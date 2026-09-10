/* Friends of Biodiversity — Sprint 8 member intelligence shell
 * Focused product layer: Biodiversity Intelligence belongs inside the member account.
 * Public homepage remains the public acquisition/education experience.
 *
 * Intelligence workspace contains exactly four member actions:
 * - Steward Briefings
 * - EIA Biodiversity Data Pack
 * - Citizen Science
 * - Bring a Member
 */
(function (global) {
  'use strict';

  const esc = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;').replace(/'/g, '&#39;');

  const TIER_RANK = { student: 1, silver: 1, gold: 2, platinum: 3, diamond: 4, partner: 2 };
  const PACKAGE_ID = 'fob-bi-package';

  const css = `
  #fob-bi-rail{position:fixed;right:16px;top:50%;transform:translateY(-50%);z-index:1800;font-family:Inter,system-ui,sans-serif}
  #fob-bi-launch{display:none!important;width:62px;min-height:150px;border:1px solid rgba(200,168,75,.45);border-radius:18px;background:linear-gradient(180deg,#123a25,#0b2618);color:#fff;box-shadow:0 12px 34px rgba(0,0,0,.22);cursor:pointer;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:12px 9px}
  #fob-bi-launch .ico{font-size:24px;line-height:1}
  #fob-bi-launch .txt{font-size:11px;font-weight:900;line-height:1.15;text-align:center;writing-mode:vertical-rl;transform:rotate(180deg);letter-spacing:.04em}
  #fob-bi-panel{display:none;position:fixed;inset:0;background:rgba(5,18,11,.56);backdrop-filter:blur(3px);padding:18px;overflow:auto;z-index:1801}
  #fob-bi-panel.open{display:block}
  .fob-bi-shell{width:min(940px,100%);margin:34px auto;background:#f6f1e7;border-radius:22px;box-shadow:0 26px 78px rgba(0,0,0,.28);overflow:hidden}
  .fob-bi-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:22px 24px;background:#0b2618;color:#fff}
  .fob-bi-head h2{margin:0;font:900 27px/1.08 Georgia,serif}.fob-bi-head p{margin:6px 0 0;color:rgba(255,255,255,.7);font-size:13px}
  .fob-bi-close{border:1px solid rgba(255,255,255,.25);background:transparent;color:#fff;border-radius:10px;padding:8px 11px;cursor:pointer}
  .fob-bi-body{padding:20px}
  .fob-bi-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  .fob-bi-card{background:#fff;border:1px solid #e4ddce;border-radius:17px;padding:20px;min-height:190px;display:flex;flex-direction:column;box-shadow:0 8px 28px rgba(54,39,15,.05)}
  .fob-bi-card .eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#788277;font-weight:900}.fob-bi-card h3{margin:7px 0 6px;font:900 21px/1.12 Georgia,serif;color:#173522}.fob-bi-card p{margin:0;color:#5d685f;font-size:13px;line-height:1.6}.fob-bi-card .meta{margin-top:9px;font-size:12px;color:#718077}.fob-bi-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:auto;padding-top:15px}.fob-bi-btn{border:0;border-radius:10px;padding:10px 13px;font-weight:850;cursor:pointer;background:#0b2618;color:#fff}.fob-bi-btn.gold{background:#d8b55a;color:#0b2618}.fob-bi-btn.soft{background:#ece6db;color:#173522}
  .fob-bi-list{margin-top:15px;border-top:1px solid #ece6dc}.fob-bi-item{padding:12px 0;border-bottom:1px solid #ece6dc}.fob-bi-item:last-child{border-bottom:0}.fob-bi-item strong{display:block;color:#173522;font-size:13px}.fob-bi-item span{display:block;color:#6b756d;font-size:12px;line-height:1.5;margin-top:3px}.fob-bi-empty{padding:18px 0;color:#737d75;font-size:13px}
  .fob-bi-topline{padding:14px 16px;margin-bottom:16px;border-radius:13px;background:linear-gradient(135deg,#173f29,#0b2618);color:#fff}.fob-bi-topline strong{font-size:15px}.fob-bi-topline span{display:block;color:rgba(255,255,255,.72);font-size:12px;line-height:1.5;margin-top:4px}
  .fob-bi-note{margin-top:15px;padding:11px 13px;border-radius:11px;background:#f0eadf;color:#526057;font-size:12px;line-height:1.55}
  #${PACKAGE_ID}{cursor:pointer;border:1px solid rgba(200,168,75,.55);background:linear-gradient(135deg,rgba(200,168,75,.10),rgba(45,106,79,.08));color:inherit;font:inherit;text-align:left;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
  #${PACKAGE_ID}:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,0,0,.10);border-color:rgba(200,168,75,.9)}
  #${PACKAGE_ID}:focus-visible{outline:2px solid #C8A84B;outline-offset:2px}
  #${PACKAGE_ID} .pc-txt{font-weight:800}
  @media(max-width:760px){#fob-bi-rail{right:10px;top:auto;bottom:84px;transform:none}#fob-bi-launch{width:58px;min-height:58px;border-radius:50%;padding:0;gap:0}.fob-bi-launch .txt{display:none}.fob-bi-shell{margin:10px auto;border-radius:17px}.fob-bi-head{padding:17px}.fob-bi-body{padding:14px}.fob-bi-grid{grid-template-columns:1fr}.fob-bi-card{min-height:0}}
  `;

  const state = { briefings: [], products: [], user: null, member: null };

  function db(){
    try{return (typeof sb !== 'undefined' && sb && typeof sb.from === 'function') ? sb : null;}catch(_){return null;}
  }

  function injectStyle(){
    if(document.getElementById('fob-bi-style')) return;
    const style=document.createElement('style');style.id='fob-bi-style';style.textContent=css;document.head.appendChild(style);
  }

  async function authUser(){
    const c=db();
    if(!c||!c.auth) return null;
    try{return (await c.auth.getUser()).data?.user||null;}catch(_){return null;}
  }

  async function memberForUser(user){
    if(!user) return null;
    try{
      const c=db();
      const {data}=await c.from('members').select('id,name,email,tier,amount,year,role,status,auth_user_id').or(`auth_user_id.eq.${user.id},email.eq.${String(user.email||'').toLowerCase()}`).limit(5);
      return (data||[]).find(x=>x.auth_user_id===user.id)||data?.[0]||null;
    }catch(_){return null;}
  }

  async function loadBriefings(){
    const c=db(); if(!c) return [];
    try{
      const {data,error}=await c.from('briefings').select('id,title,kind,body,file_url,file_name,file_type,link_url,session_at,recording_url,min_tier,created_at').order('created_at',{ascending:false}).limit(24);
      if(error){console.warn('[FoB BI] briefings',error.message);return []}
      state.briefings=data||[];return state.briefings;
    }catch(_){return []}
  }

  async function loadProducts(){
    const c=db(); if(!c) return [];
    try{
      const {data,error}=await c.from('data_products').select('id,slug,name,description,buyer_segment,price_ugx,delivery_format,active').eq('active',true).order('created_at',{ascending:true});
      if(error){console.warn('[FoB BI] products',error.message);return []}
      state.products=data||[];return state.products;
    }catch(_){return []}
  }

  function tierAllowed(minTier){
    const memberTier=String(state.member?.tier||'silver').toLowerCase();
    return (TIER_RANK[memberTier]||1)>=(TIER_RANK[String(minTier||'gold').toLowerCase()]||2);
  }

  function findEiaProduct(){
    return state.products.find(p=>/eia|baseline|data.?pack|biodiversity.*pack/i.test(`${p.slug||''} ${p.name||''} ${p.description||''}`))||state.products[0]||null;
  }

  function openExistingSighting(){
    if(typeof global.openModal==='function'){global.openModal('m-sighting');return}
    const launch=document.getElementById('app-fab');
    if(launch) launch.click();
  }

  function bringMember(){
    if(typeof global.copyInvite==='function'){
      global.copyInvite();
      return;
    }
    const url=(location.origin||'https://www.ugandabiodiversityfund.org')+'/?ref='+(state.member?.id||'');
    navigator.clipboard?.writeText(url).then(()=>alert('Invite link copied — share it with a friend.')).catch(()=>alert(url));
  }

  function openProduct(product){
    if(!product) return;
    if(typeof global.openEnquiry==='function'){
      global.openEnquiry('datapack');
      return;
    }
    const c=db(); if(!c) return;
    const name=prompt(`Request ${product.name}\n\nTell UBF what you need:`,'EIA baseline / biodiversity data pack');
    if(!name) return;
    c.from('enquiries').insert({kind:'biodiversity_intelligence',name:state.member?.name||state.user?.email||'Member',email:state.member?.email||state.user?.email||'',org:'',message:name,meta:JSON.stringify({product_id:product.id,product:product.name,source:'member-biodiversity-intelligence'})}).then(({error})=>alert(error?'The request could not be sent: '+error.message:'Request sent to the UBF team.'));
  }

  async function renderPanel(){
    const panel=document.getElementById('fob-bi-panel');if(!panel)return;
    const eia=findEiaProduct();
    const allowedBriefings=state.briefings.filter(b=>tierAllowed(b.min_tier));
    const recent=allowedBriefings.slice(0,4);
    const briefingsHtml=recent.length?`<div class="fob-bi-list">${recent.map(b=>`<div class="fob-bi-item"><strong>${esc(b.title)}</strong><span>${esc(b.kind||'Briefing')}${b.session_at?' · '+esc(new Date(b.session_at).toLocaleString('en-UG',{dateStyle:'medium',timeStyle:'short'})):''}</span><div class="fob-bi-actions"><button class="fob-bi-btn soft" data-briefing="${esc(b.id)}">Open briefing</button></div></div>`).join('')}</div>`:`<div class="fob-bi-empty">No briefings are currently available for your membership level.</div>`;

    panel.querySelector('.fob-bi-body').innerHTML=`
      <div class="fob-bi-topline"><strong>Biodiversity Intelligence</strong><span>This is the member-only evidence layer — concise access to UBF briefings, EIA-ready biodiversity data, citizen observations and member growth.</span></div>
      <div class="fob-bi-grid">
        <article class="fob-bi-card"><div class="eyebrow">01 · Knowledge</div><h3>Steward Briefings</h3><p>Private UBF briefings, impact reports, finance notes and session recordings appropriate to your Green Card level.</p>${briefingsHtml}</article>
        <article class="fob-bi-card"><div class="eyebrow">02 · Evidence</div><h3>EIA Biodiversity Data Pack</h3><p>Request a scoped biodiversity baseline pack built from verified observations and species evidence for research, screening and EIA baseline work.</p><div class="meta">${eia?esc(eia.name):'Available to scope'}</div><div class="fob-bi-actions"><button class="fob-bi-btn gold" id="fob-bi-eia">Request data pack</button></div></article>
        <article class="fob-bi-card"><div class="eyebrow">03 · Field evidence</div><h3>Citizen Science</h3><p>Submit a biodiversity sighting from your member account. Verified records strengthen the shared evidence base.</p><div class="meta">Your observations are reviewed before becoming verified evidence.</div><div class="fob-bi-actions"><button class="fob-bi-btn gold" id="fob-bi-sight">Log a sighting</button></div></article>
        <article class="fob-bi-card"><div class="eyebrow">04 · Growth</div><h3>Bring a Member</h3><p>Invite someone who cares about Uganda’s biodiversity. Your personal referral link connects their registration back to your member account.</p><div class="meta">${typeof global.myReferralCount==='function'?esc(global.myReferralCount()):'0'} people currently attributed to your referral.</div><div class="fob-bi-actions"><button class="fob-bi-btn soft" id="fob-bi-invite">Copy my invite link</button></div></article>
      </div>
      <div class="fob-bi-note">Biodiversity Intelligence is deliberately separated from the public homepage. The public site explains the programme; this member workspace is where participation becomes evidence and evidence becomes useful intelligence.</div>`;

    panel.querySelector('#fob-bi-eia')?.addEventListener('click',()=>openProduct(eia));
    panel.querySelector('#fob-bi-sight')?.addEventListener('click',openExistingSighting);
    panel.querySelector('#fob-bi-invite')?.addEventListener('click',bringMember);
    panel.querySelectorAll('[data-briefing]').forEach(btn=>btn.addEventListener('click',()=>openBriefing(btn.dataset.briefing)));
  }

  async function openBriefing(id){
    const b=state.briefings.find(x=>String(x.id)===String(id));if(!b)return;
    const body=[b.body,b.file_url,b.link_url].filter(Boolean).join('');
    if(b.link_url){window.open(b.link_url,'_blank','noopener');return}
    if(b.file_url){window.open(b.file_url,'_blank','noopener');return}
    alert(b.title+'\n\n'+(body||'This briefing has no published body yet.'));
  }

  async function refresh(){
    state.user=await authUser();
    state.member=await memberForUser(state.user);
    if(!state.user||!state.member||state.member.status==='removed') return false;
    await Promise.all([loadBriefings(),loadProducts()]);
    await renderPanel();
    return true;
  }

  function openWorkspace(){
    const rail=document.getElementById('fob-bi-rail');
    if(rail) rail.style.display='block';
    refresh().then(ok=>{if(ok) document.getElementById('fob-bi-panel')?.classList.add('open')});
  }

  function mountPackageCard(){
    const host=document.querySelector('#view-member #mem-body .perk-chips');
    if(!host) return;
    let card=document.getElementById(PACKAGE_ID);
    if(!card){
      card=document.createElement('button');
      card.type='button';
      card.id=PACKAGE_ID;
      card.className='perk-chip fob-bi-package';
      card.setAttribute('aria-label','Open Biodiversity Intelligence');
      card.title='Briefings · EIA Data Pack · Citizen Science · Bring a Member';
      card.innerHTML='<span class="pc-ico">🧠</span><span class="pc-txt">Biodiversity Intelligence</span>';
      card.addEventListener('click',openWorkspace);
      host.appendChild(card);
    }else if(card.parentElement!==host){
      host.appendChild(card);
    }
  }

  function mount(){
    injectStyle();
    if(!document.getElementById('fob-bi-rail')){
      const rail=document.createElement('div');rail.id='fob-bi-rail';rail.style.display='none';
      rail.innerHTML=`<button id="fob-bi-launch" aria-label="Open Biodiversity Intelligence"><span class="ico">🧠</span><span class="txt">Biodiversity Intelligence</span></button>
        <div id="fob-bi-panel" role="dialog" aria-modal="true" aria-label="Biodiversity Intelligence"><div class="fob-bi-shell"><div class="fob-bi-head"><div><h2>Biodiversity Intelligence</h2><p>Member evidence &amp; intelligence workspace</p></div><button class="fob-bi-close" id="fob-bi-close">Close</button></div><div class="fob-bi-body"></div></div></div>`;
      document.body.appendChild(rail);
      document.getElementById('fob-bi-launch').addEventListener('click',openWorkspace);
      document.getElementById('fob-bi-close').addEventListener('click',()=>document.getElementById('fob-bi-panel')?.classList.remove('open'));
      document.getElementById('fob-bi-panel').addEventListener('click',e=>{if(e.target.id==='fob-bi-panel')e.currentTarget.classList.remove('open')});
      document.addEventListener('keydown',e=>{if(e.key==='Escape')document.getElementById('fob-bi-panel')?.classList.remove('open')});
    }
    observeMemberState();
    mountPackageCard();
    const vm=document.getElementById('view-member');
    if(vm)new MutationObserver(mountPackageCard).observe(vm,{subtree:true,childList:true});
  }

  function observeMemberState(){
    const sync=()=>{
      const isMember=!!document.body.classList.contains('has-tabbar') && !!document.getElementById('view-member')?.classList.contains('active');
      const rail=document.getElementById('fob-bi-rail');if(rail)rail.style.display=isMember?'block':'none';
      if(isMember) mountPackageCard();
    };
    sync();
    const mo=new MutationObserver(sync);mo.observe(document.body,{attributes:true,attributeFilter:['class']});
    const vm=document.getElementById('view-member');if(vm)new MutationObserver(sync).observe(vm,{attributes:true,attributeFilter:['class','style']});
  }

  function boot(){
    mount();
    global.FoBSprint8UI=Object.freeze({
      open:openWorkspace,
      close:()=>document.getElementById('fob-bi-panel')?.classList.remove('open'),
      refresh
    });
    mountPackageCard();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(window);