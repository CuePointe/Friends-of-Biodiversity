/* Friends of Biodiversity — Auth/profile bridge
 * Ensures every Supabase Auth session has a corresponding public.profiles row.
 * This is intentionally independent of the legacy UI so RBAC can be adopted safely.
 */
(function (global) {
  'use strict';

  function client() {
    try { return (typeof sb !== 'undefined' && sb) ? sb : null; } catch (_) { return null; }
  }

  async function syncProfile(user) {
    const c = client();
    if (!c || !user) return;
    try {
      const email = String(user.email || '').toLowerCase();
      let member = null;
      const lookup = await c.from('members')
        .select('id,name,email,tel,org,role,status,auth_user_id')
        .or('auth_user_id.eq.' + user.id + (email ? ',email.eq.' + email : ''))
        .limit(5);
      if (!lookup.error && Array.isArray(lookup.data) && lookup.data.length) {
        member = lookup.data.find(x => x.auth_user_id === user.id) || lookup.data[0];
      }

      const role = member && ['member','moderator','verifier','finance','communications','admin','super_admin'].includes(member.role)
        ? member.role : 'member';
      const status = member && ['active','suspended','pending','deleted'].includes(member.status)
        ? member.status : 'active';
      const profile = {
        id: user.id,
        full_name: (member && member.name) || user.user_metadata?.full_name || email || 'Friends of Biodiversity member',
        email,
        phone: (member && member.tel) || null,
        organisation: (member && member.org) || null,
        role,
        status
      };
      const upsert = await c.from('profiles').upsert(profile, { onConflict: 'id' });
      if (upsert.error) console.warn('[FoB profile bridge]', upsert.error.message);

      if (member && member.auth_user_id !== user.id) {
        const linked = await c.from('members').update({ auth_user_id: user.id }).eq('id', member.id);
        if (linked.error && linked.error.code !== '42703') console.warn('[FoB member bridge]', linked.error.message);
      }
    } catch (error) {
      console.warn('[FoB profile bridge]', error);
    }
  }

  function install() {
    const c = client();
    if (!c || !c.auth || typeof c.auth.onAuthStateChange !== 'function') return;
    c.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Defer the database work out of Supabase's auth callback turn.
        setTimeout(() => syncProfile(session.user), 0);
      }
    });
  }

  global.FoBSprint8Auth = Object.freeze({ syncProfile });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})(window);
