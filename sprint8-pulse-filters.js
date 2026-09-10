/* Friends of Biodiversity — Biodiversity Pulse interaction layer */
(function(global){
  'use strict';

  const esc=(v)=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const num=(v)=>new Intl.NumberFormat('en-UG').format(Number(v)||0);

  function db(){try{return (typeof sb!=='undefined'&&sb&&typeof sb.from==='function')?sb:null;}catch(_){return null;}}

  async function loadRows(){
    const c=db(); if(!c) return [];
    const [sightings,species]=await Promise.allSettled([
      c.from('sightings').select('species,observed_at,verified,habitat').limit(2000),
      c.from('species').select('common_name,conservation_status').eq('active',true).limit(1000)
    ]);
    const rows=sightings.status==='fulfilled'&&!sightings.value.error?(sightings.value.data||[]):[];
    const speciesRows=species.status==='fulfilled'&&!species.value.error?(species.value.data||[]):[];
    return {rows,speciesRows};
  }

  function populateSelect(id, values, prefix){
    const el=document.getElementById(id); if(!el) return;
    const old=el.value;
    const options=[`<option value="all">${esc(prefix)} · All</option>`].concat(values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`));
    el.innerHTML=options.join('');
    if(values.includes(old)) el.value=old;
  }

  function recalc(rows,speciesRows){
    const year=document.getElementById('fob-pulse-year')?.value||'all';
    const ecosystem=document.getElementById('fob-pulse-ecosystem')?.value||'all';
    const species=document.getElementById('fob-pulse-species')?.value||'all';
    let filtered=rows.slice();
    if(year!=='all') filtered=filtered.filter(r=>String(r.observed_at||'').slice(0,4)===year);
    if(ecosystem!=='all') filtered=filtered.filter(r=>String(r.habitat||'')===ecosystem);
    if(species!=='all') filtered=filtered.filter(r=>String(r.species||'')===species);

    const now=Date.now();
    const last30=30*86400000;
    const verified=filtered.filter(r=>r.verified).length;
    const distinct=new Set(filtered.map(r=>r.species).filter(Boolean)).size;
    const habitats=new Set(filtered.map(r=>r.habitat).filter(Boolean)).size;
    const month=filtered.filter(r=>{const t=Date.parse(r.observed_at||'');return Number.isFinite(t)&&(now-t)<=last30;}).length;
    const box=document.getElementById('fob-pulse-kpis'); if(!box) return;
    const required=speciesRows.filter(x=>x.conservation_status&&!/least concern|lc/i.test(x.conservation_status)).length;
    box.innerHTML=`
      <div class="fob-s8s-kpi"><strong>${num(distinct)}</strong><span>Species observed</span></div>
      <div class="fob-s8s-kpi"><strong>${num(verified)}</strong><span>Verified observations</span></div>
      <div class="fob-s8s-kpi"><strong>${habitats?num(habitats):'—'}</strong><span>Habitats represented</span></div>
      <div class="fob-s8s-kpi"><strong>—</strong><span>Active citizen scientists</span></div>
      <div class="fob-s8s-kpi"><strong>${num(required)}</strong><span>Species requiring attention*</span></div>
      <div class="fob-s8s-kpi"><strong>${num(month)}</strong><span>Observations in last 30 days</span></div>`;
  }

  async function boot(){
    const pulse=document.getElementById('fob-s8-pulse');
    if(!pulse) return;
    const data=await loadRows();
    const rows=data.rows,speciesRows=data.speciesRows;
    const years=[...new Set(rows.map(r=>String(r.observed_at||'').slice(0,4)).filter(x=>/^\d{4}$/.test(x)))].sort().reverse();
    const habitats=[...new Set(rows.map(r=>r.habitat).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b)));
    const species=[...new Set(rows.map(r=>r.species).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b)));
    populateSelect('fob-pulse-year',years,'Year');
    populateSelect('fob-pulse-ecosystem',habitats,'Ecosystem');
    populateSelect('fob-pulse-species',species,'Species');
    const region=document.getElementById('fob-pulse-region');
    const threat=document.getElementById('fob-pulse-threat');
    if(region){region.disabled=true;region.title='Region filtering will activate when observations are tagged by region.';region.innerHTML='<option>Region · Tagging pending</option>';}
    if(threat){threat.disabled=true;threat.title='Threat filtering will activate when threat data is captured.';threat.innerHTML='<option>Threat · Tagging pending</option>';}
    pulse.querySelectorAll('select').forEach(s=>s.addEventListener('change',()=>recalc(rows,speciesRows)));
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,150),{once:true});
  else setTimeout(boot,150);
})(window);
