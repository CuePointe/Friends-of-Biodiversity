/* Friends of Biodiversity — Sprint 8 strategic product layer
 * Visible public architecture for the biodiversity-intelligence network.
 * Additive: does not replace the legacy SPA.
 */
(function (global) {
  'use strict';

  const esc = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const money = (v) => new Intl.NumberFormat('en-UG', {
    style: 'currency', currency: 'UGX', maximumFractionDigits: 0
  }).format(Number(v) || 0);

  const num = (v) => new Intl.NumberFormat('en-UG').format(Number(v) || 0);

  const css = `
  #fob-s8-strategy{font-family:Inter,system-ui,sans-serif;color:#173522;background:#f6f1e7;border-top:1px solid #e5ddcf;margin-top:28px}
  .fob-s8s-wrap{max-width:1180px;margin:auto;padding:46px 22px 60px}
  .fob-s8s-hero{background:linear-gradient(135deg,#0b2618,#174930);color:#fff;border-radius:26px;padding:42px 34px;box-shadow:0 18px 55px rgba(11,38,24,.18)}
  .fob-s8s-eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#ead79d;font-weight:900}.fob-s8s-hero h2{font:900 42px/1.04 Georgia,serif;margin:10px 0 12px;color:#fff;max-width:820px}.fob-s8s-hero p{max-width:760px;line-height:1.7;color:rgba(255,255,255,.82);font-size:16px}
  .fob-s8s-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.fob-s8s-btn{border:0;border-radius:11px;padding:11px 16px;font-weight:850;cursor:pointer}.fob-s8s-btn.gold{background:#d8b55a;color:#0b2618}.fob-s8s-btn.light{background:#fff;color:#173522}.fob-s8s-btn.ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.28)}
  .fob-s8s-section{margin-top:34px}.fob-s8s-section h3{font:900 28px/1.15 Georgia,serif;margin:0 0 8px;color:#173522}.fob-s8s-lede{color:#667168;line-height:1.65;max-width:760px}
  .fob-s8s-hierarchy{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-top:22px}.fob-s8s-node{position:relative;background:#fff;border:1px solid #e2dacb;border-radius:15px;padding:14px 12px;min-height:104px;display:flex;flex-direction:column;justify-content:center;box-shadow:0 7px 24px rgba(57,40,17,.05)}.fob-s8s-node:not(:last-child)::after{content:'→';position:absolute;right:-9px;top:50%;transform:translateY(-50%);z-index:2;color:#8c9b90;font-weight:900}.fob-s8s-node strong{font-size:14px;color:#173522}.fob-s8s-node span{font-size:11px;color:#6c776e;margin-top:5px;line-height:1.4}
  .fob-s8s-journey{display:flex;gap:0;overflow:auto;padding:18px 0 4px}.fob-s8s-step{min-width:126px;text-align:center;position:relative}.fob-s8s-step:not(:last-child)::after{content:'→';position:absolute;right:-2px;top:18px;color:#9ba59d}.fob-s8s-dot{width:38px;height:38px;border-radius:50%;margin:0 auto 8px;display:grid;place-items:center;background:#173f29;color:#fff;font-weight:900}.fob-s8s-step b{display:block;font-size:12px}.fob-s8s-step small{display:block;color:#7a827c;margin-top:4px}
  .fob-s8s-markets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.fob-s8s-market{background:#fff;border:1px solid #e2dacb;border-radius:18px;padding:22px}.fob-s8s-market h4{font-size:19px;margin:0;color:#173522}.fob-s8s-market .tag{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#728076;font-weight:900;margin-top:6px}.fob-s8s-market p{line-height:1.6;color:#626e66}.fob-s8s-market ul{margin:12px 0 0;padding-left:18px;color:#4e5d53;line-height:1.8}.fob-s8s-goal{margin-top:14px;padding-top:12px;border-top:1px solid #eee6d9;font-weight:850;color:#0b2618}
  .fob-s8s-tiers{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.fob-s8s-tier{background:#fff;border:1px solid #e2dacb;border-radius:16px;padding:18px}.fob-s8s-tier .rung{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#8a7660;font-weight:900}.fob-s8s-tier h4{margin:6px 0;font-size:18px}.fob-s8s-tier p{margin:0;color:#677269;font-size:13px;line-height:1.55}
  .fob-s8s-badges{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px}.fob-s8s-badge{background:#fff;border:1px solid #e4dccf;border-radius:14px;padding:15px 10px;text-align:center}.fob-s8s-badge .ico{font-size:25px;display:block}.fob-s8s-badge b{display:block;margin-top:6px;font-size:11px}
  .fob-s8s-stories{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.fob-s8s-story{background:#fff;border:1px solid #e2dacb;border-radius:15px;padding:17px}.fob-s8s-story .label{font-size:10px;text-transform:uppercase;letter-spacing:.11em;color:#7d8a80;font-weight:900}.fob-s8s-story h4{margin:7px 0;font-size:16px}.fob-s8s-story p{font-size:12px;line-height:1.55;color:#677269;margin:0}
  .fob-s8s-pulse{background:#0b2618;color:#fff;border-radius:24px;padding:28px;margin-top:34px}.fob-s8s-pulse h3{color:#fff;margin-bottom:4px}.fob-s8s-pulse .lede{color:rgba(255,255,255,.7);margin:0 0 18px}.fob-s8s-filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}.fob-s8s-filters select{border:1px solid rgba(255,255,255,.18);background:#173f29;color:#fff;border-radius:9px;padding:9px 10px;font:inherit}.fob-s8s-kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}.fob-s8s-kpi{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:14px}.fob-s8s-kpi strong{display:block;font-size:25px;color:#fff}.fob-s8s-kpi span{display:block;color:rgba(255,255,255,.65);font-size:11px;line-height:1.35;margin-top:4px}
  .fob-s8s-trust{display:grid;grid-template-columns:1.05fr .95fr;gap:16px}.fob-s8s-trust-panel{background:#fff;border:1px solid #e2dacb;border-radius:18px;padding:23px}.fob-s8s-impact{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:18px}.fob-s8s-impact div{padding:13px;background:#f5f0e6;border-radius:12px}.fob-s8s-impact strong{display:block;font-size:20px}.fob-s8s-impact span{display:block;font-size:11px;color:#6f796f;margin-top:4px}.fob-s8s-source{font-size:11px;color:#778078;margin-top:16px}.fob-s8s-products{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.fob-s8s-product{background:#f9f5ed;border:1px solid #e7dfd1;border-radius:14px;padding:16px}.fob-s8s-product strong{display:block}.fob-s8s-product span{display:block;color:#667168;font-size:12px;line-height:1.5;margin-top:5px}.fob-s8s-product .price{margin-top:10px;font-weight:900;color:#0b2618}
  @media(max-width:1000px){.fob-s8s-hierarchy{grid-template-columns:repeat(3,1fr)}.fob-s8s-node:nth-child(3)::after{display:none}.fob-s8s-kpis{grid-template-columns:repeat(3,1fr)}.fob-s8s-badges{grid-template-columns:repeat(4,1fr)}.fob-s8s-stories{grid-template-columns:repeat(3,1fr)}.fob-s8s-tiers{grid-template-columns:repeat(3,1fr)}.fob-s8s-trust{grid-template-columns:1fr}}
  @media(max-width:700px){.fob-s8s-wrap{padding:32px 14px 44px}.fob-s8s-hero{padding:30px 22px}.fob-s8s-hero h2{font-size:32px}.fob-s8s-hierarchy,.fob-s8s-markets,.fob-s8s-tiers,.fob-s8s-stories,.fob-s8s-products{grid-template-columns:1fr 1fr}.fob-s8s-kpis{grid-template-columns:1fr 1fr}.fob-s8s-badges{grid-template-columns:repeat(3,1fr)}.fob-s8s-impact{grid-template-columns:1fr 1fr}}
  `;

  const state = { rows: [], pulse: null, metrics: [] };

  function db(){
    try{return (typeof sb !== 'undefined' && sb && typeof sb.from === 'function') ? sb : null;}catch(_){return null;}
  }

  function injectCss(){
    if(document.getElementById('fob-s8-strategy-style')) return;
    const s=document.createElement('style'); s.id='fob-s8-strategy-style'; s.textContent=css; document.head.appendChild(s);
  }

  async function loadData(){
    const c=db(); if(!c) return;
    const results=await Promise.allSettled([
      c.from('biodiversity_pulse').select('*').limit(1).maybeSingle(),
      c.from('accountability_metrics').select('*').eq('published',true).order('metric_label',{ascending:true}),
      c.from('sightings').select('species,observed_at,verified,habitat').limit(2000),
      c.from('species').select('common_name,conservation_status').eq('active',true).limit(1000),
      c.from('data_products').select('*').eq('active',true).order('created_at',{ascending:true})
    ]);
    state.pulse=results[0].status==='fulfilled' && !results[0].value.error ? (results[0].value.data||null) : null;
    state.metrics=results[1].status==='fulfilled' && !results[1].value.error ? (results[1].value.data||[]) : [];
    state.rows=results[2].status==='fulfilled' && !results[2].value.error ? (results[2].value.data||[]) : [];
    state.species=results[3].status==='fulfilled' && !results[3].value.error ? (results[3].value.data||[]) : [];
    state.products=results[4].status==='fulfilled' && !results[4].value.error ? (results[4].value.data||[]) : [];
  }

  function metric(key,label){
    const found=state.metrics.find(x=>x.metric_key===key || x.metric_label===label);
    if(!found) return '—';
    return found.value_numeric!=null ? num(found.value_numeric)+(found.unit? ' '+found.unit:'') : (found.value_text||'—');
  }

  function renderPulse(){
    const p=state.pulse||{};
    const total=Number(p.total_observations)||state.rows.length;
    const verified=Number(p.verified_observations)||state.rows.filter(x=>x.verified).length;
    const distinct=Number(p.distinct_species)||new Set(state.rows.map(x=>x.species).filter(Boolean)).size;
    const contributors=Number(p.contributing_members)||0;
    const month=Number(p.observations_30d)||0;
    const landscapes=new Set(state.rows.map(x=>x.habitat).filter(Boolean)).size;
    const urgent=state.species.filter(x=>x.conservation_status && !/least concern|lc/i.test(x.conservation_status)).length;
    return {total,verified,distinct,contributors,month,landscapes,urgent};
  }

  function wireActions(root){
    root.querySelectorAll('[data-fob-action]').forEach(btn=>btn.addEventListener('click',()=>{
      const action=btn.dataset.fobAction;
      if(action==='join' && typeof global.selectTier==='function'){global.selectTier('silver'); return;}
      if(action==='datapack' && typeof global.openEnquiry==='function'){global.openEnquiry('datapack'); return;}
      if(action==='partner' && typeof global.openEnquiry==='function'){global.openEnquiry('sponsor'); return;}
      const launcher=document.getElementById('fob-s8-launch'); if(launcher) launcher.click();
    }));
  }

  function render(){
    const host=document.getElementById('view-main') || document.body;
    if(document.getElementById('fob-s8-strategy')) return;
    injectCss();
    const p=renderPulse();
    const el=document.createElement('section'); el.id='fob-s8-strategy';
    el.innerHTML=`
      <div class="fob-s8s-wrap">
        <div class="fob-s8s-hero">
          <div class="fob-s8s-eyebrow">Uganda Biodiversity Fund · Friends of Biodiversity</div>
          <h2>Become part of Uganda's biodiversity intelligence network.</h2>
          <p>Care about Uganda's living systems? Join the movement, learn what matters, observe what you see, and help build evidence that makes better conservation decisions possible.</p>
          <div class="fob-s8s-actions"><button class="fob-s8s-btn gold" data-fob-action="join">Join the Green Card</button><button class="fob-s8s-btn ghost" data-fob-action="datapack">For institutions & technical buyers</button></div>
        </div>

        <div class="fob-s8s-section">
          <h3>A simple architecture</h3><p class="fob-s8s-lede">Each layer has one clear job: UBF is the institution; Friends of Biodiversity is the movement; the Green Card is membership; the app is the digital relationship; Citizen Science creates evidence; Conservation Intelligence turns verified evidence into institutional value.</p>
          <div class="fob-s8s-hierarchy">
            <div class="fob-s8s-node"><strong>UBF</strong><span>The institution</span></div>
            <div class="fob-s8s-node"><strong>Friends of Biodiversity</strong><span>The membership movement</span></div>
            <div class="fob-s8s-node"><strong>Green Card</strong><span>Your membership</span></div>
            <div class="fob-s8s-node"><strong>FoB App</strong><span>Your digital relationship with the movement</span></div>
            <div class="fob-s8s-node"><strong>Citizen Science</strong><span>Your opportunity to contribute biodiversity intelligence</span></div>
            <div class="fob-s8s-node"><strong>Conservation Intelligence</strong><span>The institutional data product</span></div>
          </div>
        </div>

        <div class="fob-s8s-section"><h3>The journey</h3><p class="fob-s8s-lede">A member does more than pay. The relationship compounds from care to evidence to better decisions.</p>
          <div class="fob-s8s-journey">
            ${['You care.','You join.','You learn.','You observe.','You contribute evidence.','UBF verifies it.','Uganda understands better.','Institutions use better information.','Better decisions support better conservation.','Your membership sustains the system.'].map((x,i)=>`<div class="fob-s8s-step"><div class="fob-s8s-dot">${i+1}</div><b>${x}</b></div>`).join('')}
          </div>
        </div>

        <div class="fob-s8s-section"><h3>Three markets. One network.</h3>
          <div class="fob-s8s-markets">
            <div class="fob-s8s-market"><div class="tag">Market A · Citizens</div><h4>Protect what you love.</h4><p>Membership and engagement built around participation, learning and identity.</p><ul><li>Green Card</li><li>Learning</li><li>Community</li><li>Events</li><li>Citizen Science</li><li>Badges</li></ul><div class="fob-s8s-goal">Goal: membership + engagement</div></div>
            <div class="fob-s8s-market"><div class="tag">Market B · Institutions</div><h4>Put biodiversity into practice.</h4><p>Turn conservation from a donation line into an active organisational programme.</p><ul><li>Institutional Green Card</li><li>ESG engagement</li><li>Employee conservation programmes</li><li>Biodiversity reporting</li><li>Partnership programmes</li><li>Citizen-science projects</li></ul><div class="fob-s8s-goal">Goal: memberships + partnerships</div></div>
            <div class="fob-s8s-market"><div class="tag">Market C · Technical buyers</div><h4>Better biodiversity evidence for better decisions.</h4><p>Verified, appropriately governed intelligence for technical and conservation use cases.</p><ul><li>Biodiversity data packs</li><li>Research datasets</li><li>Monitoring</li><li>Dashboards</li><li>Spatial intelligence</li></ul><div class="fob-s8s-goal">Goal: data + service revenue</div></div>
          </div>
        </div>

        <div class="fob-s8s-section"><h3>Membership progression</h3><div class="fob-s8s-tiers">
          ${[['Student','Participate','Projects, volunteering, learning, citizen science.'],['Silver','Support','Membership, learning and visible impact.'],['Gold','Engage','Events, networking and project visibility.'],['Platinum','Partner','Strategic engagement, reporting and co-branding.'],['Diamond','Lead','Strategic conservation partnership and bespoke biodiversity/ESG engagement.']].map(x=>`<div class="fob-s8s-tier"><div class="rung">${x[1]}</div><h4>${x[0]}</h4><p>${x[2]}</p></div>`).join('')}
        </div></div>

        <div class="fob-s8s-section"><h3>Conservation identity</h3><p class="fob-s8s-lede">Badges turn contribution into a story members can see on their profile.</p><div class="fob-s8s-badges">
          ${[['🔭','Observer'],['🌱','Habitat Protector'],['🦋','Species Guardian'],['🗺️','Field Explorer'],['🔬','Citizen Scientist'],['🤝','Conservation Connector'],['🏆','Conservation Champion']].map(x=>`<div class="fob-s8s-badge"><span class="ico">${x[0]}</span><b>${x[1]}</b></div>`).join('')}
        </div></div>

        <div class="fob-s8s-section"><h3>Stories that keep the network alive</h3><div class="fob-s8s-stories">
          ${[['Meet the Species','“You have probably never noticed this creature. Here is why it matters.”'],['Behind the Impact','“What happened to your contribution?”'],['Field Notes','Citizen-science observations from the field.'],['One Number','One powerful conservation metric, explained.'],['Conservation Stories','Human-centred stories from communities, researchers and field workers.']].map(x=>`<div class="fob-s8s-story"><div class="label">Recurring format</div><h4>${x[0]}</h4><p>${x[1]}</p></div>`).join('')}
        </div></div>

        <div class="fob-s8s-pulse" id="fob-s8-pulse"><h3>Uganda Biodiversity Pulse</h3><p class="lede">A public window into the evidence being built by the network. Counts are drawn from the live biodiversity data layer; where a field is not yet populated, the interface shows that honestly.</p>
          <div class="fob-s8s-filters"><select id="fob-pulse-year"><option value="all">Year · All</option></select><select id="fob-pulse-region"><option>Region · All</option></select><select id="fob-pulse-ecosystem"><option value="all">Ecosystem · All</option></select><select id="fob-pulse-species"><option value="all">Species · All</option></select><select id="fob-pulse-threat"><option value="all">Threat · All</option></select></div>
          <div class="fob-s8s-kpis" id="fob-pulse-kpis">
            <div class="fob-s8s-kpi"><strong>${num(p.distinct)}</strong><span>Species observed</span></div><div class="fob-s8s-kpi"><strong>${num(p.verified)}</strong><span>Verified observations</span></div><div class="fob-s8s-kpi"><strong>${p.landscapes ? num(p.landscapes) : '—'}</strong><span>Habitats represented</span></div><div class="fob-s8s-kpi"><strong>${p.contributors ? num(p.contributors) : '—'}</strong><span>Contributing citizen scientists</span></div><div class="fob-s8s-kpi"><strong>${num(p.urgent)}</strong><span>Species requiring attention*</span></div><div class="fob-s8s-kpi"><strong>${num(p.month)}</strong><span>Observations in last 30 days</span></div>
          </div><div style="font-size:10px;color:rgba(255,255,255,.52);margin-top:12px">*Attention count is based on populated conservation-status records, not an invented risk model.</div>
        </div>

        <div class="fob-s8s-section"><h3>The accountability trust engine</h3><div class="fob-s8s-trust">
          <div class="fob-s8s-trust-panel"><h4 style="margin:0">Your community this year</h4><p class="fob-s8s-lede">Replace generic impact language with traceable numbers and a visible update date.</p><div class="fob-s8s-impact">
            <div><strong>${metric('money_mobilised','Money mobilised')}</strong><span>mobilised</span></div><div><strong>${metric('hectares_restored','Hectares restored')}</strong><span>hectares restored</span></div><div><strong>${metric('trees_supported','Trees supported')}</strong><span>trees supported</span></div><div><strong>${metric('communities_reached','Communities reached')}</strong><span>communities reached</span></div><div><strong>${num(p.verified)}</strong><span>species observations verified</span></div><div><strong>${metric('projects_supported','Projects supported')}</strong><span>projects supported</span></div>
          </div><div class="fob-s8s-source">Data updated: ${new Date().toLocaleDateString('en-UG',{day:'2-digit',month:'short',year:'numeric'})}<br>Source: UBF programme records</div></div>
          <div class="fob-s8s-trust-panel"><h4 style="margin:0">Conservation Intelligence</h4><p class="fob-s8s-lede">The institutional layer built from appropriately governed, verified evidence.</p><div class="fob-s8s-products">${state.products.map(x=>`<div class="fob-s8s-product"><strong>${esc(x.name)}</strong><span>${esc(x.description||'Verified biodiversity intelligence for informed decisions.')}</span><span>${esc(x.buyer_segment||'Institutional & technical buyers')}</span><div class="price">${x.price_ugx ? money(x.price_ugx) : 'Request scope & quote'}</div></div>`).join('') || '<div class="fob-s8s-product"><strong>Biodiversity Intelligence Pack</strong><span>Request a scoped evidence product for EIA, research, monitoring or conservation planning.</span><div class="price">Request scope & quote</div></div>'}</div><div class="fob-s8s-actions"><button class="fob-s8s-btn gold" data-fob-action="datapack">Request intelligence</button><button class="fob-s8s-btn light" data-fob-action="partner">Build a partnership</button></div></div>
        </div></div>
      </div>`;
    if(host===document.body) host.appendChild(el); else host.appendChild(el);
    wireActions(el);
  }

  function boot(){
    if(!document.body) return;
    render();
    loadData().then(()=>{
      const live=document.getElementById('fob-s8-strategy');
      if(live){live.remove(); render();}
    }).catch(()=>{});
  }

  global.FoBStrategy={refresh:boot};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else setTimeout(boot,0);
})(window);
