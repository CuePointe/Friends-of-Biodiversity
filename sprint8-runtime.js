/*
 * Friends of Biodiversity — Sprint 8 runtime integration
 *
 * This file is intentionally isolated from the legacy monolithic app.js.
 * It provides the migration bridge for Supabase Auth, event analytics,
 * performance instrumentation and lightweight business-growth UI.
 *
 * The bridge is fail-safe: when the Sprint 8 database migration is not yet
 * applied, the existing app remains usable. Once the migration is applied,
 * authenticated users move to Supabase Auth without requiring a rewrite of
 * the existing UI.
 */
(function (global) {
  'use strict';

  const ROLE_LABELS = {
    member: 'Member',
    moderator: 'Moderator',
    verifier: 'Data Verifier',
    finance: 'Finance',
    communications: 'Communications',
    admin: 'Administrator',
    super_admin: 'Super Administrator'
  };

  const BRAND = Object.freeze({
    institution: 'Uganda Biodiversity Fund',
    movement: 'Friends of Biodiversity',
    membership: 'Green Card',
    app: 'Friends of Biodiversity app',
    participation: 'Citizen Science',
    intelligence: 'Biodiversity Intelligence',
    story: 'Join. Learn. Observe. Contribute. Protect.'
  });

  const EVENTS = Object.freeze({
    membershipCtaView: 'membership_cta_view',
    membershipStart: 'membership_start',
    membershipSubmit: 'membership_submit',
    membershipPaymentSuccess: 'membership_payment_success',
    sightingSubmit: 'sighting_submit',
    institutionLead: 'institution_lead',
    dataProductEnquiry: 'data_product_enquiry'
  });

  const AUTH_STATE = {
    migration: null,
    cooldown: 0,
    timer: null
  };

  function getSb() {
    try {
      return (typeof sb !== 'undefined' && sb && typeof sb.from === 'function') ? sb : null;
    } catch (_) {
      return null;
    }
  }

  function getMembers() {
    try {
      return (typeof MEMBERS !== 'undefined' && Array.isArray(MEMBERS)) ? MEMBERS : [];
    } catch (_) {
      return [];
    }
  }

  function getCurrentUser() {
    try {
      return (typeof currentUser !== 'undefined') ? currentUser : null;
    } catch (_) {
      return null;
    }
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function scoreObservation(input) {
    const x = input || {};
    const score =
      clamp(x.photoScore, 0, 100) * 0.15 +
      clamp(x.gpsScore, 0, 100) * 0.15 +
      clamp(x.observerScore, 0, 100) * 0.15 +
      clamp(x.duplicateScore == null ? 100 : x.duplicateScore, 0, 100) * 0.10 +
      clamp(x.verificationScore, 0, 100) * 0.30 +
      clamp(x.completenessScore, 0, 100) * 0.15;
    const rounded = Math.round(score * 100) / 100;
    return {
      score: rounded,
      band: rounded >= 85 ? 'high' : rounded >= 65 ? 'medium' : 'low'
    };
  }

  function sessionId() {
    const key = 'fob_s8_session_id';
    try {
      let id = localStorage.getItem(key);
      if (!id) {
        id = (global.crypto && global.crypto.randomUUID) ? global.crypto.randomUUID() :
          's8-' + Date.now() + '-' + Math.random().toString(16).slice(2);
        localStorage.setItem(key, id);
      }
      return id;
    } catch (_) {
      return 's8-ephemeral-' + Date.now();
    }
  }

  async function track(eventName, metadata, options) {
    const opts = options || {};
    const payload = {
      event_name: String(eventName || 'unknown'),
      event_group: String(opts.group || 'product'),
      source: opts.source || 'web',
      page: location.pathname,
      session_id: sessionId(),
      metadata: metadata && typeof metadata === 'object' ? metadata : {}
    };

    global.dispatchEvent(new CustomEvent('fob:sprint8-event', { detail: payload }));

    const client = getSb();
    if (client) {
      try {
        const authUser = client.auth && typeof client.auth.getUser === 'function'
          ? (await client.auth.getUser()).data.user
          : null;
        payload.user_id = authUser ? authUser.id : null;
        const result = await client.from('analytics_events').insert(payload);
        if (result && result.error) console.warn('[FoB analytics]', result.error.message);
      } catch (error) {
        console.warn('[FoB analytics] event dropped:', error);
      }
    }
    return payload;
  }

  function revenueSummary(rows) {
    const list = Array.isArray(rows) ? rows : [];
    const successful = list.filter(r => r.status === 'successful');
    const revenue = successful.reduce((sum, r) => sum + (Number(r.amount_ugx) || 0), 0);
    const payers = new Set(successful.map(r => r.member_id).filter(Boolean));
    return {
      transactions: successful.length,
      revenueUGX: revenue,
      payingMembers: payers.size,
      averageTransactionUGX: successful.length ? Math.round(revenue / successful.length) : 0
    };
  }

  function funnelRate(numerator, denominator) {
    const d = Number(denominator) || 0;
    return d ? Math.round((Number(numerator) / d) * 10000) / 100 : 0;
  }

  function formatUGX(amount) {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency', currency: 'UGX', maximumFractionDigits: 0
    }).format(Number(amount) || 0);
  }

  function installPerformanceObserver() {
    if (!('PerformanceObserver' in global)) return;
    try {
      const obs = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'largest-contentful-paint') {
            global.dispatchEvent(new CustomEvent('fob:performance', {
              detail: { metric: 'LCP', value: Math.round(entry.startTime) }
            }));
          }
          if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
            global.dispatchEvent(new CustomEvent('fob:performance', {
              detail: { metric: 'CLS_EVENT', value: entry.value }
            }));
          }
        });
      });
      obs.observe({ type: 'largest-contentful-paint', buffered: true });
      obs.observe({ type: 'layout-shift', buffered: true });
    } catch (_) {}
  }

  function deferNonCriticalImages(root) {
    const scope = root || document;
    scope.querySelectorAll('img:not([loading])').forEach(img => {
      try {
        const rect = img.getBoundingClientRect();
        if (rect.top > global.innerHeight * 1.5) img.loading = 'lazy';
      } catch (_) {}
    });
  }

  function migrationReady() {
    const client = getSb();
    if (!client) return Promise.resolve(false);
    return client.from('profiles').select('id').limit(1).then(({ error }) => !error).catch(() => false);
  }

  function setVerifyCooldown(seconds) {
    AUTH_STATE.cooldown = seconds;
    const btn = document.getElementById('verify-resend');
    if (AUTH_STATE.timer) clearInterval(AUTH_STATE.timer);
    AUTH_STATE.timer = setInterval(() => {
      AUTH_STATE.cooldown -= 1;
      if (!btn) return;
      if (AUTH_STATE.cooldown <= 0) {
        clearInterval(AUTH_STATE.timer);
        AUTH_STATE.timer = null;
        btn.disabled = false;
        btn.textContent = 'Resend code';
      } else {
        btn.disabled = true;
        btn.textContent = 'Resend code (' + AUTH_STATE.cooldown + 's)';
      }
    }, 1000);
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Resend code (' + seconds + 's)';
    }
  }

  async function sendAuthCode(email) {
    const client = getSb();
    if (!client) throw new Error('Authentication service unavailable.');
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    });
    if (error) throw error;
  }

  function openVerification(member, next, password, mode) {
    AUTH_STATE.migration = { member, next, password: password || null, mode: mode || 'verify' };
    const label = document.getElementById('verify-email-label');
    const code = document.getElementById('verify-code');
    if (label) label.textContent = member.email;
    if (code) { code.value = ''; code.focus(); }
    if (typeof openModal === 'function') openModal('m-verify');
    sendAuthCode(member.email)
      .then(() => {
        if (typeof toast === 'function') toast('✉ Verification code sent — check your inbox.');
        setVerifyCooldown(60);
      })
      .catch(error => {
        console.error('[FoB auth]', error);
        if (typeof toast === 'function') toast('⚠ ' + (error.message || 'Could not send verification code.'));
      });
  }

  async function confirmVerification() {
    const state = AUTH_STATE.migration;
    const client = getSb();
    if (!state || !client) {
      if (typeof closeModal === 'function') closeModal('m-verify');
      return;
    }
    const code = (document.getElementById('verify-code')?.value || '').trim();
    if (!/^\d{6}$/.test(code)) {
      if (typeof toast === 'function') toast('⚠ Enter the 6-digit code from your email.');
      return;
    }
    try {
      if (typeof toast === 'function') toast('Checking code…');
      const { data, error } = await client.auth.verifyOtp({ email: state.member.email, token: code, type: 'email' });
      if (error) throw error;
      const authUser = data && data.user ? data.user : (await client.auth.getUser()).data.user;
      if (!authUser) throw new Error('Verification succeeded but no user session was returned.');

      if (state.password) {
        const { error: pwErr } = await client.auth.updateUser({ password: state.password });
        if (pwErr) throw pwErr;
      }

      const updates = {
        auth_user_id: authUser.id,
        email_verified: true
      };
      let updateResult = await client.from('members').update(updates).eq('id', state.member.id);
      if (updateResult.error) {
        // Pre-migration deployments may not have the bridge column yet.
        if (updateResult.error.code === '42703' || /auth_user_id/i.test(updateResult.error.message || '')) {
          updateResult = await client.from('members').update({ email_verified: true }).eq('id', state.member.id);
        } else {
          throw updateResult.error;
        }
      }

      const merged = Object.assign({}, state.member, updates);
      if (typeof loadMembers === 'function') await loadMembers();
      if (state.next === 'login' || state.mode === 'migrate-login') {
        const fresh = getMembers().find(m => m.id === state.member.id) || merged;
        if (typeof client.auth.signOut === 'function') await client.auth.signOut();
        AUTH_STATE.migration = null;
        if (typeof finishLogin === 'function') finishLogin(fresh);
      } else {
        if (typeof client.auth.signOut === 'function') await client.auth.signOut();
        AUTH_STATE.migration = null;
        if (typeof closeModal === 'function') closeModal('m-verify');
        if (typeof toast === 'function') toast('✅ Email verified — your FoB account is ready.');
      }
    } catch (error) {
      console.error('[FoB auth verify]', error);
      if (typeof toast === 'function') toast('⚠ ' + (error.message || 'Invalid or expired code.'));
    }
  }

  async function signInAuthUser(email, password, expectedRole) {
    const client = getSb();
    if (!client) return { ok: false, reason: 'no_client' };
    const result = await client.auth.signInWithPassword({ email, password });
    if (result.error || !result.data || !result.data.user) return { ok: false, reason: 'invalid', error: result.error };

    const authUser = result.data.user;
    const members = getMembers();
    const member = members.find(m => m.auth_user_id === authUser.id) ||
      members.find(m => String(m.email || '').toLowerCase() === email.toLowerCase());

    if (!member) {
      await client.auth.signOut().catch(() => {});
      return { ok: false, reason: 'no_member' };
    }
    if (expectedRole && member.role !== expectedRole) {
      await client.auth.signOut().catch(() => {});
      return { ok: false, reason: 'role' };
    }
    if (member.status !== 'active') {
      await client.auth.signOut().catch(() => {});
      return { ok: false, reason: member.status || 'inactive', member };
    }

    if (!member.auth_user_id) {
      await client.from('members').update({ auth_user_id: authUser.id }).eq('id', member.id).catch(() => {});
      member.auth_user_id = authUser.id;
    }
    if (typeof persistSession === 'function') persistSession(member);
    if (typeof finishLogin === 'function') finishLogin(member);
    return { ok: true, member };
  }

  async function migrateLegacyLogin(email, password, expectedRole) {
    const members = getMembers();
    const member = members.find(m => String(m.email || '').toLowerCase() === email && m.pass === password);
    if (!member) return { ok: false, reason: 'invalid' };
    if (expectedRole && member.role !== expectedRole) return { ok: false, reason: 'role' };
    if (member.status !== 'active') return { ok: false, reason: member.status || 'inactive', member };

    const client = getSb();
    if (!client) return { ok: false, reason: 'no_client' };

    // If Auth user exists but password is not yet set, OTP will authenticate the email;
    // if it does not exist, OTP creates it. After verification we set the same password.
    AUTH_STATE.migration = { member, next: 'login', password, mode: 'migrate-login' };
    openVerification(member, 'login', password, 'migrate-login');
    return { ok: true, pendingVerification: true, member };
  }

  async function doLoginV2() {
    const email = (document.getElementById('li-email')?.value || '').trim().toLowerCase();
    const password = document.getElementById('li-pass')?.value || '';
    if (!email || !password) {
      if (typeof toast === 'function') toast('⚠ Enter your email and password.');
      return;
    }
    const lock = typeof checkRateLimit === 'function' ? checkRateLimit(email) : null;
    if (lock) { if (typeof toast === 'function') toast('⚠ ' + lock); return; }

    if (typeof loadMembers === 'function') await loadMembers();

    const ready = await migrationReady();
    if (ready) {
      const auth = await signInAuthUser(email, password, 'member');
      if (auth.ok) {
        if (typeof clearRateLimit === 'function') clearRateLimit(email);
        await track(EVENTS.membershipStart, { member_id: auth.member.id, method: 'supabase_auth' }, { group: 'membership' });
        return;
      }
      const members = getMembers();
      const legacy = members.find(m => String(m.email || '').toLowerCase() === email && m.pass === password);
      if (legacy) {
        if (typeof clearRateLimit === 'function') clearRateLimit(email);
        await migrateLegacyLogin(email, password, 'member');
        return;
      }
    }

    // Pre-migration fallback: preserve existing behavior until migrations are applied.
    const legacy = getMembers().find(m => String(m.email || '').toLowerCase() === email && m.pass === password);
    if (!legacy) {
      if (typeof recordLoginFailure === 'function') recordLoginFailure(email);
      if (typeof toast === 'function') toast('⚠ Email or password incorrect.');
      return;
    }
    if (legacy.role === 'admin') { if (typeof toast === 'function') toast('⚠ Admin accounts must use the admin sign-in.'); return; }
    if (legacy.status === 'pending') { if (typeof closeModal === 'function') closeModal('m-login'); if (typeof showLockedModal === 'function') showLockedModal(legacy.name); return; }
    if (legacy.status !== 'active') { if (typeof toast === 'function') toast('⚠ This account has been deactivated.'); return; }
    if (legacy.email_verified === false && typeof startEmailVerification === 'function') {
      if (typeof clearRateLimit === 'function') clearRateLimit(email);
      startEmailVerification(legacy, 'login');
      return;
    }
    if (typeof clearRateLimit === 'function') clearRateLimit(email);
    if (typeof finishLogin === 'function') finishLogin(legacy);
  }

  async function doAdminLoginV2() {
    const email = (document.getElementById('al-email')?.value || '').trim().toLowerCase();
    const password = document.getElementById('al-pass')?.value || '';
    if (!email || !password) { if (typeof toast === 'function') toast('⚠ Enter your email and password.'); return; }
    if (typeof ADMIN_EMAILS !== 'undefined' && Array.isArray(ADMIN_EMAILS) && !ADMIN_EMAILS.includes(email)) {
      if (typeof toast === 'function') toast('⚠ This email is not authorised for admin access.'); return;
    }
    const lock = typeof checkRateLimit === 'function' ? checkRateLimit(email) : null;
    if (lock) { if (typeof toast === 'function') toast('⚠ ' + lock); return; }
    if (typeof loadMembers === 'function') await loadMembers();

    const ready = await migrationReady();
    if (ready) {
      const auth = await signInAuthUser(email, password, 'admin');
      if (auth.ok) {
        if (typeof clearRateLimit === 'function') clearRateLimit(email);
        await track('admin_login', { member_id: auth.member.id, method: 'supabase_auth' }, { group: 'security' });
        return;
      }
      const legacy = getMembers().find(m => String(m.email || '').toLowerCase() === email && m.pass === password && m.role === 'admin');
      if (legacy) { await migrateLegacyLogin(email, password, 'admin'); return; }
    }

    const acct = getMembers().find(m => String(m.email || '').toLowerCase() === email && m.role === 'admin' && m.pass === password);
    if (!acct) {
      if (typeof recordLoginFailure === 'function') recordLoginFailure(email);
      if (typeof toast === 'function') toast('⚠ Incorrect email or password.');
      return;
    }
    if (typeof clearRateLimit === 'function') clearRateLimit(email);
    if (typeof persistSession === 'function') persistSession(acct);
    if (typeof closeModal === 'function') closeModal('m-admin-login');
    if (typeof updateNav === 'function') updateNav();
    const info = document.getElementById('adm-user-info');
    if (info) info.textContent = (acct.name || 'Administrator') + ' — ' + email;
    if (typeof toast === 'function') toast('⚙ Admin access granted.');
    if (typeof showView === 'function') showView('admin');
  }

  async function enrollWithAuthCapture(event) {
    const form = event.target;
    if (!form || form.id !== 'enroll-form') return false;
    const ready = await migrationReady();
    if (!ready) return false;

    event.preventDefault();
    event.stopImmediatePropagation();

    const get = id => document.getElementById(id);
    const name = (get('ef-name')?.value || '').trim();
    const email = (get('ef-email')?.value || '').trim().toLowerCase();
    const tel = (get('ef-tel')?.value || '').trim();
    const type = get('ef-type')?.value || '';
    const tier = get('ef-tier')?.value || '';
    const amount = parseInt(get('ef-amount')?.value, 10) || 0;
    const year = parseInt(get('ef-year')?.value, 10) || new Date().getFullYear();
    const password = get('ef-pass')?.value || '';
    const payref = (get('ef-payref')?.value || '').trim();
    if (!name || !email || !tel || !type || !tier || !amount || !password) {
      if (typeof toast === 'function') toast('⚠ Please fill in all required fields.');
      return true;
    }
    if (password.length < 8) { if (typeof toast === 'function') toast('⚠ Password must be at least 8 characters.'); return true; }

    const client = getSb();
    try {
      if (typeof toast === 'function') toast('🔐 Creating your secure account…');
      const sign = await client.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });
      if (sign.error) throw sign.error;
      if (!sign.data || !sign.data.user) throw new Error('Could not create the authentication account.');

      const interests = (() => {
        try { return Array.from(_wizInterests || []); } catch (_) { return []; }
      })();
      const refBy = typeof myRefBy === 'function' ? myRefBy() : null;
      const row = {
        name, email, tel, type, tier, amount, year, payref,
        org: (get('ef-org')?.value || '').trim(),
        engage: [interests.join(', '), (get('ef-engage')?.value || '').trim()].filter(Boolean).join(' — '),
        engage_prefs: interests.length ? interests : null,
        referred_by: (refBy && refBy.length > 20) ? refBy : null,
        role: 'member', status: 'pending',
        auth_user_id: sign.data.user.id,
        email_verified: false
      };

      let insert = await client.from('members').insert(row).select().single();
      if (insert.error && (insert.error.code === '42703' || /auth_user_id/i.test(insert.error.message || ''))) {
        delete row.auth_user_id;
        insert = await client.from('members').insert(row).select().single();
      }
      if (insert.error) throw insert.error;

      if (typeof loadMembers === 'function') await loadMembers();
      const created = insert.data;
      const formEl = document.getElementById('enroll-form');
      const success = document.getElementById('enroll-success');
      if (formEl) formEl.style.display = 'none';
      if (success) success.style.display = 'block';
      if (typeof showEP === 'function') showEP(false);
      await track(EVENTS.membershipSubmit, { tier, amount_ugx: amount, member_id: created && created.id }, { group: 'membership' });
      openVerification(created, 'enroll', null, 'enroll');
      if (typeof toast === 'function') toast('🌿 Enrollment saved. Check your email to verify your account.');
    } catch (error) {
      console.error('[FoB enrollment]', error);
      if (typeof toast === 'function') toast('⚠ ' + (error.message || 'Could not complete enrollment.'));
    }
    return true;
  }

  function addPublicGrowthPanel() {
    if (document.getElementById('s8-growth-panel')) return;
    const host = document.querySelector('#view-main footer') || document.querySelector('#view-main');
    if (!host) return;
    const panel = document.createElement('section');
    panel.id = 's8-growth-panel';
    panel.setAttribute('aria-label', 'Institutional partnerships and biodiversity intelligence');
    panel.innerHTML = `
      <div style="max-width:1120px;margin:2.5rem auto;padding:1.6rem 1.4rem;background:linear-gradient(135deg,rgba(11,38,24,.98),rgba(23,69,48,.97));border:1px solid rgba(200,168,75,.25);border-radius:20px;color:#fff;box-shadow:0 10px 40px rgba(0,0,0,.12)">
        <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.14em;color:#E9D9A8;font-weight:800;margin-bottom:.45rem">For institutions, researchers & EIA practitioners</div>
        <div style="display:flex;gap:1.3rem;justify-content:space-between;align-items:flex-end;flex-wrap:wrap">
          <div style="max-width:700px"><h2 style="margin:0 0 .45rem;font-family:var(--ff-d,Georgia,serif);font-size:1.55rem;color:#fff">Better biodiversity evidence for better decisions.</h2><p style="margin:0;color:rgba(255,255,255,.76);font-size:.88rem;line-height:1.65">Friends of Biodiversity is building verified, georeferenced biodiversity evidence from Uganda’s communities. Request a Biodiversity Intelligence Pack or discuss a long-term monitoring partnership.</p></div>
          <div style="display:flex;gap:.55rem;flex-wrap:wrap"><button class="btn btn-gold btn-sm" id="s8-datapack-cta">Request Data Pack →</button><button class="btn btn-outline btn-sm" id="s8-sponsor-cta">Partner with UBF →</button></div>
        </div>
      </div>`;
    host.parentNode.insertBefore(panel, host);
    document.getElementById('s8-datapack-cta')?.addEventListener('click', () => { track(EVENTS.dataProductEnquiry, {product: 'biodiversity-intelligence-pack'}); if (typeof openEnquiry === 'function') openEnquiry('datapack'); });
    document.getElementById('s8-sponsor-cta')?.addEventListener('click', () => { track(EVENTS.institutionLead, {opportunity_type: 'csr_partnership'}); if (typeof openEnquiry === 'function') openEnquiry('sponsor'); });
  }

  async function loadAdminCockpit() {
    if (!getCurrentUser() || getCurrentUser().role !== 'admin') return;
    const host = document.getElementById('adm-overview-body');
    if (!host || document.getElementById('s8-admin-cockpit')) return;
    const client = getSb();
    if (!client) return;
    try {
      const [funnel, revenue, pulse, pipeline, products] = await Promise.all([
        client.from('growth_funnel_summary').select('*').maybeSingle(),
        client.from('revenue_by_tier').select('*'),
        client.from('biodiversity_pulse').select('*').maybeSingle(),
        client.from('institutional_pipeline_summary').select('*'),
        client.from('data_products').select('*').eq('active', true).order('created_at', { ascending: true })
      ]);
      if (funnel.error || pulse.error) return;
      const f = funnel.data || {};
      const p = pulse.data || {};
      const pipeRows = pipeline.data || [];
      const grossPipeline = pipeRows.reduce((sum, row) => sum + (Number(row.gross_value_ugx) || 0), 0);
      const weightedPipeline = pipeRows.reduce((sum, row) => sum + (Number(row.weighted_value_ugx) || 0), 0);
      const box = document.createElement('section');
      box.id = 's8-admin-cockpit';
      box.style.cssText = 'margin-top:1.4rem;padding:1.2rem;border:1px solid var(--border);border-radius:16px;background:linear-gradient(180deg,#fff,#f8faf8)';
      const kpi = (v, l) => '<div style="flex:1;min-width:145px;padding:.75rem .8rem;background:#fff;border:1px solid var(--border);border-radius:12px"><div style="font-weight:800;font-size:1.18rem;color:var(--canopy)">'+v+'</div><div style="font-size:.68rem;color:var(--muted);margin-top:.15rem">'+l+'</div></div>';
      const rates = funnelRate(f.membership_submits, f.membership_cta_views);
      box.innerHTML = '<div style="display:flex;justify-content:space-between;gap:.7rem;align-items:center;flex-wrap:wrap"><div><div style="font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--canopy-lt);font-weight:800">Sprint 8 growth & intelligence cockpit</div><h3 style="margin:.25rem 0 0;font-family:var(--ff-d,Georgia,serif);color:var(--canopy)">Membership → evidence → institutional demand</h3></div><span style="font-size:.7rem;color:var(--muted)">Live from Sprint 8 views</span></div>'+
        '<div style="display:flex;gap:.65rem;flex-wrap:wrap;margin-top:1rem">'+
        kpi(String(f.membership_cta_views || 0), 'Membership CTA views')+
        kpi(String(f.membership_submits || 0), 'Membership submissions')+
        kpi(rates+'%', 'Submit rate')+
        kpi(String(p.verified_observations || 0), 'Verified observations')+
        kpi(String(p.distinct_species || 0), 'Distinct species')+
        kpi(formatUGX(weightedPipeline), 'Weighted pipeline')+
        '</div>'+
        '<div style="display:flex;justify-content:space-between;gap:.7rem;flex-wrap:wrap;margin-top:1rem;padding-top:.8rem;border-top:1px solid var(--border)"><div style="font-size:.78rem;color:var(--muted)">Gross institutional pipeline: <b style="color:var(--canopy)">'+formatUGX(grossPipeline)+'</b></div><div style="font-size:.78rem;color:var(--muted)">Data products active: <b style="color:var(--canopy)">'+(products.data||[]).length+'</b></div><div style="font-size:.78rem;color:var(--muted)">Recent verified sightings: <b style="color:var(--canopy)">'+(p.verified_30d || 0)+'</b></div></div>'+
        '<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.9rem"><button class="btn btn-ghost btn-sm" id="s8-refresh-cockpit">↻ Refresh metrics</button><button class="btn btn-canopy btn-sm" id="s8-export-pipeline">Open institutional pipeline</button></div>';
      host.appendChild(box);
      document.getElementById('s8-refresh-cockpit')?.addEventListener('click', () => { box.remove(); loadAdminCockpit(); });
      document.getElementById('s8-export-pipeline')?.addEventListener('click', () => {
        if (typeof admGoto === 'function') admGoto('ap-subscribers');
      });
    } catch (error) {
      console.warn('[FoB cockpit]', error);
    }
  }

  function wrapFunction(name, eventName, group, metadataFactory) {
    const original = global[name];
    if (typeof original !== 'function' || original.__s8Wrapped) return;
    const wrapped = async function () {
      const args = arguments;
      let result;
      try {
        result = original.apply(this, args);
      } catch (error) {
        throw error;
      }
      try {
        if (result && typeof result.then === 'function') result = await result;
        const meta = typeof metadataFactory === 'function' ? metadataFactory(args, result) : (metadataFactory || {});
        await track(eventName, meta, { group });
        if (name === 'submitSighting' || name === 'submitEnquiry' || name === 'adminApproveMember') loadAdminCockpit();
      } catch (_) {}
      return result;
    };
    wrapped.__s8Wrapped = true;
    global[name] = wrapped;
  }

  function installIntegration() {
    // Override auth entry points once the legacy app.js definitions exist.
    if (typeof global.doLogin === 'function' && !global.doLogin.__s8Wrapped) {
      global.doLogin = doLoginV2;
      global.doLogin.__s8Wrapped = true;
    }
    if (typeof global.doAdminLogin === 'function' && !global.doAdminLogin.__s8Wrapped) {
      global.doAdminLogin = doAdminLoginV2;
      global.doAdminLogin.__s8Wrapped = true;
    }
    global.confirmVerifyCode = confirmVerification;

    // Keep the existing legacy password controls functional until full migration,
    // while making the new Auth path available as soon as the migration is live.
    wrapFunction('selectTier', EVENTS.membershipCtaView, 'membership', args => ({ tier: args[0] }));
    wrapFunction('submitSighting', EVENTS.sightingSubmit, 'citizen_science', () => ({ member_id: getCurrentUser()?.id || null }));
    wrapFunction('submitEnquiry', null, 'growth', args => ({ kind: args[0] || 'unknown' }));
    wrapFunction('adminApproveMember', EVENTS.membershipPaymentSuccess, 'membership', args => ({ member_id: args[0] || null }));

    const form = document.getElementById('enroll-form');
    if (form && !form.dataset.s8Capture) {
      document.addEventListener('submit', enrollWithAuthCapture, true);
      form.dataset.s8Capture = '1';
    }

    addPublicGrowthPanel();
    deferNonCriticalImages();
    loadAdminCockpit();
  }

  global.FoBSprint8 = Object.freeze({
    BRAND,
    EVENTS,
    ROLE_LABELS,
    scoreObservation,
    track,
    revenueSummary,
    funnelRate,
    formatUGX,
    migrationReady,
    installPerformanceObserver,
    deferNonCriticalImages
  });

  function boot() {
    installPerformanceObserver();
    deferNonCriticalImages();
    installIntegration();
    global.addEventListener('load', () => {
      // app.js is already loaded before this deferred runtime in the injected document.
      installIntegration();
      addPublicGrowthPanel();
      loadAdminCockpit();
    }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})(window);
