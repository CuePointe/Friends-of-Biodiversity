/* Friends of Biodiversity — Sprint 8 visible product layer
 * Adds real user-facing features without rewriting the legacy SPA.
 *
 * Features:
 * - Sprint 8 navigation rail
 * - Green Card membership snapshot
 * - Citizen Science observation submission + live observation feed
 * - Biodiversity Intelligence product catalogue + enquiry capture
 * - Admin intelligence cockpit for staff
 * - Progressive enhancement: never blocks the legacy app
 */
(function (global) {
  'use strict';

  const esc = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;').replace(/'/g, '&#39;');

  const money = (value) => new Intl.NumberFormat('en-UG', {
    style: 'currency', currency: 'UGX', maximumFractionDigits: 0
  }).format(Number(value) || 0);

  const css = `
  #fob-s8-rail{position:fixed;right:18px;bottom:18px;z-index:99990;font-family:Inter,system-ui,sans-serif}
  #fob-s8-launch{border:0;border-radius:999px;padding:13px 17px;background:#0b2618;color:#fff;font-weight:800;box-shadow:0 10px 30px rgba(0,0,0,.22);cursor:pointer}
  #fob-s8-panel{display:none;position:fixed;inset:0;background:rgba(5,18,11,.55);backdrop-filter:blur(3px);padding:20px;overflow:auto}
  #fob-s8-panel.open{display:block}
  .fob-s8-shell{max-width:1180px;margin:35px auto;background:#f6f1e7;border-radius:24px;box-shadow:0 24px 70px rgba(0,0,0,.25);overflow:hidden}
  .fob-s8-head{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px 28px;background:#0b2618;color:#fff}
  .fob-s8-head h2{margin:0;font:800 28px/1.1 Georgia,serif}.fob-s8-head p{margin:7px 0 0;opacity:.78}
  .fob-s8-close{border:1px solid rgba(255,255,255,.25);background:transparent;color:#fff;border-radius:10px;padding:9px 12px;cursor:pointer}
  .fob-s8-nav{display:flex;gap:8px;flex-wrap:wrap;padding:14px 20px;background:#123a25;border-bottom:1px solid rgba(255,255,255,.08)}
  .fob-s8-tab{border:0;background:rgba(255,255,255,.08);color:#fff;border-radius:999px;padding:9px 14px;font-weight:750;cursor:pointer}.fob-s8-tab.active{background:#d8b55a;color:#0b2618}
  .fob-s8-body{padding:24px}.fob-s8-view{display:none}.fob-s8-view.active{display:block}
  .fob-s8-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.fob-s8-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}
  .fob-s8-card{background:#fff;border:1px solid #e4ddce;border-radius:18px;padding:19px;box-shadow:0 8px 28px rgba(54,39,15,.06)}
  .fob-s8-card h3{margin:0 0 8px;color:#173522}.fob-s8-card p{color:#59665d;line-height:1.55}.fob-s8-kpi{font-size:30px;font-weight:900;color:#0b2618;margin-top:7px}
  .fob-s8-pill{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:5px 9px;background:#edf5ee;color:#27583a;font-size:12px;font-weight:800}
  .fob-s8-muted{color:#6f786f;font-size:13px}.fob-s8-btn{border:0;border-radius:10px;padding:10px 14px;font-weight:800;cursor:pointer;background:#0b2618;color:#fff}.fob-s8-btn.secondary{background:#e9e3d7;color:#173522}.fob-s8-btn.gold{background:#d8b55a;color:#0b2618}.fob-s8-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
  .fob-s8-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.fob-s8-field{display:flex;flex-direction:column;gap:6px}.fob-s8-field.full{grid-column:1/-1}.fob-s8-field label{font-size:12px;font-weight:800;color:#39463c}.fob-s8-field input,.fob-s8-field select,.fob-s8-field textarea{width:100%;box-sizing:border-box;border:1px solid #d7d0c4;background:#fff;border-radius:10px;padding:11px;font:inherit}.fob-s8-field textarea{min-height:100px;resize:vertical}
  .fob-s8-banner{padding:18px 20px;border-radius:16px;background:linear-gradient(135deg,#183e29,#0b2618);color:#fff;margin-bottom:18px}.fob-s8-banner h3{margin:0 0 6px;color:#fff}.fob-s8-banner p{margin:0;opacity:.83}
  .fob-s8-observation{display:grid;grid-template-columns:88px 1fr auto;gap:14px;align-items:center;padding:13px 0;border-bottom:1px solid #ece7dc}.fob-s8-observation:last-child{border-bottom:0}.fob-s8-thumb{width:88px;height:64px;border-radius:10px;object-fit:cover;background:#e8e2d6}.fob-s8-empty{text-align:center;padding:40px 10px;color:#6d756d}
  .fob-s8-product{display:flex;flex-direction:column;height:100%}.fob-s8-product .price{font-size:21px;font-weight:900;color:#0b2618;margin:11px 0}.fob-s8-product .buyer{font-size:12px;font-weight:800;color:#677267;text-transform:uppercase;letter-spacing:.06em}.fob-s8-table{width:100%;border-collapse:collapse;font-size:13px}.fob-s8-table th,.fob-s8-table td{text-align:left;padding:10px 8px;border-bottom:1px solid #e8e2d6}.fob-s8-table th{color:#526057}.fob-s8-status{font-weight:800}.fob-s8-note{padding:11px 13px;border-radius:10px;background:#f5f0e5;color:#4f5d53;font-size:13px;margin-top:12px}
  @media(max-width:850px){.fob-s8-grid,.fob-s8-grid.two,.fob-s8-form{grid-template-columns:1fr}.fob-s8-shell{margin:8px auto}.fob-s8-body{padding:16px}.fob-s8-head{padding:18px}.fob-s8-observation{grid-template-columns:64px 1fr}.fob-s8-observation>.actions{grid-column:2}.fob-s8-thumb{width:64px;height:54px}}
  `;

  const state = { tab: 'overview', products: [], species: [], observations: [], staff: false };

  function injectStyle() {
    if (document.getElementById('fob-s8-style')) return;
    const style = document.createElement('style'); style.id = 'fob-s8-style'; style.textContent = css; document.head.appendChild(style);
  }

  function supabase() {
    try { return (typeof sb !== 'undefined' && sb && typeof sb.from === 'function') ? sb : null; } catch (_) { return null; }
  }

  async function authUser() {
    const c = supabase();
    if (!c || !c.auth) return null;
    try { return (await c.auth.getUser()).data?.user || null; } catch (_) { return null; }
  }

  async function memberForUser(user) {
    if (!user) return null;
    try {
      const c = supabase();
      const { data } = await c.from('members').select('id,name,email,tier,amount,year,role,status,org,photo_url,auth_user_id').or(`auth_user_id.eq.${user.id},email.eq.${String(user.email || '').toLowerCase()}`).limit(5);
      return (data || []).find(x => x.auth_user_id === user.id) || data?.[0] || null;
    } catch (_) { return null; }
  }

  async function loadProducts() {
    const c = supabase(); if (!c) return [];
    const { data, error } = await c.from('data_products').select('*').eq('active', true).order('created_at', { ascending: true });
    if (error) { console.warn('[FoB Sprint 8 UI] products', error.message); return []; }
    state.products = data || []; return state.products;
  }

  async function loadSpecies() {
    const c = supabase(); if (!c) return [];
    const { data, error } = await c.from('species').select('common_name,scientific_name,taxon_group,conservation_status,habitat').eq('active', true).order('common_name', { ascending: true }).limit(100);
    if (error) { console.warn('[FoB Sprint 8 UI] species', error.message); return []; }
    state.species = data || []; return state.species;
  }

  async function loadObservations() {
    const c = supabase(); if (!c) return [];
    const { data, error } = await c.from('sightings').select('id,species,lat,lng,observed_at,member_name,photo_url,notes,verified,count_band,activity,habitat,created_at').order('created_at', { ascending: false }).limit(30);
    if (error) { console.warn('[FoB Sprint 8 UI] sightings', error.message); return []; }
    state.observations = data || []; return state.observations;
  }

  function renderShell() {
    if (document.getElementById('fob-s8-rail')) return;
    injectStyle();
    const rail = document.createElement('div'); rail.id = 'fob-s8-rail';
    rail.innerHTML = `<button id="fob-s8-launch">🌿 Explore FoB</button>
      <div id="fob-s8-panel" role="dialog" aria-modal="true" aria-label="Friends of Biodiversity features">
       <div class="fob-s8-shell">
        <div class="fob-s8-head"><div><h2>Friends of Biodiversity</h2><p>Join. Learn. Observe. Contribute. Protect.</p></div><button class="fob-s8-close" id="fob-s8-close">Close</button></div>
        <div class="fob-s8-nav" id="fob-s8-nav">
          <button class="fob-s8-tab active" data-s8-tab="overview">Overview</button>
          <button class="fob-s8-tab" data-s8-tab="observe">Citizen Science</button>
          <button class="fob-s8-tab" data-s8-tab="intelligence">Biodiversity Intelligence</button>
          <button class="fob-s8-tab" data-s8-tab="membership">Green Card</button>
          <button class="fob-s8-tab" data-s8-tab="admin" id="fob-s8-admin-tab" style="display:none">Admin Cockpit</button>
        </div>
        <div class="fob-s8-body">
          <section class="fob-s8-view active" id="fob-s8-overview"></section>
          <section class="fob-s8-view" id="fob-s8-observe"></section>
          <section class="fob-s8-view" id="fob-s8-intelligence"></section>
          <section class="fob-s8-view" id="fob-s8-membership"></section>
          <section class="fob-s8-view" id="fob-s8-admin"></section>
        </div>
       </div>
      </div>`;
    document.body.appendChild(rail);
    document.getElementById('fob-s8-launch').addEventListener('click', open);
    document.getElementById('fob-s8-close').addEventListener('click', close);
    document.getElementById('fob-s8-panel').addEventListener('click', e => { if (e.target.id === 'fob-s8-panel') close(); });
    document.getElementById('fob-s8-nav').addEventListener('click', e => {
      const btn = e.target.closest('[data-s8-tab]'); if (!btn) return; selectTab(btn.dataset.s8Tab);
    });
  }

  async function open() {
    renderShell();
    document.getElementById('fob-s8-panel').classList.add('open');
    await refresh();
  }
  function close() { document.getElementById('fob-s8-panel')?.classList.remove('open'); }

  async function refresh() {
    await Promise.allSettled([loadProducts(), loadSpecies(), loadObservations(), checkStaff()]);
    renderAll();
  }

  async function checkStaff() {
    const user = await authUser();
    const member = await memberForUser(user);
    state.staff = !!(member && ['admin','super_admin','finance','moderator','verifier','communications'].includes(member.role));
    const tab = document.getElementById('fob-s8-admin-tab'); if (tab) tab.style.display = state.staff ? '' : 'none';
    return state.staff;
  }

  function selectTab(tab) {
    state.tab = tab;
    document.querySelectorAll('.fob-s8-tab').forEach(x => x.classList.toggle('active', x.dataset.s8Tab === tab));
    document.querySelectorAll('.fob-s8-view').forEach(x => x.classList.toggle('active', x.id === 'fob-s8-' + tab));
    if (tab === 'admin') renderAdmin();
  }

  function renderAll() {
    renderOverview(); renderObserve(); renderIntelligence(); renderMembership(); if (state.staff) renderAdmin();
  }

  function renderOverview() {
    const el = document.getElementById('fob-s8-overview'); if (!el) return;
    const verified = state.observations.filter(x => x.verified).length;
    const products = state.products.length;
    const species = state.species.length;
    el.innerHTML = `<div class="fob-s8-banner"><h3>A new layer of the FoB app is live</h3><p>Use this workspace to observe biodiversity, discover intelligence products, and follow your Green Card journey.</p><div class="fob-s8-actions"><button class="fob-s8-btn gold" data-jump="observe">Submit an observation</button><button class="fob-s8-btn secondary" data-jump="intelligence">Explore intelligence</button></div></div>
      <div class="fob-s8-grid">
       <div class="fob-s8-card"><span class="fob-s8-pill">🦋 Citizen Science</span><div class="fob-s8-kpi">${verified}</div><p>verified observations visible in the shared biodiversity feed.</p></div>
       <div class="fob-s8-card"><span class="fob-s8-pill">📊 Biodiversity Intelligence</span><div class="fob-s8-kpi">${products}</div><p>data products available for institutional enquiries.</p></div>
       <div class="fob-s8-card"><span class="fob-s8-pill">🌱 Species library</span><div class="fob-s8-kpi">${species}</div><p>active species references available to guide observations.</p></div>
      </div>
      <div class="fob-s8-card" style="margin-top:16px"><h3>What changed?</h3><p>The app now exposes the Sprint 8 capabilities instead of leaving them behind the database layer: observation capture, biodiversity data products, membership intelligence and a staff cockpit.</p></div>`;
    el.querySelectorAll('[data-jump]').forEach(b => b.addEventListener('click', () => selectTab(b.dataset.jump)));
  }

  function renderObserve() {
    const el = document.getElementById('fob-s8-observe'); if (!el) return;
    const speciesOptions = state.species.map(s => `<option value="${esc(s.common_name)}">${esc(s.common_name)}${s.scientific_name ? ' — ' + esc(s.scientific_name) : ''}</option>`).join('');
    const rows = state.observations.map(o => `<div class="fob-s8-observation">
      ${o.photo_url ? `<img class="fob-s8-thumb" src="${esc(o.photo_url)}" alt="${esc(o.species)}" loading="lazy">` : `<div class="fob-s8-thumb"></div>`}
      <div><strong>${esc(o.species)}</strong> ${o.verified ? '<span class="fob-s8-pill">✓ verified</span>' : '<span class="fob-s8-muted">awaiting verification</span>'}<br><span class="fob-s8-muted">${esc(o.member_name || 'Community observer')} · ${esc((o.observed_at || o.created_at || '').slice(0,10))}${o.habitat ? ' · ' + esc(o.habitat) : ''}</span><br><span class="fob-s8-muted">${esc(o.notes || '')}</span></div>
      <div class="actions"><span class="fob-s8-muted">${o.lat != null && o.lng != null ? '📍 GPS captured' : 'No GPS'}</span></div>
    </div>`).join('');
    el.innerHTML = `<div class="fob-s8-grid two">
      <div class="fob-s8-card"><h3>Log a biodiversity observation</h3><p>Capture a species sighting with evidence and location. Verified records can contribute to biodiversity intelligence.</p>
       <form class="fob-s8-form" id="fob-s8-observation-form">
        <div class="fob-s8-field full"><label>Species</label><input id="s8-species" list="s8-species-list" required placeholder="e.g. Grey crowned crane"><datalist id="s8-species-list">${speciesOptions}</datalist></div>
        <div class="fob-s8-field"><label>Observed date</label><input id="s8-observed-at" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
        <div class="fob-s8-field"><label>Count band</label><select id="s8-count"><option value="1">1</option><option value="2-5">2–5</option><option value="6-20">6–20</option><option value="21+">21+</option></select></div>
        <div class="fob-s8-field"><label>Activity</label><select id="s8-activity"><option value="feeding">Feeding</option><option value="resting">Resting</option><option value="breeding">Breeding</option><option value="flying">Flying</option><option value="other">Other</option></select></div>
        <div class="fob-s8-field"><label>Habitat</label><input id="s8-habitat" placeholder="Wetland, forest, garden…"></div>
        <div class="fob-s8-field full"><label>Photo URL <span class="fob-s8-muted">optional</span></label><input id="s8-photo" type="url" placeholder="Public image URL, if available"></div>
        <div class="fob-s8-field full"><label>Notes / evidence</label><textarea id="s8-notes" placeholder="What did you observe? What makes the identification credible?"></textarea></div>
        <div class="fob-s8-actions full"><button type="button" class="fob-s8-btn secondary" id="s8-gps">📍 Capture my location</button><span class="fob-s8-muted" id="s8-gps-status">GPS not captured</span></div>
        <div class="fob-s8-actions full"><button class="fob-s8-btn gold" type="submit">Submit observation</button></div>
       </form></div>
      <div class="fob-s8-card"><h3>Community observation feed</h3><p class="fob-s8-muted">Recent observations from the shared FoB dataset.</p><div>${rows || '<div class="fob-s8-empty">No observations to display yet.</div>'}</div></div>
    </div>`;
    let coords = { lat: null, lng: null };
    document.getElementById('s8-gps')?.addEventListener('click', () => {
      const status = document.getElementById('s8-gps-status');
      if (!navigator.geolocation) { status.textContent = 'GPS unavailable on this device'; return; }
      status.textContent = 'Capturing…'; navigator.geolocation.getCurrentPosition(pos => { coords.lat = pos.coords.latitude; coords.lng = pos.coords.longitude; status.textContent = `GPS captured (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`; }, () => { status.textContent = 'Could not read GPS'; }, { enableHighAccuracy: true, timeout: 10000 });
    });
    document.getElementById('fob-s8-observation-form')?.addEventListener('submit', async e => {
      e.preventDefault(); await submitObservation(coords);
    });
  }

  async function submitObservation(coords) {
    const c = supabase(); if (!c) return alert('Connection to the biodiversity database is unavailable.');
    const user = await authUser(); if (!user) { alert('Please sign in first so the observation can be linked to you.'); return; }
    const member = await memberForUser(user);
    const species = document.getElementById('s8-species')?.value.trim();
    if (!species) return;
    const payload = { species, lat: coords.lat, lng: coords.lng, observed_at: document.getElementById('s8-observed-at')?.value ? new Date(document.getElementById('s8-observed-at').value).toISOString() : new Date().toISOString(), member_id: member?.id || null, member_name: member?.name || user.email, photo_url: document.getElementById('s8-photo')?.value.trim() || null, notes: document.getElementById('s8-notes')?.value.trim() || null, verified: false, count_band: document.getElementById('s8-count')?.value || null, activity: document.getElementById('s8-activity')?.value || null, habitat: document.getElementById('s8-habitat')?.value.trim() || null };
    const { data, error } = await c.from('sightings').insert(payload).select('id').single();
    if (error) { console.error(error); alert('The observation could not be saved: ' + error.message); return; }
    try { global.FoBSprint8?.track?.('sighting_submit', { sighting_id: data?.id }); } catch (_) {}
    alert('Observation submitted. It is now awaiting verification.');
    await loadObservations(); renderObserve();
  }

  function renderIntelligence() {
    const el = document.getElementById('fob-s8-intelligence'); if (!el) return;
    const cards = state.products.map(p => `<div class="fob-s8-card fob-s8-product"><div class="fob-s8-product"><span class="fob-s8-pill">${esc(p.buyer_segment || 'Institutional')}</span><h3 style="margin-top:11px">${esc(p.name)}</h3><p>${esc(p.description || '')}</p><div class="price">${p.price_ugx ? money(p.price_ugx) : 'Quoted to scope'}</div><div class="fob-s8-muted">Delivery: ${esc(p.delivery_format || 'Digital')}</div><div class="fob-s8-actions" style="margin-top:auto"><button class="fob-s8-btn gold" data-product="${esc(p.id)}">Enquire</button></div></div></div>`).join('');
    el.innerHTML = `<div class="fob-s8-banner"><h3>Biodiversity Intelligence</h3><p>Turn verified community observations into useful evidence for EIA, research, conservation planning and institutional monitoring.</p></div>
      <div class="fob-s8-grid">${cards || '<div class="fob-s8-empty">No products are currently published.</div>'}</div>
      <div class="fob-s8-note">Paid intelligence should be assembled from verified evidence. The app treats this catalogue as an enquiry and delivery workflow, not as a public dump of sensitive location data.</div>`;
    el.querySelectorAll('[data-product]').forEach(b => b.addEventListener('click', () => openProductEnquiry(b.dataset.product)));
  }

  function openProductEnquiry(productId) {
    const p = state.products.find(x => String(x.id) === String(productId)); if (!p) return;
    const el = document.getElementById('fob-s8-intelligence');
    const existing = document.getElementById('s8-enquiry-wrap'); existing?.remove();
    const wrap = document.createElement('div'); wrap.id = 's8-enquiry-wrap'; wrap.className = 'fob-s8-card'; wrap.style.marginTop = '16px';
    wrap.innerHTML = `<h3>Enquire: ${esc(p.name)}</h3><p>Tell UBF what you need so the team can scope the evidence and delivery format.</p><form class="fob-s8-form" id="s8-enquiry-form"><div class="fob-s8-field"><label>Name</label><input id="s8e-name" required></div><div class="fob-s8-field"><label>Work email</label><input id="s8e-email" type="email" required></div><div class="fob-s8-field"><label>Institution</label><input id="s8e-org"></div><div class="fob-s8-field"><label>Requested format / scope</label><input id="s8e-scope" placeholder="e.g. EIA baseline for western Uganda"></div><div class="fob-s8-field full"><label>Message</label><textarea id="s8e-message" required></textarea></div><div class="fob-s8-actions full"><button class="fob-s8-btn gold">Send enquiry</button><button class="fob-s8-btn secondary" type="button" id="s8e-cancel">Cancel</button></div></form>`;
    el.appendChild(wrap); wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    document.getElementById('s8e-cancel').onclick = () => wrap.remove();
    document.getElementById('s8-enquiry-form').onsubmit = async e => {
      e.preventDefault(); const c = supabase(); if (!c) return;
      const payload = { kind: 'biodiversity_intelligence', name: document.getElementById('s8e-name').value.trim(), email: document.getElementById('s8e-email').value.trim(), org: document.getElementById('s8e-org').value.trim(), message: document.getElementById('s8e-message').value.trim(), meta: JSON.stringify({ product_id: p.id, product: p.name, scope: document.getElementById('s8e-scope').value.trim() }) };
      const { error } = await c.from('enquiries').insert(payload);
      if (error) return alert('We could not send the enquiry: ' + error.message);
      try { global.FoBSprint8?.track?.('data_product_enquiry', { product_id: p.id }); } catch (_) {}
      alert('Enquiry sent to the UBF team.'); wrap.remove();
    };
  }

  function renderMembership() {
    const el = document.getElementById('fob-s8-membership'); if (!el) return;
    const member = (() => { try { return typeof currentUser !== 'undefined' ? currentUser : null; } catch (_) { return null; } })();
    const tier = member?.tier || 'silver';
    const tierLabel = String(tier).replace(/^./, x => x.toUpperCase());
    el.innerHTML = `<div class="fob-s8-banner"><h3>Green Card membership</h3><p>Your membership should connect contribution to participation, learning and visible conservation impact.</p></div><div class="fob-s8-grid two"><div class="fob-s8-card"><span class="fob-s8-pill">Current status</span><div class="fob-s8-kpi">${member ? esc(tierLabel) : 'Guest'}</div><p>${member ? `Welcome back, ${esc(member.name || 'member')}. Your existing account remains the source of truth while the new membership ledger is adopted.` : 'Sign in or join the Friends of Biodiversity movement to unlock member-specific services.'}</p><div class="fob-s8-actions"><button class="fob-s8-btn gold" id="s8-membership-action">${member ? 'View my profile' : 'Join Green Card'}</button></div></div><div class="fob-s8-card"><h3>Membership ladder</h3><table class="fob-s8-table"><thead><tr><th>Tier</th><th>Purpose</th></tr></thead><tbody><tr><td>🎓 Student</td><td>Youth participation & in-kind contribution</td></tr><tr><td>🥈 Silver</td><td>Core individual membership</td></tr><tr><td>🥇 Gold</td><td>Engaged supporter & network</td></tr><tr><td>💎 Platinum</td><td>Strategic partnership</td></tr><tr><td>🔷 Diamond</td><td>Major conservation patron</td></tr><tr><td>🤝 Partner</td><td>Institutional participation</td></tr></tbody></table></div></div>`;
    document.getElementById('s8-membership-action')?.addEventListener('click', () => {
      try { if (member && typeof showView === 'function') showView('profile'); else if (typeof openModal === 'function') openModal('m-join'); else alert('Use the main app navigation to join or open your profile.'); } catch (_) { alert('Use the main app navigation to join or open your profile.'); }
    });
  }

  async function renderAdmin() {
    const el = document.getElementById('fob-s8-admin'); if (!el || !state.staff) return;
    el.innerHTML = '<div class="fob-s8-card"><h3>Loading intelligence cockpit…</h3></div>';
    const c = supabase(); if (!c) return;
    const safeCount = async table => { const r = await c.from(table).select('*', { count: 'exact', head: true }); return r.error ? 0 : (r.count || 0); };
    const [memberships, transactions, sightings, leads, orders, analytics] = await Promise.all([safeCount('memberships'),safeCount('payment_transactions'),safeCount('sightings'),safeCount('institution_leads'),safeCount('data_product_orders'),safeCount('analytics_events')]);
    let revenue = 0, verified = 0, funnel = 0;
    try { const r = await c.from('payment_transactions').select('amount_ugx').eq('status','successful'); revenue = (r.data || []).reduce((s,x)=>s + Number(x.amount_ugx || 0),0); } catch (_) {}
    try { const r = await c.from('sightings').select('*',{count:'exact',head:true}).eq('verified',true); verified = r.count || 0; } catch (_) {}
    try { const r = await c.from('institution_leads').select('estimated_value_ugx,probability'); funnel = (r.data || []).reduce((s,x)=>s + (Number(x.estimated_value_ugx||0)*Number(x.probability||0)/100),0); } catch (_) {}
    el.innerHTML = `<div class="fob-s8-banner"><h3>Staff intelligence cockpit</h3><p>Operational view across members, revenue, citizen science, institutional pipeline and product demand.</p></div><div class="fob-s8-grid"><div class="fob-s8-card"><span class="fob-s8-pill">Memberships</span><div class="fob-s8-kpi">${memberships}</div><p>records in the new membership ledger.</p></div><div class="fob-s8-card"><span class="fob-s8-pill">Revenue</span><div class="fob-s8-kpi">${money(revenue)}</div><p>successful transactions only.</p></div><div class="fob-s8-card"><span class="fob-s8-pill">Observations</span><div class="fob-s8-kpi">${sightings}</div><p>${verified} verified records.</p></div><div class="fob-s8-card"><span class="fob-s8-pill">Institutional leads</span><div class="fob-s8-kpi">${leads}</div><p>weighted pipeline: ${money(funnel)}.</p></div><div class="fob-s8-card"><span class="fob-s8-pill">Data-product orders</span><div class="fob-s8-kpi">${orders}</div><p>commercial delivery workflow records.</p></div><div class="fob-s8-card"><span class="fob-s8-pill">Analytics events</span><div class="fob-s8-kpi">${analytics}</div><p>product engagement events captured so far.</p></div></div><div class="fob-s8-note">Finance numbers come from the canonical payment ledger. Citizen-science records are separated into submitted and verified evidence so the commercial data layer can stay defensible.</div>`;
  }

  function installGlobalBridge() {
    global.FoBSprint8UI = Object.freeze({ open, close, refresh, selectTab });
    try {
      document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    } catch (_) {}
  }

  function boot() { renderShell(); installGlobalBridge(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})(window);
