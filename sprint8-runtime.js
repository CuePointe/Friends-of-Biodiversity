/*
 * Friends of Biodiversity — Sprint 8 runtime helpers
 *
 * Dependency-free helpers for the existing vanilla SPA. They are deliberately
 * isolated from app.js so the large legacy application can be migrated in small,
 * testable slices instead of receiving one risky rewrite.
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
        id = (crypto && crypto.randomUUID) ? crypto.randomUUID() :
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

    // Non-blocking browser event lets app.js integrate without a hard dependency.
    global.dispatchEvent(new CustomEvent('fob:sprint8-event', { detail: payload }));

    // Optional Supabase bridge. No key/credential is embedded here.
    if (global.sb && typeof global.sb.from === 'function') {
      try {
        const user = global.sb.auth && await global.sb.auth.getUser
          ? (await global.sb.auth.getUser()).data.user
          : null;
        payload.user_id = user ? user.id : null;
        const result = await global.sb.from('analytics_events').insert(payload);
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
    } catch (_) {
      // Older browsers: performance monitoring remains optional.
    }
  }

  function deferNonCriticalImages(root) {
    const scope = root || document;
    scope.querySelectorAll('img:not([loading])').forEach(img => {
      const rect = img.getBoundingClientRect();
      if (rect.top > innerHeight * 1.5) img.loading = 'lazy';
    });
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
    installPerformanceObserver,
    deferNonCriticalImages
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      installPerformanceObserver();
      deferNonCriticalImages();
    }, { once: true });
  } else {
    installPerformanceObserver();
    deferNonCriticalImages();
  }
})(window);
