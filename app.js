/* ═══════════════════════════════════════════
   FRIENDS OF BIODIVERSITY — APPLICATION LOGIC
   Uganda Biodiversity Fund
   Backend: Supabase (live, shared database across all users)
═══════════════════════════════════════════ */

/* ═══ SUPABASE CLIENT ═══ */
const SUPABASE_URL='https://tqvuulubivabhnjauhsi.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdnV1bHViaXZhYmhuamF1aHNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTUwMjEsImV4cCI6MjA5NzE5MTAyMX0.2b4HBgDFPigQajinPRbcMrwV1LWH21YFnXDi-abJ1vE';
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);

/* ═══ REFERENCE DATA ═══ */
const THEMES_DATA=[
  {id:'biodiversity',label:'Reducing Biodiversity Degradation',icon:'🦋'},
  {id:'climate',label:'Climate Resilience & Adaptation',icon:'🌊'},
  {id:'livelihoods',label:'Community Livelihoods',icon:'🌾'},
];
const WINDOWS_DATA=[
  {id:'nf',name:'Nature Finance & Markets',icon:'💰',theme:'biodiversity',desc:'Develops innovative financing mechanisms — carbon credits, biodiversity credits, green bonds, offsets, and public–private partnerships — to mobilise sustainable funding for conservation. Promotes ESG alignment and private sector engagement.'},
  {id:'rl',name:'Resilient Landscapes & Catchments',icon:'🏔',theme:'climate',desc:'Supports integrated landscape and catchment management in Key Biodiversity Areas and refugee-hosting landscapes. Focuses on ecosystem restoration, watershed protection, and climate resilience across Uganda\'s forests, wetlands, rangelands, and watersheds.'},
  {id:'fs',name:'Nature-Positive Food Systems',icon:'🌱',theme:'livelihoods',desc:'Supports transitions toward agroecological and biodiversity-friendly production systems. Promotes sustainable land management, agrobiodiversity conservation, and responsible value chains enabling communities to benefit without compromising ecosystem health.'},
  {id:'ce',name:'Circular Economy & Green Cities',icon:'♻',theme:'climate',desc:'Promotes circular economy models — plastic waste reduction, green urban planning, sustainable infrastructure — that reduce biodiversity pressure and position nature at the heart of Uganda\'s green growth agenda.'},
  {id:'oh',name:'One Health & Bioeconomy',icon:'🧬',theme:'biodiversity',desc:'Strengthens cross-sectoral collaboration on zoonotic disease risks and ecosystem health. Promotes Uganda\'s bioeconomy through research and value addition to biodiversity-based products — herbal medicines, pollination services, and genetic resources.'},
];
const TIERS_DATA={
  student:{r:1,emoji:'🎓',label:'Student',color:'#2D6A4F'},
  silver:{r:1,emoji:'🥈',label:'Silver',color:'#909090'},
  gold:{r:2,emoji:'🥇',label:'Gold',color:'#C8A84B'},
  platinum:{r:3,emoji:'💎',label:'Platinum',color:'#5BC4BF'},
  diamond:{r:4,emoji:'🔷',label:'Diamond',color:'#7EB8C9'},
  partner:{r:2,emoji:'🤝',label:'Partner',color:'#C8A84B'},
};
const TIER_RANGES={
  student:{individual:'In-kind / Youth Project Work',institution:'N/A'},
  silver:{individual:'500K–1M UGX',institution:'2M–5M UGX'},
  gold:{individual:'1.5M–2M UGX',institution:'6M–10M UGX'},
  platinum:{individual:'2.5M–4.5M UGX',institution:'20M–40M UGX'},
  diamond:{individual:'5M+ UGX',institution:'50M+ UGX'},
};
const PERKS_MAP={
  student:['🎓 Youth project & volunteer work registration','🤝 In-kind contributions recognised','📚 Full Learning Exchange access','🏆 Wall of Fame listing','📜 Downloadable digital membership certificate','🧭 Professional mentorship & leadership development package'],
  silver:['📦 Eco-friendly welcome kit & personalised certificates','📊 Contribution & accountability dashboard','🎓 Learning Exchange content library access','🏆 Wall of Fame listing','📜 Downloadable digital membership certificate'],
  gold:['All Silver perks','👁 Visibility in UBF conservation projects','🤝 Exclusive networking & partnership events','📬 Priority invitations to UBF events','📋 Quarterly impact report'],
  platinum:['All Gold perks','🎨 Co-branding on project materials & publications','🤝 Strategic partnership access','📰 Named in UBF annual report','💼 Private Executive Director briefing'],
  diamond:['All Platinum perks','🌟 Named conservation project or corridor','🏛 Board-level observer engagement','📈 Bespoke ESG biodiversity reporting package','📡 Media & PR recognition campaign','👑 Annual CEO briefing','🌍 Exposure visits to project sites'],
};
const ACCESS_RANK={public:0,member:1,gold:2,platinum:3,diamond:4};

/* ═══ ADMIN TEAM — UBF Staff Accounts ═══ */
const ADMIN_EMAILS=[
  'i.amani@ugandabiodiversityfund.org',
  'o.atuhaire@ugandabiodiversityfund.org',
  't.otieno@ugandabiodiversityfund.org',
  'd.okullu@ugandabiodiversityfund.org',
  'w.nabantanzi@ugandabiodiversityfund.org',
  's.abonyo@ugandabiodiversityfund.org',
  'm.ndimu@ugandabiodiversityfund.org',
];
const ADMIN_NAMES={
  'i.amani@ugandabiodiversityfund.org':'Executive Director',
  'o.atuhaire@ugandabiodiversityfund.org':'Projects Officer',
  't.otieno@ugandabiodiversityfund.org':'Office Assistant',
  'd.okullu@ugandabiodiversityfund.org':'M&E Officer',
  'w.nabantanzi@ugandabiodiversityfund.org':'Finance Manager',
  's.abonyo@ugandabiodiversityfund.org':'Administration Officer',
  'm.ndimu@ugandabiodiversityfund.org':'Finance Officer',
};
// Default password for admin accounts. Used at first login; each admin changes it
// under "My Password". Kept out of all on-screen text so it's never displayed.
const ADMIN_SEED_PASS='UBF@2026!';

/* ═══ HERO SLIDESHOW IMAGES (static files shipped with the site) ═══ */
const SLIDE_IMAGES=Array.from({length:17},(_,i)=>`slide-${i+1}.jpg`);

/* ═══ LOCAL UI-ONLY STATE (not shared data — just this browser's session/cache) ═══ */
const LS={
  get:(k,d)=>{try{const v=localStorage.getItem('ubf_'+k);return v!==null?JSON.parse(v):d}catch{return d}},
  set:(k,v)=>{try{localStorage.setItem('ubf_'+k,JSON.stringify(v))}catch{}},
};

/* ═══ XSS SAFETY — sanitize any string rendered into innerHTML ═══ */
function esc(t){return(t==null?'':String(t)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function safeHtml(html){return typeof DOMPurify!=='undefined'?DOMPurify.sanitize(html,{USE_PROFILES:{html:true}}):(html||'')}

/* ═══ LOGIN RATE LIMITING — 5 failures triggers 15-min lockout ═══ */
const LOGIN_MAX=5;const LOGIN_LOCK_MS=15*60*1000;
function _rlKey(email){return'rl_'+email.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,24)}
function checkRateLimit(email){
  const d=LS.get(_rlKey(email),{c:0,u:0});
  if(d.u>Date.now()){const m=Math.ceil((d.u-Date.now())/60000);return`Too many failed attempts. Try again in ${m} minute${m!==1?'s':''}.`;}
  return null;
}
function recordLoginFailure(email){
  const k=_rlKey(email);const d=LS.get(k,{c:0,u:0});
  const c=d.u<Date.now()?1:d.c+1;
  LS.set(k,{c,u:c>=LOGIN_MAX?Date.now()+LOGIN_LOCK_MS:d.u});
}
function clearRateLimit(email){LS.set(_rlKey(email),{c:0,u:0})}

/* ═══ SESSION PERSISTENCE — restore login across page refreshes ═══ */
function persistSession(user){
  if(!user){LS.set('session',null);return}
  const s={id:user.id,role:user.role,tier:user.tier};// never store password
  LS.set('session',s);
}
async function restoreSession(){
  const s=LS.get('session',null);
  if(!s||!s.id)return;
  const fresh=MEMBERS.find(m=>m.id===s.id&&m.status==='active'&&m.role===s.role);
  if(fresh){currentUser=fresh;updateNav();if(s.role==='admin'){document.getElementById('adm-user-info').textContent=fresh.name+' ('+ADMIN_NAMES[fresh.email]||'Admin'+') — '+fresh.email;showView('admin');}else{loadMessages().then(updateChatBadge);appNav('home');}}
  else{LS.set('session',null);}
}

/* ═══ APP STATE — populated from Supabase on load, kept live ═══ */
let MEMBERS=[];
let MY_FOLLOWING=new Set();// ids the current user follows (for the Discover Members directory)
let DASH_META={};let DASH_ITEMS=[];// accountability dashboard (admin-editable, Supabase-backed)
let CONTENT=[];
let ANNOUNCES=[];
let FIN_REPORTS=[];
let EMAIL_LOG=[];
let FAME=[];
let PAYMENT={};
let currentUser=null;
let selectedTier_=null;
let uploadedFile=null;
let famePhotoData=null;
let activeFilter='all';

/* ═══ DATA LOADERS — pull live shared data from Supabase ═══ */
async function loadMembers(){
  const {data,error}=await sb.from('members').select('*').order('created_at',{ascending:true});
  if(error){console.error('loadMembers',error);return}
  MEMBERS=data||[];
}
async function loadContent(){
  const {data,error}=await sb.from('content').select('*,comments(*)').order('created_at',{ascending:false});
  if(error){console.error('loadContent',error);return}
  CONTENT=(data||[]).map(c=>({
    id:c.id,title:c.title,type:c.type,window:c.window_name,theme:c.theme,
    desc:c.description,author:c.author,date:(c.created_at||'').slice(0,10),
    access:c.access,url:c.url||'',mediaUrl:c.media_url||'',
    mediaType:c.media_type||'',fullText:c.full_text||'',
    reactions:c.reactions||{likes:0,bookmarks:0},
    comments:(c.comments||[]).map(cm=>({user:cm.user_name,text:cm.text,time:(cm.created_at||'').slice(0,10)})),
  }));
}
async function loadAnnouncements(){
  const {data,error}=await sb.from('announcements').select('*').order('created_at',{ascending:false});
  if(error){console.error('loadAnnouncements',error);return}
  ANNOUNCES=(data||[]).map(a=>({type:a.type,title:a.title,body:a.body,date:(a.created_at||'').slice(0,10),id:a.id}));
}
async function loadFinReports(){
  const {data,error}=await sb.from('fin_reports').select('*').order('created_at',{ascending:false});
  if(error){console.error('loadFinReports',error);return}
  FIN_REPORTS=(data||[]).map(r=>({title:r.title,period:r.period,summary:r.summary,url:r.url,date:(r.created_at||'').slice(0,10),id:r.id}));
}
async function loadFame(){
  const {data,error}=await sb.from('wall_of_fame').select('*').order('created_at',{ascending:false});
  if(error){console.error('loadFame',error);return}
  FAME=(data||[]).map(m=>({id:m.id,name:m.name,caption:m.caption,tier:m.tier,year:m.year,photo:m.photo_url}));
}
async function loadPayment(){
  const {data,error}=await sb.from('payment_details').select('*').eq('id',1).maybeSingle();
  if(error){console.error('loadPayment',error);return}
  PAYMENT=data||{};
}
async function loadDashboard(){
  const {data:meta}=await sb.from('dashboard_meta').select('*').eq('id',1).maybeSingle();
  DASH_META=meta||{};
  const {data:items,error}=await sb.from('dashboard_items').select('*').order('sort',{ascending:true});
  if(error){console.error('loadDashboard',error);return}
  DASH_ITEMS=items||[];
}
let PROTECT=[];
async function loadProtect(){
  const {data,error}=await sb.from('protect_gallery').select('*').order('sort',{ascending:true});
  if(error){console.error('loadProtect',error);return}
  PROTECT=data||[];
}
/* ═══ ARCHIVING — items older than 21 days (or flagged) leave the main feed
   but are never deleted; an archive toggle reveals them again. ═══ */
const ARCHIVE_DAYS=21;
function _daysOld(ts){if(!ts)return 0;const t=new Date(ts).getTime();return isNaN(t)?0:(Date.now()-t)/86400000;}
function _isArchived(item){return item&&(item.archived===true||_daysOld(item.created_at)>ARCHIVE_DAYS);}
const _showAll={announce:false,fin:false,posts:false};
async function setArchived(table,id,val){
  const {error}=await sb.from(table).update({archived:val}).eq('id',id);
  if(error){toast('⚠ Could not update.');console.error(error);return false}
  return true;
}
/* ═══ BENEFIT-GATING — benefits stay locked until payment is confirmed ═══ */
function lockedBenefitsHTML(){
  return '<div class="locked-perks">'+
    ['📊 Accountability dashboard','🎓 Learning Exchange library','🏆 Wall of Fame listing','📜 Digital membership certificate']
    .map(p=>'<div class="locked-perk"><span>'+p+'</span><span class="lk">🔒</span></div>').join('')+
  '</div>';
}
function goToPayment(){
  if(document.body.classList.contains('app-mode')){
    // In app mode the marketing sections are hidden — surface just the payment screen
    document.body.classList.remove('tab-home','tab-learn');
    document.body.classList.add('tab-pay');
    showView('main');window.scrollTo(0,0);
    return;
  }
  showView('main');setTimeout(()=>{const e=document.getElementById('payment');if(e)e.scrollIntoView({behavior:'smooth'})},200);
}
function showLockedModal(name){
  const b=document.getElementById('locked-body');
  if(b)b.innerHTML='<div class="locked-status">MEMBERSHIP STATUS: <span class="locked-pill">● Pending payment</span></div>'+
    '<h3 class="locked-h">You’re one payment away from everything below 🌿</h3>'+
    '<p class="locked-p">'+(name?esc(name.split(' ')[0])+', your':'Your')+' account is created — but your benefits stay locked until we confirm your contribution. This keeps membership genuine and every benefit funded.</p>'+
    lockedBenefitsHTML()+
    '<button class="btn btn-gold btn-full" style="margin-top:1.2rem" onclick="closeModal(\'m-locked\');goToPayment()">Complete my payment →</button>';
  openModal('m-locked');
}

/* ═══ INIT ADMIN ACCOUNTS IF MISSING (runs once against Supabase) ═══ */
async function initAdmins(){
  let failCount=0;
  for(const email of ADMIN_EMAILS){
    const exists=MEMBERS.find(m=>m.email.toLowerCase()===email);
    if(!exists){
      const {error}=await sb.from('members').insert({
        name:ADMIN_NAMES[email]||'Admin',
        email,pass:ADMIN_SEED_PASS,type:'staff',tier:'diamond',
        amount:0,year:new Date().getFullYear(),org:'Uganda Biodiversity Fund',
        role:'admin',status:'active',payref:''
      });
      if(error){console.error('initAdmins insert',email,error);failCount++}
    }
  }
  if(failCount>0){
    toast('⚠ Could not create '+failCount+' admin account(s) — check Supabase RLS policies on the members table.');
  }
}

/* ═══ PAYMENT DETAILS — render saved values into public page ═══ */
// Placeholder brand marks shown only if no logo file / upload is found
const PAY_LOGO_SVG={
  stanbic:'<svg width="52" height="52" viewBox="0 0 52 52" role="img" aria-label="Stanbic Bank"><circle cx="26" cy="19" r="9" fill="#fff"/><circle cx="26" cy="19" r="4.4" fill="#0033A0"/><text x="26" y="43" text-anchor="middle" font-family="Georgia,serif" font-size="8.5" font-weight="700" fill="#fff">Stanbic</text></svg>',
  mtn:'<svg width="54" height="46" viewBox="0 0 54 46" role="img" aria-label="MTN"><ellipse cx="27" cy="23" rx="20" ry="12" fill="none" stroke="#001A70" stroke-width="2.4"/><text x="27" y="28" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" font-weight="900" fill="#001A70" letter-spacing="-.5">MTN</text></svg>',
  airtel:'<svg width="54" height="46" viewBox="0 0 54 46" role="img" aria-label="Airtel"><path d="M14 30c-1-11 8-18 18-15.5 7 1.8 9 8.6 4.6 12.2-3.1 2.6-7.8 1.8-9.4-1.4" fill="none" stroke="#E40000" stroke-width="5" stroke-linecap="round"/><text x="30" y="42" text-anchor="middle" font-family="Arial,sans-serif" font-size="9.5" font-weight="700" fill="#E40000">airtel</text></svg>'
};
// Try repo image files (hyphen-proof) then fall back to the SVG mark
const PAY_LOGO_TRIES={stanbic:['stanbic.png','stanbic-logo.png','stanbiclogo.png'],mtn:['mtn.png','mtn-logo.png','mtnlogo.png'],airtel:['airtel.png','airtel-logo.png','airtellogo.png']};
function payLogoFallback(img,key){
  const tries=PAY_LOGO_TRIES[key]||[];
  let i=parseInt(img.dataset.try||'0',10)+1;
  if(i<tries.length){img.dataset.try=i;img.src=tries[i];return;}
  const box=img.parentElement;if(box)box.innerHTML=PAY_LOGO_SVG[key]||'';
}
const PAY_IMPACT_DEFAULT=[
  {icon:'🌱',amount:'UGX 25,000',text:'plants & nurtures 15 indigenous tree seedlings.'},
  {icon:'🦍',amount:'UGX 100,000',text:'funds a full day of ranger patrol guarding mountain gorillas.'},
  {icon:'💧',amount:'UGX 250,000',text:'restores a wetland spring that waters wildlife year-round.'},
  {icon:'🌳',amount:'UGX 500,000',text:'brings a full hectare of degraded forest back to life.'}
];
function renderPaymentUI(){
  const map={
    'pay-bank-name':PAYMENT.bank,'pay-acc-no':PAYMENT.accno,'pay-branch':PAYMENT.branch,
    'pay-mtn':PAYMENT.mtn,'pay-airtel':PAYMENT.airtel,'pay-acc-name':PAYMENT.acc_name,
  };
  Object.entries(map).forEach(([id,val])=>{
    if(val){const el=document.getElementById(id);if(el)el.textContent=val}
  });
  // Admin-uploaded logo (Supabase) takes priority over the repo file
  const logos={'pay-logo-stanbic':PAYMENT.stanbic_logo,'pay-logo-mtn':PAYMENT.mtn_logo,'pay-logo-airtel':PAYMENT.airtel_logo};
  Object.entries(logos).forEach(([id,url])=>{
    if(url){const el=document.getElementById(id);if(el)el.innerHTML='<img src="'+esc(url)+'" alt="" onerror="this.remove()"/>';}
  });
  // WhatsApp help line
  if(PAYMENT.whatsapp){
    const w=PAYMENT.whatsapp.trim();
    const wt=document.getElementById('pay-whatsapp');if(wt)wt.textContent=w;
    const wl=document.getElementById('pay-whatsapp-link');if(wl)wl.href='https://wa.me/'+w.replace(/[^0-9]/g,'');
  }
  // "Where your money goes" — editable impact list
  const list=document.getElementById('pay-impact-list');
  if(list){
    let items=PAYMENT.impact_items;
    if(typeof items==='string'){try{items=JSON.parse(items)}catch(e){items=null}}
    if(!Array.isArray(items)||!items.length)items=PAY_IMPACT_DEFAULT;
    list.innerHTML=items.map(it=>'<div class="pay-irow"><span class="ic">'+esc(it.icon||'🌿')+'</span><div><span class="amt">'+esc(it.amount||'')+'</span><p>'+esc(it.text||'')+'</p></div></div>').join('');
  }
  // Welcome media (admin video/image) replaces the default poster
  const promo=document.getElementById('pay-promo');
  if(promo&&PAYMENT.promo_url){
    const cap='<div class="pay-pcap"><b>This is who you’re protecting.</b>'+(PAYMENT.promo_caption?'<span>'+esc(PAYMENT.promo_caption)+'</span>':'')+'</div>';
    const badge='<span class="pay-media-badge">Watch · Your impact</span>';
    if(PAYMENT.promo_type==='video'){
      promo.innerHTML=badge+'<video src="'+esc(PAYMENT.promo_url)+'" controls playsinline preload="metadata"></video>'+cap;
    }else{
      promo.innerHTML=badge+'<img src="'+esc(PAYMENT.promo_url)+'" alt="How to pay"/>'+cap;
    }
  }else if(promo){
    // refresh caption text if admin set one without uploading media
    const capEl=document.getElementById('pay-promo-cap');
    if(capEl&&PAYMENT.promo_caption)capEl.textContent=PAYMENT.promo_caption;
  }
}
/* Tap-to-copy a payment number/account */
function copyPayNum(btn){
  const src=document.getElementById(btn.getAttribute('data-copy-from'));
  if(!src)return;
  const txt=(src.textContent||'').trim();
  const done=()=>{const o=btn.textContent;btn.textContent='✓ Copied';btn.classList.add('ok');toast('📋 Copied: '+txt);setTimeout(()=>{btn.textContent=o;btn.classList.remove('ok')},1500)};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(done).catch(done)}else{done()}
}

/* ═══ CONSERVATION GALLERY — "What you're protecting" (data-driven) ═══ */
let _protectTab='species';
function setProtectTab(kind){_protectTab=kind;renderProtectGallery();}
function protectStatusClass(s){
  s=(s||'').toLowerCase();
  if(s.includes('critical'))return 'b-cr';
  if(s.includes('endanger'))return 'b-en';
  if(s.includes('vulner'))return 'b-vu';
  return 'b-pl';
}
function renderProtectGallery(){
  const wrap=document.getElementById('protect-grid');if(!wrap)return;
  const items=PROTECT.filter(p=>p.active!==false && p.kind===_protectTab);
  const spN=PROTECT.filter(p=>p.active!==false&&p.kind==='species').length;
  const plN=PROTECT.filter(p=>p.active!==false&&p.kind==='place').length;
  const tS=document.getElementById('protect-tab-species'),tP=document.getElementById('protect-tab-place');
  if(tS){tS.classList.toggle('on',_protectTab==='species');tS.textContent='Endangered species'+(spN?' ('+spN+')':'');}
  if(tP){tP.classList.toggle('on',_protectTab==='place');tP.textContent='Threatened places'+(plN?' ('+plN+')':'');}
  const cs=document.getElementById('protect-count-species'),cp=document.getElementById('protect-count-place');
  if(cs)cs.textContent=spN;if(cp)cp.textContent=plN;
  if(!items.length){wrap.innerHTML='<p class="protect-empty">Nothing added here yet — the admin can add species and places from the Conservation Gallery panel.</p>';return;}
  wrap.innerHTML=items.map(p=>{
    const isVid=p.media_type==='video'&&p.video_url;
    let imgs=Array.isArray(p.images)&&p.images.length?p.images:(p.image_url?[p.image_url]:[]);
    if(typeof p.images==='string'){try{const a=JSON.parse(p.images);if(Array.isArray(a)&&a.length)imgs=a;}catch(e){}}
    let media='';let extra='';
    if(isVid){
      media='<video src="'+esc(p.video_url)+'" muted loop playsinline autoplay preload="metadata"'+(imgs[0]?' poster="'+esc(imgs[0])+'"':'')+'></video>';
    }else if(imgs.length>1){
      // mini-slideshow: stacked slides + arrows + dots, auto-advancing
      media=imgs.map((u,i)=>'<img class="pg-s'+(i===0?' on':'')+'" src="'+esc(u)+'" alt="" onerror="this.remove()"/>').join('');
      extra='<span class="pg-count">'+imgs.length+' photos</span>'+
        '<div class="pg-arrows"><button type="button" onclick="event.stopPropagation();pgNav(this,-1)">‹</button><button type="button" onclick="event.stopPropagation();pgNav(this,1)">›</button></div>'+
        '<div class="pg-dots">'+imgs.map((_,i)=>'<i'+(i===0?' class="on"':'')+'></i>').join('')+'</div>';
    }else if(imgs[0]){
      media='<img src="'+esc(imgs[0])+'" alt="" onerror="this.style.display=\'none\'"/>';
    }
    const hasMedia=isVid||imgs.length;
    const badge=p.status?'<span class="pg-badge '+protectStatusClass(p.status)+'">'+esc(p.status)+'</span>':'';
    return '<article class="pg-card pg-click"'+(imgs.length>1?' data-auto="1" data-idx="0"':'')+' data-pid="'+esc(p.id)+'" role="button" tabindex="0" onclick="openProtect(\''+p.id+'\')" onkeydown="if(event.key===\'Enter\')openProtect(\''+p.id+'\')"'+(hasMedia?'':' style="background:linear-gradient(160deg,#174530,#0c2a19)"')+'>'+media+extra+
      '<div class="pg-body">'+badge+'<h3>'+esc(p.name||'')+'</h3>'+(p.blurb?'<p>'+esc(p.blurb)+'</p>':'')+
      (p.region?'<span class="pg-region">📍 '+esc(p.region)+'</span>':'')+'<span class="pg-more">Tap to learn more →</span></div></article>';
  }).join('');
  renderTierProtect();
}
/* Rich detail view for an endangered species / threatened place */
function openProtect(id){
  const p=(PROTECT||[]).find(x=>x.id===id);if(!p)return;_buzz&&_buzz();
  let imgs=Array.isArray(p.images)&&p.images.length?p.images:(p.image_url?[p.image_url]:[]);
  if(typeof p.images==='string'){try{const a=JSON.parse(p.images);if(Array.isArray(a)&&a.length)imgs=a;}catch(e){}}
  const isVid=p.media_type==='video'&&p.video_url;
  const media=isVid
    ?'<video src="'+esc(p.video_url)+'" controls playsinline autoplay muted loop'+(imgs[0]?' poster="'+esc(imgs[0])+'"':'')+' class="dtl-media"></video>'
    :(imgs[0]?'<img src="'+esc(imgs[0])+'" alt="" class="dtl-media"/>':'<div class="dtl-media dtl-media-empty">🌿</div>');
  const badge=p.status?'<span class="pg-badge '+protectStatusClass(p.status)+'">'+esc(p.status)+'</span>':'';
  const kindLabel=p.kind==='place'?'Threatened place':'Endangered species';
  // extra photos strip
  const strip=imgs.length>1?'<div class="dtl-strip">'+imgs.slice(0,6).map(u=>'<img src="'+esc(u)+'" alt="" onerror="this.remove()"/>').join('')+'</div>':'';
  document.getElementById('detail-body').innerHTML=
    '<div class="dtl-hero">'+media+'<div class="dtl-hero-grad"></div>'+
      '<div class="dtl-hero-txt"><span class="dtl-kind">'+kindLabel+'</span><h2>'+esc(p.name||'')+'</h2>'+
      (p.region?'<span class="dtl-region">📍 '+esc(p.region)+'</span>':'')+'</div>'+badge+'</div>'+
    '<div class="dtl-body">'+
      strip+
      (p.blurb?'<p class="dtl-blurb">'+esc(p.blurb)+'</p>':'')+
      '<p class="dtl-give-note">💚 “Help protect” makes a <b>donation</b> to this cause, paid through UBF’s official channels (MTN, Airtel or Stanbic).</p>'+
      '<div class="dtl-cta-row">'+
        '<button class="btn btn-gold" onclick="donateForProtect(\''+p.id+'\')">💚 Help protect '+esc((p.name||'this').split(' ')[0])+'</button>'+
        '<button class="btn btn-ghost" onclick="closeModal(\'m-detail\')">Close</button>'+
      '</div>'+
    '</div>';
  openModal('m-detail');
}
/* Clicking a Wall of Fame champion → their member profile, or a champion detail */
function openFame(idx){
  const m=FAME[idx];if(!m)return;_buzz&&_buzz();
  // Try to open the real member profile first
  const match=(MEMBERS||[]).find(x=>m.member_id&&x.id===m.member_id) ||
              (MEMBERS||[]).find(x=>(x.name||'').trim().toLowerCase()===(m.name||'').trim().toLowerCase());
  if(match){viewMemberProfile(match.id);return;}
  const td=TIERS_DATA[m.tier]||TIERS_DATA.silver;
  const initials=(m.name||'?').split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase();
  document.getElementById('detail-body').innerHTML=
    '<div class="dtl-hero">'+(m.photo?'<img src="'+esc(m.photo)+'" alt="" class="dtl-media"/>':'<div class="dtl-media dtl-media-empty">'+initials+'</div>')+
      '<div class="dtl-hero-grad"></div>'+
      '<div class="dtl-hero-txt"><span class="dtl-kind">🏆 Wall of Fame · '+esc(m.year||'')+'</span><h2>'+esc(m.name||'')+'</h2>'+
      '<span class="dtl-region">'+(td.emoji||'')+' '+esc(td.label||'')+' champion</span></div></div>'+
    '<div class="dtl-body">'+
      (m.caption?'<p class="dtl-blurb">'+esc(m.caption)+'</p>':'')+
      '<div class="dtl-cta-row"><button class="btn btn-ghost" onclick="closeModal(\'m-detail\')">Close</button></div>'+
    '</div>';
  openModal('m-detail');
}
/* Show tier-linked species/places on the membership tier cards */
function renderTierProtect(){
  document.querySelectorAll('#greencard .tier-card').forEach(card=>{
    const tier=card.getAttribute('data-tier');
    const items=(PROTECT||[]).filter(p=>p.active!==false&&p.tier===tier);
    let slot=card.querySelector('.tier-protect');
    if(!items.length){if(slot)slot.remove();return;}
    if(!slot){slot=document.createElement('div');slot.className='tier-protect';card.appendChild(slot);}
    slot.innerHTML='<span class="tp-lbl">🌿 You help protect</span>'+items.map(p=>'<span class="tp-item">'+esc(p.name)+'</span>').join('');
  });
}
/* Gallery slideshow controls */
function _pgSet(card,idx){
  const s=card.querySelectorAll('.pg-s');if(!s.length)return;
  idx=((idx%s.length)+s.length)%s.length;
  card.dataset.idx=idx;
  s.forEach((el,i)=>el.classList.toggle('on',i===idx));
  card.querySelectorAll('.pg-dots i').forEach((el,i)=>el.classList.toggle('on',i===idx));
}
function pgNav(btn,dir){
  const card=btn.closest('.pg-card');if(!card)return;
  card.dataset.auto='0';// user took control — stop auto-advance for this card
  _pgSet(card,parseInt(card.dataset.idx||'0',10)+dir);
}
setInterval(()=>{document.querySelectorAll('.pg-card[data-auto="1"]').forEach(c=>{if(c.offsetParent)_pgSet(c,parseInt(c.dataset.idx||'0',10)+1)});},5200);

/* Admin CRUD for the gallery */
let _protectEditId=null;
function fillProtectForm(p){
  _protectEditId=p.id||null;
  const g=id=>document.getElementById(id);
  if(g('pf-kind'))g('pf-kind').value=p.kind||'species';
  if(g('pf-name'))g('pf-name').value=p.name||'';
  if(g('pf-status'))g('pf-status').value=p.status||'';
  if(g('pf-blurb'))g('pf-blurb').value=p.blurb||'';
  if(g('pf-region'))g('pf-region').value=p.region||'';
  if(g('pf-imgurl'))g('pf-imgurl').value=(p.media_type==='video')?'':(Array.isArray(p.images)&&p.images.length?p.images.join(', '):(p.image_url||''));
  if(g('pf-tier'))g('pf-tier').value=p.tier||'';
  const cs=g('pf-cause');
  if(cs)cs.innerHTML='<option value="">— Donations go to the default cause —</option>'+(CAMPAIGNS||[]).filter(c=>c.active!==false).map(c=>'<option value="'+c.id+'"'+(p.cause_campaign_id===c.id?' selected':'')+'>'+esc(c.title)+'</option>').join('');
  if(g('pf-active'))g('pf-active').checked=p.active!==false;
  if(g('pf-title'))g('pf-title').textContent=p.id?('Editing: '+(p.name||'')):'Add a species or place';
  if(g('pf-save'))g('pf-save').textContent=p.id?'Update':'Add to gallery';
  const t=g('pf-thumb');if(t)t.innerHTML=(p.media_type==='video'&&p.video_url)?'🎬':(p.image_url?'<img src="'+esc(p.image_url)+'" alt=""/>':'🖼');
}
function resetProtectForm(){fillProtectForm({kind:'species',active:true});const f=document.getElementById('pf-img');if(f)f.value='';}
function openProtectEdit(id){const p=PROTECT.find(x=>x.id===id);if(!p)return;fillProtectForm(p);const a=document.getElementById('protect-form-card');if(a)a.scrollIntoView({behavior:'smooth',block:'center'});}
async function saveProtectItem(){
  const name=(document.getElementById('pf-name').value||'').trim();
  if(!name){toast('⚠ A name is required.');return}
  const btn=document.getElementById('pf-save');if(btn){btn.disabled=true;btn.textContent='Saving…'}
  const cur=_protectEditId?PROTECT.find(p=>p.id===_protectEditId):null;
  let image_url=cur?(cur.image_url||null):null;
  let video_url=cur?(cur.video_url||null):null;
  let media_type=cur?(cur.media_type||'image'):'image';
  let images=cur&&Array.isArray(cur.images)?cur.images.slice():(image_url?[image_url]:[]);
  // Up to 5 files at once — images build the slideshow; a video takes over the card
  const inp=document.getElementById('pf-img');
  const files=inp&&inp.files?Array.from(inp.files).slice(0,5):[];
  for(const f of files){
    const up=await _uploadFile(f,'protect');
    if(!up)continue;
    if(up.type==='video'){video_url=up.url;media_type='video';}
    else{images.push(up.url);media_type='image';}
  }
  // Typed repo filenames (comma-separated) replace the image list
  const typed=(document.getElementById('pf-imgurl')?document.getElementById('pf-imgurl').value.trim():'');
  if(typed&&!files.length){images=typed.split(',').map(s=>s.trim()).filter(Boolean).slice(0,5);media_type='image';}
  images=images.slice(-5);
  image_url=images[0]||image_url;
  const row={kind:document.getElementById('pf-kind').value,name,image_url,video_url,media_type,images:images.length?images:null,
    status:(document.getElementById('pf-status').value||'').trim(),
    blurb:(document.getElementById('pf-blurb').value||'').trim(),
    region:(document.getElementById('pf-region').value||'').trim(),
    tier:document.getElementById('pf-tier').value||null,
    cause_campaign_id:(document.getElementById('pf-cause')?document.getElementById('pf-cause').value||null:null),
    active:document.getElementById('pf-active').checked};
  if(_protectEditId)row.id=_protectEditId;
  const {error}=await sb.from('protect_gallery').upsert(row);
  if(btn){btn.disabled=false;btn.textContent=_protectEditId?'Update':'Add to gallery'}
  if(error){toast('⚠ Could not save.');console.error(error);return}
  await loadProtect();renderProtectGallery();renderProtectAdmin();resetProtectForm();
  audit('Saved gallery item',name);toast('✅ Saved to the gallery.');
}
async function delProtectItem(id){
  const p=PROTECT.find(x=>x.id===id);
  if(!confirm('Remove "'+((p&&p.name)||'this item')+'" from the gallery? This cannot be undone.'))return;
  const {error}=await sb.from('protect_gallery').delete().eq('id',id);
  if(error){toast('⚠ Could not delete.');console.error(error);return}
  await loadProtect();renderProtectGallery();renderProtectAdmin();toast('Removed from the gallery.');
}
/* Show/hide a password field (eye toggle) */
function togglePw(id,btn){
  const el=document.getElementById(id);if(!el)return;
  const hidden=el.type==='password';
  el.type=hidden?'text':'password';
  if(btn)btn.textContent=hidden?'🙈':'👁';
  if(btn)btn.title=hidden?'Hide password':'Show password';
}
/* Reveal the signed-in user's current password into a element (members & admins) */
function revealMyPassword(targetId,btn){
  if(!currentUser){toast('⚠ Please sign in first.');return}
  const el=document.getElementById(targetId);if(!el)return;
  if(el.dataset.shown==='1'){el.textContent='';el.dataset.shown='';if(btn)btn.textContent='👁 Show my current password';return;}
  el.textContent='Your current password: '+(currentUser.pass||'(not set)');
  el.dataset.shown='1';if(btn)btn.textContent='🙈 Hide my current password';
}
/* Shared password-change routine (members & admins). curId optional. */
async function doChangePassword(newId,confirmId,curId,btnId){
  if(!currentUser){toast('⚠ Please sign in first.');return}
  const nw=document.getElementById(newId).value;
  const cf=document.getElementById(confirmId).value;
  if(curId){const c=document.getElementById(curId);if(c&&c.value&&currentUser.pass!==c.value){toast('⚠ Current password is incorrect.');return}}
  if(nw.length<8){toast('⚠ New password must be at least 8 characters.');return}
  if(nw!==cf){toast('⚠ New passwords do not match.');return}
  if(nw===currentUser.pass){toast('⚠ Choose a password different from your current one.');return}
  const btn=btnId?document.getElementById(btnId):null;if(btn){btn.disabled=true;btn.textContent='Updating…'}
  const {error}=await sb.from('members').update({pass:nw}).eq('id',currentUser.id);
  if(btn){btn.disabled=false;btn.textContent='Update password'}
  if(error){toast('⚠ Could not update password.');console.error(error);return}
  currentUser.pass=nw;persistSession(currentUser);
  [newId,confirmId,curId].forEach(id=>{if(id){const e=document.getElementById(id);if(e)e.value='';}});
  toast('✅ Password updated — use it next time you sign in.');
}
function changeAdminPassword(){
  if(!currentUser||currentUser.role!=='admin'){toast('⚠ Admins only.');return}
  doChangePassword('pw-new','pw-confirm','pw-current','pw-save');
}
function changeMyPassword(){doChangePassword('mp-new','mp-confirm',null,'mp-save');}
function renderProtectAdmin(){
  const el=document.getElementById('protect-admin-list');if(!el)return;
  el.innerHTML=PROTECT.map(p=>
    '<div class="pa-row">'+
      '<span class="pa-thumb">'+((p.media_type==='video'&&p.video_url)?'🎬':(p.image_url?'<img src="'+esc(p.image_url)+'" alt=""/>':(p.kind==='place'?'🌍':'🦍')))+'</span>'+
      '<div class="pa-info"><strong>'+esc(p.name)+'</strong><span>'+esc(p.kind)+(p.status?' · '+esc(p.status):'')+(p.active===false?' · hidden':'')+'</span></div>'+
      '<button class="btn btn-ghost btn-sm" onclick="openProtectEdit(\''+p.id+'\')">Edit</button>'+
      '<button class="btn btn-danger btn-sm" onclick="delProtectItem(\''+p.id+'\')">Delete</button>'+
    '</div>').join('')||'<p style="color:var(--muted);font-size:.85rem">No items yet — add your first below.</p>';
}

/* ═══ PRIVATE MESSAGES — LinkedIn/FB-style member DMs ═══ */
let MSGS=[];let _chatWith=null;
async function loadMessages(){
  if(!currentUser){MSGS=[];return}
  const{data,error}=await sb.from('member_messages').select('*')
    .or('from_id.eq.'+currentUser.id+',to_id.eq.'+currentUser.id)
    .order('created_at',{ascending:true});
  if(error){console.error('loadMessages',error);return}
  MSGS=data||[];
}
function _convs(){
  const map={};
  MSGS.forEach(m=>{const other=m.from_id===currentUser.id?m.to_id:m.from_id;(map[other]=map[other]||[]).push(m);});
  return Object.entries(map).map(([id,msgs])=>({id,msgs,last:msgs[msgs.length-1],
    unread:msgs.filter(x=>x.to_id===currentUser.id&&!x.read).length}))
    .sort((a,b)=>String(b.last.created_at).localeCompare(String(a.last.created_at)));
}
function updateChatBadge(){
  const n=currentUser?MSGS.filter(m=>m.to_id===currentUser.id&&!m.read).length:0;
  const b=document.getElementById('chat-tab-badge');
  if(b){b.textContent=n>9?'9+':String(n);b.style.display=n>0?'grid':'none';}
}
function _chatAvatar(m,size){
  const s=size||38;
  const init=(m&&m.name?m.name:'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  return (m&&m.photo_url)
    ?'<img src="'+m.photo_url+'" style="width:'+s+'px;height:'+s+'px;border-radius:50%;object-fit:cover" alt=""/>'
    :'<span class="chat-init" style="width:'+s+'px;height:'+s+'px;background:'+_avatarColor(m?m.id:'x')+'">'+init+'</span>';
}
function openChats(){
  if(!currentUser){openModal('m-login');return}
  const sr=document.getElementById('chat-search-results');if(sr)sr.innerHTML='';
  const si=document.getElementById('chat-search');if(si)si.value='';
  renderChats();openModal('m-chats');
}
function renderChats(){
  const el=document.getElementById('chats-list');if(!el)return;
  const convs=_convs();
  if(!convs.length){el.innerHTML='<p style="font-size:.85rem;color:var(--muted);padding:.8rem 0">No conversations yet — search a member above, or tap ✉ Message on any member profile.</p>';return}
  el.innerHTML=convs.map(c=>{
    const m=MEMBERS.find(x=>x.id===c.id)||{name:'Member'};
    const mine=c.last.from_id===currentUser.id;
    return '<div class="conv-row" onclick="openChat(\''+c.id+'\')">'+
      _chatAvatar(m,40)+
      '<div class="conv-main"><b>'+esc(m.name||'Member')+'</b><span class="conv-last">'+(mine?'You: ':'')+esc((c.last.body||'').slice(0,48))+'</span></div>'+
      '<div class="conv-side"><span class="conv-time">'+_timeAgo(c.last.created_at)+'</span>'+(c.unread?'<span class="conv-unread">'+c.unread+'</span>':'')+'</div>'+
    '</div>';
  }).join('');
}
function searchChatMembers(q){
  const el=document.getElementById('chat-search-results');if(!el)return;
  q=(q||'').trim().toLowerCase();
  if(q.length<2){el.innerHTML='';return}
  const hits=MEMBERS.filter(m=>m.role==='member'&&m.status==='active'&&m.id!==(currentUser&&currentUser.id)&&(m.name||'').toLowerCase().includes(q)).slice(0,6);
  el.innerHTML=hits.map(m=>'<div class="conv-row" onclick="openChat(\''+m.id+'\')">'+_chatAvatar(m,34)+'<div class="conv-main"><b>'+esc(m.name)+'</b><span class="conv-last">Start a conversation</span></div><span class="dg-chev">›</span></div>').join('')||'<p style="font-size:.8rem;color:var(--muted)">No member found.</p>';
}
async function openChat(otherId){
  if(!currentUser){openModal('m-login');return}
  _chatWith=otherId;
  closeModal('m-chats');closeModal('m-member-profile');
  const m=MEMBERS.find(x=>x.id===otherId);
  const who=document.getElementById('chat-who');if(who)who.innerHTML=_chatAvatar(m,30)+'<span>'+esc((m&&m.name)||'Member')+'</span>';
  renderChatThread();openModal('m-chat');
  // mark their messages to me as read (optimistic, then sync)
  let dirty=false;
  MSGS.forEach(x=>{if(x.from_id===otherId&&x.to_id===currentUser.id&&!x.read){x.read=true;dirty=true;}});
  updateChatBadge();
  if(dirty)await sb.from('member_messages').update({read:true}).eq('from_id',otherId).eq('to_id',currentUser.id).eq('read',false);
}
function renderChatThread(){
  const el=document.getElementById('chat-thread');if(!el||!_chatWith)return;
  const msgs=MSGS.filter(m=>(m.from_id===_chatWith&&m.to_id===currentUser.id)||(m.from_id===currentUser.id&&m.to_id===_chatWith));
  el.innerHTML=msgs.length?msgs.map(m=>{
    const mine=m.from_id===currentUser.id;
    return '<div class="chat-b '+(mine?'me':'them')+'"><div class="chat-bubble">'+escHtml(m.body)+'</div><span class="chat-t">'+_timeAgo(m.created_at)+'</span></div>';
  }).join(''):'<p style="font-size:.82rem;color:var(--muted);text-align:center;padding:1.2rem 0">Say hello 👋 — this conversation is private between the two of you.</p>';
  el.scrollTop=el.scrollHeight;
}
async function sendChatMsg(){
  if(!currentUser||!_chatWith)return;
  const input=document.getElementById('chat-input');
  const body=(input.value||'').trim();if(!body)return;
  input.value='';_buzz();
  // Optimistic: show instantly, sync behind
  const local={id:'tmp-'+Date.now(),from_id:currentUser.id,to_id:_chatWith,body,read:false,created_at:new Date().toISOString()};
  MSGS.push(local);renderChatThread();
  const{error}=await sb.from('member_messages').insert({from_id:currentUser.id,to_id:_chatWith,body});
  if(error){console.error('sendChat',error);toast('⚠ Message not sent — check your connection.');MSGS=MSGS.filter(m=>m.id!==local.id);renderChatThread();}
}

/* ═══ TIER CHANGES — self-service upgrade/downgrade with full history ═══ */
async function openTierModal(){
  if(!currentUser)return;
  const sel=document.getElementById('tier-new');if(sel)sel.value=currentUser.tier||'silver';
  const amt=document.getElementById('tier-amount');if(amt)amt.value=currentUser.amount||'';
  const note=document.getElementById('tier-note');if(note)note.value='';
  openModal('m-tier');
  const list=document.getElementById('tier-history-list');
  if(list){
    list.innerHTML='<p style="font-size:.8rem;color:var(--muted)">Loading…</p>';
    const{data}=await sb.from('tier_history').select('*').eq('member_id',currentUser.id).order('created_at',{ascending:false});
    const rows=data||[];
    list.innerHTML=rows.length?rows.map(h=>{
      const up=(TIERS_DATA[h.new_tier]&&TIERS_DATA[h.old_tier])?((TIERS_DATA[h.new_tier].r||0)>=(TIERS_DATA[h.old_tier].r||0)):true;
      return '<div class="th-row"><span class="th-ico">'+(up?'⬆':'⬇')+'</span><div class="th-main"><b>'+esc(h.old_tier||'—')+' → '+esc(h.new_tier||'—')+'</b><span>UGX '+((h.old_amount||0).toLocaleString())+' → UGX '+((h.new_amount||0).toLocaleString())+(h.note?' · '+esc(h.note):'')+'</span></div><span class="th-date">'+String(h.created_at||'').slice(0,10)+'</span></div>';
    }).join(''):'<p style="font-size:.8rem;color:var(--muted)">No changes yet — your first change will appear here.</p>';
  }
}
async function saveTierChange(){
  if(!currentUser)return;
  const newTier=document.getElementById('tier-new').value;
  const newAmount=parseInt(document.getElementById('tier-amount').value)||0;
  const note=(document.getElementById('tier-note').value||'').trim();
  if(!newAmount){toast('⚠ Enter your new annual commitment.');return}
  if(newTier===currentUser.tier&&newAmount===(currentUser.amount||0)){toast('⚠ That is already your current tier and amount.');return}
  const btn=document.getElementById('tier-save');if(btn){btn.disabled=true;btn.textContent='Saving…'}
  const hist={member_id:currentUser.id,member_name:currentUser.name,
    old_tier:currentUser.tier,new_tier:newTier,
    old_amount:currentUser.amount||0,new_amount:newAmount,note:note||null};
  const{error:e1}=await sb.from('tier_history').insert(hist);
  const{error:e2}=await sb.from('members').update({tier:newTier,amount:newAmount}).eq('id',currentUser.id);
  if(btn){btn.disabled=false;btn.textContent='Save tier change'}
  if(e1||e2){toast('⚠ Could not save the change.');console.error(e1||e2);return}
  currentUser.tier=newTier;currentUser.amount=newAmount;persistSession(currentUser);
  const idx=MEMBERS.findIndex(m=>m.id===currentUser.id);if(idx!==-1)Object.assign(MEMBERS[idx],{tier:newTier,amount:newAmount});
  renderMemberView();closeModal('m-tier');
  toast('✅ Tier updated to '+((TIERS_DATA[newTier]||{}).label||newTier)+' — recorded in your history.');
}

/* ═══ AD CAMPAIGNS — scheduled in-app marketing ═══ */
let ADS=[];
async function loadAds(){
  const{data,error}=await sb.from('ads').select('*').order('sort',{ascending:true});
  if(error){console.error('loadAds',error);return}
  ADS=data||[];
}
function activeAds(){
  const t=new Date().toISOString().slice(0,10);
  return ADS.filter(a=>a.active!==false&&(!a.starts_at||a.starts_at<=t)&&(!a.ends_at||a.ends_at>=t));
}
const _adSeen=new Set();
function _adView(id){if(_adSeen.has(id))return;_adSeen.add(id);sb.rpc('ad_hit',{aid:id,kind:'view'}).then(()=>{},()=>{});}
function adClick(id){sb.rpc('ad_hit',{aid:id,kind:'click'}).then(()=>{},()=>{});}
// Ads can run in three slots (like major platforms): in-feed, a side rail beside
// the screen (desktop), and a banner below the screen. 'all' shows in every slot.
function adsFor(slot){return activeAds().filter(a=>{const p=a.placement||'feed';return p===slot||p==='all';});}
function _adMedia(a,cls){
  if(a.media_type==='video'&&a.video_url)
    return '<video class="'+cls+'" src="'+esc(a.video_url)+'" muted loop playsinline autoplay preload="metadata"'+(a.image_url?' poster="'+esc(a.image_url)+'"':'')+'></video>';
  return a.image_url?'<img class="'+cls+'" src="'+esc(a.image_url)+'" alt="" onerror="this.style.display=\'none\'"/>':'';
}
function _adCta(a){return a.link_url?'<a class="ad-cta" href="'+esc(a.link_url)+'" onclick="adClick(\''+a.id+'\')" '+(String(a.link_url).startsWith('#')?'':'target="_blank" rel="noopener"')+'>'+esc(a.cta||'Learn more →')+'</a>':'';}
// Visual CTA button — the WHOLE card is clickable, so this is a styled label (not a nested link)
function _adCtaBtn(a){return '<span class="ad-cta">'+esc(a.cta||'Learn more')+' →</span>';}
// Click-through: tap anywhere on an ad → payment (default) or the campaign's link
function adOpen(id){
  const a=(ADS||[]).find(x=>x.id===id);if(!a)return;
  adClick(id);_buzz&&_buzz();
  const u=(a.link_url||'#payment').trim();
  if(u.charAt(0)==='#'){
    const sec=u.slice(1).toLowerCase();
    if(sec==='payment'||sec==='pay'||sec==='pay-now'){goToPayment();return;}
    const e=document.getElementById(u.slice(1));
    if(e){e.scrollIntoView({behavior:'smooth'});}else{goToPayment();}
  }else{
    window.open(u,'_blank','noopener');
  }
}
// standard clickable-root attributes for any ad card
function _adClickAttrs(a){return ' data-adid="'+esc(a.id)+'" role="button" tabindex="0" onclick="adOpen(\''+a.id+'\')" onkeydown="if(event.key===\'Enter\')adOpen(\''+a.id+'\')"';}
function _adHasMedia(a){return !!((a.media_type==='video'&&a.video_url)||a.image_url);}
function adCardHTML(a){
  _adView(a.id);
  return '<div class="ad-card ad-click'+(_adHasMedia(a)?'':' ad-nomedia')+'"'+_adClickAttrs(a)+'><span class="ad-tag">Sponsored · UBF</span>'+_adMedia(a,'ad-img')+
    '<div class="ad-body"><b>'+esc(a.title||'')+'</b>'+(a.body?'<p>'+esc(a.body)+'</p>':'')+_adCtaBtn(a)+'</div></div>';
}
function railAdHTML(a){
  _adView(a.id);
  return '<div class="ad-rail-card ad-click'+(_adHasMedia(a)?'':' ad-nomedia')+'"'+_adClickAttrs(a)+'><span class="ad-tag">Sponsored</span>'+_adMedia(a,'ad-rail-media')+
    '<div class="ad-rail-body"><b>'+esc(a.title||'')+'</b>'+(a.body?'<p>'+esc(a.body)+'</p>':'')+_adCtaBtn(a)+'</div></div>';
}
function bannerAdHTML(a){
  _adView(a.id);
  return '<div class="ad-banner-card ad-click"'+_adClickAttrs(a)+'>'+_adMedia(a,'ad-banner-media')+
    '<div class="ad-banner-body"><span class="ad-tag">Sponsored · UBF</span><b>'+esc(a.title||'')+'</b>'+(a.body?'<p>'+esc(a.body)+'</p>':'')+'</div>'+
    '<div class="ad-banner-cta">'+_adCtaBtn(a)+'</div></div>';
}
function bannerStripHTML(){
  const ads=adsFor('banner');if(!ads.length)return '';
  // Auto-rotating banner — slides between campaigns to keep drawing the eye
  return '<div class="ad-banner-strip ad-rotator">'+ads.map((a,i)=>'<div class="ad-slide'+(i===0?' on':'')+'">'+bannerAdHTML(a)+'</div>').join('')+
    (ads.length>1?'<div class="ad-dots">'+ads.map((a,i)=>'<i'+(i===0?' class="on"':'')+'></i>').join('')+'</div>':'')+'</div>';
}
// Side rail — POP-IN/POP-OFF cards: each slides in from the right edge, stays a
// while, slides off, and the next campaign pops in. Up to 3 stacked at once.
const AD_RAIL_SLOTS=3;
let _railIdx=0;
function _railSlotHTML(a,slot){
  return '<div class="rail-slot" data-slot="'+slot+'">'+
    '<button class="rail-x" onclick="railDismiss('+slot+')" aria-label="Close">✕</button>'+
    railAdHTML(a)+'</div>';
}
function renderAdRail(){
  let rail=document.getElementById('ad-rail');
  // Show for signed-in members on their home/learn tabs, AND for public visitors on the shell home (desktop).
  const memberShow=currentUser&&currentUser.role==='member'&&(_appTab==='home'||_appTab==='learn'||!document.body.classList.contains('app-mode'));
  const guestShow=document.body.classList.contains('shell-mode')&&!document.body.classList.contains('shell-open');
  const show=memberShow||guestShow;
  const ads=adsFor('rail');
  if(!rail){rail=document.createElement('aside');rail.id='ad-rail';document.body.appendChild(rail);}
  const visible=!!(ads.length&&show);
  document.body.classList.toggle('has-adrail',visible);
  if(!visible){rail.style.display='none';rail.innerHTML='';return;}
  rail.style.display='';
  const n=Math.min(AD_RAIL_SLOTS,ads.length);
  rail.innerHTML='<div class="ad-rail-head">Sponsored</div>'+
    Array.from({length:n},(_,s)=>_railSlotHTML(ads[s%ads.length],s)).join('');
  _railIdx=n;
  // stagger the entrances so they pop in one after another
  [...rail.querySelectorAll('.rail-slot')].forEach((el,i)=>setTimeout(()=>el.classList.add('in'),150+i*350));
}
function _railSwap(slotEl){
  const ads=adsFor('rail');if(!ads.length)return;
  const a=ads[_railIdx%ads.length];_railIdx++;
  slotEl.classList.remove('in');            // slide off…
  setTimeout(()=>{
    const slot=slotEl.getAttribute('data-slot');
    slotEl.outerHTML=_railSlotHTML(a,slot);
    const fresh=document.querySelector('#ad-rail .rail-slot[data-slot="'+slot+'"]');
    if(fresh)requestAnimationFrame(()=>requestAnimationFrame(()=>fresh.classList.add('in'))); // …next pops in
  },450);
}
function railDismiss(slot){
  const el=document.querySelector('#ad-rail .rail-slot[data-slot="'+slot+'"]');
  if(!el)return;
  const more=adsFor('rail').length>document.querySelectorAll('#ad-rail .rail-slot').length;
  if(more){_railSwap(el);}                                  // another campaign pops in
  else{el.classList.remove('in');setTimeout(()=>el.remove(),450);} // ✕ = gone for this visit
}
// One gentle cycle: every ~9s the oldest visible card slides off and the next pops in
setInterval(()=>{
  const rail=document.getElementById('ad-rail');
  if(!rail||rail.style.display==='none'||!rail.offsetParent)return;
  const slots=[...rail.querySelectorAll('.rail-slot.in')];
  if(!slots.length)return;
  if(adsFor('rail').length<=slots.length)return; // nothing new to rotate in
  _railSwap(slots[0]);
},9000);
// One gentle ticker crossfades every visible ad rotator (banner + rail)
setInterval(()=>{
  document.querySelectorAll('.ad-rotator').forEach(rot=>{
    if(!rot.offsetParent)return;
    const slides=[...rot.querySelectorAll(':scope > .ad-slide')];
    if(slides.length<2)return;
    let i=slides.findIndex(s=>s.classList.contains('on'));if(i<0)i=0;
    const n=(i+1)%slides.length;
    slides[i].classList.remove('on');slides[n].classList.add('on');
    const dots=rot.querySelectorAll('.ad-dots i');
    if(dots.length){dots.forEach(d=>d.classList.remove('on'));if(dots[n])dots[n].classList.add('on');}
    // count the newly-surfaced ad as seen
    const vid=slides[n].querySelector('[data-adid]');if(vid)_adView(vid.getAttribute('data-adid'));
  });
},5500);

/* ═══ TIMED POP-UP INTERSTITIAL — slides up to grab attention, then bows out ═══
   Frequency-capped so it never nags: at most once per session, and not again
   for the same campaign within 8 hours. */
let _popupTimer=null,_popupShown=false,_popupActive=null;
function popupAdHTML(a){
  const media=_adHasMedia(a)?_adMedia(a,'ad-pop-media'):'';
  return '<div class="ad-pop-card ad-click'+(media?'':' ad-pop-nomedia')+'" data-adid="'+esc(a.id)+'" role="button" tabindex="0" onclick="adOpen(\''+a.id+'\');dismissAdPopup()">'+
    '<button class="ad-pop-x" onclick="event.stopPropagation();dismissAdPopup(true)" aria-label="Close">✕</button>'+
    media+
    '<div class="ad-pop-body">'+
      '<span class="ad-pop-tag">Sponsored</span>'+
      '<b class="ad-pop-title">'+esc(a.title||'')+'</b>'+
      (a.body?'<p class="ad-pop-text">'+esc(a.body)+'</p>':'')+
      '<span class="ad-pop-cta">'+esc(a.cta||'Learn more')+' →</span>'+
    '</div>'+
    '<div class="ad-pop-timer"><i></i></div>'+
  '</div>';
}
/* Recurring rhythm: pop up → stay a few seconds → slide away → wait → reappear,
   rotating through the pop-up campaigns. Runs only while a member is on the
   Home/Learn feed; closing (✕) pauses it briefly so it never feels aggressive. */
const AD_POP_SHOW=7000;   // visible for 7s
const AD_POP_GAP=6000;    // hidden for 6s, then returns
const AD_POP_FIRST=4000;  // let the page settle before the first appearance
let _popCycleTimer=null,_popHideTimer=null,_popIdx=0,_popPausedUntil=0;
function _adPopEligible(){
  // Members only — the admin console must never get member-facing pop-ups
  return currentUser && currentUser.role==='member' && (_appTab==='home'||_appTab==='learn'||!document.body.classList.contains('app-mode')) && adsFor('popup').length>0;
}
function maybeShowAdPopup(){ startAdPopupCycle(); }
function startAdPopupCycle(){
  if(_popCycleTimer)return;              // already running
  if(!_adPopEligible())return;
  _popCycleTimer=setTimeout(_adPopTick,AD_POP_FIRST);
}
function stopAdPopupCycle(){
  clearTimeout(_popCycleTimer);clearTimeout(_popHideTimer);_popCycleTimer=null;
  hideAdPopup();
}
function _adPopTick(){
  _popCycleTimer=null;
  if(!_adPopEligible()){return;}                                   // left the feed → stop
  if(Date.now()<_popPausedUntil){ _popCycleTimer=setTimeout(_adPopTick,2500);return; } // user paused it
  if(document.querySelector('.overlay.open')){ _popCycleTimer=setTimeout(_adPopTick,3000);return; } // don't cover a dialog
  const ads=adsFor('popup');
  if(!ads.length){return;}
  const a=ads[_popIdx%ads.length];_popIdx++;
  showAdPopup(a);
  _popHideTimer=setTimeout(hideAdPopup,AD_POP_SHOW);               // hide after a few seconds
  _popCycleTimer=setTimeout(_adPopTick,AD_POP_SHOW+AD_POP_GAP);    // …then reappear
}
function showAdPopup(a){
  if(document.querySelector('.overlay.open'))return;
  _popupActive=a;
  let host=document.getElementById('ad-popup');
  if(!host){host=document.createElement('div');host.id='ad-popup';document.body.appendChild(host);}
  host.innerHTML=popupAdHTML(a);
  host.style.display='block';
  _adView(a.id);
  // keep the timer bar in sync with how long it stays up
  const bar=host.querySelector('.ad-pop-timer i');if(bar)bar.style.animationDuration=(AD_POP_SHOW/1000)+'s';
  requestAnimationFrame(()=>requestAnimationFrame(()=>host.classList.add('show')));
}
function hideAdPopup(){
  const host=document.getElementById('ad-popup');if(!host)return;
  host.classList.remove('show');
  setTimeout(()=>{if(host&&!host.classList.contains('show'))host.style.display='none';},500);
}
// ✕ = pause the rhythm for a minute, then it resumes on its own
function dismissAdPopup(userClosed){
  hideAdPopup();
  if(userClosed)_popPausedUntil=Date.now()+60000;
}
function _adStatus(a){
  const t=new Date().toISOString().slice(0,10);
  if(a.active===false)return['Off','#888'];
  if(a.starts_at&&a.starts_at>t)return['Scheduled','#2E7D9A'];
  if(a.ends_at&&a.ends_at<t)return['Ended','#B5451B'];
  return['● Live','#2D6A4F'];
}
let _adEditId=null;
function resetAdForm(){_adEditId=null;['ad-title','ad-body','ad-img','ad-link','ad-cta','ad-start','ad-end'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});const f=document.getElementById('ad-media');if(f)f.value='';const th=document.getElementById('ad-thumb');if(th)th.textContent='🖼';const pl=document.getElementById('ad-placement');if(pl)pl.value='feed';const a=document.getElementById('ad-active');if(a)a.checked=true;const t=document.getElementById('ad-form-title');if(t)t.textContent='Create a campaign';const b=document.getElementById('ad-save');if(b)b.textContent='Launch campaign';}
function editAd(id){
  const a=ADS.find(x=>x.id===id);if(!a)return;_adEditId=id;
  const g=i=>document.getElementById(i);
  g('ad-title').value=a.title||'';g('ad-body').value=a.body||'';g('ad-img').value=a.image_url||'';
  g('ad-link').value=a.link_url||'';g('ad-cta').value=a.cta||'';
  g('ad-start').value=a.starts_at||'';g('ad-end').value=a.ends_at||'';
  if(g('ad-placement'))g('ad-placement').value=a.placement||'feed';
  const th=g('ad-thumb');if(th)th.innerHTML=(a.media_type==='video'&&a.video_url)?'🎬':(a.image_url?'<img src="'+esc(a.image_url)+'" alt=""/>':'🖼');
  g('ad-active').checked=a.active!==false;
  g('ad-form-title').textContent='Editing: '+(a.title||'');g('ad-save').textContent='Update campaign';
  const c=document.getElementById('ad-form-card');if(c)c.scrollIntoView({behavior:'smooth',block:'center'});
}
async function saveAd(){
  const title=(document.getElementById('ad-title').value||'').trim();
  if(!title){toast('⚠ A campaign title is required.');return}
  const cur=_adEditId?ADS.find(x=>x.id===_adEditId):null;
  const row={title,body:(document.getElementById('ad-body').value||'').trim(),
    image_url:(document.getElementById('ad-img').value||'').trim()||null,
    link_url:(document.getElementById('ad-link').value||'').trim()||null,
    cta:(document.getElementById('ad-cta').value||'').trim()||null,
    starts_at:document.getElementById('ad-start').value||null,
    ends_at:document.getElementById('ad-end').value||null,
    placement:(document.getElementById('ad-placement')?document.getElementById('ad-placement').value:'feed')||'feed',
    video_url:cur?(cur.video_url||null):null,
    media_type:cur?(cur.media_type||null):null,
    active:document.getElementById('ad-active').checked};
  const btn=document.getElementById('ad-save');if(btn){btn.disabled=true;btn.textContent='Saving…'}
  // Optional media upload (image or video) — becomes the ad creative
  const up=await _uploadPayAsset('ad-media','ad');
  if(up){if(up.type==='video'){row.video_url=up.url;row.media_type='video';}else{row.image_url=up.url;row.media_type='image';}}
  if(_adEditId)row.id=_adEditId;
  const{error}=await sb.from('ads').upsert(row);
  if(btn){btn.disabled=false;btn.textContent=_adEditId?'Update campaign':'Launch campaign'}
  if(error){toast('⚠ Could not save the campaign.');console.error(error);return}
  await loadAds();renderAdsAdmin();renderPosts();renderAdRail();resetAdForm();
  audit('Saved ad campaign',title);toast('✅ Campaign saved.');
}
async function delAd(id){
  const a=ADS.find(x=>x.id===id);
  if(!confirm('Delete campaign "'+((a&&a.title)||'')+'"? This cannot be undone.'))return;
  const{error}=await sb.from('ads').delete().eq('id',id);
  if(error){toast('⚠ Could not delete.');return}
  audit('Deleted ad campaign',(a&&a.title)||id);await loadAds();renderAdsAdmin();renderPosts();toast('Campaign deleted.');
}
function renderAdsAdmin(){
  const el=document.getElementById('ads-admin-list');if(!el)return;
  el.innerHTML=ADS.length?ADS.map(a=>{
    const[st,col]=_adStatus(a);
    const slot={feed:'📰 Feed',rail:'📐 Side rail',banner:'🪧 Banner',popup:'🎬 Pop-up',all:'🌐 Everywhere'}[a.placement||'feed'];
    const media=(a.media_type==='video'&&a.video_url)?'🎬 video':(a.image_url?'🖼 image':'📝 text');
    return '<div class="pa-row"><span class="pa-thumb">'+((a.media_type==='video'&&a.video_url)?'🎬':'📣')+'</span>'+
      '<div class="pa-info"><strong>'+esc(a.title)+'</strong><span style="color:'+col+';font-weight:700">'+st+'</span><span> · '+slot+' · '+media+' · '+(a.starts_at||'—')+' → '+(a.ends_at||'no end')+' · 👁 '+(a.impressions||0)+' views · 🖱 '+(a.clicks||0)+' clicks</span></div>'+
      '<button class="btn btn-ghost btn-sm" onclick="editAd(\''+a.id+'\')">Edit</button>'+
      '<button class="btn btn-danger btn-sm" onclick="delAd(\''+a.id+'\')">Delete</button></div>';
  }).join(''):'<p style="font-size:.85rem;color:var(--muted)">No campaigns yet — create your first above.</p>';
}

/* ═══ MEMBERSHIP RENEWALS — lifecycle with pending→approved flow ═══ */
function membershipDue(u){return u&&u.role==='member'&&(u.year||0)<new Date().getFullYear();}
function renewBannerHTML(u){
  if(!membershipDue(u))return '';
  const y=new Date().getFullYear();
  return '<div class="renew-banner"><div><b>Your '+esc(String(u.year))+' membership needs renewal for '+y+'</b><span>Renew to keep your benefits active — it takes a minute.</span></div><button class="btn btn-gold btn-sm" onclick="openRenewModal()">🔄 Renew now</button></div>';
}
async function openRenewModal(){
  if(!currentUser)return;
  const y=new Date().getFullYear();
  const lbl=document.getElementById('renew-year-label');if(lbl)lbl.textContent=String(y);
  const amt=document.getElementById('renew-amount');if(amt)amt.value=currentUser.amount||'';
  const pr=document.getElementById('renew-payref');if(pr)pr.value='';
  const{data}=await sb.from('renewals').select('id').eq('member_id',currentUser.id).eq('to_year',y).eq('status','pending');
  const note=document.getElementById('renew-pending-note');
  if(note)note.style.display=(data&&data.length)?'block':'none';
  openModal('m-renew');
}
async function submitRenewal(){
  if(!currentUser)return;
  const y=new Date().getFullYear();
  const amount=parseInt(document.getElementById('renew-amount').value)||0;
  const payref=(document.getElementById('renew-payref').value||'').trim();
  if(!amount){toast('⚠ Enter your renewal amount.');return}
  const{error}=await sb.from('renewals').insert({member_id:currentUser.id,member_name:currentUser.name,from_year:currentUser.year,to_year:y,amount,payref});
  if(error){toast('⚠ Could not submit — try again.');console.error(error);return}
  closeModal('m-renew');
  toast('✅ Renewal submitted — we activate it once your payment is confirmed (within 48h).');
}
async function approveRenewal(id){
  const{data:r}=await sb.from('renewals').select('*').eq('id',id).single();
  if(!r)return;
  if(!confirm('Approve renewal for '+(r.member_name||'member')+' → '+r.to_year+'? Confirm the payment reference first.'))return;
  await sb.from('renewals').update({status:'approved'}).eq('id',id);
  await sb.from('members').update({year:r.to_year,amount:r.amount||undefined}).eq('id',r.member_id);
  audit('Approved renewal','member '+(r.member_name||r.member_id)+' → '+r.to_year);
  await loadMembers();renderAdminOverview();renderAdminMembers();
  toast('✅ Renewal approved.');
}

/* ═══ CONTRIBUTION RECEIPT (PDF) — logos, ED signature, FoB stamp, QR ═══ */
function _loadAsset(srcs){
  return new Promise(res=>{
    if(!srcs||!srcs.length)return res(null);
    const im=new Image();
    const next=()=>_loadAsset(srcs.slice(1)).then(res);
    im.onload=()=>{
      if(im.naturalWidth<4||im.naturalHeight<4)return next();// skip empty/broken files
      try{
        const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;
        c.getContext('2d').drawImage(im,0,0);
        res({d:c.toDataURL('image/png'),w:im.naturalWidth,h:im.naturalHeight});
      }catch(e){next();}
    };
    im.onerror=next;
    im.src=srcs[0];
  });
}
async function downloadReceipt(){
  if(!currentUser)return;
  const J=(window.jspdf||{}).jsPDF;
  if(!J){toast('⚠ PDF engine still loading — try again in a moment.');return}
  toast('🧾 Preparing your receipt…');
  const[fob,ubf,sig,stamp,qr]=await Promise.all([
    _loadAsset(['fob-logo.png']),_loadAsset(['ubf-logo.png']),
    _loadAsset(['edsignature.png','ed-signature.png']),
    _loadAsset(['stamp.png','fobstamp.png']),
    _loadAsset(['qrcode.png','qr-code.png'])
  ]);
  const d=new J();const u=currentUser;const td=TIERS_DATA[u.tier]||{label:u.tier};
  const fit=(a,maxW,maxH)=>{const r=Math.min(maxW/a.w,maxH/a.h);return{w:a.w*r,h:a.h*r};};
  // Header band with both logos
  d.setFillColor(11,38,24);d.rect(0,0,210,34,'F');
  if(fob){const s=fit(fob,24,24);d.addImage(fob.d,'PNG',12,(34-s.h)/2,s.w,s.h);}
  if(ubf){const s=fit(ubf,24,24);d.addImage(ubf.d,'PNG',210-12-s.w,(34-s.h)/2,s.w,s.h);}
  d.setTextColor(228,201,122);d.setFont('helvetica','bold');d.setFontSize(15);
  d.text('UGANDA BIODIVERSITY FUND',105,14,{align:'center'});
  d.setFontSize(9);d.setTextColor(255,255,255);d.setFont('helvetica','normal');
  d.text('Friends of Biodiversity · Green Card Programme',105,22,{align:'center'});
  // Gold band
  d.setFillColor(200,168,75);d.rect(0,34,210,9,'F');
  d.setTextColor(11,38,24);d.setFont('helvetica','bold');d.setFontSize(9);
  d.text('O F F I C I A L   C O N T R I B U T I O N   R E C E I P T',105,40,{align:'center'});
  // Details
  d.setTextColor(30,30,30);d.setFontSize(11);
  const rows=[['Receipt No','FOB-'+String(u.id||'').slice(0,8).toUpperCase()],
    ['Date issued',new Date().toLocaleDateString()],
    ['Member',u.name||''],['Member type',(u.type||'individual')+(u.org?' — '+u.org:'')],
    ['Green Card tier',(td.label||u.tier)+' · '+String(u.year||'')],
    ['Payment reference',u.payref||'—']];
  let y=56;
  rows.forEach(([k,v])=>{
    d.setFont('helvetica','bold');d.text(k,25,y);
    d.setFont('helvetica','normal');d.text(String(v),80,y);
    d.setDrawColor(225,225,225);d.setLineDashPattern([1,1.5],0);d.line(25,y+2.5,185,y+2.5);d.setLineDashPattern([],0);
    y+=10;});
  // Amount highlight
  d.setFillColor(248,243,228);d.setDrawColor(200,168,75);d.roundedRect(25,y,160,16,3,3,'FD');
  d.setFont('helvetica','bold');d.setTextColor(11,38,24);d.setFontSize(11);
  d.text('Annual contribution',31,y+10);
  d.setFontSize(14);d.text('UGX '+(u.amount||0).toLocaleString(),179,y+10.5,{align:'right'});
  y+=26;
  d.setFont('helvetica','normal');d.setFontSize(9.5);d.setTextColor(100,100,100);
  d.text('Thank you for standing with Uganda\'s forests, wetlands and wildlife.',25,y);
  d.text('Every shilling becomes measurable protection on the ground.',25,y+5);
  // Footer: signature · stamp · QR
  const fy=y+42;
  if(sig){const s=fit(sig,46,20);d.addImage(sig.d,'PNG',30+(46-s.w)/2,fy-s.h-1,s.w,s.h);}
  else{d.setFont('times','italic');d.setFontSize(16);d.setTextColor(22,50,31);d.text('I. Amani',45,fy-3);}
  d.setDrawColor(60,60,60);d.line(28,fy,80,fy);
  d.setFont('helvetica','bold');d.setFontSize(8);d.setTextColor(60,60,60);
  d.text('Executive Director',54,fy+5,{align:'center'});
  d.setFont('helvetica','normal');d.text('Uganda Biodiversity Fund',54,fy+9.5,{align:'center'});
  if(stamp){const s=fit(stamp,34,34);d.addImage(stamp.d,'PNG',105-s.w/2,fy-24,s.w,s.h);}
  else{
    d.setDrawColor(45,106,79);d.setLineWidth(.8);d.circle(105,fy-8,15);d.setLineWidth(.3);d.circle(105,fy-8,12.5);
    d.setFontSize(6.5);d.setTextColor(45,106,79);d.setFont('helvetica','bold');
    d.text('UGANDA BIODIVERSITY FUND',105,fy-10,{align:'center'});d.text('· OFFICIAL ·',105,fy-6,{align:'center'});
    d.setLineWidth(.2);
  }
  if(qr){const s=fit(qr,26,26);d.addImage(qr.d,'PNG',155,fy-26,s.w,s.h);
    d.setFontSize(7);d.setTextColor(100,100,100);d.setFont('helvetica','normal');
    d.text('Scan to verify',168,fy+4,{align:'center'});}
  // Contact strip
  d.setFillColor(11,38,24);d.rect(0,282,210,15,'F');
  d.setTextColor(220,220,220);d.setFontSize(8);
  d.text('info@ugandabiodiversityfund.org  ·  www.ugandabiodiversityfund.org  ·  +256 (039) 3216445',105,291,{align:'center'});
  d.save('UBF-Receipt-'+(u.year||'')+'.pdf');
  toast('🧾 Receipt downloaded.');
}

/* ═══ FUNDRAISING CAMPAIGNS + DONATIONS ═══ */
let CAMPAIGNS=[];
async function loadCampaigns(){const{data}=await sb.from('campaigns').select('*').order('created_at',{ascending:false});CAMPAIGNS=data||[];}
function campaignCardHTML(c){
  const pct=c.goal>0?Math.min(100,Math.round((c.raised||0)*100/c.goal)):0;
  return '<div class="camp-card">'+(c.image_url?'<img class="camp-img" src="'+esc(c.image_url)+'" alt="" onerror="this.style.display=\'none\'"/>':'')+
    '<div class="camp-body"><b>'+esc(c.title)+'</b>'+(c.blurb?'<p>'+esc(c.blurb)+'</p>':'')+
    '<div class="camp-bar"><span style="width:'+pct+'%"></span></div>'+
    '<div class="camp-nums">UGX '+((c.raised||0).toLocaleString())+' raised'+(c.goal?' of UGX '+c.goal.toLocaleString()+' ('+pct+'%)':'')+(c.ends_at?' · ends '+esc(c.ends_at):'')+'</div>'+
    '<button class="btn btn-gold btn-sm" onclick="openDonate(\''+c.id+'\')">💚 Donate</button></div></div>';
}
let _donateCampaign=null;
function _causeCardHTML(c){
  if(!c)return '<div class="dc-inner"><span class="dc-tag">Your cause</span><b>UBF Conservation Fund</b><p>Your gift protects Uganda’s forests, wetlands and wildlife where the need is greatest right now.</p></div>';
  const pct=c.goal>0?Math.min(100,Math.round((c.raised||0)*100/c.goal)):0;
  return '<div class="dc-inner">'+
    (c.image_url?'<img class="dc-img" src="'+esc(c.image_url)+'" alt="" onerror="this.style.display=\'none\'"/>':'')+
    '<div class="dc-txt"><span class="dc-tag">You’re supporting</span><b>'+esc(c.title)+'</b>'+
    (c.blurb?'<p>'+esc(c.blurb)+'</p>':'')+
    (c.goal?'<div class="camp-bar"><span style="width:'+pct+'%"></span></div><div class="dc-nums">UGX '+((c.raised||0).toLocaleString())+' of '+c.goal.toLocaleString()+' ('+pct+'%)</div>':'')+
    '</div></div>';
}
function setDonateCause(cid){
  _donateCampaign=cid||null;
  const c=CAMPAIGNS.find(x=>x.id===cid);
  const card=document.getElementById('donate-cause-card');if(card)card.innerHTML=_causeCardHTML(c);
}
let _donateSource=null;
// From an IUCN gallery card → a donation to protect that species/place, via official channels
function donateForProtect(id){
  const p=(PROTECT||[]).find(x=>x.id===id);if(!p)return;
  closeModal('m-detail');
  openDonate(p.cause_campaign_id||null,'Protect: '+(p.name||''));
}
function openDonate(cid,source){
  _donateSource=source||null;
  const active=CAMPAIGNS.filter(c=>c.active!==false);
  // Always tie a donation to a specific cause: default to the first live cause
  if(!cid&&active.length)cid=active[0].id;
  _donateCampaign=cid||null;
  const c=CAMPAIGNS.find(x=>x.id===cid);
  const card=document.getElementById('donate-cause-card');if(card)card.innerHTML=_causeCardHTML(c);
  // If several causes are live, let the donor pick which one
  const pick=document.getElementById('donate-cause-pick');
  if(pick){
    if(active.length>1){
      pick.style.display='';
      pick.innerHTML='<label>Choose your cause</label><select onchange="setDonateCause(this.value)">'+
        active.map(x=>'<option value="'+x.id+'"'+(x.id===cid?' selected':'')+'>'+esc(x.title)+'</option>').join('')+'</select>';
    }else pick.style.display='none';
  }
  ['donate-amount','donate-payref','donate-name'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const nm=document.getElementById('donate-name');if(nm&&currentUser)nm.value=currentUser.name;
  donateGate(); // re-lock the log button until a fresh payment reference is entered
  openModal('m-donate');
}
let _donChan='MTN MoMo';
function pickDonChan(btn){
  document.querySelectorAll('.donate-chan').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');_donChan=btn.dataset.ch;
}
// Pay-first gate: the log button stays locked until a payment reference exists
function donateGate(){
  const ref=(document.getElementById('donate-payref').value||'').trim();
  const btn=document.getElementById('donate-submit');
  const note=document.getElementById('donate-locknote');
  if(btn){btn.disabled=!ref;btn.textContent=ref?'✓ Submit payment for verification':'🔒 Submit payment for verification';}
  if(note)note.style.display=ref?'none':'';
}
async function submitDonation(){
  const amount=parseInt(document.getElementById('donate-amount').value)||0;
  const payref=(document.getElementById('donate-payref').value||'').trim();
  const donor=(document.getElementById('donate-name').value||'').trim()||'Anonymous friend';
  if(!payref){toast('🔒 Pay first — then enter your payment reference to unlock logging.');return}
  if(!amount){toast('⚠ Enter the amount you paid.');return}
  const btn=document.getElementById('donate-submit');if(btn){btn.disabled=true;btn.textContent='Saving…';}
  const ref=(_donChan?_donChan+' · ':'')+payref;
  const{error}=await sb.from('donations').insert({campaign_id:_donateCampaign,donor_name:donor,member_id:currentUser?currentUser.id:null,amount,payref:ref,source:_donateSource});
  if(btn){btn.disabled=false;btn.textContent='✓ Submit payment for verification';}
  if(error){toast('⚠ Could not record the donation.');console.error(error);return}
  closeModal('m-donate');
  // Auto-logged recap — the member sees exactly what the system recorded
  const c=CAMPAIGNS.find(x=>x.id===_donateCampaign);
  const kv=(k,v)=>'<div class="don-krow"><span>'+k+'</span><b>'+esc(v)+'</b></div>';
  document.getElementById('detail-body').innerHTML=
    '<div class="dtl-hero" style="height:110px;background:linear-gradient(135deg,#153d28,#2D6A4F)"><div class="dtl-hero-grad"></div>'+
      '<div class="dtl-hero-txt"><span class="dtl-kind">🕓 Submitted for verification</span><h2>Thank you, '+esc(donor.split(' ')[0])+'!</h2></div></div>'+
    '<div class="dtl-body">'+
      '<p class="dtl-blurb" style="margin-bottom:.8rem">Your payment claim has been submitted. <b>It does not count yet</b> — the UBF team first verifies your reference against the '+esc(_donChan||'payment')+' statement. Once the payment is found, your donation is confirmed and added to the cause. Claims with no matching payment are rejected.</p>'+
      kv('Cause',c?c.title:'UBF Conservation Fund')+
      (_donateSource?kv('For',_donateSource):'')+
      kv('Amount','UGX '+amount.toLocaleString())+
      kv('Reference',ref)+
      kv('Status','Awaiting payment verification 🕓')+
      '<div class="dtl-cta-row" style="margin-top:1rem"><button class="btn btn-ghost" onclick="closeModal(\'m-detail\')">Close</button></div>'+
    '</div>';
  openModal('m-detail');
}
async function approveDonation(id){
  const{data:dn}=await sb.from('donations').select('*').eq('id',id).single();
  if(!dn)return;
  if(!confirm('Confirm donation of UGX '+(dn.amount||0).toLocaleString()+' from '+(dn.donor_name||'donor')+'?'))return;
  await sb.from('donations').update({status:'approved'}).eq('id',id);
  if(dn.campaign_id){const c=CAMPAIGNS.find(x=>x.id===dn.campaign_id);if(c)await sb.from('campaigns').update({raised:(c.raised||0)+(dn.amount||0)}).eq('id',c.id);}
  audit('Verified donation payment','UGX '+(dn.amount||0).toLocaleString()+' from '+(dn.donor_name||''));
  await loadCampaigns();renderCampaignsAdmin();renderMemberView();
  toast('✅ Payment verified — donation now counts.');
}
// A claim whose payment can't be found in the statement gets rejected — it never counted
async function rejectDonation(id){
  const{data:dn}=await sb.from('donations').select('*').eq('id',id).single();
  if(!dn)return;
  if(!confirm('Reject this claim? UGX '+(dn.amount||0).toLocaleString()+' from '+(dn.donor_name||'donor')+' ('+(dn.payref||'no ref')+') — no matching payment found.'))return;
  await sb.from('donations').update({status:'rejected'}).eq('id',id);
  audit('Rejected donation claim','UGX '+(dn.amount||0).toLocaleString()+' from '+(dn.donor_name||'')+' · '+(dn.payref||'no ref'));
  renderCampaignsAdmin();
  toast('✗ Claim rejected — it was never counted.');
}
let _campEditId=null;
function resetCampForm(){_campEditId=null;['camp-title','camp-blurb','camp-goal','camp-img','camp-end'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});const a=document.getElementById('camp-active');if(a)a.checked=true;const b=document.getElementById('camp-save');if(b)b.textContent='Create fundraiser';}
function editCamp(id){const c=CAMPAIGNS.find(x=>x.id===id);if(!c)return;_campEditId=id;const g=i=>document.getElementById(i);g('camp-title').value=c.title||'';g('camp-blurb').value=c.blurb||'';g('camp-goal').value=c.goal||'';g('camp-img').value=c.image_url||'';g('camp-end').value=c.ends_at||'';g('camp-active').checked=c.active!==false;g('camp-save').textContent='Update fundraiser';}
async function saveCamp(){
  const title=(document.getElementById('camp-title').value||'').trim();
  if(!title){toast('⚠ A title is required.');return}
  const row={title,blurb:(document.getElementById('camp-blurb').value||'').trim(),
    goal:parseInt(document.getElementById('camp-goal').value)||0,
    image_url:(document.getElementById('camp-img').value||'').trim()||null,
    ends_at:document.getElementById('camp-end').value||null,
    active:document.getElementById('camp-active').checked};
  if(_campEditId)row.id=_campEditId;
  const{error}=await sb.from('campaigns').upsert(row);
  if(error){toast('⚠ Could not save.');console.error(error);return}
  audit('Saved fundraiser',title);
  await loadCampaigns();renderCampaignsAdmin();resetCampForm();toast('✅ Fundraiser saved.');
}
async function renderCampaignsAdmin(){
  const el=document.getElementById('camps-admin-list');if(!el)return;
  el.innerHTML=CAMPAIGNS.map(c=>'<div class="pa-row"><span class="pa-thumb">🎯</span><div class="pa-info"><strong>'+esc(c.title)+'</strong><span>UGX '+((c.raised||0).toLocaleString())+' / '+((c.goal||0).toLocaleString())+(c.active===false?' · off':'')+'</span></div><button class="btn btn-ghost btn-sm" onclick="editCamp(\''+c.id+'\')">Edit</button></div>').join('')||'<p style="font-size:.85rem;color:var(--muted)">No fundraisers yet.</p>';
  const dl=document.getElementById('donations-pending-list');
  if(dl){
    const{data}=await sb.from('donations').select('*').eq('status','pending').order('created_at',{ascending:false});
    dl.innerHTML=(data&&data.length)?
      '<p style="font-size:.8rem;color:var(--muted);line-height:1.55;margin-top:0">These are <b>unverified claims</b> — they count nowhere until you check the reference against the MTN/Airtel/Stanbic statement and press <b>✓ Verify</b>. No matching payment? Press <b>✗ Reject</b>.</p>'+
      data.map(d=>'<div class="pa-row"><span class="pa-thumb">💚</span><div class="pa-info"><strong>UGX '+((d.amount||0).toLocaleString())+' — '+esc(d.donor_name||'Anonymous')+'</strong><span>'+(d.payref?'Ref: '+esc(d.payref):'⚠ no reference')+(d.source?' · '+esc(d.source):'')+' · '+String(d.created_at||'').slice(0,10)+'</span></div><button class="btn btn-canopy btn-sm" onclick="approveDonation(\''+d.id+'\')">✓ Verify payment</button><button class="btn btn-danger btn-sm" onclick="rejectDonation(\''+d.id+'\')">✗ Reject</button></div>').join('')
      :'<p style="font-size:.85rem;color:var(--muted)">No claims awaiting verification.</p>';
  }
}

/* ═══ EVENTS & RSVP ═══ */
let EVENTS=[];let RSVPS=[];
async function loadEvents(){
  const[e,r]=await Promise.all([
    sb.from('events').select('*').order('event_date',{ascending:true}),
    sb.from('event_rsvps').select('*')
  ]);
  EVENTS=e.data||[];RSVPS=r.data||[];
}
function upcomingEvents(){const t=new Date().toISOString().slice(0,10);return EVENTS.filter(ev=>ev.active!==false&&(!ev.event_date||ev.event_date>=t));}
/* Sliding poster/video carousel — admin-designed posters auto-slide like ads */
function eventCardHTML(ev){
  const going=RSVPS.filter(r=>r.event_id===ev.id);
  const mine=currentUser&&going.some(r=>r.member_id===currentUser.id);
  const d=ev.event_date?new Date(ev.event_date+'T00:00:00'):null;
  const media=(ev.media_type==='video'&&ev.video_url)
    ?'<video src="'+esc(ev.video_url)+'" muted loop playsinline autoplay preload="metadata"'+(ev.poster_url?' poster="'+esc(ev.poster_url)+'"':'')+'></video>'
    :(ev.poster_url?'<img src="'+esc(ev.poster_url)+'" alt="" onerror="this.style.display=\'none\'"/>':'');
  return '<div class="evc-card"'+(media?'':' style="background:linear-gradient(160deg,#174530,#0c2a19)"')+'>'+media+
    (d?'<div class="evc-date"><span>'+d.toLocaleString('en',{month:'short'})+'</span><b>'+d.getDate()+'</b></div>':'')+
    ((ev.media_type==='video'&&ev.video_url)?'<span class="evc-vid">🎬</span>':'')+
    '<div class="evc-body"><b>'+esc(ev.title)+'</b><span>'+[ev.event_time,ev.location].filter(Boolean).map(esc).join(' · ')+(going.length?' · 🙌 '+going.length+' going':'')+'</span>'+
    (currentUser?'<button class="evc-cta'+(mine?' on':'')+'" onclick="toggleRsvp(\''+ev.id+'\')">'+(mine?'✓ Going':'RSVP →')+'</button>':'')+
    '</div></div>';
}
function eventsCarouselHTML(){
  const evs=upcomingEvents();if(!evs.length)return '';
  return '<div class="evc-wrap"><div class="evc-head"><b>📅 What’s coming up</b><span>swipe ›</span></div><div class="evc">'+evs.map(eventCardHTML).join('')+'</div></div>';
}
// Gentle auto-advance for every visible carousel
setInterval(()=>{
  document.querySelectorAll('.evc').forEach(t=>{
    if(!t.offsetParent)return;
    const w=t.firstElementChild?t.firstElementChild.offsetWidth+12:270;
    const max=t.scrollWidth-t.clientWidth;
    if(max<=4)return;
    const next=t.scrollLeft+w>max-8?0:t.scrollLeft+w;
    t.scrollTo({left:next,behavior:'smooth'});
  });
},4800);
function eventRowHTML(ev){
  const going=RSVPS.filter(r=>r.event_id===ev.id);
  const mine=currentUser&&going.some(r=>r.member_id===currentUser.id);
  const d=ev.event_date?new Date(ev.event_date+'T00:00:00'):null;
  const cal=d?'<div class="ev-cal"><span>'+d.toLocaleString('en',{month:'short'})+'</span><b>'+d.getDate()+'</b></div>':'<div class="ev-cal"><b>📅</b></div>';
  return '<div class="ev-row">'+cal+'<div class="ev-main"><b>'+esc(ev.title)+'</b><span>'+[ev.event_time,ev.location].filter(Boolean).map(esc).join(' · ')+(ev.blurb?'<br>'+esc(ev.blurb):'')+'</span><span class="ev-going">🙌 '+going.length+' going</span></div>'+
    (currentUser?'<button class="btn '+(mine?'btn-ghost':'btn-canopy')+' btn-sm" onclick="toggleRsvp(\''+ev.id+'\')">'+(mine?'✓ Going':'RSVP')+'</button>':'')+'</div>';
}
async function toggleRsvp(eventId){
  if(!currentUser){openModal('m-login');return}
  _buzz();
  const _redraw=()=>{renderMemberView();renderPosts();};
  const mine=RSVPS.find(r=>r.event_id===eventId&&r.member_id===currentUser.id);
  if(mine){RSVPS=RSVPS.filter(r=>r!==mine);_redraw();await sb.from('event_rsvps').delete().eq('id',mine.id);}
  else{const local={id:'tmp'+Date.now(),event_id:eventId,member_id:currentUser.id,member_name:currentUser.name};RSVPS.push(local);_redraw();
    const{data,error}=await sb.from('event_rsvps').insert({event_id:eventId,member_id:currentUser.id,member_name:currentUser.name}).select().single();
    if(error){RSVPS=RSVPS.filter(r=>r!==local);_redraw();toast('⚠ Could not RSVP.');}else{local.id=data.id;toast('🙌 See you there!');}}
}
let _evEditId=null;
function resetEventForm(){_evEditId=null;['ev-title','ev-date','ev-time','ev-loc','ev-blurb','ev-poster-url'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});const f=document.getElementById('ev-media');if(f)f.value='';const t=document.getElementById('ev-thumb');if(t)t.textContent='🖼';const a=document.getElementById('ev-active');if(a)a.checked=true;const b=document.getElementById('ev-save');if(b)b.textContent='Publish event';}
function editEvent(id){const ev=EVENTS.find(x=>x.id===id);if(!ev)return;_evEditId=id;const g=i=>document.getElementById(i);g('ev-title').value=ev.title||'';g('ev-date').value=ev.event_date||'';g('ev-time').value=ev.event_time||'';g('ev-loc').value=ev.location||'';g('ev-blurb').value=ev.blurb||'';if(g('ev-poster-url'))g('ev-poster-url').value=(ev.media_type!=='video'&&ev.poster_url)?ev.poster_url:'';const t=g('ev-thumb');if(t)t.innerHTML=(ev.media_type==='video'&&ev.video_url)?'🎬':(ev.poster_url?'<img src="'+esc(ev.poster_url)+'" alt=""/>':'🖼');g('ev-active').checked=ev.active!==false;g('ev-save').textContent='Update event';}
async function saveEvent(){
  const title=(document.getElementById('ev-title').value||'').trim();
  if(!title){toast('⚠ An event title is required.');return}
  const cur=_evEditId?EVENTS.find(e=>e.id===_evEditId):null;
  const row={title,event_date:document.getElementById('ev-date').value||null,
    event_time:(document.getElementById('ev-time').value||'').trim()||null,
    location:(document.getElementById('ev-loc').value||'').trim()||null,
    blurb:(document.getElementById('ev-blurb').value||'').trim()||null,
    active:document.getElementById('ev-active').checked,
    poster_url:cur?(cur.poster_url||null):null,
    video_url:cur?(cur.video_url||null):null,
    media_type:cur?(cur.media_type||'image'):'image'};
  const up=await _uploadPayAsset('ev-media','event');
  if(up){if(up.type==='video'){row.video_url=up.url;row.media_type='video';}else{row.poster_url=up.url;row.media_type='image';}}
  else{const typed=(document.getElementById('ev-poster-url')?document.getElementById('ev-poster-url').value.trim():'');if(typed){row.poster_url=typed;row.media_type='image';}}
  if(_evEditId)row.id=_evEditId;
  const{error}=await sb.from('events').upsert(row);
  if(error){toast('⚠ Could not save.');console.error(error);return}
  audit('Saved event',title);
  await loadEvents();renderEventsAdmin();resetEventForm();renderMemberView();toast('✅ Event published.');
}
async function delEvent(id){
  const ev=EVENTS.find(x=>x.id===id);
  if(!confirm('Delete event "'+((ev&&ev.title)||'')+'"?'))return;
  await sb.from('events').delete().eq('id',id);
  audit('Deleted event',(ev&&ev.title)||id);
  await loadEvents();renderEventsAdmin();renderMemberView();toast('Event deleted.');
}
function renderEventsAdmin(){
  const el=document.getElementById('events-admin-list');if(!el)return;
  el.innerHTML=EVENTS.map(ev=>{
    const n=RSVPS.filter(r=>r.event_id===ev.id).length;
    return '<div class="pa-row"><span class="pa-thumb">📅</span><div class="pa-info"><strong>'+esc(ev.title)+'</strong><span>'+(ev.event_date||'no date')+(ev.location?' · '+esc(ev.location):'')+' · 🙌 '+n+' going'+(ev.active===false?' · hidden':'')+'</span></div><button class="btn btn-ghost btn-sm" onclick="editEvent(\''+ev.id+'\')">Edit</button><button class="btn btn-danger btn-sm" onclick="delEvent(\''+ev.id+'\')">Delete</button></div>';
  }).join('')||'<p style="font-size:.85rem;color:var(--muted)">No events yet.</p>';
}

/* ═══ IMPACT BADGES ═══ */
function memberBadges(u,posts){
  const b=['💚 Friend of Biodiversity'];// baseline — every member wears the colours
  if((u.year||9999)<=2025)b.push('🌱 Founding member');
  if(['platinum','diamond'].includes(u.tier))b.push('🛡 Guardian');
  if(posts>=5)b.push('✍ Storyteller');else if(posts>=1)b.push('🌿 Green voice');
  if((u.followers_count||0)>=5)b.push('🤝 Connector');
  if(RSVPS.filter(r=>r.member_id===u.id).length>=1)b.push('🙌 Event-goer');
  const vs=myVerifiedSightings(u.id);
  if(vs>=10)b.push('🔬 Citizen Scientist');else if(mySightings(u.id)>=1)b.push('🔭 Observer');
  return b;
}

/* ═══ ADMIN AUDIT TRAIL ═══ */
function audit(action,target){
  if(!currentUser||currentUser.role!=='admin')return;
  sb.from('admin_audit').insert({admin_email:currentUser.email,action,target:(target||'').slice(0,180)}).then(()=>{},()=>{});
}
async function renderAuditLog(){
  const el=document.getElementById('audit-list');if(!el)return;
  const{data}=await sb.from('admin_audit').select('*').order('created_at',{ascending:false}).limit(100);
  el.innerHTML=(data&&data.length)?data.map(a=>'<div class="pa-row"><span class="pa-thumb">🧾</span><div class="pa-info"><strong>'+esc(a.action||'')+'</strong><span>'+esc(a.target||'')+'</span></div><span style="font-size:.72rem;color:var(--muted);font-family:var(--ff-m);text-align:right">'+esc(a.admin_email||'').split('@')[0]+'<br>'+String(a.created_at||'').slice(0,16).replace('T',' ')+'</span></div>').join(''):'<p style="font-size:.85rem;color:var(--muted)">No admin actions recorded yet.</p>';
}

/* ═══ CITIZEN SCIENCE — sightings log, map & EIA data pack ═══
   A member snaps a photo, picks a species from the conservation gallery,
   and the phone auto-fills GPS + date. Each submission is one row in the
   `sightings` table — thousands of rows become a biodiversity dataset that
   EIA consultants, researchers and NGOs can use. 10 verified sightings
   unlock the free Citizen Scientist badge. */
let SIGHTINGS=[];
// Uganda bounding box for the self-contained map (no external tiles needed)
const UG_BBOX={lngMin:29.5,lngMax:35.1,latMin:-1.6,latMax:4.3};
async function loadSightings(){
  const{data,error}=await sb.from('sightings').select('*').order('created_at',{ascending:false});
  if(error){console.error('loadSightings',error);return}
  SIGHTINGS=data||[];
}
function _speciesList(){
  // Species come straight from your conservation gallery titles
  const seen={},out=[];
  (PROTECT||[]).forEach(p=>{if(p.active===false||p.kind==='place')return;const t=(p.name||'').trim();if(t&&!seen[t.toLowerCase()]){seen[t.toLowerCase()]=1;out.push({name:t,img:(Array.isArray(p.images)&&p.images[0])||p.image_url||''});}});
  return out;
}
let _sightPhoto=null,_sightSpecies=null,_sightCoords=null,_sightExtra={count:null,activity:null,habitat:null};
function openSighting(){
  if(!currentUser){openModal('m-login');return}
  _sightPhoto=null;_sightSpecies=null;_sightCoords=null;_sightExtra={count:null,activity:null,habitat:null};
  const g=id=>document.getElementById(id);
  if(g('sight-photo'))g('sight-photo').value='';
  if(g('sight-thumb'))g('sight-thumb').innerHTML='📷';
  if(g('sight-notes'))g('sight-notes').value='';
  document.querySelectorAll('#m-sighting .sp-pill').forEach(b=>b.classList.remove('on'));
  // Species chips from the gallery
  const sp=_speciesList();
  if(g('sight-species')){
    g('sight-species').innerHTML=sp.length?sp.map(s=>
      '<button type="button" class="sp-chip" data-sp="'+esc(s.name)+'" onclick="pickSpecies(this)">'+
      (s.img?'<span class="sp-im" style="background-image:url(\''+esc(s.img.split('?')[0])+'\')"></span>':'<span class="sp-im">🐾</span>')+
      '<small>'+esc(s.name)+'</small></button>').join('')
      :'<p style="font-size:.82rem;color:var(--muted)">Add species to the Conservation Gallery first — they become the options here.</p>';
  }
  if(g('sight-meta'))g('sight-meta').innerHTML='<span class="sm-auto">AUTO</span>🗓 '+new Date().toLocaleString('en',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})+'<br><span class="sm-auto">AUTO</span>👤 '+esc(currentUser.name)+'<br><span id="sight-loc"><span class="sm-auto">…</span>📍 finding your location…</span>';
  openModal('m-sighting');
  // Auto-capture GPS
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      pos=>{_sightCoords={lat:pos.coords.latitude,lng:pos.coords.longitude};const l=g('sight-loc');if(l)l.innerHTML='<span class="sm-auto">AUTO</span>📍 '+_sightCoords.lat.toFixed(4)+', '+_sightCoords.lng.toFixed(4);},
      ()=>{const l=g('sight-loc');if(l)l.innerHTML='<span class="sm-auto" style="background:rgba(181,69,27,.15);color:var(--rust)">OFF</span>📍 Location unavailable — turn on GPS to appear on the map.';},
      {enableHighAccuracy:true,timeout:8000}
    );
  }else{const l=g('sight-loc');if(l)l.textContent='📍 This device cannot share location.';}
}
function pickSpecies(btn){
  document.querySelectorAll('#sight-species .sp-chip').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');_sightSpecies=btn.dataset.sp;
}
// count / activity / habitat pills — NEMA Annex 3 asks for number & breeding habits
function sightPick(group,btn){
  document.querySelectorAll('#m-sighting .sp-pill[data-g="'+group+'"]').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');_sightExtra[group]=btn.dataset.v;
}
function sightPhotoPreview(input){
  const f=input.files&&input.files[0];if(!f)return;_sightPhoto=f;
  const t=document.getElementById('sight-thumb');
  if(t){const u=URL.createObjectURL(f);t.innerHTML='<img src="'+u+'" alt=""/>';}
}
async function submitSighting(){
  if(!currentUser)return;
  if(!_sightSpecies){toast('⚠ Pick which species you saw.');return}
  const btn=document.getElementById('sight-submit');
  if(btn){btn.disabled=true;btn.textContent='Saving…';}
  let photo_url=null;
  if(_sightPhoto){const up=await _uploadFile(_sightPhoto,'sighting');if(up)photo_url=up.url;}
  const row={species:_sightSpecies,lat:_sightCoords?_sightCoords.lat:null,lng:_sightCoords?_sightCoords.lng:null,
    observed_at:new Date().toISOString(),member_id:currentUser.id,member_name:currentUser.name,
    photo_url,notes:(document.getElementById('sight-notes').value||'').trim()||null,verified:false,
    count_band:_sightExtra.count,activity:_sightExtra.activity,habitat:_sightExtra.habitat};
  const{error}=await sb.from('sightings').insert(row);
  if(btn){btn.disabled=false;btn.textContent='✓ Submit sighting';}
  if(error){toast('⚠ Could not save the sighting.');console.error(error);return}
  await loadSightings();
  closeModal('m-sighting');renderMemberView();
  toast('🔬 Sighting logged — thank you for growing Uganda’s biodiversity record!');
}
function myVerifiedSightings(uid){return SIGHTINGS.filter(s=>s.member_id===uid&&s.verified).length;}
function mySightings(uid){return SIGHTINGS.filter(s=>s.member_id===uid).length;}
// ---- Map projection helpers (self-contained, no external tiles) ----
function _projXY(lat,lng,W,H){const x=(lng-UG_BBOX.lngMin)/(UG_BBOX.lngMax-UG_BBOX.lngMin)*W;const y=(UG_BBOX.latMax-lat)/(UG_BBOX.latMax-UG_BBOX.latMin)*H;return{x,y};}
function _invXY(x,y,W,H){const lng=UG_BBOX.lngMin+(x/W)*(UG_BBOX.lngMax-UG_BBOX.lngMin);const lat=UG_BBOX.latMax-(y/H)*(UG_BBOX.latMax-UG_BBOX.latMin);return{lat,lng};}
function _haversineKm(a,b,c,d){const R=6371,r=Math.PI/180;const dLat=(c-a)*r,dLng=(d-b)*r;const s=Math.sin(dLat/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(dLng/2)**2;return 2*R*Math.asin(Math.sqrt(s));}
const _spClass=n=>{n=(n||'').toLowerCase();if(/bird|crane|shoebill|stork|eagle|weaver|turaco/.test(n))return'b';if(/frog|toad|amphib|newt/.test(n))return'a';return'm';};
let _mapCenter=null,_mapRadius=10;
function openSightMap(){openModal('m-sightmap');requestAnimationFrame(()=>requestAnimationFrame(renderSightMap));}
function sightMapRadius(v){_mapRadius=+v;const o=document.getElementById('sm-radlabel');if(o)o.textContent=v+' km';renderSightMap();}
function sightMapClick(ev){
  const box=document.getElementById('sm-canvas');if(!box)return;
  const r=box.getBoundingClientRect();
  const p=_invXY(ev.clientX-r.left,ev.clientY-r.top,r.width,r.height);
  _mapCenter=p;renderSightMap();
}
function _sightsInRadius(){
  if(!_mapCenter)return[];
  return SIGHTINGS.filter(s=>s.lat!=null&&s.lng!=null&&_haversineKm(_mapCenter.lat,_mapCenter.lng,s.lat,s.lng)<=_mapRadius);
}
function renderSightMap(){
  const box=document.getElementById('sm-canvas');if(!box)return;
  const W=box.clientWidth||320,H=box.clientHeight||420;
  const withGeo=SIGHTINGS.filter(s=>s.lat!=null&&s.lng!=null);
  let html='';
  withGeo.forEach(s=>{const p=_projXY(s.lat,s.lng,W,H);html+='<span class="sm-dot '+_spClass(s.species)+'" style="left:'+p.x+'px;top:'+p.y+'px" title="'+esc(s.species)+'"></span>';});
  if(_mapCenter){
    const c=_projXY(_mapCenter.lat,_mapCenter.lng,W,H);
    // radius circle: convert km to px using lng scale at this lat
    const kmPerDegLng=111.32*Math.cos(_mapCenter.lat*Math.PI/180);
    const radDeg=_mapRadius/kmPerDegLng;const radPx=radDeg/(UG_BBOX.lngMax-UG_BBOX.lngMin)*W;
    html+='<span class="sm-rad" style="left:'+c.x+'px;top:'+c.y+'px;width:'+(radPx*2)+'px;height:'+(radPx*2)+'px"></span>';
    html+='<span class="sm-pin" style="left:'+c.x+'px;top:'+c.y+'px">📍</span>';
  }
  box.innerHTML=html;
  const inR=_sightsInRadius();
  const info=document.getElementById('sm-info');
  if(info){
    info.innerHTML=_mapCenter
      ?'<b>'+inR.length+' sighting'+(inR.length===1?'':'s')+'</b> within '+_mapRadius+' km · <b>'+new Set(inR.map(s=>s.species)).size+'</b> species'
      :'<b>'+withGeo.length+'</b> sightings mapped · tap the map to drop a survey pin';
  }
  const exp=document.getElementById('sm-export');
  if(exp)exp.style.display=(currentUser&&currentUser.role==='admin'&&_mapCenter)?'block':'none';
}
function exportSightings(){
  const rows=_mapCenter?_sightsInRadius():SIGHTINGS.filter(s=>s.lat!=null);
  if(!rows.length){toast('No sightings in this area yet.');return}
  const esc2=v=>{v=(v==null?'':String(v)).replace(/"/g,'""');return /[",\n]/.test(v)?'"'+v+'"':v;};
  const hdr=['species','iucn_status','count','activity','habitat','lat','lng','observed_at','verified','logged_by','notes'];
  const line=s=>[s.species,_speciesStatus(s.species),s.count_band,s.activity,s.habitat,s.lat,s.lng,s.observed_at,s.verified,s.member_name,s.notes].map(esc2).join(',');
  const csv=[hdr.join(',')].concat(rows.map(line)).join('\n');
  // Cover note that frames the pack as a legal INPUT, never an EIA itself
  const nSpecies=new Set(rows.map(s=>s.species)).size, nVer=rows.filter(s=>s.verified).length;
  const cover=[
    '# UGANDA BIODIVERSITY FUND — Friends of Biodiversity',
    '# BIODIVERSITY BASELINE DATA PACK (citizen-science)',
    _mapCenter?('# Survey area: '+_mapRadius+' km radius around '+_mapCenter.lat.toFixed(4)+', '+_mapCenter.lng.toFixed(4)):'# Survey area: all mapped records',
    '# Records: '+rows.length+'  |  Distinct species: '+nSpecies+'  |  Verified records: '+nVer,
    '# Generated: '+new Date().toISOString().slice(0,10),
    '#',
    '# PURPOSE & LIMITS: This community-science dataset is provided to support the',
    '# screening and baseline-study phases of an Environmental Impact Assessment under',
    '# the EIA Regulations (No.13 of 1998) and the Wildlife Statute (No.14 of 1996, s.16).',
    '# It does NOT constitute an EIA and does not replace a NEMA-approved practitioner.',
    '# Records are observer-reported and admin-verified; use as indicative baseline',
    '# evidence, aligned to NEMA EIA Annex 3 (Ecological Considerations).',
    '#',''
  ].join('\n');
  const blob=new Blob([cover+csv],{type:'text/csv'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ubf-baseline-data-pack-'+new Date().toISOString().slice(0,10)+'.csv';a.click();
  audit('Exported biodiversity baseline data pack',_mapCenter?(rows.length+' rows near '+_mapCenter.lat.toFixed(3)+','+_mapCenter.lng.toFixed(3)):(rows.length+' rows'));
  toast('⬇ Baseline data pack exported ('+rows.length+' rows).');
}
// Conservation status comes from the gallery — never hardcoded
function _speciesStatus(name){
  const p=(PROTECT||[]).find(x=>(x.name||'').trim().toLowerCase()===(name||'').trim().toLowerCase());
  return p&&p.status?p.status:'';
}
async function verifySighting(id,val){
  await sb.from('sightings').update({verified:val}).eq('id',id);
  audit(val?'Verified sighting':'Unverified sighting',id);
  await loadSightings();renderSightingsAdmin();
}
async function delSighting(id){
  if(!confirm('Delete this sighting permanently?'))return;
  await sb.from('sightings').delete().eq('id',id);
  audit('Deleted sighting',id);
  await loadSightings();renderSightingsAdmin();
}
function renderSightingsAdmin(){
  const el=document.getElementById('sightings-admin-list');if(!el)return;
  const total=SIGHTINGS.length,ver=SIGHTINGS.filter(s=>s.verified).length,geo=SIGHTINGS.filter(s=>s.lat!=null).length;
  const stat=document.getElementById('sightings-stat');
  if(stat)stat.innerHTML='<b>'+total+'</b> logged · <b>'+ver+'</b> verified · <b>'+geo+'</b> mapped · <b>'+new Set(SIGHTINGS.map(s=>s.species)).size+'</b> species';
  el.innerHTML=SIGHTINGS.length?SIGHTINGS.map(s=>
    '<div class="pa-row">'+
    (s.photo_url?'<span class="pa-thumb" style="background-image:url(\''+esc(s.photo_url.split('?')[0])+'\');background-size:cover"></span>':'<span class="pa-thumb">🐾</span>')+
    '<div class="pa-info"><strong>'+esc(s.species)+(s.verified?' <span style="color:var(--canopy-lt)">✓ verified</span>':'')+'</strong><span>'+
      (s.lat!=null?'📍 '+s.lat.toFixed(3)+', '+s.lng.toFixed(3):'no location')+' · '+esc(s.member_name||'')+' · '+String(s.observed_at||s.created_at||'').slice(0,10)+
      (function(){const ex=[s.count_band?'🔢 '+esc(s.count_band):'',s.activity?'🌿 '+esc(s.activity):'',s.habitat?'🏞 '+esc(s.habitat):'',_speciesStatus(s.species)?'🛡 '+esc(_speciesStatus(s.species)):''].filter(Boolean);return ex.length?'<br>'+ex.join(' · '):'';})()+
      (s.notes?'<br>'+esc(s.notes):'')+'</span></div>'+
    '<button class="btn '+(s.verified?'btn-ghost':'btn-canopy')+' btn-sm" onclick="verifySighting(\''+s.id+'\','+(!s.verified)+')">'+(s.verified?'Unverify':'✓ Verify')+'</button>'+
    '<button class="btn btn-danger btn-sm" onclick="delSighting(\''+s.id+'\')">Delete</button></div>'
  ).join(''):'<p style="font-size:.85rem;color:var(--muted)">No sightings logged yet.</p>';
}

/* ═══ APP BOOTSTRAP — load everything from Supabase, then render ═══ */
async function bootstrapApp(){
  preloadSlides(); // start downloading all slide images immediately in background
  showSkeletons(); // app-like: layout-matched placeholders instead of a spinner
  await Promise.all([loadMembers(),loadContent(),loadAnnouncements(),loadFinReports(),loadFame(),loadPayment(),loadPosts(),loadDashboard(),loadProtect(),loadAds(),loadCampaigns(),loadEvents(),loadSightings()]);
  await initAdmins();
  await loadMembers(); // refresh in case admins were just inserted
  renderPaymentUI();
  renderProtectGallery();
  initWizard();
  initSlideshow();
  renderThemes();
  renderFilters();
  renderContent();
  applyContentView();
  renderFame();
  renderPublicAnnounces();
  renderStatHints();
  renderExtraStats();
  renderPosts();
  updatePostCreateBtn();
  hideLoadingToast();
  subscribeRealtime();
  await restoreSession();
}
function showLoadingToast(){toast('🌿 Loading live data...')}
function hideLoadingToast(){/* toast auto-clears */}

/* ═══ REALTIME — auto-refresh when any user changes shared data ═══ */
function subscribeRealtime(){
  sb.channel('public:content').on('postgres_changes',{event:'*',schema:'public',table:'content'},async()=>{await loadContent();renderContent();renderAdminContent();updateNotifBadge()}).subscribe();
  sb.channel('public:comments').on('postgres_changes',{event:'*',schema:'public',table:'comments'},async()=>{await loadContent();renderContent()}).subscribe();
  sb.channel('public:wall_of_fame').on('postgres_changes',{event:'*',schema:'public',table:'wall_of_fame'},async()=>{await loadFame();renderFame();renderAdminFame()}).subscribe();
  sb.channel('public:announcements').on('postgres_changes',{event:'*',schema:'public',table:'announcements'},async()=>{await loadAnnouncements();renderPublicAnnounces();renderAdminAnnounces();updateNotifBadge()}).subscribe();
  sb.channel('public:fin_reports').on('postgres_changes',{event:'*',schema:'public',table:'fin_reports'},async()=>{await loadFinReports();renderFinancials()}).subscribe();
  sb.channel('public:members').on('postgres_changes',{event:'*',schema:'public',table:'members'},async()=>{await loadMembers();renderAdminMembers()}).subscribe();
  sb.channel('public:payment_details').on('postgres_changes',{event:'*',schema:'public',table:'payment_details'},async()=>{await loadPayment();renderPaymentUI()}).subscribe();
  sb.channel('public:dashboard_items').on('postgres_changes',{event:'*',schema:'public',table:'dashboard_items'},async()=>{await loadDashboard();renderAccountabilityDashboard();renderDashboardAdmin()}).subscribe();
  sb.channel('public:dashboard_meta').on('postgres_changes',{event:'*',schema:'public',table:'dashboard_meta'},async()=>{await loadDashboard();renderAccountabilityDashboard();renderDashboardAdmin()}).subscribe();
  sb.channel('public:member_posts').on('postgres_changes',{event:'*',schema:'public',table:'member_posts'},async()=>{await loadPosts();renderPosts();renderAdminPosts();updateNotifBadge();}).subscribe();
  sb.channel('public:post_comments').on('postgres_changes',{event:'*',schema:'public',table:'post_comments'},async()=>{await loadPosts();renderPosts();}).subscribe();
  sb.channel('public:member_messages').on('postgres_changes',{event:'*',schema:'public',table:'member_messages'},async()=>{await loadMessages();updateChatBadge();renderChats();renderChatThread();}).subscribe();
  sb.channel('public:ads').on('postgres_changes',{event:'*',schema:'public',table:'ads'},async()=>{await loadAds();renderPosts();renderAdsAdmin();}).subscribe();
  sb.channel('public:sightings').on('postgres_changes',{event:'*',schema:'public',table:'sightings'},async()=>{await loadSightings();renderSightingsAdmin();if(document.getElementById('m-sightmap').classList.contains('open'))renderSightMap();}).subscribe();
}

function updatePostCreateBtn(){
  const wrap=document.getElementById('post-create-btn-wrap');
  if(wrap)wrap.style.display=currentUser?'block':'none';
}

/* ═══ HERO SLIDESHOW ═══ */
let curSlide=0;
/* ═══ PRELOAD ONLY FIRST 3 SLIDES — rest loaded lazily ═══ */
// ALL screens use the compressed 900px versions (slideNsm.jpg) — the big
// slide-N.jpg originals are being removed from the repo entirely.
function _slideSmall(src){return src.replace('slide-','slide').replace('.jpg','sm.jpg')}
function slideSrc(src){return _slideSmall(src)}
function preloadSlides(){
  SLIDE_IMAGES.slice(0,3).forEach(src=>{const img=new Image();img.src=slideSrc(src);});
  // Lazy load the rest after a short idle delay
  if('requestIdleCallback' in window){
    requestIdleCallback(()=>SLIDE_IMAGES.slice(3).forEach(src=>{const img=new Image();img.src=slideSrc(src);}),{timeout:5000});
  }else{
    setTimeout(()=>SLIDE_IMAGES.slice(3).forEach(src=>{const img=new Image();img.src=slideSrc(src);}),3000);
  }
}

function initSlideshow(){
  const track=document.getElementById('slide-track');
  const dots=document.getElementById('slide-dots');
  const countEl=document.getElementById('slide-count');
  if(!track)return;
  track.innerHTML='';dots.innerHTML='';
  const imgs=[...SLIDE_IMAGES];
  imgs.forEach((src,i)=>{
    const d=document.createElement('div');
    d.className='slide'+(i===0?' active':'');
    const chosen=slideSrc(src);
    d.style.backgroundImage=`url('${chosen}')`;
    if(chosen!==src){const probe=new Image();probe.onerror=()=>{d.style.backgroundImage=`url('${src}')`};probe.src=chosen;}
    track.appendChild(d);
    const dot=document.createElement('div');
    dot.className='dot'+(i===0?' active':'');
    dot.onclick=()=>goSlide(i);
    dots.appendChild(dot);
  });
  curSlide=0;
  if(countEl)countEl.textContent=`1 / ${imgs.length}`;
}
function goSlide(n){
  const slides=document.querySelectorAll('#slide-track .slide');
  const dots=document.querySelectorAll('#slide-dots .dot');
  const countEl=document.getElementById('slide-count');
  if(!slides.length)return;
  slides[curSlide].classList.remove('active');
  if(dots[curSlide])dots[curSlide].classList.remove('active');
  curSlide=((n%slides.length)+slides.length)%slides.length;
  slides[curSlide].classList.add('active');
  if(dots[curSlide])dots[curSlide].classList.add('active');
  if(countEl)countEl.textContent=`${curSlide+1} / ${slides.length}`;
}
setInterval(()=>goSlide(curSlide+1),5500);

/* ═══ HEADER SCROLL ═══ */
const HDR=document.getElementById('hdr');
window.addEventListener('scroll',()=>HDR.classList.toggle('scrolled',scrollY>40),{passive:true});

/* ═══ HAMBURGER ═══ */
const hamBtn=document.getElementById('ham');const mobMenu=document.getElementById('mob-menu');
hamBtn.addEventListener('click',()=>{hamBtn.classList.toggle('open');mobMenu.classList.toggle('open')});
function closeMob(){hamBtn.classList.remove('open');mobMenu.classList.remove('open')}

/* ═══ VIEW ROUTER ═══ */
function showView(v){
  document.querySelectorAll('.view').forEach(e=>e.classList.remove('active'));
  document.getElementById('view-'+v).classList.add('active');
  window.scrollTo(0,0);
  if(v==='member')renderMemberView();
  if(v==='admin')renderAdminAll();
}

/* ═══ SIDE SHELL — home = hero + gallery only; other sections slide into a drawer ═══ */
var _shellMoved=[];
function openShell(panel,title){
  // For signed-in members browsing via Explore, the shell is off — just scroll to the section.
  if(!document.body.classList.contains('shell-mode')){
    const first=document.querySelector('#view-main > section.shell-sec[data-panel="'+panel+'"]');
    if(first)first.scrollIntoView({behavior:'smooth'});
    return;
  }
  closeShell(true); // restore any currently-open panel first (no scroll)
  const body=document.getElementById('shell-drawer-body');
  const drawer=document.getElementById('shell-drawer');
  if(!body||!drawer)return;
  const secs=[...document.querySelectorAll('#view-main > section.shell-sec[data-panel="'+panel+'"]')];
  if(!secs.length)return;
  _shellMoved=secs.map(s=>({node:s,parent:s.parentNode,next:s.nextSibling}));
  secs.forEach(s=>{s.querySelectorAll('.reveal').forEach(e=>e.classList.add('visible'));body.appendChild(s);});
  const t=document.getElementById('shell-title');if(t)t.textContent=title||'';
  body.scrollTop=0;
  document.body.classList.add('shell-open');
  drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');
  document.querySelectorAll('.side-shell .shell-btn').forEach(b=>b.classList.remove('on'));
  const btn=document.querySelector('.side-shell .shell-btn[data-panel="'+panel+'"]');if(btn)btn.classList.add('on');
}
function closeShell(silent){
  if(_shellMoved&&_shellMoved.length){_shellMoved.forEach(m=>{m.parent.insertBefore(m.node,m.next);});}
  _shellMoved=[];
  const drawer=document.getElementById('shell-drawer');
  if(drawer){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');}
  document.body.classList.remove('shell-open');
  if(!silent){
    document.querySelectorAll('.side-shell .shell-btn').forEach(b=>b.classList.remove('on'));
    const h=document.querySelector('.side-shell .shell-btn[data-shell="home"]');if(h)h.classList.add('on');
    window.scrollTo({top:0,behavior:'smooth'});
  }
}
function shellHome(){closeShell();}

/* ═══ APP SHELL — full-screen app mode for signed-in members.
   The marketing site disappears; tabs switch between real screens. ═══ */
let _appTab='home';
function _buzz(){if(navigator.vibrate){try{navigator.vibrate(8)}catch(e){}}}
function appNav(tab){
  _appTab=tab;_buzz();
  document.querySelectorAll('#app-tabbar .app-tab').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
  if(tab==='chats'){openChats();return}
  if(tab==='alerts'){openNotifications();return}
  document.body.classList.remove('tab-home','tab-learn','tab-pay','explore-mode');
  {const b=document.getElementById('explore-back');if(b)b.style.display='none';}
  let screen=null;
  if(tab==='home'){document.body.classList.add('tab-home');showView('main');screen=document.getElementById('learn');}
  else if(tab==='learn'){document.body.classList.add('tab-learn');showView('main');screen=document.getElementById('learn');}
  else if(tab==='profile'){showView('member');screen=document.getElementById('view-member');}
  window.scrollTo(0,0);
  if(screen){screen.classList.remove('app-anim');void screen.offsetWidth;screen.classList.add('app-anim');}
  renderAdRail();
  if(tab==='home'||tab==='learn')startAdPopupCycle();else stopAdPopupCycle();
}
/* EXPLORE — members browse the full website while staying signed in */
function toggleExplore(open){const d=document.getElementById('explore-drawer');if(d)d.style.display=open?'flex':'none';}
function exploreGo(sec){
  toggleExplore(false);
  document.body.classList.remove('tab-home','tab-learn','tab-pay');
  document.body.classList.add('explore-mode');
  showView('main');
  const back=document.getElementById('explore-back');if(back)back.style.display='flex';
  setTimeout(()=>{
    if(sec==='top'){window.scrollTo({top:0,behavior:'smooth'});return}
    const e=document.getElementById(sec);if(e)e.scrollIntoView({behavior:'smooth'});
  },140);
}
function exitExplore(){
  document.body.classList.remove('explore-mode');
  const b=document.getElementById('explore-back');if(b)b.style.display='none';
  appNav('home');
}
/* PWA install nudge */
let _deferredInstall=null;
window.addEventListener('beforeinstallprompt',function(e){
  e.preventDefault();_deferredInstall=e;
  if(!localStorage.getItem('install_dismissed')){const el=document.getElementById('app-install');if(el)el.style.display='flex';}
});
function promptInstall(){if(_deferredInstall){_deferredInstall.prompt();_deferredInstall=null;}dismissInstall();}
function dismissInstall(){const el=document.getElementById('app-install');if(el)el.style.display='none';localStorage.setItem('install_dismissed','1');}
/* Skeleton placeholders while first data loads (app-like perceived speed) */
function showSkeletons(){
  const skRow='<div class="sk-row"><div class="sk-c"></div><div class="sk-l"><div class="sk-bar" style="width:75%"></div><div class="sk-bar sk-sm" style="width:40%"></div><div class="sk-bar sk-sm" style="width:60%"></div></div></div>';
  const f=document.getElementById('posts-feed');if(f&&!f.children.length)f.innerHTML=skRow+skRow+skRow;
  const skCard='<div class="sk-card"><div class="sk-thumb"></div><div class="sk-bar" style="width:80%"></div><div class="sk-bar sk-sm" style="width:55%"></div></div>';
  const c=document.getElementById('content-grid');if(c&&!c.children.length)c.innerHTML=skCard+skCard+skCard;
}

/* ═══ MODALS ═══ */
function openModal(id){document.getElementById(id).classList.add('open')}
function closeModal(id){document.getElementById(id).classList.remove('open')}
document.querySelectorAll('.overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open')}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.overlay.open').forEach(o=>o.classList.remove('open'))});

/* ═══ AUTH ═══
   NOTE: This uses a simple custom 'members' table check (matching your existing
   schema with plaintext pass column) rather than full Supabase Auth, so it keeps
   working with the tables you already created. Data is now shared and live —
   only the credential check itself stays app-side. */
async function doLogin(){
  const em=document.getElementById('li-email').value.trim().toLowerCase();
  const pw=document.getElementById('li-pass').value;
  if(!em||!pw){toast('⚠ Enter your email and password.');return}
  const lock=checkRateLimit(em);
  if(lock){toast('⚠ '+lock);return}
  await loadMembers();
  const u=MEMBERS.find(m=>m.email.toLowerCase()===em&&m.pass===pw);
  if(!u){recordLoginFailure(em);toast('⚠ Email or password incorrect.');return}
  if(u.role==='admin'){toast('⚠ Admin accounts must use the admin sign-in.');return}
  if(u.status==='pending'){closeModal('m-login');showLockedModal(u.name);return}
  if(u.status==='removed'||u.status==='inactive'){toast('⚠ This account has been deactivated. Contact info@ugandabiodiversityfund.org.');return}
  clearRateLimit(em);
  // Security: new members must confirm their registered email before first sign-in
  if(!u.email_verified){closeModal('m-login');startEmailVerification(u,'login');return}
  finishLogin(u);
}
function finishLogin(u){
  currentUser=u;persistSession(u);closeModal('m-login');updateNav();
  toast('🌿 Welcome back, '+esc(u.name.split(' ')[0])+'!');
  loadMessages().then(updateChatBadge);
  appNav('home');
  if(membershipDue(u))setTimeout(()=>toast('🔄 Your '+u.year+' membership has ended — renew from your Profile tab.'),2500);
}

/* ═══ EMAIL VERIFICATION (Supabase Auth OTP) ═══
   New members confirm their registered email with a 6-digit code before
   first sign-in. Existing members were grandfathered as verified. */
let _verifyCtx=null;// {member, next:'login'|'enroll'}
let _verifyCooldown=0;
async function sendVerifyCode(email){
  const{error}=await sb.auth.signInWithOtp({email,options:{shouldCreateUser:true}});
  if(error){console.error('OTP send',error);return error.message||'Could not send the code.'}
  return null;
}
async function startEmailVerification(member,next){
  _verifyCtx={member,next};
  const lbl=document.getElementById('verify-email-label');
  if(lbl)lbl.textContent=member.email;
  const codeEl=document.getElementById('verify-code');if(codeEl)codeEl.value='';
  toast('✉ Sending a verification code to your email…');
  const err=await sendVerifyCode(member.email);
  if(err)toast('⚠ '+err+' You can press "Resend code" to try again.');
  else toast('✉ Code sent — check your inbox (and spam folder).');
  _startResendCooldown();
  openModal('m-verify');
}
function _startResendCooldown(){
  _verifyCooldown=60;
  const btn=document.getElementById('verify-resend');
  const tick=()=>{
    if(!btn)return;
    if(_verifyCooldown>0){btn.disabled=true;btn.textContent='Resend code ('+_verifyCooldown+'s)';_verifyCooldown--;setTimeout(tick,1000);}
    else{btn.disabled=false;btn.textContent='Resend code';}
  };
  tick();
}
async function resendVerifyCode(){
  if(!_verifyCtx||_verifyCooldown>0)return;
  toast('✉ Resending code…');
  const err=await sendVerifyCode(_verifyCtx.member.email);
  toast(err?('⚠ '+err):'✉ New code sent.');
  _startResendCooldown();
}
async function confirmVerifyCode(){
  if(!_verifyCtx){closeModal('m-verify');return}
  const code=(document.getElementById('verify-code').value||'').trim();
  if(!/^\d{6}$/.test(code)){toast('⚠ Enter the 6-digit code from your email.');return}
  toast('Checking code…');
  const{error}=await sb.auth.verifyOtp({email:_verifyCtx.member.email,token:code,type:'email'});
  if(error){toast('⚠ '+(error.message||'Invalid or expired code — try Resend.'));return}
  sb.auth.signOut().catch(()=>{});// we only needed the one-time check
  const{error:upErr}=await sb.from('members').update({email_verified:true}).eq('id',_verifyCtx.member.id);
  if(upErr)console.error('verify flag',upErr);
  _verifyCtx.member.email_verified=true;
  await loadMembers();
  closeModal('m-verify');
  toast('✅ Email verified — thank you!');
  if(_verifyCtx.next==='login'){
    const fresh=MEMBERS.find(m=>m.id===_verifyCtx.member.id)||_verifyCtx.member;
    finishLogin(fresh);
  }
  _verifyCtx=null;
}
async function doAdminLogin(){
  const em=document.getElementById('al-email').value.trim().toLowerCase();
  const pw=document.getElementById('al-pass').value;
  if(!ADMIN_EMAILS.includes(em)){toast('⚠ This email is not authorised for admin access.');return}
  if(!em.endsWith('@ugandabiodiversityfund.org')){toast('⚠ Admin login requires a @ugandabiodiversityfund.org email.');return}
  const lock=checkRateLimit(em);
  if(lock){toast('⚠ '+lock);return}
  await loadMembers();
  const acct=MEMBERS.find(m=>m.email.toLowerCase()===em&&m.role==='admin');
  if(!acct){toast('⚠ No admin account found for this email in the database — ask your developer to check the members table.');return}
  if(acct.pass!==pw){recordLoginFailure(em);toast('⚠ Incorrect password.');return}
  clearRateLimit(em);
  currentUser=acct;persistSession(acct);closeModal('m-admin-login');updateNav();
  document.getElementById('adm-user-info').textContent=esc(acct.name)+' ('+esc(ADMIN_NAMES[em]||'Admin')+') — '+esc(em);
  toast('⚙ Admin access granted. Welcome, '+esc(acct.name)+'.');showView('admin');
}
function doLogout(){currentUser=null;persistSession(null);updateNav();showView('main');toast('Signed out successfully.')}
function updateNav(){
  const in_=!!currentUser,adm=in_&&currentUser.role==='admin';
  document.getElementById('n-login-li').style.display=in_?'none':'';
  document.getElementById('n-logout-li').style.display=in_?'':'none';
  document.getElementById('n-mem-li').style.display=in_&&!adm?'':'none';
  document.getElementById('n-adm-li').style.display=adm?'':'none';
  document.getElementById('mob-login').style.display=in_?'none':'';
  document.getElementById('mob-logout').style.display=in_?'':'none';
  document.getElementById('mob-dash').style.display=in_&&!adm?'':'none';
  document.getElementById('mob-adm').style.display=adm?'':'none';
  document.getElementById('upload-btn-slot').style.display=adm?'':'none';
  if(in_)document.getElementById('n-mem-name').textContent=currentUser.name.split(' ')[0]+' →';
  // App shell: signed-in members get the full-screen app (marketing site hidden)
  const memberMode=in_&&!adm;
  document.body.classList.toggle('has-tabbar',memberMode);
  document.body.classList.toggle('app-mode',memberMode);
  // Side shell is the public visitor experience — off for signed-in members.
  if(memberMode)closeShell(true);
  document.body.classList.toggle('shell-mode',!memberMode);
  // Logged-out visitors navigate via the side shell, so declutter the top nav for them.
  document.body.classList.toggle('guest',!in_);
  if(!memberMode)document.body.classList.remove('tab-home','tab-learn');
  const av=document.getElementById('ah-avatar');
  if(av&&memberMode){
    av.innerHTML=currentUser.photo_url
      ?'<img src="'+currentUser.photo_url+'" alt=""/>'
      :currentUser.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  }
  renderContent();
  renderPosts();
  updatePostCreateBtn();
}

/* ═══ ENROLL ═══ */
/* Green Card tier — rich clickable detail (same treatment as the gallery) */
function openTierDetail(t){
  const td=TIERS_DATA[t];if(!td)return;_buzz&&_buzz();
  const card=document.querySelector('.tier-card[data-tier="'+t+'"]');
  const perks=card?[...card.querySelectorAll('.tier-perks li')].map(li=>li.textContent):[];
  const mt=(document.getElementById('ef-type')&&document.getElementById('ef-type').value)||'individual';
  const price=(typeof TIER_RANGES!=='undefined'&&TIER_RANGES[t])?(TIER_RANGES[t][mt]||TIER_RANGES[t].individual):'';
  const isMember=currentUser&&currentUser.role==='member';
  document.getElementById('detail-body').innerHTML=
    '<div class="dtl-hero tier-hero t-'+t+'">'+
      '<div class="dtl-hero-grad"></div>'+
      '<div class="dtl-hero-txt"><span class="dtl-kind">🪪 Green Card Tier</span><h2>'+td.emoji+' '+esc(td.label)+'</h2>'+
      (price?'<span class="dtl-region">'+esc(price)+'</span>':'')+'</div></div>'+
    '<div class="dtl-body">'+
      '<div class="tier-detail-perks">'+perks.map(p=>'<div class="tdp"><span>✓</span>'+esc(p)+'</div>').join('')+'</div>'+
      '<div class="dtl-cta-row">'+
        (isMember
          ?'<button class="btn btn-gold" onclick="closeModal(\'m-detail\');openTierModal()">⇅ Switch to '+esc(td.label)+'</button>'
          :'<button class="btn btn-gold" onclick="closeModal(\'m-detail\');selectTier(\''+t+'\')">Choose '+esc(td.label)+' →</button>')+
        '<button class="btn btn-ghost" onclick="closeModal(\'m-detail\')">Close</button>'+
      '</div>'+
    '</div>';
  openModal('m-detail');
}
function selectTier(t){
  selectedTier_=t;
  document.querySelectorAll('.tier-card').forEach(c=>c.classList.remove('sel'));
  document.querySelector('.tier-card[data-tier="'+t+'"]').classList.add('sel');
  document.getElementById('ef-tier').value=t;
  const tc=document.getElementById('tier-chosen');tc.style.display='block';
  const mt=document.getElementById('ef-type').value||'individual';
  const td=TIERS_DATA[t];
  tc.innerHTML='Selected: <strong>'+td.emoji+' '+td.label+'</strong> &nbsp;|&nbsp; '+(TIER_RANGES[t][mt]||TIER_RANGES[t].individual);
  toast(td.emoji+' '+td.label+' tier selected — complete enrollment and payment below.');
  setTimeout(()=>document.getElementById('enroll').scrollIntoView({behavior:'smooth'}),500);
}
document.getElementById('ef-type').addEventListener('change',()=>{
  if(!selectedTier_)return;
  const mt=document.getElementById('ef-type').value;
  const td=TIERS_DATA[selectedTier_];
  document.getElementById('tier-chosen').innerHTML='Selected: <strong>'+td.emoji+' '+td.label+'</strong> &nbsp;|&nbsp; '+(TIER_RANGES[selectedTier_][mt]||TIER_RANGES[selectedTier_].individual);
});
/* ═══ ENROLLMENT WIZARD — friendly 5-step slide-through ═══ */
let _wizStep=1;
const WIZ_TOTAL=5;
const WIZ_LABELS=['You','Interests','Green Card','Payment','Account'];
const WIZ_INTERESTS=[['🌳','Forest restoration'],['💧','Wetlands & water'],['🦍','Wildlife protection'],['🐝','One Health'],['💰','Nature finance'],['🎓','Youth & education'],['🤝','Corporate co-branding'],['🙌','Volunteering']];
let _wizInterests=new Set();
function renderWizChrome(){
  const steps=document.getElementById('wz-steps');
  if(steps)steps.innerHTML=WIZ_LABELS.map((l,i)=>{const n=i+1;const cls=n<_wizStep?'done':(n===_wizStep?'now':'');return '<span class="wz-st '+cls+'"><span class="dot">'+(n<_wizStep?'✓':n)+'</span>'+l+'</span>';}).join('<span class="wz-sep"></span>');
  const fill=document.getElementById('wz-bar-fill');if(fill)fill.style.width=Math.round((_wizStep/WIZ_TOTAL)*100)+'%';
  const prog=document.getElementById('wz-prog');if(prog)prog.textContent='Step '+_wizStep+' of '+WIZ_TOTAL;
  document.querySelectorAll('#enroll-form .wz-step').forEach(s=>{s.hidden=(parseInt(s.dataset.step,10)!==_wizStep);});
  const back=document.getElementById('wz-back'),next=document.getElementById('wz-next'),sub=document.getElementById('wz-submit');
  if(back)back.style.visibility=_wizStep===1?'hidden':'visible';
  if(next)next.style.display=_wizStep===WIZ_TOTAL?'none':'';
  if(sub)sub.style.display=_wizStep===WIZ_TOTAL?'':'none';
}
function wizValidateStep(){
  const req={1:['ef-name','ef-tel','ef-email','ef-type'],3:['ef-tier','ef-amount','ef-year']};
  for(const id of (req[_wizStep]||[])){const el=document.getElementById(id);if(el&&!String(el.value).trim()){toast('⚠ Please complete this step to continue.');el.focus();return false;}}
  return true;
}
function wizStep(dir){
  if(dir>0&&!wizValidateStep())return;
  _wizStep=Math.min(WIZ_TOTAL,Math.max(1,_wizStep+dir));
  renderWizChrome();
  const f=document.getElementById('enroll-form');if(f)f.scrollIntoView({behavior:'smooth',block:'start'});
}
function toggleWizInterest(btn){const v=btn.dataset.int;if(_wizInterests.has(v)){_wizInterests.delete(v);btn.classList.remove('on');}else{_wizInterests.add(v);btn.classList.add('on');}}
function initWizard(){
  const chips=document.getElementById('wz-chips');
  if(chips)chips.innerHTML=WIZ_INTERESTS.map(function(x){return '<button type="button" class="wz-chip" data-int="'+x[1]+'" onclick="toggleWizInterest(this)">'+x[0]+' '+x[1]+'</button>';}).join('');
  _wizStep=1;_wizInterests=new Set();renderWizChrome();
}

document.getElementById('enroll-form').addEventListener('submit',async function(e){
  e.preventDefault();
  const name=document.getElementById('ef-name').value.trim();
  const email=document.getElementById('ef-email').value.trim().toLowerCase();
  const tel=document.getElementById('ef-tel').value.trim();
  const type=document.getElementById('ef-type').value;
  const tier=document.getElementById('ef-tier').value;
  const amount=parseInt(document.getElementById('ef-amount').value)||0;
  const year=parseInt(document.getElementById('ef-year').value)||new Date().getFullYear();
  const pass=document.getElementById('ef-pass').value;
  const payref=document.getElementById('ef-payref').value.trim();
  if(!name||!email||!tel||!type||!tier||!amount||!pass){toast('⚠ Please fill in all required fields.');return}
  if(pass.length<8){toast('⚠ Password must be at least 8 characters.');return}
  await loadMembers();
  if(MEMBERS.find(m=>m.email.toLowerCase()===email)){toast('⚠ This email is already registered. Please sign in.');return}
  const interests=Array.from(_wizInterests||[]);
  const engageText=[interests.join(', '),document.getElementById('ef-engage').value.trim()].filter(Boolean).join(' — ');
  const nm={name:name.trim(),email,pass,tel,type,tier,amount,year,payref,
    org:document.getElementById('ef-org').value.trim(),
    engage:engageText,engage_prefs:interests.length?interests:null,
    role:'member',status:'pending'};
  const {data:created,error}=await sb.from('members').insert(nm).select().single();
  if(error){toast('⚠ Could not register — please try again.');console.error(error);return}
  await loadMembers();
  this.style.display='none';document.getElementById('enroll-success').style.display='block';
  await logEmail('Welcome to Friends of Biodiversity','New member: '+email+' ('+tier+') · '+new Date().toLocaleDateString());
  toast('🌿 Welcome, '+name.split(' ')[0]+'! Enrollment registered.');
  showEP(false);
  // Security: confirm the registered email right away (can also be done at first sign-in)
  if(created)startEmailVerification(created,'enroll');
});

/* ═══ THEMES & PROGRAMMES ═══ */
function renderThemes(){
  const tabsEl=document.getElementById('theme-tabs');
  const panelsEl=document.getElementById('theme-panels');
  if(!tabsEl)return;
  tabsEl.innerHTML='';panelsEl.innerHTML='';
  THEMES_DATA.forEach((th,i)=>{
    const btn=document.createElement('button');btn.className='ttab'+(i===0?' active':'');
    btn.textContent=th.icon+' '+th.label;
    btn.onclick=()=>{
      document.querySelectorAll('.ttab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
      document.querySelectorAll('.theme-panel').forEach(p=>p.classList.remove('active'));
      document.getElementById('tp-'+th.id).classList.add('active');
    };
    tabsEl.appendChild(btn);
    const panel=document.createElement('div');panel.className='theme-panel'+(i===0?' active':'');panel.id='tp-'+th.id;
    const wins=WINDOWS_DATA.filter(w=>w.theme===th.id);
    panel.innerHTML='<p style="font-size:.87rem;color:var(--muted);line-height:1.72;margin-bottom:1.2rem;max-width:680px">'+th.icon+' <strong style="color:var(--canopy)">'+th.label+'</strong> — one of UBF\'s three core thematic investment priorities.</p><div class="prog-grid">'+
      wins.map(w=>'<div class="prog-card"><div class="prog-icon">'+w.icon+'</div><span class="prog-tag">Programme Window</span><div class="prog-title">'+w.name+'</div><p class="prog-desc">'+w.desc+'</p></div>').join('')+'</div>';
    panelsEl.appendChild(panel);
  });
}

/* ═══ LEARNING EXCHANGE CONTENT — real thumbnails, inline media ═══ */
const TYPE_ICONS={video:'🎬',documentary:'🎥',podcast:'🎙',interview:'🎤',article:'📰',research:'🔬'};
const TYPE_BADGE_CLS={video:'badge-video',documentary:'badge-documentary',podcast:'badge-podcast',interview:'badge-interview',article:'badge-article',research:'badge-research'};
// Clean line-icons (white) shown on the coloured thumbnail when a resource has no image/video
function typeIconSvg(t){
  const P={
    video:'<rect x="2" y="5" width="14" height="14" rx="2.5"/><path d="M16 9l6-3v12l-6-3z"/>',
    documentary:'<rect x="2.5" y="6.5" width="19" height="12" rx="2"/><path d="M2.5 10.5h19M7 6.5l-2 4M12 6.5l-2 4M17 6.5l-2 4"/>',
    podcast:'<rect x="9" y="3" width="6" height="10" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/>',
    interview:'<path d="M3 5h9a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7l-4 3z"/><path d="M21 9.5v6a2 2 0 0 1-2 2h-3.2"/>',
    article:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    research:'<path d="M9 3h6M10 3v6l-4.6 7.6A2 2 0 0 0 7.1 20h9.8a2 2 0 0 0 1.7-3.4L14 9V3"/><path d="M8.5 15h7"/>'
  };
  return '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,.35))">'+(P[t]||P.article)+'</svg>';
}

function renderFilters(){
  const el=document.getElementById('content-filters');
  if(!el)return;
  const types=['All','Video','Documentary','Podcast','Interview','Article','Research'];
  el.innerHTML=types.map((t,i)=>'<button class="ftag'+(i===0?' active':'')+'" data-cf="'+(t==='All'?'all':t.toLowerCase())+'" onclick="setFilter(this)">'+t+'</button>').join('');
}
let contentSearchQuery='';
function setFilter(btn){document.querySelectorAll('[data-cf]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeFilter=btn.dataset.cf;renderContent()}
function setContentSearch(val){contentSearchQuery=(val||'').trim().toLowerCase();renderContent()}
/* Grid / list layout toggle — remembered per device */
function setContentView(mode){LS.set('content_view',mode);applyContentView();}
function applyContentView(){
  const g=document.getElementById('content-grid');if(!g)return;
  const mode=LS.get('content_view','list');
  g.classList.toggle('grid-view',mode==='grid');
  const l=document.getElementById('vt-list'),gr=document.getElementById('vt-grid');
  if(l)l.classList.toggle('active',mode!=='grid');
  if(gr)gr.classList.toggle('active',mode==='grid');
}

function uRank(){
  if(!currentUser)return 0;
  return TIERS_DATA[currentUser.tier]?.r||1;
}
function renderContent(){
  const grid=document.getElementById('content-grid');if(!grid)return;
  const ur=uRank();
  let items=CONTENT;
  if(activeFilter!=='all')items=items.filter(c=>c.type===activeFilter);
  if(contentSearchQuery)items=items.filter(c=>(c.title||'').toLowerCase().includes(contentSearchQuery)||(c.desc||'').toLowerCase().includes(contentSearchQuery)||(c.author||'').toLowerCase().includes(contentSearchQuery)||(c.window||'').toLowerCase().includes(contentSearchQuery));
  // Search / category first (like LinkedIn/FB): the default view stays clean —
  // only the newest few show until the member picks a category or searches.
  const browsing=(activeFilter==='all'&&!contentSearchQuery);
  let hint='';
  if(browsing&&items.length>3){
    hint='<div class="cc-browsehint" style="grid-column:1/-1"><b>Latest additions</b> — pick a category above or search to explore the full library ('+CONTENT.length+' resources).</div>';
    items=items.slice(0,3);
  }
  if(!items.length){
    const msg=contentSearchQuery?'No resources match "'+esc(contentSearchQuery)+'". Try a different search term.':(activeFilter!=='all'?'No '+activeFilter+' resources yet.':'No content published yet. Admins can upload videos, documentaries, podcasts, interviews, articles and research via the Admin panel.');
    grid.innerHTML='<p style="color:var(--muted);font-size:.9rem;padding:1.5rem 0;grid-column:1/-1">'+msg+'</p>';return;
  }
  const bkd=LS.get('bookmarked',[]);const myReactions=LS.get('my_reactions',{});
  grid.innerHTML=hint+items.map(c=>{
    const ar=ACCESS_RANK[c.access]||0;
    const locked=ar>0&&ur<ar;
    const bc=TYPE_BADGE_CLS[c.type]||'badge-article';
    const ico=TYPE_ICONS[c.type]||'📄';
    const typeLabel=c.type?c.type.charAt(0).toUpperCase()+c.type.slice(1):'';
    const thumbCls='thumb-'+(c.type||'article');
    // Auto-extract YouTube/Vimeo thumbnail if URL provided
    let ytThumb='';
    if(c.url){
      const ytMatch=c.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      const vimeoMatch=c.url.match(/vimeo\.com\/(\d+)/);
      if(ytMatch)ytThumb=`https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
    // Prefer a real image thumbnail (uploaded image, or an image link); then video; else a clean icon
    const isImg=u=>/\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(u||'');
    const imgUrl=(c.mediaUrl&&(c.mediaType==='image'||isImg(c.mediaUrl)))?c.mediaUrl:(isImg(c.url)?c.url:'');
    const thumbContent=ytThumb
      ?`<img src="${ytThumb}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.classList.add('thumb-fallback');this.remove()"/>`
      :(c.mediaUrl&&c.mediaType==='video'
        ?`<video src="${c.mediaUrl}" style="width:100%;height:100%;object-fit:cover" preload="metadata" muted></video>`
        :(imgUrl
          ?`<img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.classList.add('thumb-fallback');this.remove()"/>`
          :`<div class="cc-thumb-icon">${typeIconSvg(c.type)}</div>`));
    const totalReacts=REACTION_EMOJIS.reduce((s,r)=>s+(c.reactions[r.key]||0),0);
    return '<div class="content-card cc-clickable" id="card-'+c.id+'" onclick="openContent(\''+c.id+'\')" role="button" tabindex="0" onkeydown="if(event.key===\'Enter\')openContent(\''+c.id+'\')">'+
      '<div class="cc-thumb '+thumbCls+(ytThumb||c.mediaUrl?' cc-has-media':'')+'">'+thumbContent+
      '<span class="cc-badge '+bc+'">'+typeLabel+'</span>'+
      (locked?'<div class="cc-lock"><span style="font-size:1.6rem">🔒</span><span>'+c.access.charAt(0).toUpperCase()+c.access.slice(1)+'+ Members</span></div>':'')+
      '</div>'+
      '<div class="cc-body">'+
        '<span class="cc-win-tag">'+esc(c.window)+'</span>'+
        '<div class="cc-title">'+esc(c.title)+'</div>'+
        '<div class="cc-meta"><span>📅 '+esc(c.date)+'</span><span>👤 '+esc(c.author)+'</span>'+(c.theme?'<span>🏷 '+esc(c.theme)+'</span>':'')+'</div>'+
        '<p class="cc-desc">'+esc(c.desc)+'</p>'+
        '<div class="cc-foot">'+
          '<span class="cc-foot-stats">'+(totalReacts?'❤ '+totalReacts+' ':'')+'💬 '+c.comments.length+(bkd.includes(c.id)?' · 🔖':'')+'</span>'+
          '<span class="cc-open-lite">'+(locked?'🔒 Unlock':'▶ Open')+' →</span>'+
        '</div>'+
      '</div>'+
    '</div>';
  }).join('');
}

const REACTION_EMOJIS=[
  {key:'likes',emoji:'❤️',label:'Love this'},
  {key:'thumbsup',emoji:'👍',label:'Helpful'},
  {key:'wow',emoji:'😮',label:'Wow'},
  {key:'sad',emoji:'😢',label:'Sad'},
  {key:'celebrate',emoji:'🎉',label:'Celebrate'},
];
async function toggleEmoji(id,key,btn){
  if(!currentUser){toast('Sign in to react.');return}
  const item=CONTENT.find(c=>c.id===id);if(!item)return;
  const myR=LS.get('my_reactions',{});
  const reactions={...item.reactions};
  const prev=myR[id];
  if(prev===key){
    reactions[key]=Math.max(0,(reactions[key]||0)-1);
    delete myR[id];
  }else{
    if(prev)reactions[prev]=Math.max(0,(reactions[prev]||0)-1);
    reactions[key]=(reactions[key]||0)+1;
    myR[id]=key;
  }
  item.reactions=reactions;
  LS.set('my_reactions',myR);
  await sb.from('content').update({reactions}).eq('id',id);
  renderContent();refreshContentModal();
}
async function toggleReact(id,type,btn){
  if(!currentUser){toast('Sign in to react.');return}
  const key=type==='like'?'liked':'bookmarked';
  let arr=LS.get(key,[]);
  const item=CONTENT.find(c=>c.id===id);if(!item)return;
  const field=type==='like'?'likes':'bookmarks';
  const reactions={...item.reactions};
  if(arr.includes(id)){arr=arr.filter(x=>x!==id);reactions[field]=Math.max(0,(reactions[field]||0)-1);btn.classList.remove(type==='like'?'liked':'bkd')}
  else{arr.push(id);reactions[field]=(reactions[field]||0)+1;btn.classList.add(type==='like'?'liked':'bkd')}
  item.reactions=reactions;
  btn.innerHTML=(type==='like'?'❤ ':'🔖 ')+reactions[field]+(type==='bookmark'?' Save':'');
  LS.set(key,arr);
  await sb.from('content').update({reactions}).eq('id',id);
  renderContent();
}
async function postComment(cid){
  if(!currentUser){toast('Sign in to comment.');return}
  const inp=document.getElementById('ci-'+cid);if(!inp)return;
  const text=inp.value.trim();if(!text)return;
  inp.value='';
  const {error}=await sb.from('comments').insert({content_id:cid,user_name:currentUser.name,text});
  if(error){toast('⚠ Could not post comment.');console.error(error);return}
  await loadContent();renderContent();refreshContentModal();
  toast('Comment posted.');
}
let _openContentId=null;
function openContent(cid){
  const item=CONTENT.find(c=>c.id===cid);if(!item)return;
  _openContentId=cid;
  renderContentModal(cid);
  openModal('m-content');
}
// refresh ONLY the social block (reactions/comments) so a playing video is never interrupted
function refreshContentModal(){
  if(!_openContentId)return;
  const item=CONTENT.find(c=>c.id===_openContentId);if(!item)return;
  const el=document.getElementById('cc-social');
  if(el)el.innerHTML=_contentSocialHTML(item);else renderContentModal(_openContentId);
}
// closing must stop any playing video/audio (clear the embed)
function closeContentModal(){_openContentId=null;const b=document.getElementById('content-modal-body');if(b)b.innerHTML='';closeModal('m-content');}
function _contentSocialHTML(item){
  const bkd=LS.get('bookmarked',[]);const cid=item.id;
  return _contentReactBar(item)+
    '<div class="cc-actions" style="margin-bottom:.4rem">'+
      '<button class="rbt'+(bkd.includes(cid)?' bkd':'')+'" onclick="toggleReact(\''+cid+'\',\'bookmark\',this)">🔖 '+(item.reactions.bookmarks||0)+' Save</button>'+
      '<button class="rbt" onclick="shareItem(\''+cid+'\')">🔗 Share</button>'+
    '</div>'+
    _contentComments(item,false);
}
function _contentReactBar(c){
  const myReactions=LS.get('my_reactions',{});
  return '<div class="cc-reactbar" style="margin:.4rem 0 .2rem">'+REACTION_EMOJIS.map(r=>
    '<button class="ebt'+(myReactions[c.id]===r.key?' picked':'')+'" onclick="toggleEmoji(\''+c.id+'\',\''+r.key+'\',this)" title="'+r.label+'">'+r.emoji+' <span>'+(c.reactions[r.key]||0)+'</span></button>'
  ).join('')+'</div>';
}
function _contentComments(c,locked){
  if(locked)return '';
  return '<div class="comments-wrap" style="margin-top:1rem">'+
    '<h5>Comments ('+c.comments.length+')</h5>'+
    '<div class="comment-list" id="cl-'+c.id+'">'+
      (c.comments.length?c.comments.map(cm=>'<div class="comment-item"><span class="comment-author">'+esc(cm.user)+'</span><span class="comment-time">'+esc(cm.time)+'</span><br>'+esc(cm.text)+'</div>').join('')
        :'<p style="font-size:.76rem;color:var(--muted)">No comments yet.</p>')+
    '</div>'+
    (currentUser
      ?'<div class="comment-input-row"><input id="ci-'+c.id+'" placeholder="Add a comment..." onkeydown="if(event.key===\'Enter\')postComment(\''+c.id+'\')"/><button class="btn btn-ghost btn-sm" onclick="postComment(\''+c.id+'\')">Post</button></div>'
      :'<p style="font-size:.76rem;color:var(--muted);margin-top:.35rem"><a href="#" onclick="openModal(\'m-login\');return false" style="color:var(--canopy-lt);font-weight:600">Sign in</a> to comment.</p>')+
  '</div>';
}
// Build an INLINE player/reader — members watch/read inside the app, not via a link.
function _ytId(u){const m=(u||'').match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);return m?m[1]:'';}
function _vimeoId(u){const m=(u||'').match(/vimeo\.com\/(?:video\/)?(\d+)/);return m?m[1]:'';}
function _isImgUrl(u){return /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(u||'');}
function _isVidUrl(u){return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(u||'');}
function _isAudioUrl(u){return /\.(mp3|wav|m4a|aac|oga)(\?.*)?$/i.test(u||'');}
function _contentMedia(item){
  // 1) Admin-uploaded files play/read inline directly
  if(item.mediaUrl&&item.mediaType==='video')return '<video controls playsinline preload="metadata" style="width:100%;border-radius:var(--r-sm);margin-bottom:1rem;background:#000" src="'+esc(item.mediaUrl)+'"></video>';
  if(item.mediaUrl&&item.mediaType==='audio')return '<audio controls preload="metadata" style="width:100%;margin-bottom:1rem" src="'+esc(item.mediaUrl)+'"></audio>';
  if(item.mediaUrl&&(item.mediaType==='image'||_isImgUrl(item.mediaUrl)))return '<img src="'+esc(item.mediaUrl)+'" style="width:100%;border-radius:var(--r-sm);margin-bottom:1rem" alt=""/>';
  const url=item.url||'';
  if(url.length>5){
    // 2) YouTube / Vimeo → embedded player, right here
    const yt=_ytId(url);
    if(yt)return '<div class="embed-wrap"><iframe src="https://www.youtube-nocookie.com/embed/'+yt+'?rel=0" title="'+esc(item.title)+'" loading="lazy" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;web-share" allowfullscreen></iframe></div>';
    const vim=_vimeoId(url);
    if(vim)return '<div class="embed-wrap"><iframe src="https://player.vimeo.com/video/'+vim+'" title="'+esc(item.title)+'" loading="lazy" allow="autoplay;fullscreen;picture-in-picture" allowfullscreen></iframe></div>';
    // 3) Direct media links → native players
    if(_isVidUrl(url))return '<video controls playsinline preload="metadata" style="width:100%;border-radius:var(--r-sm);margin-bottom:1rem;background:#000" src="'+esc(url)+'"></video>';
    if(_isAudioUrl(url))return '<audio controls preload="metadata" style="width:100%;margin-bottom:1rem" src="'+esc(url)+'"></audio>';
    if(_isImgUrl(url))return '<img src="'+esc(url)+'" style="width:100%;border-radius:var(--r-sm);margin-bottom:1rem" alt=""/>';
    // 4) Articles / blogs → read inline in a framed reader, with a fallback link
    //    (some sites block embedding; the fallback always works)
    return '<div class="embed-wrap embed-page"><iframe src="'+esc(url)+'" title="'+esc(item.title)+'" loading="lazy" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-popups"></iframe></div>'+
      '<a href="'+esc(url)+'" target="_blank" rel="noopener" class="embed-fallback">Trouble viewing? Open the original ↗</a>';
  }
  return '';
}
function renderContentModal(cid){
  const item=CONTENT.find(c=>c.id===cid);if(!item)return;
  const ur=uRank();const ar=ACCESS_RANK[item.access]||0;
  if(ar>0&&ur<ar){
    document.getElementById('content-modal-body').innerHTML=
      '<div style="text-align:center;padding:1rem 0">'+
        '<div style="font-size:2.5rem;margin-bottom:.85rem">🔒</div>'+
        '<h3 style="font-family:var(--ff-d);font-size:1.3rem;color:var(--canopy);margin-bottom:.45rem">Members Only Content</h3>'+
        '<p style="font-size:.85rem;color:var(--muted);margin-bottom:1.25rem;line-height:1.65">This resource is available to <strong>'+item.access.charAt(0).toUpperCase()+item.access.slice(1)+'+ members</strong>.</p>'+
        '<button class="btn btn-gold btn-full" onclick="closeModal(\'m-content\');document.getElementById(\'greencard\').scrollIntoView({behavior:\'smooth\'})">View Green Card Tiers →</button>'+
        '<button class="btn btn-ghost btn-full" style="margin-top:.5rem" onclick="openModal(\'m-login\');closeModal(\'m-content\')">Sign In →</button>'+
      '</div>';
    openModal('m-content');return;
  }
  const bc=TYPE_BADGE_CLS[item.type]||'badge-article';
  const typeLabel=item.type?item.type.charAt(0).toUpperCase()+item.type.slice(1):'';
  let mediaBlock=_contentMedia(item);
  let bodyBlock='';
  if(item.fullText&&item.fullText.length>0){
    bodyBlock='<div style="font-size:.87rem;color:var(--text);line-height:1.8;max-height:420px;overflow-y:auto;padding:1rem;background:var(--mist);border-radius:var(--r-sm);margin-bottom:1rem;white-space:pre-line">'+esc(item.fullText)+'</div>';
  }
  if(!mediaBlock&&!bodyBlock){
    mediaBlock='<div style="background:var(--mist);border-radius:var(--r-sm);padding:1.1rem;text-align:center;font-size:.82rem;color:var(--muted);margin-bottom:.7rem">Content will be available once the admin adds the file or text.</div>';
  }
  document.getElementById('content-modal-body').innerHTML=
    '<span class="cc-badge '+bc+'" style="display:inline-block;margin-bottom:.9rem">'+typeLabel+'</span>'+
    '<h3 style="font-family:var(--ff-d);font-size:1.2rem;color:var(--canopy);margin-bottom:.45rem">'+esc(item.title)+'</h3>'+
    '<p style="font-size:.76rem;color:var(--muted);margin-bottom:.9rem">By '+esc(item.author)+' · '+esc(item.date)+' · '+esc(item.window)+'</p>'+
    mediaBlock+bodyBlock+
    (!bodyBlock?'<p style="font-size:.87rem;color:var(--text);line-height:1.72;margin-bottom:1rem">'+esc(item.desc)+'</p>':'')+
    '<div id="cc-social">'+_contentSocialHTML(item)+'</div>';
}
function shareItem(cid){
  const item=CONTENT.find(c=>c.id===cid);if(!item)return;
  const url=location.origin+location.pathname+'#learn';
  if(navigator.share){navigator.share({title:item.title,text:item.desc.slice(0,100)+'...',url}).catch(()=>{})}
  else{navigator.clipboard.writeText(url+' — '+item.title).then(()=>toast('🔗 Link copied!')).catch(()=>toast('Copy link: '+url))}
}

/* ═══ FILE/THUMBNAIL HANDLING — admin upload ═══ */
function onDragOver(e){e.preventDefault();document.getElementById('upload-zone').classList.add('drag')}
function onDrop(e){e.preventDefault();document.getElementById('upload-zone').classList.remove('drag');const f=e.dataTransfer.files[0];if(f)processFile(f)}
function onFileSelect(e){const f=e.target.files[0];if(f)processFile(f)}
function processFile(f){
  uploadedFile=f;
  document.getElementById('file-prev-wrap').innerHTML=
    '<div class="file-prev"><span>📄</span><span class="fp-name">'+f.name+'</span><span style="font-size:.7rem;color:var(--muted)">'+(f.size/1024/1024).toFixed(2)+' MB</span><button class="fp-rm" onclick="uploadedFile=null;document.getElementById(\'file-prev-wrap\').innerHTML=\'\'">✕</button></div>';
}

/* ═══ UPLOAD CONTENT — files go to Supabase Storage, row goes to 'content' table ═══ */
async function submitUpload(){
  if(!currentUser){toast('⚠ You must be logged in to upload content.');return}
  const title=document.getElementById('up-title').value.trim();
  const type=document.getElementById('up-type').value;
  const win=document.getElementById('up-window').value;
  if(!title||!type||!win){toast('⚠ Title, type, and programme window are required.');return}
  toast('⬆ Uploading...');

  let mediaUrl='';let mediaType='';
  if(uploadedFile){
    const path='media/'+Date.now()+'_'+uploadedFile.name.replace(/\s+/g,'_');
    const {error:upErr}=await sb.storage.from('content-files').upload(path,uploadedFile);
    if(!upErr){
      const {data}=sb.storage.from('content-files').getPublicUrl(path);
      mediaUrl=data.publicUrl;
      mediaType=uploadedFile.type.startsWith('video')?'video':uploadedFile.type.startsWith('audio')?'audio':'';
    }else{console.error('media upload',upErr);toast('⚠ Media upload failed — check Storage bucket permissions.');}
  }

  const row={
    title,type,window_name:win,
    theme:document.getElementById('up-theme').value||'Biodiversity',
    description:document.getElementById('up-desc').value||'',
    author:document.getElementById('up-author').value||currentUser.name,
    access:document.getElementById('up-access').value||'member',
    url:document.getElementById('up-url').value||'',
    media_url:mediaUrl,media_type:mediaType,
    full_text:document.getElementById('up-fulltext').value||'',
    reactions:{likes:0,bookmarks:0,love:0,wow:0,sad:0},
  };
  const {error}=await sb.from('content').insert(row);
  if(error){toast('⚠ Could not publish content.');console.error(error);return}

  uploadedFile=null;
  document.getElementById('file-prev-wrap').innerHTML='';
  ['up-title','up-type','up-window','up-theme','up-desc','up-author','up-url','up-fulltext'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
  closeModal('m-upload');
  await loadContent();renderContent();renderAdminContent();
  toast('✅ Content published to Learning Exchange.');
}

/* ═══ WALL OF FAME — shared via Supabase, photos go to Storage ═══ */
function renderFame(){
  const el=document.getElementById('fame-grid');if(!el)return;
  if(!FAME.length){
    el.innerHTML='<div class="fame-empty"><h4>Our Champions Will Appear Here</h4><p>Conservation champions will be featured here with photos and stories.</p></div>';
    return;
  }
  el.innerHTML=FAME.map((m,idx)=>{
    const td=TIERS_DATA[m.tier]||TIERS_DATA.silver;
    const initials=m.name.split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase();
    return '<div class="fame-card fame-click" role="button" tabindex="0" onclick="openFame('+idx+')" onkeydown="if(event.key===\'Enter\')openFame('+idx+')">'+
      (m.photo
        ?'<img src="'+m.photo+'" alt="'+m.name+'" style="width:100%;height:200px;object-fit:cover"/>'
        :'<div class="fame-img-placeholder"><div class="fame-initials">'+initials+'</div></div>')+
      '<div class="fame-body">'+
        '<div class="fame-name">'+esc(m.name)+'</div>'+
        '<div class="fame-tier">'+td.emoji+' '+esc(td.label)+'</div>'+
        (m.caption?'<div class="fame-caption">'+esc(m.caption)+'</div>':'')+
        '<div class="fame-year">'+m.year+' <span class="fame-view">View →</span></div>'+
      '</div>'+
    '</div>';
  }).join('');
}

function handleFamePhoto(e){
  const f=e.target.files[0];if(!f)return;
  famePhotoData=f;
  const reader=new FileReader();
  reader.onload=ev=>{
    document.getElementById('fame-photo-prev').innerHTML=
      '<div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem;padding:.5rem;background:var(--mist);border-radius:var(--r-sm)">'+
        '<img src="'+ev.target.result+'" style="width:48px;height:48px;border-radius:50%;object-fit:cover"/>'+
        '<span style="font-size:.82rem;color:var(--text)">'+f.name+'</span>'+
        '<button onclick="famePhotoData=null;document.getElementById(\'fame-photo-prev\').innerHTML=\'\'" style="margin-left:auto;background:none;border:none;cursor:pointer;color:var(--muted)">✕</button>'+
      '</div>';
  };
  reader.readAsDataURL(f);
}
async function addFameChampion(){
  const name=document.getElementById('fame-name').value.trim();
  const caption=document.getElementById('fame-caption').value.trim();
  const tier=document.getElementById('fame-tier').value;
  const year=parseInt(document.getElementById('fame-year').value)||new Date().getFullYear();
  if(!name||!caption){toast('⚠ Name and caption required.');return}
  toast('⬆ Adding champion...');
  let photoUrl='';
  if(famePhotoData){
    const path='fame/'+Date.now()+'_'+famePhotoData.name.replace(/\s+/g,'_');
    const {error:upErr}=await sb.storage.from('fame-photos').upload(path,famePhotoData);
    if(!upErr){
      const {data}=sb.storage.from('fame-photos').getPublicUrl(path);
      photoUrl=data.publicUrl;
    }else{console.error('fame photo upload',upErr);}
  }
  const {error}=await sb.from('wall_of_fame').insert({name,caption,tier,year,photo_url:photoUrl||null});
  if(error){toast('⚠ Could not add champion.');console.error(error);return}
  famePhotoData=null;
  closeModal('m-fame-add');
  document.getElementById('fame-name').value='';document.getElementById('fame-caption').value='';
  document.getElementById('fame-photo-prev').innerHTML='';
  await loadFame();renderFame();renderAdminFame();
  toast('✅ Champion added to Wall of Fame.');
}

/* ═══ ANNOUNCEMENTS — public strip ═══ */
function renderPublicAnnounces(){
  const el=document.getElementById('announce-pub-list');if(!el)return;
  if(!ANNOUNCES.length){el.innerHTML='<p style="color:rgba(255,255,255,.4);font-size:.88rem">No announcements yet. Check back soon for project updates and news.</p>';return}
  const recent=ANNOUNCES.filter(a=>!_isArchived(a));
  const older=ANNOUNCES.filter(a=>_isArchived(a));
  const show=_showAll.announce?ANNOUNCES:recent;
  const card=a=>'<div class="announce-pub-card"><div class="apc-type">'+esc(a.type)+'</div><div class="apc-title">'+esc(a.title)+'</div><p class="apc-body">'+esc(a.body)+'</p><div class="apc-date">'+esc(a.date)+'</div></div>';
  let html=show.length?show.slice(0,_showAll.announce?100:5).map(card).join(''):'<p style="color:rgba(255,255,255,.4);font-size:.88rem">No current announcements.</p>';
  if(older.length)html+='<button class="archive-toggle" onclick="_showAll.announce=!_showAll.announce;renderPublicAnnounces()">'+(_showAll.announce?'↑ Hide older':'View earlier announcements ('+older.length+') →')+'</button>';
  el.innerHTML=html;
}

/* ═══ MEMBER DASHBOARD ═══ */
function renderMemberView(){
  if(!currentUser)return;
  const u=currentUser;const td=TIERS_DATA[u.tier]||TIERS_DATA.silver;
  const initials=u.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const accessible=CONTENT.filter(c=>ACCESS_RANK[c.access]<=(td.r||1));
  const myPostCount=POSTS.filter(p=>p.author_id===u.id).length;

  // Profile card — wallpaper + avatar + name + bio
  const avatarWrap=document.getElementById('mem-avatar-wrap');
  if(avatarWrap){
    avatarWrap.className='profile-header-card';
    avatarWrap.innerHTML=
      '<div class="profile-wallpaper" style="'+(u.wallpaper_url
        ?'background-image:url(\''+u.wallpaper_url.split('?')[0]+'?t='+Date.now()+'\');background-size:cover;background-position:center'
        :'background:linear-gradient(135deg,#0B2618 0%,#174530 50%,#2D6A4F 100%)'
      )+'"></div>'+
      '<div class="profile-avatar-row">'+
        '<div class="profile-avatar-wrap">'+
          (u.photo_url
            ?'<img src="'+u.photo_url+'" class="profile-avatar-img"/>'
            :'<div class="profile-avatar-img profile-avatar-init">'+initials+'</div>')+
        '</div>'+
        '<div class="profile-header-actions">'+
          '<button class="btn btn-ghost btn-sm" onclick="openEditProfile()">✏ Edit Profile</button>'+
        '</div>'+
      '</div>'+
      '<div class="profile-info">'+
        '<div class="profile-name">'+esc(u.name)+'</div>'+
        '<div class="profile-tier-badge">'+
          '<span style="display:inline-block;background:rgba(45,106,79,.1);border:1px solid rgba(45,106,79,.2);border-radius:99px;padding:.15rem .6rem;font-size:.72rem;font-weight:700;color:var(--canopy-lt);letter-spacing:.04em;text-transform:uppercase">'+esc(td.label)+' Member</span>'+
          (u.org?' <span style="font-size:.78rem;color:var(--muted)">· '+esc(u.org)+'</span>':'')+
        '</div>'+
        (u.bio?'<div class="profile-bio">'+esc(u.bio)+'</div>':
          '<div class="profile-bio" style="color:var(--muted);font-style:italic;font-size:.82rem">No bio yet — <a href="#" onclick="openEditProfile();return false" style="color:var(--canopy-lt)">add one</a></div>')+
        (Array.isArray(u.engage_prefs)&&u.engage_prefs.length?'<div class="mem-interests">'+u.engage_prefs.map(function(p){return '<span class="mi">'+esc(p)+'</span>';}).join('')+'</div>':'')+
        (function(){const bs=memberBadges(u,myPostCount);return bs.length?'<div class="badge-row">'+bs.map(b=>'<span class="badge-chip">'+b+'</span>').join('')+'</div>':'';})()+
        '<div class="profile-stats">'+
          '<span><strong>'+(u.followers_count||0)+'</strong> followers</span>'+
          '<span>·</span>'+
          '<span><strong>'+myPostCount+'</strong> posts</span>'+
          '<span>·</span>'+
          '<span>Member since <strong>'+u.year+'</strong></span>'+
        '</div>'+
      '</div>';
  }

  // Stats strip — clean inline metadata, no emoji boxes
  document.getElementById('mem-strip').innerHTML=
    '<div class="mem-mini"><span class="val">'+td.label+'</span><span class="lbl">Membership Tier</span></div>'+
    '<div class="mem-mini"><span class="val">'+(u.amount?'UGX '+u.amount.toLocaleString():'—')+'</span><span class="lbl">Annual Contribution</span></div>'+
    '<div class="mem-mini"><span class="val">'+accessible.length+'</span><span class="lbl">Resources Unlocked</span></div>'+
    '<div class="mem-mini"><span class="val">'+myPostCount+'</span><span class="lbl">Posts Published</span></div>';
  const perks=PERKS_MAP[u.tier]||[];
  // Discover Members — lifted into its own rail (level with the wallpaper on desktop; a card under the profile on mobile)
  const discoverEl=document.getElementById('mem-discover');
  if(discoverEl)discoverEl.innerHTML=
      '<div class="mem-sec-title" style="margin-top:0">Discover Members</div>'+
      '<p style="font-size:.8rem;color:var(--muted);margin:-.35rem 0 .8rem;line-height:1.55">Search a member or institution, then follow them. Tap any result to view their profile.</p>'+
      '<div class="member-search-wrap"><span class="member-search-ico">🔍</span><input id="member-search" type="search" class="member-search-input" placeholder="Search members…" oninput="searchMembers(this.value)" autocomplete="off" spellcheck="false"/></div>'+
      '<div id="members-directory" class="members-dir"><p style="font-size:.85rem;color:var(--muted)">Loading…</p></div>'+
      (CAMPAIGNS.filter(c=>c.active!==false).length?'<div class="mem-sec-title" style="margin-top:1.5rem">🎯 Fundraisers</div><div class="camp-grid camp-grid-rail">'+CAMPAIGNS.filter(c=>c.active!==false).map(campaignCardHTML).join('')+'</div>':'')+
      '';
  document.getElementById('mem-body').innerHTML=
    '<div class="mem-main">'+
    renewBannerHTML(u)+
    // Benefits — clean chips
    '<div class="mem-sec-title">Your Green Card Benefits</div>'+
    '<div class="perk-chips">'+perks.map(p=>'<div class="perk-chip"><span class="pc-ico">'+p.split(' ')[0]+'</span><span class="pc-txt">'+p.replace(/^[^\s]+\s/,'')+'</span></div>').join('')+'</div>'+
    // Certificate
    '<div class="mem-cert-row">'+
      '<div><div class="mem-cert-title">Green Card Certificate</div><div class="mem-cert-sub">Your official UBF Friends of Biodiversity membership certificate</div></div>'+
      '<div style="display:flex;gap:.4rem;flex-wrap:wrap"><button class="btn btn-gold btn-sm" onclick="openCertModal()">⬇ Certificate</button>'+
      '<button class="btn btn-ghost btn-sm" onclick="downloadReceipt()">🧾 Receipt</button></div>'+
    '</div>'+
    // Actions
    // Actions — primary up front, the rest tucked into a tidy menu (LinkedIn-style)
    '<div class="mem-action-row">'+
      '<button class="btn btn-canopy btn-sm" onclick="openEditProfile()">✏ Edit Profile</button>'+
      '<button class="btn btn-gold btn-sm" onclick="openModal(\'m-create-post\')">✍ Post</button>'+
      '<button class="btn btn-gold btn-sm" onclick="openDashboardModal()">📊 Accountability</button>'+
      '<div class="mem-more"><button class="btn btn-ghost btn-sm" onclick="this.parentNode.classList.toggle(\'open\')">⋯ More</button>'+
        '<div class="mem-more-menu">'+
          '<button onclick="openTierModal()">⇅ Change Tier</button>'+
          '<button onclick="openModal(\'m-change-pass\')">🔑 Password</button>'+
          '<button onclick="doLogout()" style="color:var(--rust)">🚪 Sign Out</button>'+
        '</div>'+
      '</div>'+
    '</div>'+
    // Citizen science — log sightings, view the map, earn the badge
    (function(){const vs=myVerifiedSightings(u.id),ms=mySightings(u.id);return ''+
      '<div class="cs-panel">'+
        '<div class="cs-head"><div><div class="cs-title">🔬 Citizen Science</div><div class="cs-sub">Log what you see in the wild. Every sighting grows Uganda’s open biodiversity record.</div></div>'+
          '<div class="cs-count"><b>'+ms+'</b><span>logged</span></div></div>'+
        '<div class="cs-actions"><button class="btn btn-canopy" onclick="openSighting()">🔍 Log a sighting</button>'+
          '<button class="btn btn-ghost" onclick="openSightMap()">🗺 Sightings map</button></div>'+
        '<div class="cs-prog"><div class="cs-bar" style="width:'+Math.min(100,vs/10*100)+'%"></div></div>'+
        '<div class="cs-note">'+(vs>=10?'🔬 <b>Citizen Scientist</b> unlocked — thank you!':'<b>'+vs+'/10</b> verified sightings to unlock the free 🔬 Citizen Scientist badge.')+'</div>'+
      '</div>';})()+
    // Central feed continues: sponsored banner, events, then updates
    bannerStripHTML()+
    eventsCarouselHTML()+
    // Announcements — clickable, scrollable, latest on top
    announcementsListHTML()+
    // Financial Reports — clickable, scrollable, latest on top
    reportsListHTML()+
    // Leave
    '<div class="leave-row">'+
      '<p>Need to leave or unsubscribe from UBF communications?</p>'+
      '<button class="btn-leave" onclick="openModal(\'m-leave\')">Leave Membership</button>'+
    '</div>'+
    '</div>'; // close .mem-main
  populateMembersDirectory();
  updateNotifBadge();
  renderAdRail();
}

/* ═══ Announcements & Financial Reports — clickable, scrollable, latest on top ═══ */
function announcementsListHTML(){
  if(!ANNOUNCES.length)return '<div class="mem-sec-title" style="margin-top:1.25rem">Latest from UBF</div><div class="empty-state"><span>📢</span><p>No announcements yet.</p></div>';
  return '<div class="feed-head-row"><div class="mem-sec-title" style="margin:1.25rem 0 .2rem">📢 Latest from UBF</div><span class="feed-count">'+ANNOUNCES.length+'</span></div>'+
    '<div class="upd-list">'+ANNOUNCES.map((a,i)=>
      '<div class="upd-row" role="button" tabindex="0" onclick="openAnnounce(\''+a.id+'\')" onkeydown="if(event.key===\'Enter\')openAnnounce(\''+a.id+'\')">'+
        '<span class="upd-ic">📣</span>'+
        '<div class="upd-mid"><div class="upd-t">'+esc(a.title)+(i<2?' <span class="upd-new">New</span>':'')+'</div>'+
          '<div class="upd-d">'+esc((a.body||a.type||'').slice(0,80))+(((a.body||'').length>80)?'…':'')+' · '+esc(a.date||'')+'</div></div>'+
        '<span class="upd-chev">›</span>'+
      '</div>'
    ).join('')+'</div>';
}
function reportsListHTML(){
  if(!FIN_REPORTS.length)return '<div class="mem-sec-title" style="margin-top:2rem">Financial Reports</div><div class="empty-state"><span>📊</span><p>No reports published yet.</p></div>';
  return '<div class="feed-head-row"><div class="mem-sec-title" style="margin:2rem 0 .2rem">📄 Financial Reports</div><span class="feed-count">'+FIN_REPORTS.length+'</span></div>'+
    '<div class="upd-list">'+FIN_REPORTS.map((r,i)=>
      '<div class="upd-row" role="button" tabindex="0" onclick="openReport(\''+r.id+'\')" onkeydown="if(event.key===\'Enter\')openReport(\''+r.id+'\')">'+
        '<span class="upd-ic">📄</span>'+
        '<div class="upd-mid"><div class="upd-t">'+esc(r.title)+(i===0?' <span class="upd-new">New</span>':'')+'</div>'+
          '<div class="upd-d">'+esc([r.period,r.date].filter(Boolean).join(' · '))+(r.summary?' · '+esc(r.summary.slice(0,50)):'')+'</div></div>'+
        '<span class="upd-chev">'+((r.url&&r.url!=='#')?'⬇':'›')+'</span>'+
      '</div>'
    ).join('')+'</div>';
}
function openAnnounce(id){
  const a=(ANNOUNCES||[]).find(x=>x.id===id);if(!a)return;_buzz&&_buzz();
  document.getElementById('detail-body').innerHTML=
    '<div class="dtl-hero" style="height:120px;background:linear-gradient(135deg,#153d28,#2D6A4F)"><div class="dtl-hero-grad"></div>'+
      '<div class="dtl-hero-txt"><span class="dtl-kind">📢 '+esc(a.type||'Announcement')+'</span><h2>'+esc(a.title)+'</h2>'+
      (a.date?'<span class="dtl-region">'+esc(a.date)+'</span>':'')+'</div></div>'+
    '<div class="dtl-body">'+
      (a.body?'<p class="dtl-blurb">'+esc(a.body)+'</p>':'<p class="dtl-blurb" style="color:var(--muted)">No further details.</p>')+
      '<div class="dtl-cta-row"><button class="btn btn-ghost" onclick="closeModal(\'m-detail\')">Close</button></div>'+
    '</div>';
  openModal('m-detail');
}
function openReport(id){
  const r=(FIN_REPORTS||[]).find(x=>x.id===id);if(!r)return;_buzz&&_buzz();
  document.getElementById('detail-body').innerHTML=
    '<div class="dtl-hero" style="height:120px;background:linear-gradient(135deg,#1a2e3a,#2E7D9A)"><div class="dtl-hero-grad"></div>'+
      '<div class="dtl-hero-txt"><span class="dtl-kind">📄 Financial Report</span><h2>'+esc(r.title)+'</h2>'+
      '<span class="dtl-region">'+esc([r.period,r.date].filter(Boolean).join(' · '))+'</span></div></div>'+
    '<div class="dtl-body">'+
      (r.summary?'<p class="dtl-blurb">'+esc(r.summary)+'</p>':'')+
      '<div class="dtl-cta-row">'+
        ((r.url&&r.url!=='#')?'<a class="btn btn-gold" href="'+esc(r.url)+'" target="_blank" rel="noopener">⬇ Open / Download</a>':'<span style="font-size:.85rem;color:var(--muted)">The document will be available once uploaded.</span>')+
        '<button class="btn btn-ghost" onclick="closeModal(\'m-detail\')">Close</button>'+
      '</div>'+
    '</div>';
  openModal('m-detail');
}

/* ═══ ACCOUNTABILITY DASHBOARD (member-facing, admin-editable) ═══ */
function openDashboardModal(){
  const m=document.getElementById('dash-modal');if(m)m.classList.remove('fs');
  const b=document.getElementById('dash-fs-btn');if(b)b.textContent='⛶';
  renderAccountabilityDashboard();openModal('m-dashboard');
}
function dashToggleFull(){
  const m=document.getElementById('dash-modal');if(!m)return;
  m.classList.toggle('fs');
  const b=document.getElementById('dash-fs-btn');
  if(b)b.textContent=m.classList.contains('fs')?'🗕':'⛶';
}
/* ═══ NOTIFICATIONS / UPDATES ═══ */
function buildNotifications(){
  const items=[];
  if(currentUser&&membershipDue(currentUser))items.push({icon:'🔄',cat:'Membership renewal',text:'Your '+currentUser.year+' membership has ended — tap to renew for '+new Date().getFullYear(),date:new Date().toISOString().slice(0,10),kind:'renew',tid:'me'});
  (ANNOUNCES||[]).forEach(a=>items.push({icon:'📢',cat:'Announcement',text:a.title,date:a.date,kind:'announce',tid:a.id}));
  (CONTENT||[]).forEach(c=>items.push({icon:'📚',cat:'New '+(c.type||'resource'),text:c.title,date:c.date,kind:'content',tid:c.id}));
  (FIN_REPORTS||[]).forEach(r=>items.push({icon:'📄',cat:'Financial report',text:r.title,date:r.date,kind:'report',tid:r.id}));
  (POSTS||[]).slice(0,30).forEach(p=>items.push({icon:'📝',cat:'Community post',text:(p.author_name||'A member')+((p.body||'').trim()?': '+p.body.trim().slice(0,60):' shared a post'),date:(p.created_at||'').slice(0,10),kind:'post',tid:p.id}));
  (MEMBERS||[]).filter(m=>m.role==='member'&&m.status==='active'&&m.created_at).forEach(m=>items.push({icon:'🌿',cat:'New member',text:(m.name||'A new member')+' joined the community',date:(m.created_at||'').slice(0,10),kind:'member',tid:m.id}));
  items.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  return items.slice(0,20);
}
// LinkedIn-style: clicking a notification takes the member to the exact item, briefly highlighted
function openNotifItem(kind,id){
  closeModal('m-notifications');
  if(kind==='member'){viewMemberProfile(id);return}
  if(kind==='renew'){openRenewModal();return}
  if(kind==='post'){showView('member');openPostModal(id);return}
  const dest={
    content:{view:'main',target:'card-'+id,fallback:'learn'},
    post:{view:'main',target:'post-'+id,fallback:'community-feed-wrap'},
    announce:{view:'member',target:'ann-'+id,fallback:'mem-body'},
    report:{view:'member',target:'rep-'+id,fallback:'mem-body'}
  }[kind];
  if(!dest)return;
  showView(dest.view);
  setTimeout(()=>{
    const el=document.getElementById(dest.target);
    const scrollTo=el||document.getElementById(dest.fallback);
    if(scrollTo)scrollTo.scrollIntoView({behavior:'smooth',block:'center'});
    if(el){el.classList.add('notif-flash');setTimeout(()=>el.classList.remove('notif-flash'),2600);}
  },300);
}
function _notifId(i){return (i.date||'')+'|'+(i.text||'')}
function updateNotifBadge(){
  const items=buildNotifications();const last=LS.get('notif_last','');
  let n=0;for(const i of items){if(_notifId(i)===last)break;n++;}
  const badge=document.getElementById('notif-badge');
  if(badge){if(n>0){badge.textContent=n>9?'9+':String(n);badge.style.display='flex';}else{badge.style.display='none';}}
  const dot=document.getElementById('app-tab-dot');
  if(dot)dot.style.display=n>0?'block':'none';
  const ah=document.getElementById('ah-badge');
  if(ah){ah.textContent=n>9?'9+':String(n);ah.style.display=n>0?'grid':'none';}
}
function renderNotifications(){
  const el=document.getElementById('notif-list');if(!el)return;
  const items=buildNotifications();
  if(!items.length){el.innerHTML='<p style="color:var(--muted);font-size:.85rem;padding:.5rem 0">No updates yet — check back soon.</p>';return}
  el.innerHTML=items.map(i=>'<div class="notif-item notif-click" onclick="openNotifItem(\''+i.kind+'\',\''+i.tid+'\')" title="Open this item"><span class="notif-ico">'+i.icon+'</span><div class="notif-body"><div class="notif-cat">'+esc(i.cat)+'</div><div class="notif-text">'+esc(i.text)+'</div></div>'+(i.date?'<span class="notif-date">'+esc(i.date)+'</span>':'')+'<span class="notif-go">›</span></div>').join('');
}
function openNotifications(){
  renderNotifications();
  const items=buildNotifications();
  if(items.length)LS.set('notif_last',_notifId(items[0]));
  updateNotifBadge();
  openModal('m-notifications');
}

/* ═══ CONSULTATION (Find an Expert) — composer dropdown ═══ */
function toggleConsultMenu(e){
  if(e){e.stopPropagation();}
  const m=document.getElementById('consult-menu');if(!m)return;
  if(m.style.display!=='none'){m.style.display='none';return}
  const list=document.getElementById('consult-list');
  const item=(icon,label)=>{const safe=String(label).replace(/'/g,'’');return '<button type="button" class="consult-item" onclick="addConsultation(\''+safe+'\')"><span>'+icon+'</span>'+esc(label)+'</button>';};
  list.innerHTML=
    '<div class="consult-group">Programme Windows</div>'+
    (WINDOWS_DATA||[]).map(w=>item(w.icon,w.name)).join('')+
    '<div class="consult-group">Thematic Areas</div>'+
    (THEMES_DATA||[]).map(t=>item(t.icon,t.label)).join('');
  m.style.display='block';
}
function addConsultation(topic){
  const ta=document.getElementById('post-body');if(!ta)return;
  const tag='🧭 Consultation — '+topic;
  if(!ta.value.includes(tag)){
    ta.value=(ta.value.trim()?ta.value.trim()+'\n\n':'')+tag+'\nOpen to connect with interested parties, experts and partners in this area.';
  }
  const m=document.getElementById('consult-menu');if(m)m.style.display='none';
  ta.focus();
  toast('🧭 Consultation topic added to your post.');
}
document.addEventListener('click',e=>{const m=document.getElementById('consult-menu');if(m&&m.style.display!=='none'&&!e.target.closest('#consult-menu')){m.style.display='none';}});

function _dashItems(section){return DASH_ITEMS.filter(i=>i.section===section)}
function renderAccountabilityDashboard(){
  const el=document.getElementById('accountability-dash');
  if(!el)return;
  if(!currentUser){el.innerHTML='';return}
  const m=DASH_META||{};
  const kpis=_dashItems('kpi');
  const alloc=_dashItems('allocation');
  const windows=_dashItems('window');
  const impact=_dashItems('impact');
  const tpm=parseInt(m.trees_per_million)||320;
  // Interactive donut segments
  let offset=25;
  const donutSegs=alloc.map((a,i)=>{
    const pct=parseFloat(a.val1)||0;
    const seg='<circle class="adb-slice" cx="21" cy="21" r="15.915" fill="none" stroke="'+esc(a.val2||'#2D6A4F')+'" stroke-width="6" stroke-dasharray="'+pct+' '+(100-pct)+'" stroke-dashoffset="'+offset+'" onclick="dashDetail(\'allocation\','+i+')"></circle>';
    offset-=pct;return seg;
  }).join('');
  const adminItem=alloc.find(a=>/admin/i.test(a.label));
  const fieldPct=adminItem?Math.round(100-(parseFloat(adminItem.val1)||0)):(alloc.length?Math.round(parseFloat(alloc[0].val1)||0):0);
  const maxAmt=Math.max(1,...windows.map(w=>parseFloat(w.val1)||0));
  const bars=windows.map((w,i)=>{
    const amt2=parseFloat(w.val1)||0;
    return '<div class="adb-bar-row" onclick="dashDetail(\'window\','+i+')"><div class="adb-bt"><span>'+esc(w.label)+' <span class="adb-more">details ›</span></span><b>UGX '+esc(w.val1||'0')+'M</b></div><div class="adb-track"><div class="adb-fill" style="width:'+Math.round(amt2/maxAmt*100)+'%"></div></div></div>';
  }).join('');
  const u=currentUser;const amt=u.amount||0;const td=TIERS_DATA[u.tier]||TIERS_DATA.silver;
  // Benchmark vs average active member
  const peers=MEMBERS.filter(x=>x.role==='member'&&x.status==='active'&&(x.amount||0)>0);
  const avg=peers.length?Math.round(peers.reduce((s,x)=>s+(x.amount||0),0)/peers.length):0;
  const benchMax=Math.max(amt,avg,1);
  // Goal
  const goal=parseInt(m.annual_goal)||0;const raised=parseInt(m.goal_raised)||0;
  const goalPct=goal?Math.min(100,Math.round(raised/goal*100)):0;
  const fmtM=v=>'UGX '+(Math.round(v/1e5)/10).toLocaleString()+'M';
  const eHa=Math.max(0,Math.round((amt/1e6*tpm)/40));const eProj=Math.max(1,Math.round(amt/500000));const eTrees=Math.round(amt/1e6*tpm);
  el.innerHTML=
    '<div class="adb-head"><div class="adb-head-l"><div class="adb-logos"><img src="ubf-logo.png" alt="UBF"/><span class="adb-logo-div"></span><img src="fob-logo.png" alt="FoB"/></div>'+
      '<div><div class="adb-title">Accountability Dashboard</div>'+(m.intro_note?'<div class="adb-sub">'+esc(m.intro_note)+'</div>':'')+'</div></div>'+
      '<div class="adb-badges"><span class="adb-badge">✔ Independently Audited</span>'+(m.updated_label?'<span class="adb-badge gold">'+esc(m.updated_label)+'</span>':'')+'</div></div>'+
    (goal?'<div class="adb-goal"><div class="adb-goal-top"><span>'+esc(m.goal_label||'Annual Goal')+'</span><b>'+fmtM(raised)+' of '+fmtM(goal)+' · '+goalPct+'%</b></div><div class="adb-goal-track"><div class="adb-goal-fill" style="width:'+goalPct+'%"></div></div></div>':'')+
    (kpis.length?'<div class="adb-kpis">'+kpis.map(k=>'<div class="adb-kpi"><div class="adb-kpi-lbl">'+esc(k.label)+'</div><div class="adb-kpi-val">'+esc(k.val1||'—')+'</div>'+(k.val2?'<div class="adb-kpi-delta">'+esc(k.val2)+'</div>':'')+'</div>').join('')+'</div>':'')+
    '<div class="adb-row2">'+
      (alloc.length?'<div class="adb-card"><h4>Where Contributions Go</h4><div class="adb-cardsub">Tap a slice to examine it</div><div class="adb-donut-wrap"><svg width="132" height="132" viewBox="0 0 42 42"><circle cx="21" cy="21" r="15.915" fill="none" stroke="#eef2ee" stroke-width="6"></circle>'+donutSegs+'<text x="21" y="20.5" text-anchor="middle" font-size="6" font-weight="800" fill="#1B4332">'+fieldPct+'%</text><text x="21" y="25.5" text-anchor="middle" font-size="2.5" fill="#6b7a72">to the field</text></svg>'+
        '<div class="adb-legend">'+alloc.map((a,i)=>'<div onclick="dashDetail(\'allocation\','+i+')" style="cursor:pointer"><span class="adb-dot" style="background:'+esc(a.val2||'#2D6A4F')+'"></span>'+esc(a.label)+'<span class="adb-pct">'+esc(a.val1||'0')+'%</span></div>').join('')+'</div></div></div>':'')+
      (windows.length?'<div class="adb-card"><h4>Spend by Programme Window</h4><div class="adb-cardsub">Tap a bar to examine it</div><div class="adb-bars">'+bars+'</div></div>':'')+
    '</div>'+
    '<div id="adb-detail" class="adb-detail"><span class="adb-detail-hint">🔍 Tap any chart segment above to see exactly what it funds.</span></div>'+
    '<div class="adb-card adb-sim-card"><h4>🌱 Impact Simulator</h4><div class="adb-cardsub">Move the slider to explore how any contribution turns into conservation impact.</div>'+
      '<div class="adb-sim-amt" id="adb-sim-amt">UGX '+amt.toLocaleString()+'</div>'+
      '<input type="range" id="adb-sim" class="adb-slider" min="0" max="10000000" step="250000" value="'+amt+'" oninput="dashSim(this.value)"/>'+
      '<div class="adb-sim-tier">Membership tier at this level: <b id="adb-sim-tier">'+_tierFromAmount(amt)+'</b></div>'+
      '<div class="adb-sim-out"><div class="adb-sim-cell"><div class="adb-sim-n" id="adb-sim-trees">0</div><div class="adb-sim-l">indigenous trees</div></div><div class="adb-sim-cell"><div class="adb-sim-n" id="adb-sim-ha">0</div><div class="adb-sim-l">hectares restored</div></div><div class="adb-sim-cell"><div class="adb-sim-n" id="adb-sim-proj">0</div><div class="adb-sim-l">community projects</div></div></div></div>'+
    '<div class="adb-row3">'+
      '<div class="adb-card adb-you"><h4>Your Contribution &amp; Impact</h4><div class="adb-you-big">'+(amt?'UGX '+amt.toLocaleString():'—')+'</div><div class="adb-you-meta">'+esc(td.label)+' tier · '+esc(String(u.year||''))+'</div>'+
        (amt?'<div class="adb-you-line">Your contribution restored an estimated <b>'+eHa+' hectare'+(eHa===1?'':'s')+'</b> and supported <b>'+eProj+' community project'+(eProj===1?'':'s')+'</b>.</div><span class="adb-chip">🌿 ≈ '+eTrees.toLocaleString()+' indigenous trees</span>':'<div class="adb-you-line">Your impact appears once your contribution is recorded.</div>')+
        '<button class="adb-dl" onclick="openImpactStatement()">📜 My impact statement</button></div>'+
      '<div class="adb-card"><h4>You vs the Community</h4><div class="adb-cardsub">How your giving compares</div><div class="adb-bench">'+
        '<div class="adb-bench-row"><span>You</span><div class="adb-bench-track"><div class="adb-bench-fill you" style="width:'+Math.round(amt/benchMax*100)+'%"></div></div><b>'+(amt?fmtM(amt):'—')+'</b></div>'+
        '<div class="adb-bench-row"><span>Avg member</span><div class="adb-bench-track"><div class="adb-bench-fill" style="width:'+Math.round(avg/benchMax*100)+'%"></div></div><b>'+(avg?fmtM(avg):'—')+'</b></div></div>'+
        (amt&&avg?'<div class="adb-bench-note">'+(amt>=avg?'You contribute <b>'+Math.round((amt/avg-1)*100)+'% above</b> the average member — thank you for leading. 🌟':'You’re building momentum — every shilling moves conservation forward.')+'</div>':'')+
      '</div></div>'+
    (impact.length?'<div class="adb-card"><h4 style="margin-bottom:.75rem">Collective Impact</h4><div class="adb-impact">'+impact.map(i=>'<div class="adb-imp"><div class="adb-imp-n">'+esc(i.val1||'—')+'</div><div class="adb-imp-l">'+esc(i.label)+'</div></div>').join('')+'</div></div>':'')+
    '<div class="adb-foot"><span>Source: UBF audited accounts &amp; M&amp;E field reports</span>'+(m.source_url?'<a href="'+esc(m.source_url)+'" target="_blank" rel="noopener">⬇ View audited reports →</a>':'')+'</div>';
  dashSim(amt);
}
function _tierFromAmount(a){a=parseInt(a)||0;if(a>=5000000)return'Diamond';if(a>=2500000)return'Platinum';if(a>=1500000)return'Gold';if(a>=500000)return'Silver';if(a>0)return'Student / In-kind';return'—';}
function dashSim(val){
  const v=parseInt(val)||0;const tpm=parseInt((DASH_META||{}).trees_per_million)||320;
  const trees=Math.round(v/1e6*tpm);const ha=Math.max(0,Math.round(trees/40));const proj=Math.max(0,Math.round(v/500000));
  const set=(id,t)=>{const e=document.getElementById(id);if(e)e.textContent=t;};
  set('adb-sim-amt','UGX '+v.toLocaleString());set('adb-sim-trees',trees.toLocaleString());set('adb-sim-ha',ha.toLocaleString());set('adb-sim-proj',proj.toLocaleString());set('adb-sim-tier',_tierFromAmount(v));
}
function dashDetail(section,i){
  const items=_dashItems(section);const it=items[i];if(!it)return;
  const el=document.getElementById('adb-detail');if(!el)return;
  const unit=section==='window'?'UGX '+esc(it.val1||'0')+'M':(esc(it.val1||'')+'%');
  const color=section==='allocation'?esc(it.val2||'#2D6A4F'):'var(--canopy-lt)';
  el.classList.add('show');
  el.innerHTML='<div class="adb-detail-head"><span class="adb-detail-dot" style="background:'+color+'"></span><b>'+esc(it.label)+'</b><span class="adb-detail-val">'+unit+'</span></div>'+(it.detail?'<p>'+esc(it.detail)+'</p>':'<p class="adb-detail-hint">No further detail provided yet.</p>');
}
const CERT_SIGN_SVG='<img class="sig-img" src="ed-signature.png" alt="Executive Director signature" onload="if(this.naturalHeight>this.naturalWidth*1.2)this.classList.add(\'sig-rot\')" onerror="if(!this.dataset.alt){this.dataset.alt=1;this.src=\'edsignature.png\'}else{this.style.display=\'none\'}"/>';
const CONSERV_BADGE_SVG='<svg viewBox="0 0 120 120" width="86" height="86"><defs><path id="isArc" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"/></defs><circle cx="60" cy="60" r="57" fill="none" stroke="#C8A84B" stroke-width="1.5"/><circle cx="60" cy="60" r="46" fill="none" stroke="#C8A84B" stroke-width="2.5" opacity=".45"/><circle cx="60" cy="60" r="31" fill="rgba(200,168,75,.10)" stroke="#C8A84B" stroke-width="1"/><text fill="#E9D9A8" font-size="7.6" font-weight="700" letter-spacing="1.2"><textPath href="#isArc" startOffset="0">FRIENDS OF BIODIVERSITY ★ CONSERVATION SUPPORTER ★ </textPath></text><path d="M60 79V65" stroke="#C8A84B" stroke-width="1.5"/><path d="M60 44 66.5 55.5h-13z" fill="none" stroke="#C8A84B" stroke-width="1.5" stroke-linejoin="round"/><path d="M60 51 67 63.5H53z" fill="none" stroke="#C8A84B" stroke-width="1.5" stroke-linejoin="round"/><text x="60" y="95" text-anchor="middle" fill="#E9D9A8" font-size="7.5" font-weight="800" letter-spacing="1.4">CERTIFIED</text></svg>';
function openImpactStatement(){renderImpactStatement();openModal('m-impact');}

/* ═══ TRUE PDF DOWNLOAD — renders the card and saves a real .pdf file ═══ */
function _loadSigForPdf(node){
  const sig=node.querySelector('.sig-img');
  if(!sig||sig.style.display==='none'||!sig.src)return Promise.resolve(null);
  return new Promise(res=>{
    const im=new Image();
    im.onload=()=>res({im,rot:sig.classList.contains('sig-rot')});
    im.onerror=()=>res(null);
    im.src=sig.currentSrc||sig.src;
  });
}
async function downloadPdf(elId,baseName){
  const node=document.getElementById(elId);
  if(!node)return;
  if(typeof html2canvas==='undefined'||!window.jspdf){
    toast('⚠ PDF engine not loaded — opening the print dialog instead (choose "Save as PDF").');
    setTimeout(()=>window.print(),400);
    return;
  }
  toast('⬇ Preparing your PDF…');
  try{
    const sig=await _loadSigForPdf(node);
    const canvas=await html2canvas(node,{scale:2,useCORS:true,backgroundColor:null,onclone:doc=>{
      // The PDF renderer ignores CSS filters/rotation on the signature — redraw it as white ink
      doc.querySelectorAll('.sig-img').forEach(img=>{
        if(!sig){img.style.display='none';return}
        const W=170,H=46;
        const c=doc.createElement('canvas');
        c.width=W*2;c.height=H*2;c.style.width=W+'px';c.style.height=H+'px';c.style.display='block';
        const x=c.getContext('2d');x.scale(2,2);
        const iw=sig.im.naturalWidth,ih=sig.im.naturalHeight;
        if(sig.rot){
          x.save();x.translate(W/2,H/2);x.rotate(Math.PI/2);
          const s=Math.min(H/iw,W/ih);
          x.drawImage(sig.im,-iw*s/2,-ih*s/2,iw*s,ih*s);x.restore();
        }else{
          const s=Math.min(W/iw,H/ih);
          x.drawImage(sig.im,0,(H-ih*s)/2,iw*s,ih*s);
        }
        x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,W,H);
        img.parentNode.replaceChild(c,img);
      });
    }});
    const{jsPDF}=window.jspdf;
    const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    const pw=210,ph=297,margin=14;
    let w=pw-margin*2,h=w*canvas.height/canvas.width;
    if(h>ph-margin*2){h=ph-margin*2;w=h*canvas.width/canvas.height;}
    pdf.addImage(canvas.toDataURL('image/png'),'PNG',(pw-w)/2,Math.max(margin,(ph-h)/2),w,h);
    pdf.save(baseName+'.pdf');
    toast('✅ PDF downloaded — check your Downloads folder.');
  }catch(e){
    console.error('pdf',e);
    toast('⚠ Could not generate the PDF — opening the print dialog instead.');
    setTimeout(()=>window.print(),400);
  }
}
function renderImpactStatement(){
  const el=document.getElementById('impact-card');if(!el||!currentUser)return;
  const u=currentUser;const amt=u.amount||0;const tpm=parseInt((DASH_META||{}).trees_per_million)||320;
  const trees=Math.round(amt/1e6*tpm);const ha=Math.max(0,Math.round(trees/40));const proj=Math.max(1,Math.round(amt/500000));
  const td=TIERS_DATA[u.tier]||TIERS_DATA.silver;
  el.innerHTML=
    '<div class="is-logos"><img src="ubf-logo.png" alt="UBF"/><span class="is-div"></span><img src="fob-logo.png" alt="FoB"/></div>'+
    '<div class="is-kicker">Uganda Biodiversity Fund · Friends of Biodiversity</div>'+
    '<h2 class="is-title">Personal Impact Statement</h2>'+
    '<div class="is-name">'+esc(u.name)+'</div>'+
    '<div class="is-tier">'+esc(td.label)+' Member · '+esc(String(u.year||''))+'</div>'+
    '<div class="is-contrib">Contribution: <b>UGX '+amt.toLocaleString()+'</b></div>'+
    '<div class="is-metrics"><div><div class="is-n">'+trees.toLocaleString()+'</div><div class="is-l">Trees</div></div><div><div class="is-n">'+ha+'</div><div class="is-l">Hectares</div></div><div><div class="is-n">'+proj+'</div><div class="is-l">Projects</div></div></div>'+
    '<p class="is-thanks">In recognition of your commitment to protecting Uganda\'s biodiversity — for now &amp; the future.</p>'+
    '<div class="is-foot"><div class="is-sign">'+CERT_SIGN_SVG+'<div class="is-sign-line"></div><div class="is-sign-name">Dr. Ivan Amanigaruhanga</div><div class="is-sign-title">Executive Director</div></div>'+
      '<div class="is-stamp"><img class="cert-stamp-img" src="stamp.png" alt="Official stamp" onerror="this.style.display=\'none\';var b=document.getElementById(\'is-badge-fb\');if(b)b.style.display=\'\'"/>'+
        '<div class="is-badge" id="is-badge-fb" style="display:none">'+CONSERV_BADGE_SVG+'</div></div>'+
      '<div class="cert-qr" id="is-qr"><span class="cert-qr-label">To verify</span>'+
        '<img class="cert-qr-img" src="qr-code.png" alt="Verification QR code" onerror="if(!this.dataset.alt){this.dataset.alt=1;this.src=\'qrcode.png\'}else{var q=document.getElementById(\'is-qr\');if(q)q.style.display=\'none\'}"/></div>'+
    '</div>'+
    '<div class="is-date">Issued: '+new Date().toLocaleDateString('en-GB',{year:'numeric',month:'long',day:'numeric'})+'</div>';
}
function downloadImpactStatement(){
  if(!currentUser)return;const u=currentUser;const amt=u.amount||0;const tpm=parseInt((DASH_META||{}).trees_per_million)||320;
  const trees=Math.round(amt/1e6*tpm);const ha=Math.max(0,Math.round(trees/40));const proj=Math.max(1,Math.round(amt/500000));const td=TIERS_DATA[u.tier]||TIERS_DATA.silver;
  const lines=['UGANDA BIODIVERSITY FUND — FRIENDS OF BIODIVERSITY','PERSONAL IMPACT STATEMENT','',(u.name||'').toUpperCase(),td.label+' Member · '+(u.year||''),'','Your contribution: UGX '+amt.toLocaleString(),'','Estimated impact you enabled:','  • ~'+trees.toLocaleString()+' indigenous trees','  • ~'+ha+' hectares restored','  • '+proj+' community project(s) supported','','Thank you for demonstrating care for Uganda\'s biodiversity.','For now & the future.','','Issued: '+new Date().toLocaleDateString('en-GB',{year:'numeric',month:'long',day:'numeric'})];
  const blob=new Blob([lines.join('\n')],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='UBF-Impact-Statement-'+(u.name||'member').replace(/\s+/g,'-')+'.txt';a.click();
  toast('⬇ Impact statement downloaded.');
}

/* ═══ DISCOVER MEMBERS DIRECTORY — search & follow members/institutions ═══ */
let _memberDirQuery='';
let MY_FOLLOWERS=new Set();  // ids of members who follow the current user
let _dirTab='suggested';     // suggested | following | followers
async function populateMembersDirectory(){
  const el=document.getElementById('members-directory');
  if(!el||!currentUser)return;
  // Who I follow, and who follows me (for the Following / Followers tabs)
  const[a,b]=await Promise.all([
    sb.from('follows').select('following_id').eq('follower_id',currentUser.id),
    sb.from('follows').select('follower_id').eq('following_id',currentUser.id)
  ]);
  MY_FOLLOWING=new Set(((a&&a.data)||[]).map(f=>f.following_id));
  MY_FOLLOWERS=new Set(((b&&b.data)||[]).map(f=>f.follower_id));
  _memberDirQuery='';
  renderMemberDir('');
}
function setDirTab(t){_dirTab=t;const i=document.getElementById('member-search');renderMemberDir(i?i.value:'');}
function _memberCardHtml(m){
  const td=TIERS_DATA[m.tier]||TIERS_DATA.silver;
  const initials=esc((m.name||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase());
  const following=MY_FOLLOWING.has(m.id);
  const safeName=esc(m.name).replace(/'/g,'');
  const sub=esc(td.label)+(m.org?' · '+esc(m.org):'')+' · '+(m.followers_count||0)+' follower'+((m.followers_count||0)===1?'':'s');
  // Follow-back styling for followers you don't yet follow
  const backable=!following&&_dirTab==='followers';
  const followCls=following?'btn-ghost':(backable?'btn-gold':'btn-canopy');
  const followTxt=following?'✓ Following':(backable?'+ Follow back':'+ Follow');
  return '<div class="mdir-card">'+
    '<div class="mdir-top" onclick="viewMemberProfile(\''+m.id+'\')">'+
      (m.photo_url?'<img src="'+esc(m.photo_url)+'" class="mdir-av" alt=""/>':'<div class="mdir-av mdir-av-init">'+initials+'</div>')+
      '<div class="mdir-meta">'+
        '<div class="mdir-name">'+esc(m.name)+'</div>'+
        '<div class="mdir-tier">'+sub+'</div>'+
      '</div>'+
    '</div>'+
    '<div class="mdir-actions">'+
      '<button class="mdir-msg" onclick="openChat(\''+m.id+'\')" title="Message" aria-label="Message">✉</button>'+
      '<button id="dfollow-'+m.id+'" class="btn '+followCls+' btn-sm mdir-follow" onclick="dirToggleFollow(\''+m.id+'\',\''+safeName+'\')">'+followTxt+'</button>'+
    '</div>'+
  '</div>';
}
function renderMemberDir(query){
  const el=document.getElementById('members-directory');
  if(!el||!currentUser)return;
  const q=(query||'').trim().toLowerCase();
  const base=MEMBERS.filter(m=>m.id!==currentUser.id&&m.role==='member'&&m.status==='active');
  // Tab bar with live counts
  const seg=(t,label)=>'<button class="mdir-seg'+(_dirTab===t?' on':'')+'" onclick="setDirTab(\''+t+'\')"><b>'+label+'</b><span>'+(t==='following'?MY_FOLLOWING.size:t==='followers'?MY_FOLLOWERS.size:'for you')+'</span></button>';
  const tabs='<div class="mdir-segs">'+seg('suggested','Suggested')+seg('following','Following')+seg('followers','Followers')+'</div>';
  // Pick the list for the active tab
  let list;
  if(_dirTab==='following')list=base.filter(m=>MY_FOLLOWING.has(m.id));
  else if(_dirTab==='followers')list=base.filter(m=>MY_FOLLOWERS.has(m.id));
  else list=base.filter(m=>!MY_FOLLOWING.has(m.id)); // suggested = not-yet-followed
  if(q)list=list.filter(m=>(m.name||'').toLowerCase().includes(q)||(m.org||'').toLowerCase().includes(q));
  list.sort((x,y)=>(y.followers_count||0)-(x.followers_count||0));
  const shown=(_dirTab==='suggested'&&!q)?list.slice(0,6):list.slice(0,50);
  let hint,body;
  if(!list.length){
    const empty=q?'No members or institutions match “'+esc(query.trim())+'”.'
      :_dirTab==='following'?'You’re not following anyone yet — tap Suggested to find members.'
      :_dirTab==='followers'?'No followers yet — share your posts to grow your circle.'
      :'No other members yet — check back as the community grows.';
    hint='';body='<p style="font-size:.85rem;color:var(--muted);margin-top:.4rem">'+empty+'</p>';
  }else{
    const label=q?list.length+' result'+(list.length===1?'':'s')
      :_dirTab==='following'?'You follow '+MY_FOLLOWING.size+' member'+(MY_FOLLOWING.size===1?'':'s')
      :_dirTab==='followers'?MY_FOLLOWERS.size+' member'+(MY_FOLLOWERS.size===1?'':'s')+' follow you'
      :'Most-followed members'+(list.length>shown.length?' · search to see all '+list.length:'');
    hint='<div class="mdir-hint">'+label+'</div>';body=shown.map(_memberCardHtml).join('');
  }
  el.innerHTML=tabs+hint+body;
}
function searchMembers(val){_memberDirQuery=val;renderMemberDir(val);}

async function dirToggleFollow(id,name){
  if(!currentUser){toast('Sign in to follow members.');return}
  if(id===currentUser.id)return;
  const btn=document.getElementById('dfollow-'+id);
  const following=MY_FOLLOWING.has(id);
  const cur=(MEMBERS.find(m=>m.id===id)||{}).followers_count||0;
  if(following){
    await sb.from('follows').delete().eq('follower_id',currentUser.id).eq('following_id',id);
    await sb.from('members').update({followers_count:Math.max(0,cur-1)}).eq('id',id);
    MY_FOLLOWING.delete(id);
    if(btn){btn.textContent='+ Follow';btn.className='btn btn-canopy btn-sm mdir-follow';}
    toast('Unfollowed '+name);
  }else{
    const{error}=await sb.from('follows').insert({follower_id:currentUser.id,following_id:id});
    if(error&&error.code!=='23505'){toast('⚠ Could not follow.');return}
    if(!error)await sb.from('members').update({followers_count:cur+1}).eq('id',id);
    MY_FOLLOWING.add(id);
    if(btn){btn.textContent='✓ Following';btn.className='btn btn-ghost btn-sm mdir-follow';}
    toast('Now following '+name+'!');
  }
  await loadMembers();
  const inp=document.getElementById('member-search');
  renderMemberDir(inp?inp.value:_memberDirQuery);
}

/* ═══ CERTIFICATE ═══ */
/* ═══ CHANGE PASSWORD — works for both admins and members ═══ */
/* ═══ PROFILE — EDIT, WALLPAPER, BIO, FOLLOW ═══ */

let epPhotoFile=null;let epWallpaperFile=null;let _epInterests=new Set();
function toggleEpInterest(btn){const v=btn.dataset.int;if(_epInterests.has(v)){_epInterests.delete(v);btn.classList.remove('on');}else{_epInterests.add(v);btn.classList.add('on');}}

function openEditProfile(){
  if(!currentUser)return;
  const u=currentUser;
  // Set previews
  const photoPrev=document.getElementById('ep-photo-prev');
  if(photoPrev){
    photoPrev.innerHTML=u.photo_url
      ?'<img src="'+u.photo_url+'" style="width:60px;height:60px;object-fit:cover"/>'
      :(u.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase());
  }
  const wallPrev=document.getElementById('ep-wallpaper-prev');
  if(wallPrev&&u.wallpaper_url){
    // Strip old timestamp and add fresh one to force browser reload
    const baseUrl=u.wallpaper_url.split('?')[0];
    wallPrev.style.backgroundImage='url(\''+baseUrl+'?t='+Date.now()+'\')';
    wallPrev.style.backgroundSize='cover';
    wallPrev.style.backgroundPosition='center';
  }
  const bioEl=document.getElementById('ep-bio');
  if(bioEl)bioEl.value=u.bio||'';
  const bioCount=document.getElementById('ep-bio-count');
  if(bioCount)bioCount.textContent=(u.bio||'').length+' / 160';
  // Bio live count
  if(bioEl)bioEl.oninput=()=>{if(bioCount)bioCount.textContent=bioEl.value.length+' / 160';};
  // Conservation interests
  _epInterests=new Set(Array.isArray(u.engage_prefs)?u.engage_prefs:[]);
  const ic=document.getElementById('ep-interests');
  if(ic)ic.innerHTML=WIZ_INTERESTS.map(function(x){return '<button type="button" class="int-chip'+(_epInterests.has(x[1])?' on':'')+'" data-int="'+x[1]+'" onclick="toggleEpInterest(this)">'+x[0]+' '+x[1]+'</button>';}).join('');
  epPhotoFile=null;epWallpaperFile=null;
  openModal('m-edit-profile');
}

function previewEPPhoto(e){
  const f=e.target.files[0];if(!f)return;
  epPhotoFile=f;
  const reader=new FileReader();
  reader.onload=ev=>{
    const prev=document.getElementById('ep-photo-prev');
    if(prev)prev.innerHTML='<img src="'+ev.target.result+'" style="width:60px;height:60px;object-fit:cover;border-radius:50%"/>';
  };
  reader.readAsDataURL(f);
}

function previewEPWallpaper(e){
  const f=e.target.files[0];if(!f)return;
  epWallpaperFile=f;
  const reader=new FileReader();
  reader.onload=ev=>{
    const prev=document.getElementById('ep-wallpaper-prev');
    if(prev){prev.style.backgroundImage='url(\''+ev.target.result+'\')';prev.style.backgroundSize='cover';prev.style.backgroundPosition='center';}
  };
  reader.readAsDataURL(f);
}

async function saveProfile(){
  if(!currentUser)return;
  toast('⬆ Saving profile...');
  const updates={};

  // Upload photo if changed — UNIQUE path each time so the CDN can never serve a stale cached image
  if(epPhotoFile){
    const ext=(epPhotoFile.type.split('/')[1]||'jpg').replace('jpeg','jpg');
    const path='profiles/photo_'+currentUser.id+'_'+Date.now()+'.'+ext;
    const{error}=await sb.storage.from('fame-photos').upload(path,epPhotoFile,{contentType:epPhotoFile.type});
    if(!error){
      const{data}=sb.storage.from('fame-photos').getPublicUrl(path);
      updates.photo_url=data.publicUrl;
    }else{console.error('photo upload',error);toast('⚠ Photo upload failed: '+(error.message||'try a smaller image'));return}
  }

  // Upload wallpaper if changed — UNIQUE path each time (fixes "saved but nothing changes" CDN caching)
  if(epWallpaperFile){
    const ext=(epWallpaperFile.type.split('/')[1]||'jpg').replace('jpeg','jpg');
    const path='profiles/wall_'+currentUser.id+'_'+Date.now()+'.'+ext;
    const{error}=await sb.storage.from('fame-photos').upload(path,epWallpaperFile,{contentType:epWallpaperFile.type});
    if(!error){
      const{data}=sb.storage.from('fame-photos').getPublicUrl(path);
      updates.wallpaper_url=data.publicUrl;
    }else{console.error('wallpaper upload',error);toast('⚠ Wallpaper upload failed: '+(error.message||'try a smaller image'));return}
  }

  // Bio
  const bioEl=document.getElementById('ep-bio');
  if(bioEl)updates.bio=bioEl.value.trim().slice(0,160);

  // Conservation interests (only if changed)
  const newPrefs=Array.from(_epInterests);
  const oldPrefs=Array.isArray(currentUser.engage_prefs)?currentUser.engage_prefs:[];
  if(newPrefs.slice().sort().join('|')!==oldPrefs.slice().sort().join('|'))updates.engage_prefs=newPrefs;

  if(Object.keys(updates).length===0){closeModal('m-edit-profile');toast('No changes to save.');return}

  const{error}=await sb.from('members').update(updates).eq('id',currentUser.id);
  if(error){toast('⚠ Could not save profile. Check your connection.');console.error(error);return}

  // Update in-memory currentUser and MEMBERS list
  Object.assign(currentUser,updates);
  const idx=MEMBERS.findIndex(m=>m.id===currentUser.id);
  if(idx!==-1)Object.assign(MEMBERS[idx],updates);

  epPhotoFile=null;epWallpaperFile=null;
  closeModal('m-edit-profile');
  renderMemberView();
  renderPosts();// refresh post avatars
  toast('✅ Profile saved!');
}

/* ── VIEW ANY MEMBER'S PROFILE ── */
async function viewMemberProfile(memberId){
  const m=MEMBERS.find(x=>x.id===memberId);
  if(!m)return;
  const td=TIERS_DATA[m.tier]||TIERS_DATA.silver;
  const initials=(m.name||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const safeName=(m.name||'').replace(/'/g,'');

  // Check if current user follows this member
  let isFollowing=false;
  if(currentUser&&currentUser.id!==memberId){
    const{data}=await sb.from('follows').select('id').eq('follower_id',currentUser.id).eq('following_id',memberId).single();
    isFollowing=!!data;
  }

  // Get this member's posts
  const memberPosts=POSTS.filter(p=>p.author_id===memberId);

  const body=document.getElementById('profile-modal-body');
  body.innerHTML=
    // Wallpaper
    '<div style="height:140px;'+(m.wallpaper_url?'background-image:url(\''+m.wallpaper_url+'\');background-size:cover;background-position:center':'background:linear-gradient(135deg,#0B2618 0%,#2D6A4F 60%,#C8A84B 100%)')+';position:relative">'+
    '</div>'+
    // Avatar
    '<div style="padding:0 1.25rem;position:relative;margin-top:-40px;display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:.75rem">'+
      '<div style="width:80px;height:80px;border-radius:50%;border:4px solid #fff;overflow:hidden;background:linear-gradient(135deg,var(--canopy),var(--canopy-lt));display:flex;align-items:center;justify-content:center;font-family:var(--ff-d);font-size:1.6rem;font-weight:700;color:var(--gold);flex-shrink:0">'+
        (m.photo_url?'<img src="'+m.photo_url+'" style="width:100%;height:100%;object-fit:cover"/>':initials)+
      '</div>'+
      (currentUser&&currentUser.id!==memberId?
        '<div style="display:flex;gap:.4rem">'+
        '<button class="btn btn-gold btn-sm" onclick="openChat(\''+memberId+'\')">✉ Message</button>'+
        '<button id="follow-btn-'+memberId+'" class="btn '+(isFollowing?'btn-ghost':'btn-canopy')+' btn-sm" onclick="toggleFollow(\''+memberId+'\',\''+safeName+'\')">'+
          (isFollowing?'✓ Following':'+ Follow')+
        '</button></div>'
      :'')+
    '</div>'+
    // Info
    '<div style="padding:0 1.25rem 1.25rem">'+
      '<div style="font-family:var(--ff-d);font-size:1.25rem;font-weight:700;color:var(--canopy)">'+esc(m.name)+'</div>'+
      '<div style="font-size:.8rem;color:var(--muted);margin-top:.2rem">'+td.emoji+' '+esc(td.label)+' Member'+(m.org?' · '+esc(m.org):'')+(m.year?' · Member since '+esc(String(m.year)):'')+'</div>'+
      '<p style="font-size:.86rem;margin-top:.65rem;line-height:1.65;'+(m.bio?'color:var(--text)':'color:var(--muted);font-style:italic')+'">'+(m.bio?esc(m.bio):'This member hasn’t added a bio yet.')+'</p>'+
      '<div style="display:flex;gap:1.25rem;margin-top:.75rem;font-size:.82rem">'+
        '<span><strong>'+(m.followers_count||0)+'</strong> <span style="color:var(--muted)">follower'+((m.followers_count||0)===1?'':'s')+'</span></span>'+
        '<span><strong>'+memberPosts.length+'</strong> <span style="color:var(--muted)">post'+(memberPosts.length===1?'':'s')+'</span></span>'+
      '</div>'+
      // Contributions
      '<div style="margin-top:1.1rem;padding-top:1rem;border-top:1px solid var(--border)">'+
        '<div style="font-weight:700;font-size:.82rem;color:var(--canopy);margin-bottom:.6rem">Contributions</div>'+
        (memberPosts.length?
          memberPosts.slice(0,5).map(p=>{
            const media=p.image_url?'📷 Photo':p.video_url?'🎬 Video':p.doc_url?('📄 '+esc(p.doc_name||'Document')):'';
            const date=(p.created_at||'').slice(0,10);
            const text=p.body?esc(p.body.slice(0,180))+(p.body.length>180?'…':''):'';
            return '<div style="padding:.65rem .75rem;background:var(--mist);border-radius:10px;margin-bottom:.5rem;font-size:.83rem;color:var(--text);line-height:1.6">'+
              (text?'<div>'+text+'</div>':'')+
              ((media||date)?'<div style="display:flex;gap:.75rem;margin-top:'+(text?'.4rem':'0')+';font-size:.72rem;color:var(--muted)">'+(media?'<span>'+media+'</span>':'')+(date?'<span>'+date+'</span>':'')+'</div>':'')+
            '</div>';
          }).join('')
          :'<p style="font-size:.83rem;color:var(--muted);font-style:italic">No posts yet — this member hasn’t shared any contributions.</p>')+
      '</div>'+
    '</div>';

  openModal('m-member-profile');
}

/* ── FOLLOW / UNFOLLOW ── */
async function toggleFollow(memberId,memberName){
  if(!currentUser){toast('Sign in to follow members.');openModal('m-login');return}
  if(currentUser.id===memberId)return;
  const btn=document.getElementById('follow-btn-'+memberId);
  const isFollowing=btn&&btn.textContent.includes('Following');

  if(isFollowing){
    await sb.from('follows').delete().eq('follower_id',currentUser.id).eq('following_id',memberId);
    await sb.from('members').update({followers_count:Math.max(0,((MEMBERS.find(m=>m.id===memberId)||{}).followers_count||1)-1)}).eq('id',memberId);
    if(btn){btn.textContent='+ Follow';btn.className='btn btn-canopy btn-sm';}
    toast('Unfollowed '+memberName);
  }else{
    const{error}=await sb.from('follows').insert({follower_id:currentUser.id,following_id:memberId});
    if(error&&error.code==='23505'){toast('Already following '+memberName);return}
    if(error){toast('⚠ Could not follow.');return}
    await sb.from('members').update({followers_count:((MEMBERS.find(m=>m.id===memberId)||{}).followers_count||0)+1}).eq('id',memberId);
    if(btn){btn.textContent='✓ Following';btn.className='btn btn-ghost btn-sm';}
    toast('Now following '+memberName+'!');
  }
  await loadMembers();
}

/* ═══ PROFILE PHOTO UPLOAD ═══ */
async function uploadProfilePhoto(e){
  const f=e.target.files[0];if(!f||!currentUser)return;
  toast('⬆ Uploading profile photo...');
  const path='profiles/'+currentUser.id+'_'+Date.now()+'.'+f.name.split('.').pop().toLowerCase();
  const{error:upErr}=await sb.storage.from('fame-photos').upload(path,f,{contentType:f.type});
  if(upErr){toast('⚠ Upload failed. Try a smaller image.');console.error(upErr);return}
  const{data}=sb.storage.from('fame-photos').getPublicUrl(path);
  const photoUrl=data.publicUrl;// unique path — no cache-bust needed
  const{error}=await sb.from('members').update({photo_url:photoUrl}).eq('id',currentUser.id);
  if(error){toast('⚠ Could not save photo.');console.error(error);return}
  currentUser.photo_url=photoUrl;
  toast('✅ Profile photo updated!');
  renderMemberView();
}

async function changePassword(){
  if(!currentUser){toast('⚠ You must be signed in.');return}
  const current=document.getElementById('cp-current').value;
  const newPass=document.getElementById('cp-new').value;
  const confirm=document.getElementById('cp-confirm').value;

  if(!current||!newPass||!confirm){toast('⚠ All three fields are required.');return}
  if(current!==currentUser.pass){toast('⚠ Current password is incorrect.');return}
  if(newPass.length<8){toast('⚠ New password must be at least 8 characters.');return}
  if(newPass!==confirm){toast('⚠ New passwords do not match.');return}
  if(newPass===current){toast('⚠ New password must be different from your current one.');return}

  const {error}=await sb.from('members').update({pass:newPass}).eq('id',currentUser.id);
  if(error){toast('⚠ Could not update password. Try again.');console.error(error);return}

  // Update local session so current user doesn't get logged out
  currentUser.pass=newPass;

  // Clear fields
  document.getElementById('cp-current').value='';
  document.getElementById('cp-new').value='';
  document.getElementById('cp-confirm').value='';

  closeModal('m-change-pass');
  toast('✅ Password updated successfully. Use your new password next time you sign in.');
}

function openCertModal(){
  if(!currentUser)return;
  const u=currentUser;const td=TIERS_DATA[u.tier]||TIERS_DATA.silver;
  document.getElementById('cert-name').textContent=u.name;
  document.getElementById('cert-desc').textContent='Is hereby recognised as a '+(u.type==='institution'?'Corporate ':'')+'Friend of Biodiversity and a committed partner in protecting Uganda\'s natural heritage.';
  document.getElementById('cert-tier-badge').textContent=td.emoji+' '+td.label+' Member';
  document.getElementById('cert-date').textContent='Year '+u.year+' · Uganda Biodiversity Fund';
  const issueEl=document.getElementById('cert-issue');
  if(issueEl)issueEl.textContent='Issued: '+new Date().toLocaleDateString('en-GB',{year:'numeric',month:'long',day:'numeric'});
  openModal('m-cert');
}
function downloadCert(){
  if(!currentUser)return;
  const u=currentUser;const td=TIERS_DATA[u.tier]||TIERS_DATA.silver;
  const content=[
    '════════════════════════════════════════════════',
    '         UGANDA BIODIVERSITY FUND               ',
    '         Friends of Biodiversity                ',
    '         CERTIFICATE OF MEMBERSHIP              ',
    '════════════════════════════════════════════════',
    '',
    'This certifies that:',
    '',
    u.name.toUpperCase(),
    (u.org?'('+u.org+')':''),
    '',
    'Is hereby recognised as a '+td.label+' Member of the',
    'Friends of Biodiversity Green Card Programme.',
    '',
    'Demonstrating care for Uganda\'s biodiversity',
    'through a commitment of UGX '+u.amount.toLocaleString()+' for '+u.year+'.',
    '',
    '────────────────────────────────────────────────',
    'Issued by: Uganda Biodiversity Fund',
    'Website:   www.ugandabiodiversityfund.org',
    'Email:     info@ugandabiodiversityfund.org',
    'Date of Issue: '+new Date().toLocaleDateString('en-GB',{year:'numeric',month:'long',day:'numeric'}),
    '',
    'Authorised & signed:',
    '',
    '_______________________________',
    'Dr. Ivan Amanigaruhanga',
    'Executive Director',
    'Uganda Biodiversity Fund',
    '════════════════════════════════════════════════',
  ].filter(Boolean).join('\n');
  const blob=new Blob([content],{type:'text/plain'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='UBF_Certificate_'+u.name.replace(/\s+/g,'_')+'_'+u.year+'.txt';
  a.click();URL.revokeObjectURL(a.href);
  toast('📜 Certificate downloaded!');
}

/* ═══ ADMIN PANEL ═══ */
function renderAdminAll(){renderAdminOverview();renderAdminMembers();renderAdminContent();renderAdminFame();renderAdminAnnounces();renderFinancials();renderEmailLog();loadPaymentAdmin();renderFootprintAdmin();renderAdminPosts();renderDashboardAdmin();renderProtectAdmin();resetProtectForm();renderAdsAdmin();resetAdForm();renderEventsAdmin();resetEventForm();renderCampaignsAdmin();resetCampForm();renderAuditLog();renderSightingsAdmin();}

/* ═══ ACCOUNTABILITY DASHBOARD — ADMIN EDITOR ═══ */
function _dashSectionName(s){return({kpi:'KPI Card',allocation:'Allocation Item',window:'Programme Window',impact:'Impact Metric'})[s]||'Item'}
function renderDashboardAdmin(){
  const el=document.getElementById('dash-admin');if(!el)return;
  const m=DASH_META||{};
  const sec=(title,key,hint)=>{
    const items=_dashItems(key);
    return '<div class="dadm-sec"><div class="dadm-sec-head"><span>'+title+'</span><button class="btn btn-canopy btn-sm" onclick="openDashItem(\''+key+'\')">+ Add</button></div>'+
      (hint?'<p style="font-size:.74rem;color:var(--muted);margin:-.3rem 0 .6rem">'+hint+'</p>':'')+
      (items.length?items.map(i=>'<div class="dadm-row"><div class="dadm-row-main"><b>'+esc(i.label)+'</b><span>'+esc(i.val1||'')+(i.val2?' · '+esc(i.val2):'')+'</span></div><div class="dadm-row-act"><button class="btn btn-ghost btn-sm" onclick="openDashItem(\''+key+'\',\''+i.id+'\')">Edit</button><button class="btn btn-danger btn-sm" onclick="deleteDashItem(\''+i.id+'\')">Delete</button></div></div>').join(''):'<p style="font-size:.8rem;color:var(--muted)">No items yet.</p>')+
    '</div>';
  };
  el.innerHTML=
    '<div class="dadm-sec"><div class="dadm-sec-head"><span>Header &amp; Settings</span></div>'+
      '<div class="fg"><label>Updated label (shown as a badge)</label><input id="dm-updated" value="'+esc(m.updated_label||'')+'"/></div>'+
      '<div class="fg"><label>Intro note</label><input id="dm-intro" value="'+esc(m.intro_note||'')+'"/></div>'+
      '<div class="fg"><label>Trees per UGX million (for each member’s personal impact estimate)</label><input id="dm-tpm" type="number" value="'+esc(String(m.trees_per_million||320))+'"/></div>'+
      '<div class="fg"><label>Goal label</label><input id="dm-goal-label" value="'+esc(m.goal_label||'')+'"/></div>'+
      '<div class="fg"><label>Annual goal (UGX)</label><input id="dm-annual-goal" type="number" value="'+esc(String(m.annual_goal||0))+'"/></div>'+
      '<div class="fg"><label>Raised so far (UGX)</label><input id="dm-goal-raised" type="number" value="'+esc(String(m.goal_raised||0))+'"/></div>'+
      '<div class="fg"><label>Audited reports link (optional)</label><input id="dm-source-url" value="'+esc(m.source_url||'')+'" placeholder="https://…"/></div>'+
      '<button class="btn btn-canopy btn-sm" onclick="saveDashMeta()">Save Settings</button>'+
    '</div>'+
    sec('KPI Cards','kpi','The four headline numbers at the top.')+
    sec('Where Contributions Go (donut)','allocation','Value = percentage (number only). Secondary = colour hex (e.g. #2D6A4F).')+
    sec('Spend by Programme Window (bars)','window','Value = amount in UGX millions (number only, e.g. 128).')+
    sec('Collective Impact','impact','Value = the figure shown (e.g. 128K, 42, 19%).');
}
function openDashItem(section,id){
  document.getElementById('dash-item-section').value=section;
  document.getElementById('dash-item-id').value=id||'';
  const item=id?DASH_ITEMS.find(i=>i.id===id):null;
  document.getElementById('dash-item-title').textContent=(id?'Edit ':'Add ')+_dashSectionName(section);
  document.getElementById('dash-item-label').value=item?item.label:'';
  document.getElementById('dash-item-val1').value=item?(item.val1||''):'';
  document.getElementById('dash-item-val2').value=item?(item.val2||''):'';
  const dt=document.getElementById('dash-item-detail');if(dt)dt.value=item?(item.detail||''):'';
  document.getElementById('dash-item-sort').value=item?(item.sort||0):(_dashItems(section).length+1);
  const v1=document.getElementById('dash-item-val1-lbl');
  const v2fg=document.getElementById('dash-item-val2-fg');
  const v2=document.getElementById('dash-item-val2-lbl');
  if(section==='kpi'){v1.textContent='Value (e.g. UGX 412M)';v2.textContent='Trend (e.g. ▲ 18% vs 2025)';v2fg.style.display='';}
  else if(section==='allocation'){v1.textContent='Percentage — number only (e.g. 74)';v2.textContent='Colour — hex (e.g. #2D6A4F)';v2fg.style.display='';}
  else if(section==='window'){v1.textContent='Amount in UGX millions — number only (e.g. 128)';v2fg.style.display='none';}
  else{v1.textContent='Value (e.g. 128K)';v2fg.style.display='none';}
  openModal('m-dash-item');
}
async function saveDashItem(){
  const id=document.getElementById('dash-item-id').value;
  const section=document.getElementById('dash-item-section').value;
  const label=document.getElementById('dash-item-label').value.trim();
  if(!label){toast('⚠ Enter a label.');return}
  const row={section,label,
    val1:document.getElementById('dash-item-val1').value.trim(),
    val2:document.getElementById('dash-item-val2').value.trim(),
    detail:(document.getElementById('dash-item-detail')?document.getElementById('dash-item-detail').value.trim():''),
    sort:parseInt(document.getElementById('dash-item-sort').value)||0};
  let res;
  if(id)res=await sb.from('dashboard_items').update(row).eq('id',id);
  else res=await sb.from('dashboard_items').insert(row);
  if(res.error){toast('⚠ Could not save.');console.error(res.error);return}
  closeModal('m-dash-item');
  await loadDashboard();renderDashboardAdmin();renderAccountabilityDashboard();
  toast('✅ Dashboard updated.');
}
async function deleteDashItem(id){
  if(!confirm('Delete this dashboard item? This cannot be undone.'))return;
  const{error}=await sb.from('dashboard_items').delete().eq('id',id);
  if(error){toast('⚠ Could not delete.');console.error(error);return}
  await loadDashboard();renderDashboardAdmin();renderAccountabilityDashboard();
  toast('🗑 Item deleted.');
}
async function saveDashMeta(){
  const row={id:1,
    updated_label:document.getElementById('dm-updated').value.trim(),
    intro_note:document.getElementById('dm-intro').value.trim(),
    trees_per_million:parseInt(document.getElementById('dm-tpm').value)||320,
    goal_label:document.getElementById('dm-goal-label').value.trim(),
    annual_goal:parseInt(document.getElementById('dm-annual-goal').value)||0,
    goal_raised:parseInt(document.getElementById('dm-goal-raised').value)||0,
    source_url:document.getElementById('dm-source-url').value.trim()};
  const{error}=await sb.from('dashboard_meta').upsert(row);
  if(error){toast('⚠ Could not save settings.');console.error(error);return}
  await loadDashboard();renderDashboardAdmin();renderAccountabilityDashboard();
  toast('✅ Settings saved.');
}

/* Render any extra stats saved by admin into the DOM on page load */
function renderExtraStats(){
  const extra=getExtraStats();
  const links=getStatLinks();
  const strip=document.getElementById('stats-strip-inner');
  if(!strip||!extra.length)return;
  extra.forEach(s=>{
    if(document.querySelector('.stat-cell[data-key="'+s.key+'"]'))return;// already in DOM
    const cell=document.createElement('div');
    cell.className='stat-cell'+(s.key==='packaging'?' stat-cell-sm':'');
    cell.dataset.key=s.key;
    cell.setAttribute('onclick',`openStatLink('${s.key}')`);
    cell.innerHTML='<div class="stat-ico">'+(s.ico||'📌')+'</div>'+
      '<span class="stat-n" data-t="'+s.val+'" data-prefix="'+(s.prefix||'')+'" data-suffix="'+(s.suffix||'')+'">0</span>'+
      '<span class="stat-l">'+s.label+'</span>'+
      '<span class="stat-link-hint">🔗</span>';
    strip.appendChild(cell);
  });
}

let _admMemberPage=0;const ADM_PAGE_SIZE=25;
function renderAdminMembers(){
  const tb=document.getElementById('members-tbody');if(!tb)return;
  const q=(document.getElementById('adm-member-search')?.value||'').trim().toLowerCase();
  const tierF=(document.getElementById('adm-member-tier-filter')?.value||'');
  const statusF=(document.getElementById('adm-member-status-filter')?.value||'');
  let list=MEMBERS;
  if(q)list=list.filter(m=>(m.name||'').toLowerCase().includes(q)||(m.email||'').toLowerCase().includes(q)||(m.tier||'').toLowerCase().includes(q));
  if(tierF)list=list.filter(m=>m.tier===tierF);
  if(statusF)list=list.filter(m=>m.status===statusF);
  // Pending members always show at top
  list=[...list.filter(m=>m.status==='pending'),...list.filter(m=>m.status!=='pending')];
  const total=list.length;
  const pages=Math.ceil(total/ADM_PAGE_SIZE)||1;
  if(_admMemberPage>=pages)_admMemberPage=pages-1;
  const page=list.slice(_admMemberPage*ADM_PAGE_SIZE,(_admMemberPage+1)*ADM_PAGE_SIZE);
  tb.innerHTML=page.map(m=>{
    const isPending=m.status==='pending';
    const safeName=esc(m.name);const safeEmail=esc(m.email);const safePayref=esc(m.payref||'—');
    return '<tr'+(isPending?' style="background:rgba(200,168,75,.06)"':'')+'><td>'+safeName+'</td>'+
      '<td style="font-size:.76rem">'+safeEmail+'</td>'+
      '<td>'+(m.type||'—')+'</td>'+
      '<td><span class="pill pill-'+((m.tier||'silver'))+'">'+((m.tier||'').charAt(0).toUpperCase()+(m.tier||'').slice(1)||'—')+'</span></td>'+
      '<td>'+(m.amount?m.amount.toLocaleString():'—')+'</td>'+
      '<td>'+(m.year||'—')+'</td>'+
      '<td style="font-size:.74rem">'+safePayref+'</td>'+
      '<td><span class="pill '+(isPending?'pill-gold':m.status==='active'?'pill-ok':'pill-danger')+'">'+(m.status||'active')+'</span></td>'+
      '<td><span class="pill '+(m.role==='admin'?'pill-admin':m.role==='removed'?'pill-danger':'pill-ok')+'">'+m.role+'</span></td>'+
      '<td style="display:flex;gap:.3rem;flex-wrap:wrap">'+
        (isPending?'<button class="btn btn-canopy btn-sm" onclick="adminApproveMember(\''+m.id+'\',\''+m.name.replace(/'/g,'')+'\')">✓ Approve</button>':'')+
        (m.role!=='admin'&&!m.email_verified?'<button class="btn btn-ghost btn-sm" title="Member could not receive the code? Verify their email manually after confirming their identity." onclick="adminMarkVerified(\''+m.id+'\',\''+m.name.replace(/'/g,'')+'\')">✉ Verify</button>':'')+
        (m.role!=='admin'?'<button class="btn btn-danger btn-sm" onclick="adminRemoveMember(\''+m.id+'\',\''+m.name.replace(/'/g,'')+'\')">Remove</button>':'<span style="font-size:.72rem;color:var(--muted)">—</span>')+
      '</td>'+
    '</tr>';
  }).join('');
  // Pagination controls
  const pg=document.getElementById('adm-members-pagination');
  if(pg){
    pg.innerHTML=total>ADM_PAGE_SIZE?
      '<span style="font-size:.8rem;color:var(--muted)">'+(list.filter(m=>m.status==='pending').length>0?'⚠ '+list.filter(m=>m.status==='pending').length+' pending · ':'')+((_admMemberPage*ADM_PAGE_SIZE)+1)+'–'+Math.min((_admMemberPage+1)*ADM_PAGE_SIZE,total)+' of '+total+'</span>'+
      '<button class="btn btn-ghost btn-sm" onclick="_admMemberPage=Math.max(0,_admMemberPage-1);renderAdminMembers()" '+(+_admMemberPage===0?'disabled':'')+'>← Prev</button>'+
      '<button class="btn btn-ghost btn-sm" onclick="_admMemberPage=Math.min('+(pages-1)+',_admMemberPage+1);renderAdminMembers()" '+(_admMemberPage>=pages-1?'disabled':'')+'>Next →</button>'
      :'<span style="font-size:.8rem;color:var(--muted)">'+total+' member'+(total!==1?'s':'')+(list.filter(m=>m.status==='pending').length>0?' · ⚠ '+list.filter(m=>m.status==='pending').length+' pending approval':'')+' </span>';
  }
}
async function adminMarkVerified(id,name){
  if(!confirm('Manually mark '+name+'\'s email as verified? Only do this after confirming their identity (e.g. they contacted you from the registered email).'))return;
  const{error}=await sb.from('members').update({email_verified:true}).eq('id',id);
  if(error){toast('⚠ Could not update.');console.error(error);return}
  await loadMembers();renderAdminMembers();
  audit('Manually verified email',name);
  toast('✉ '+name+' marked as verified.');
}
async function adminApproveMember(id,name){
  if(!confirm('Approve '+name+' and activate their membership? Confirm their payment reference matches.'))return;
  const{error}=await sb.from('members').update({status:'active'}).eq('id',id);
  if(error){toast('⚠ Could not approve member.');console.error(error);return}
  await loadMembers();renderAdminMembers();
  audit('Approved member',name);
  toast('✅ '+name+' approved and activated.');
}

function renderAdminContent(){
  const tb=document.getElementById('adm-content-tbody');if(!tb)return;
  tb.innerHTML=CONTENT.map(c=>'<tr><td style="font-size:.78rem;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+c.title+'</td><td><span class="pill" style="background:rgba(45,106,79,.1);color:var(--canopy-lt)">'+c.type+'</span></td><td style="font-size:.74rem">'+c.window+'</td><td style="font-size:.74rem">'+c.date+'</td><td><span class="pill '+(c.access==='public'?'pill-ok':'pill-gold')+'">'+c.access+'</span></td><td><button class="btn btn-danger btn-sm" onclick="deleteContent(\''+c.id+'\')">Delete</button></td></tr>').join('');
}
async function deleteContent(id){
  if(!confirm('Delete this content item?'))return;
  const {error}=await sb.from('content').delete().eq('id',id);
  if(error){toast('⚠ Could not delete.');console.error(error);return}
  await loadContent();renderAdminContent();renderContent();toast('Content deleted.');
}

function renderAdminFame(){
  const el=document.getElementById('adm-fame-list');if(!el)return;
  if(!FAME.length){el.innerHTML='<p style="color:var(--muted);font-size:.87rem">No champions yet. Add your first conservation champion.</p>';return}
  el.innerHTML='<div style="overflow-x:auto"><table class="dtable"><thead><tr><th>Photo</th><th>Name</th><th>Caption</th><th>Tier</th><th>Year</th><th>Actions</th></tr></thead><tbody>'+
    FAME.map(m=>'<tr>'+
      '<td>'+(m.photo?'<img src="'+m.photo+'" style="width:36px;height:36px;border-radius:50%;object-fit:cover"/>':'<div style="width:36px;height:36px;border-radius:50%;background:var(--canopy);display:flex;align-items:center;justify-content:center;color:var(--gold);font-size:.7rem">'+m.name.charAt(0)+'</div>')+'</td>'+
      '<td>'+m.name+'</td>'+
      '<td style="font-size:.75rem;max-width:200px">'+m.caption+'</td>'+
      '<td><span class="pill pill-'+(m.tier||'silver')+'">'+(m.tier||'silver')+'</span></td>'+
      '<td>'+m.year+'</td>'+
      '<td><button class="btn btn-danger btn-sm" onclick="removeFame(\''+m.id+'\')">Remove</button></td>'+
    '</tr>').join('')+
  '</tbody></table></div>';
}
async function removeFame(id){
  const champ=FAME.find(m=>m.id===id);
  if(!confirm('Remove '+(champ?champ.name:'this champion')+' from the Wall of Fame? This cannot be undone.'))return;
  const {error}=await sb.from('wall_of_fame').delete().eq('id',id);
  if(error){toast('⚠ Could not remove.');console.error(error);return}
  await loadFame();renderAdminFame();renderFame();toast('Champion removed.');
}

function renderAdminAnnounces(){
  const el=document.getElementById('announce-admin-list');if(!el)return;
  if(!ANNOUNCES.length){el.innerHTML='<p style="color:var(--muted);font-size:.87rem">No announcements yet.</p>';return}
  el.innerHTML=ANNOUNCES.map(a=>
    '<div class="adm-card" style="border-left:4px solid var(--canopy-lt)">'+
      '<div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--canopy-lt);margin-bottom:.3rem">'+esc(a.type)+'</div>'+
      '<div style="font-family:var(--ff-d);font-size:.98rem;color:var(--canopy);margin-bottom:.28rem">'+esc(a.title)+'</div>'+
      '<p style="font-size:.82rem;color:var(--muted);line-height:1.6">'+esc(a.body)+'</p>'+
      '<div style="font-size:.7rem;color:rgba(0,0,0,.32);margin-top:.45rem;display:flex;justify-content:space-between;align-items:center;gap:.4rem">'+esc(a.date)+(_isArchived(a)?' · archived':'')+'<span style="display:flex;gap:.4rem"><button class="btn btn-ghost btn-sm" onclick="toggleArchive(\'announcements\',\''+a.id+'\','+(a.archived?'false':'true')+')">'+(a.archived?'Unarchive':'Archive')+'</button><button class="btn btn-danger btn-sm" onclick="delAnnounce(\''+a.id+'\')">Delete</button></span></div>'+
    '</div>'
  ).join('');
}
async function delAnnounce(id){
  const ann=ANNOUNCES.find(a=>a.id===id);
  if(!confirm('Delete announcement: "'+((ann?ann.title:'')||'this announcement').slice(0,60)+'"? This cannot be undone.'))return;
  const {error}=await sb.from('announcements').delete().eq('id',id);
  if(error){toast('⚠ Could not delete.');console.error(error);return}
  audit('Deleted announcement',(ann&&ann.title)||id);await loadAnnouncements();renderAdminAnnounces();renderPublicAnnounces();toast('Announcement deleted.');
}
async function postAnnouncement(){
  const type=document.getElementById('ann-type').value;
  const title=document.getElementById('ann-title').value.trim();
  const body=document.getElementById('ann-body').value.trim();
  const notify=document.getElementById('ann-notify').checked;
  if(!title||!body){toast('⚠ Title and body required.');return}
  const {error}=await sb.from('announcements').insert({type,title,body});
  if(error){toast('⚠ Could not publish.');console.error(error);return}
  closeModal('m-announce');
  document.getElementById('ann-title').value='';document.getElementById('ann-body').value='';
  await loadAnnouncements();renderAdminAnnounces();renderPublicAnnounces();
  if(notify)await logEmail('['+type+'] '+title,'Broadcast to all members · '+new Date().toLocaleDateString());
  audit('Published announcement',title);toast('✅ Announcement published.'+(notify?' Email notification queued.':''));
}

function renderFinancials(){
  const bEl=document.getElementById('fin-bars');const lEl=document.getElementById('fin-list');
  if(!bEl||!lEl)return;
  bEl.innerHTML='';
  [['Albertine Rift Landscape',52],['Karamoja Landscape',32],['Capacity Building',10],['Admin & Operations',6]].forEach(([label,pct])=>{
    bEl.innerHTML+='<div style="padding:.5rem 0;border-bottom:1px solid var(--border)"><div style="display:flex;justify-content:space-between;font-size:.82rem"><span style="color:var(--muted)">'+label+'</span><strong style="color:var(--canopy)">'+pct+'%</strong></div><div class="bar-wrap"><div class="bar-fill" style="width:'+pct+'%"></div></div></div>';
  });
  const recent=FIN_REPORTS.filter(r=>!_isArchived(r));
  const older=FIN_REPORTS.filter(r=>_isArchived(r));
  const show=_showAll.fin?FIN_REPORTS:recent;
  let html=show.length?show.map(r=>
    '<div style="padding:.72rem 0;border-bottom:1px solid var(--border)'+(_isArchived(r)?';opacity:.6':'')+'">'+
      '<div style="font-weight:700;font-size:.87rem;color:var(--canopy)">'+r.title+(_isArchived(r)?' <span style="font-size:.68rem;color:var(--muted)">· archived</span>':'')+'</div>'+
      '<div style="font-size:.73rem;color:var(--muted);margin:.18rem 0">'+r.period+'</div>'+
      '<div style="font-size:.77rem;color:var(--text);line-height:1.55;margin-bottom:.38rem">'+r.summary+'</div>'+
      '<div style="display:flex;gap:.45rem"><a href="'+r.url+'" target="_blank" class="btn btn-ghost btn-sm">View</a>'+
        '<button class="btn btn-ghost btn-sm" onclick="toggleArchive(\'fin_reports\',\''+r.id+'\','+(r.archived?'false':'true')+')">'+(r.archived?'Unarchive':'Archive')+'</button>'+
        '<button class="btn btn-danger btn-sm" onclick="delReport(\''+r.id+'\')">Delete</button></div>'+
    '</div>'
  ).join(''):'<p style="font-size:.82rem;color:var(--muted)">No current reports.</p>';
  if(older.length)html+='<button class="archive-toggle" onclick="_showAll.fin=!_showAll.fin;renderFinancials()">'+(_showAll.fin?'↑ Hide archived':'View archived reports ('+older.length+') →')+'</button>';
  lEl.innerHTML=html||'<p style="font-size:.82rem;color:var(--muted)">No reports yet.</p>';
}
async function toggleArchive(table,id,val){
  const ok=await setArchived(table,id,val);if(!ok)return;
  if(table==='announcements'){await loadAnnouncements();renderAdminAnnounces();renderPublicAnnounces();}
  else if(table==='fin_reports'){await loadFinReports();renderFinancials();}
  else if(table==='member_posts'){await loadPosts();renderPosts();renderAdminPosts();}
  toast(val?'📦 Archived — still available under “View archived”.':'Restored to the feed.');
}
async function delReport(id){
  const rep=FIN_REPORTS.find(r=>r.id===id);
  if(!confirm('Delete financial report: "'+((rep?rep.title:'')||'this report').slice(0,60)+'"? This cannot be undone.'))return;
  const {error}=await sb.from('fin_reports').delete().eq('id',id);
  if(error){toast('⚠ Could not delete.');console.error(error);return}
  await loadFinReports();renderFinancials();toast('Report removed.');
}
async function addFinReport(){
  const title=document.getElementById('fin-title').value.trim();
  const period=document.getElementById('fin-period').value.trim();
  const summary=document.getElementById('fin-summary').value.trim();
  const url=document.getElementById('fin-url').value.trim();
  if(!title){toast('⚠ Report title required.');return}
  const {error}=await sb.from('fin_reports').insert({title,period,summary,url:url||'#'});
  if(error){toast('⚠ Could not publish report.');console.error(error);return}
  closeModal('m-finance');
  ['fin-title','fin-period','fin-summary','fin-url'].forEach(id=>document.getElementById(id).value='');
  await loadFinReports();renderFinancials();toast('✅ Financial report published.');
}

/* ═══ PAYMENT DETAILS — single row (id=1), admin-editable, drives public Payment section ═══ */
function _pdVal(id){const el=document.getElementById(id);return el?el.value.trim():''}
// Upload a logo/media asset to storage; timestamped path defeats CDN caching
async function _uploadFile(file,prefix){
  if(!file)return null;
  const ext=(file.name.split('.').pop()||'png').toLowerCase();
  const path='payment/'+prefix+'-'+Date.now()+'-'+Math.floor(Math.random()*1e4)+'.'+ext;
  const {error}=await sb.storage.from('content-files').upload(path,file,{contentType:file.type});
  if(error){console.error('asset upload',prefix,error);toast('⚠ Upload failed ('+prefix+'): '+(error.message||'storage error'));return null}
  return {url:sb.storage.from('content-files').getPublicUrl(path).data.publicUrl,type:file.type.startsWith('video')?'video':'image'};
}
async function _uploadPayAsset(inputId,prefix){
  const el=document.getElementById(inputId);
  return _uploadFile(el&&el.files&&el.files[0],prefix);
}
async function savePaymentDetails(){
  const btn=document.getElementById('pd-save-btn');
  if(btn){btn.disabled=true;btn.textContent='Saving…'}
  toast('Saving payment details…');
  // Parse the impact editor — one line per item: "emoji | amount | what it achieves"
  const impactRaw=_pdVal('pd-impact');
  let impact=Array.isArray(PAYMENT.impact_items)?PAYMENT.impact_items:null;
  if(impactRaw){
    impact=impactRaw.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{
      const p=l.split('|').map(s=>s.trim());
      return {icon:p[0]||'🌿',amount:p[1]||'',text:p.slice(2).join(' | ')||''};
    });
  }
  const pd={
    id:1,
    bank:_pdVal('pd-bank'),accno:_pdVal('pd-accno'),branch:_pdVal('pd-branch'),
    mtn:_pdVal('pd-mtn'),airtel:_pdVal('pd-airtel'),
    whatsapp:_pdVal('pd-whatsapp'),acc_name:PAYMENT.acc_name||'Uganda Biodiversity Fund',
    promo_caption:_pdVal('pd-promo-cap'),impact_items:impact,
    // keep existing uploaded assets unless replaced below
    stanbic_logo:PAYMENT.stanbic_logo||null,mtn_logo:PAYMENT.mtn_logo||null,
    airtel_logo:PAYMENT.airtel_logo||null,promo_url:PAYMENT.promo_url||null,promo_type:PAYMENT.promo_type||null,
  };
  const [sb_l,mtn_l,air_l,promo]=await Promise.all([
    _uploadPayAsset('pd-logo-stanbic','stanbic-logo'),
    _uploadPayAsset('pd-logo-mtn','mtn-logo'),
    _uploadPayAsset('pd-logo-airtel','airtel-logo'),
    _uploadPayAsset('pd-promo','promo'),
  ]);
  if(sb_l)pd.stanbic_logo=sb_l.url;
  if(mtn_l)pd.mtn_logo=mtn_l.url;
  if(air_l)pd.airtel_logo=air_l.url;
  if(promo){pd.promo_url=promo.url;pd.promo_type=promo.type;}
  const {error}=await sb.from('payment_details').upsert(pd);
  if(btn){btn.disabled=false;btn.textContent='Save Payment Details'}
  if(error){toast('⚠ Could not save payment details.');console.error(error);return}
  await loadPayment();renderPaymentUI();loadPaymentAdmin();
  audit('Updated payment details','How to Pay section');toast('✅ Payment details saved and updated on the public site.');
}
function loadPaymentAdmin(){
  const map={'pd-bank':PAYMENT.bank,'pd-accno':PAYMENT.accno,'pd-branch':PAYMENT.branch,'pd-mtn':PAYMENT.mtn,'pd-airtel':PAYMENT.airtel,'pd-whatsapp':PAYMENT.whatsapp,'pd-promo-cap':PAYMENT.promo_caption};
  Object.entries(map).forEach(([id,val])=>{if(val){const el=document.getElementById(id);if(el)el.value=val}});
  // impact editor: turn items back into "emoji | amount | text" lines
  const imp=document.getElementById('pd-impact');
  if(imp){
    let items=PAYMENT.impact_items;
    if(typeof items==='string'){try{items=JSON.parse(items)}catch(e){items=null}}
    if(!Array.isArray(items)||!items.length)items=PAY_IMPACT_DEFAULT;
    imp.value=items.map(it=>[it.icon||'🌿',it.amount||'',it.text||''].join(' | ')).join('\n');
  }
  // show current uploaded assets as thumbnails
  const thumbs={'pdp-stanbic':PAYMENT.stanbic_logo,'pdp-mtn':PAYMENT.mtn_logo,'pdp-airtel':PAYMENT.airtel_logo};
  Object.entries(thumbs).forEach(([id,url])=>{if(url){const el=document.getElementById(id);if(el)el.innerHTML='<img src="'+esc(url)+'" alt=""/>'}});
  if(PAYMENT.promo_url){const p=document.getElementById('pdp-promo');if(p)p.textContent=PAYMENT.promo_type==='video'?'🎬':'🖼'}
}
// Instant local preview when an admin picks a file (before saving)
function pdPreview(input,thumbId){
  const f=input.files&&input.files[0];const el=document.getElementById(thumbId);if(!f||!el)return;
  if(f.type.startsWith('image')){el.innerHTML='<img src="'+URL.createObjectURL(f)+'" alt=""/>'}
  else if(f.type.startsWith('video')){el.textContent='🎬'}
}

/* ═══ EMAIL CAMPAIGNS ═══
   NOTE: This logs campaigns for record-keeping. Actual delivery requires a
   Supabase Edge Function wired to an email provider (SendGrid/Resend/Brevo). */
function previewEmail(){
  const subj=document.getElementById('em-subj').value;
  const body=document.getElementById('em-body').value;
  const aud=document.getElementById('em-audience').value;
  const el=document.getElementById('email-prev');el.style.display='block';
  el.textContent='FROM: info@ugandabiodiversityfund.org\nTO: '+(aud==='all'?'All Members':aud.charAt(0).toUpperCase()+aud.slice(1)+' Members')+'\nSUBJECT: '+(subj||'(no subject)')+'\n\n'+body+'\n\n—\nUganda Biodiversity Fund\nwww.ugandabiodiversityfund.org\n+256 (039) 3216445';
}
async function sendEmail(){
  const subj=document.getElementById('em-subj').value.trim();
  const body=document.getElementById('em-body').value.trim();
  const aud=document.getElementById('em-audience').value;
  if(!subj||!body){toast('⚠ Subject and message required.');return}
  const tierRank={all:0,student:1,silver:1,gold:2,platinum:3,diamond:4};
  const minRank=tierRank[aud]||0;
  const recipients=MEMBERS.filter(m=>m.role!=='admin'&&(minRank===0||(TIERS_DATA[m.tier]?.r||0)>=minRank));
  const emails=recipients.map(m=>m.email).join('; ');
  if(!emails){toast('⚠ No members match the selected audience.');return}

  const fullBody=body+'\n\n—\nUganda Biodiversity Fund\nwww.ugandabiodiversityfund.org\n+256 (039) 3216445\ninfo@ugandabiodiversityfund.org';

  // Show a copy-ready panel — works for Outlook, Gmail, or any platform
  const panel=document.getElementById('email-send-panel');
  document.getElementById('esp-to').value=emails;
  document.getElementById('esp-subj').value=subj;
  document.getElementById('esp-body').value=fullBody;

  // Also build Gmail compose link as a quick option
  const gmailUrl='https://mail.google.com/mail/?view=cm&to='+encodeURIComponent(emails)+'&su='+encodeURIComponent(subj)+'&body='+encodeURIComponent(fullBody);
  document.getElementById('esp-gmail-btn').href=gmailUrl;

  panel.style.display='block';
  panel.scrollIntoView({behavior:'smooth'});

  await logEmail(subj,'Audience: '+aud+' ('+recipients.length+' members) · '+new Date().toLocaleString());
  toast('✅ Campaign ready — copy each field into your email (Outlook or Gmail).');
}
function copyField(id,label){
  const el=document.getElementById(id);
  navigator.clipboard.writeText(el.value).then(()=>toast('✅ '+label+' copied — paste into your email.')).catch(()=>{el.select();document.execCommand('copy');toast('✅ '+label+' copied.');});
}
async function logEmail(subj,meta){
  EMAIL_LOG.unshift({subj,meta});
  if(EMAIL_LOG.length>50)EMAIL_LOG=EMAIL_LOG.slice(0,50);
  LS.set('email_log',EMAIL_LOG);
  renderEmailLog();
}
function renderEmailLog(){
  const el=document.getElementById('email-log-list');if(!el)return;
  el.innerHTML=EMAIL_LOG.slice(0,12).map(e=>'<div style="padding:.58rem 0;border-bottom:1px solid var(--border)"><div style="font-size:.82rem;font-weight:600;color:var(--canopy)">'+e.subj+'</div><div style="font-size:.7rem;color:var(--muted);margin-top:.14rem">'+e.meta+'</div></div>').join('')||'<p style="font-size:.82rem;color:var(--muted)">No campaigns sent yet.</p>';
}
function exportCSV(){
  const rows=['Name,Email,Type,Tier,Amount (UGX),Year,PayRef,Role,Status',...MEMBERS.map(m=>'"'+m.name+'","'+m.email+'","'+(m.type||'')+'","'+(m.tier||'')+'","'+(m.amount||'')+'","'+(m.year||'')+'","'+(m.payref||'')+'","'+(m.role||'')+'","'+(m.status||'')+'"')];
  const blob=new Blob([rows.join('\n')],{type:'text/csv'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ubf_members_'+new Date().toISOString().slice(0,10)+'.csv';a.click();URL.revokeObjectURL(a.href);
}

/* ═══ SLIDE IMAGE UPLOADS (admin) — session-only unless pushed to repo ═══ */
function handleSlideUpload(e){
  const files=Array.from(e.target.files);
  files.forEach(f=>{
    const reader=new FileReader();
    reader.onload=ev=>{
      const prev=document.getElementById('slide-preview-list');
      prev.innerHTML+='<div style="display:flex;align-items:center;gap:.5rem;padding:.4rem;background:var(--mist);border-radius:var(--r-sm);margin-top:.4rem"><img src="'+ev.target.result+'" style="width:40px;height:30px;object-fit:cover;border-radius:4px"/><span style="font-size:.8rem">'+f.name+' — add this file to the repo root as slide-'+(SLIDE_IMAGES.length+1)+'.jpg to make it permanent</span></div>';
    };
    reader.readAsDataURL(f);
  });
}

/* ═══ ADMIN OVERVIEW — KPI snapshot landing page ═══ */
function admGoto(ap){const btn=document.querySelector('.adm-nav-item[data-ap="'+ap+'"]');if(btn)showAdminPanel(btn);}
function renderAdminOverview(){
  const el=document.getElementById('adm-overview-body');if(!el)return;
  const members=MEMBERS.filter(m=>m.role==='member');
  const active=members.filter(m=>m.status==='active');
  const pending=members.filter(m=>m.status==='pending');
  const unverified=members.filter(m=>!m.email_verified&&m.status!=='removed');
  const funds=active.reduce((s,m)=>s+(m.amount||0),0);
  const fmt=v=>v>=1e6?'UGX '+(Math.round(v/1e5)/10)+'M':'UGX '+v.toLocaleString();
  const kpi=(ico,val,lbl,ap,warn)=>'<div class="adm-ov-kpi'+(warn?' warn':'')+'" onclick="admGoto(\''+ap+'\')" title="Open '+lbl+'"><div class="ov-ico">'+ico+'</div><div class="ov-val">'+val+'</div><div class="ov-lbl">'+lbl+'</div></div>';
  el.innerHTML=
    '<div class="adm-ov-kpis">'+
      kpi('👥',active.length,'Active members','ap-members')+
      kpi('⏳',pending.length,'Pending approvals','ap-members',pending.length>0)+
      kpi('💰',fmt(funds),'Committed (active)','ap-finance')+
      kpi('📚',(CONTENT||[]).length,'Resources published','ap-content')+
      kpi('📝',(POSTS||[]).length,'Community posts','ap-posts')+
      kpi('✉',unverified.length,'Unverified emails','ap-members',unverified.length>0)+
      kpi('🔄',members.filter(m=>m.status==='active'&&(m.year||0)<new Date().getFullYear()).length,'Renewals due','ap-members')+
    '</div>'+
    '<div class="mem-sec-title" style="margin-top:1.7rem">Revenue by tier (active members)</div>'+
    (function(){
      const tiers=['student','silver','gold','platinum','diamond'];
      const sums=tiers.map(t=>active.filter(m=>m.tier===t).reduce((s,m)=>s+(m.amount||0),0));
      const max=Math.max(1,...sums);
      return '<div class="adm-card">'+tiers.map((t,i)=>'<div style="padding:.4rem 0;border-bottom:1px solid var(--border)"><div style="display:flex;justify-content:space-between;font-size:.8rem"><span style="color:var(--muted);text-transform:capitalize">'+t+' ('+active.filter(m=>m.tier===t).length+')</span><strong style="color:var(--canopy)">'+fmt(sums[i])+'</strong></div><div class="bar-wrap"><div class="bar-fill" style="width:'+Math.round(sums[i]*100/max)+'%"></div></div></div>').join('')+'</div>';
    })()+
    '<div class="mem-sec-title" style="margin-top:1.7rem">Pending renewals</div><div id="ov-renewals"><p style="font-size:.85rem;color:var(--muted)">Loading…</p></div>'+
    '<div class="mem-sec-title" style="margin-top:1.7rem">Quick Actions</div>'+
    '<div class="adm-ov-actions">'+
      (pending.length?'<button class="btn btn-canopy btn-sm" onclick="admGoto(\'ap-members\')">✓ Review '+pending.length+' pending member'+(pending.length===1?'':'s')+'</button>':'')+
      '<button class="btn btn-ghost btn-sm" onclick="openModal(\'m-upload\')">⬆ Upload content</button>'+
      '<button class="btn btn-ghost btn-sm" onclick="admGoto(\'ap-announce\')">📢 Post announcement</button>'+
      '<button class="btn btn-ghost btn-sm" onclick="admGoto(\'ap-dashboard\')">📊 Update accountability</button>'+
      '<button class="btn btn-ghost btn-sm" onclick="exportCSV()">⬇ Export members CSV</button>'+
    '</div>'+
    '<div class="mem-sec-title" style="margin-top:1.7rem">Recent Activity</div>'+
    (function(){
      const panelOf={announce:'ap-announce',content:'ap-content',report:'ap-finance',post:'ap-posts',member:'ap-members'};
      const items=buildNotifications().filter(i=>!i.date||_daysOld(i.date)<=ARCHIVE_DAYS).slice(0,6);
      return items.length
        ?items.map(i=>'<div class="notif-item notif-click" onclick="admGoto(\''+(panelOf[i.kind]||'ap-overview')+'\')" title="Open in admin"><span class="notif-ico">'+i.icon+'</span><div class="notif-body"><div class="notif-cat">'+esc(i.cat)+'</div><div class="notif-text">'+esc(i.text)+'</div></div>'+(i.date?'<span class="notif-date">'+esc(i.date)+'</span>':'')+'<span class="notif-go">›</span></div>').join('')
        :'<p style="font-size:.85rem;color:var(--muted)">No activity in the last '+ARCHIVE_DAYS+' days.</p>';
    })();
  // Pending renewals (async fill)
  sb.from('renewals').select('*').eq('status','pending').order('created_at',{ascending:false}).then(({data})=>{
    const box=document.getElementById('ov-renewals');if(!box)return;
    box.innerHTML=(data&&data.length)?data.map(r=>'<div class="pa-row"><span class="pa-thumb">🔄</span><div class="pa-info"><strong>'+esc(r.member_name||'Member')+' → '+esc(String(r.to_year))+'</strong><span>UGX '+((r.amount||0).toLocaleString())+(r.payref?' · Ref: '+esc(r.payref):' · no reference')+'</span></div><button class="btn btn-canopy btn-sm" onclick="approveRenewal(\''+r.id+'\')">✓ Approve</button></div>').join(''):'<p style="font-size:.85rem;color:var(--muted)">No pending renewals.</p>';
  });
}

/* ═══ ADMIN SIDEBAR NAVIGATION ═══ */
function showAdminPanel(btn){
  document.querySelectorAll('.adm-nav-item').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.adm-panel').forEach(p=>p.classList.remove('active'));
  const panel=document.getElementById(btn.dataset.ap);
  if(panel)panel.classList.add('active');
  toggleAdmSidebar(false);// close the drawer on mobile
  window.scrollTo({top:0,behavior:'smooth'});
}
function toggleAdmGroup(btn){btn.parentElement.classList.toggle('open')}
function toggleAdmSidebar(force){
  const sb=document.getElementById('adm-sidebar');if(!sb)return;
  const open=typeof force==='boolean'?force:!sb.classList.contains('open');
  sb.classList.toggle('open',open);
  const bd=document.getElementById('adm-backdrop');
  if(bd)bd.classList.toggle('show',open);
}

/* ═══ OUR FOOTPRINT — CLICKABLE STAT BOXES WITH PROOF LINKS ═══
   STAT_LINKS stored in localStorage keyed by stat data-key.
   Each entry: { url, desc, label }
   Admins set links via Admin → Our Footprint tab.
   Visitors clicking a stat box see the proof link modal.
   Extra stats added by admin via "Add New Stat" are stored in EXTRA_STATS.
═══ */
const DEFAULT_STATS=[
  {key:'endowments',ico:'💰',val:14,prefix:'$',suffix:'M+',label:'Raised in total endowments (USD)'},
  {key:'projects',ico:'📋',val:25,prefix:'',suffix:'',label:'Grantee projects funded'},
  {key:'households',ico:'🏠',val:3000,prefix:'',suffix:'+',label:'Households with improved livelihoods'},
  {key:'woodlots',ico:'🌲',val:2500,prefix:'',suffix:'Ha',label:'Woodlots established across regions'},
  {key:'woodlands',ico:'🌳',val:3000,prefix:'',suffix:'Ha',label:'Woodlands restored through natural regeneration'},
  {key:'agriculture',ico:'🌾',val:2000,prefix:'',suffix:'Ha',label:'Agricultural land under Sustainable Land Management'},
  {key:'forests',ico:'🌿',val:1000,prefix:'',suffix:'Ha',label:'Natural forests restored — Albertine & West Nile'},
  {key:'wetlands',ico:'💧',val:500,prefix:'',suffix:'Ha',label:'Wetlands restored across landscapes'},
  {key:'vegetation',ico:'📈',val:19,prefix:'',suffix:'%',label:'Increased vegetation cover across regions'},
  {key:'packaging',ico:'♻️',val:10000,prefix:'',suffix:'Kg',label:'Biodegradable packaging supported'},
];

function getStatLinks(){return LS.get('stat_links',{});}
function getExtraStats(){return LS.get('extra_stats',[]);}

function openStatLink(key){
  const links=getStatLinks();
  const extra=getExtraStats();
  const allStats=[...DEFAULT_STATS,...extra];
  const stat=allStats.find(s=>s.key===key);
  const link=links[key];
  if(!link||!link.url){
    // No proof link set yet
    if(currentUser&&currentUser.role==='admin'){
      openEditStatLink(key);
    }else{
      toast('No proof link attached yet. Admin can add one from the Admin Panel.');
    }
    return;
  }
  // Show proof modal
  const body=document.getElementById('stat-proof-body');
  body.innerHTML=
    '<div style="text-align:center;margin-bottom:1.25rem">'+
      '<div style="font-size:2.5rem;margin-bottom:.5rem">'+(stat?stat.ico:'🔗')+'</div>'+
      '<h3 style="font-family:var(--ff-d);font-size:1.2rem;color:var(--canopy);margin-bottom:.3rem">'+(stat?stat.label:'Achievement')+'</h3>'+
    '</div>'+
    '<p style="font-size:.85rem;color:var(--muted);line-height:1.65;margin-bottom:1.25rem">'+
      (link.desc||'View the documentation and evidence for this achievement.')+
    '</p>'+
    '<a href="'+link.url+'" target="_blank" rel="noopener" class="btn btn-canopy btn-full">View Proof / Evidence →</a>'+
    (currentUser&&currentUser.role==='admin'
      ?'<button class="btn btn-ghost btn-full btn-sm" style="margin-top:.5rem" onclick="openEditStatLink(\''+key+'\');closeModal(\'m-stat-proof\')">✏ Edit this link</button>'
      :'');
  openModal('m-stat-proof');
}

function openEditStatLink(key){
  const links=getStatLinks();
  const extra=getExtraStats();
  const allStats=[...DEFAULT_STATS,...extra];
  const stat=allStats.find(s=>s.key===key);
  const link=links[key]||{};
  document.getElementById('esl-key').value=key;
  document.getElementById('esl-label').value=stat?stat.label:key;
  document.getElementById('esl-url').value=link.url||'';
  document.getElementById('esl-desc').value=link.desc||'';
  openModal('m-edit-stat-link');
}
function saveStatLink(){
  const key=document.getElementById('esl-key').value;
  const url=document.getElementById('esl-url').value.trim();
  const desc=document.getElementById('esl-desc').value.trim();
  const label=document.getElementById('esl-label').value;
  if(!url){toast('⚠ Please enter a URL.');return}
  const links=getStatLinks();
  links[key]={url,desc,label};
  LS.set('stat_links',links);
  closeModal('m-edit-stat-link');
  renderFootprintAdmin();
  renderStatHints();
  toast('✅ Proof link saved. Visitors clicking this stat will now see the link.');
}
function removeStatLink(){
  const key=document.getElementById('esl-key').value;
  const links=getStatLinks();
  delete links[key];
  LS.set('stat_links',links);
  closeModal('m-edit-stat-link');
  renderFootprintAdmin();
  renderStatHints();
  toast('Link removed.');
}

function renderStatHints(){
  // Update the 🔗 hint visibility on stat cells — show gold when link exists
  const links=getStatLinks();
  document.querySelectorAll('.stat-cell[data-key]').forEach(cell=>{
    const key=cell.dataset.key;
    const hint=cell.querySelector('.stat-link-hint');
    if(!hint)return;
    if(links[key]&&links[key].url){
      hint.style.display='block';
      hint.style.color='var(--gold-lt)';
      cell.style.cursor='pointer';
    }else if(currentUser&&currentUser.role==='admin'){
      hint.style.display='block';
      hint.style.color='rgba(255,255,255,.2)';
      cell.style.cursor='pointer';
    }else{
      hint.style.display='none';
      cell.style.cursor='default';
    }
  });
}

function addFootprintStat(){
  const ico=document.getElementById('nfs-ico').value.trim();
  const val=parseInt(document.getElementById('nfs-val').value)||0;
  const prefix=document.getElementById('nfs-prefix').value.trim();
  const suffix=document.getElementById('nfs-suffix').value.trim();
  const label=document.getElementById('nfs-label').value.trim();
  const url=document.getElementById('nfs-url').value.trim();
  const desc=document.getElementById('nfs-desc').value.trim();
  if(!val||!label){toast('⚠ Figure and label are required.');return}
  const key='extra_'+Date.now();
  const extra=getExtraStats();
  extra.push({key,ico:ico||'📌',val,prefix,suffix,label});
  LS.set('extra_stats',extra);
  if(url){
    const links=getStatLinks();
    links[key]={url,desc,label};
    LS.set('stat_links',links);
  }
  // Inject into DOM
  const strip=document.getElementById('stats-strip-inner');
  if(strip){
    const cell=document.createElement('div');
    cell.className='stat-cell';
    cell.dataset.key=key;
    cell.setAttribute('onclick',`openStatLink('${key}')`);
    cell.innerHTML='<div class="stat-ico">'+(ico||'📌')+'</div>'+
      '<span class="stat-n" data-t="'+val+'" data-prefix="'+prefix+'" data-suffix="'+suffix+'">'+prefix+'0'+suffix+'</span>'+
      '<span class="stat-l">'+label+'</span>'+
      '<span class="stat-link-hint">🔗</span>';
    strip.appendChild(cell);
    // Animate the new counter
    const el=cell.querySelector('[data-t]');
    if(el){let cur=0;const step=val/55;const t=setInterval(()=>{cur=Math.min(cur+step,val);el.textContent=prefix+Math.round(cur).toLocaleString()+suffix;if(cur>=val)clearInterval(t);},22);}
  }
  closeModal('m-add-footprint');
  ['nfs-ico','nfs-val','nfs-prefix','nfs-suffix','nfs-label','nfs-url','nfs-desc'].forEach(id=>document.getElementById(id).value='');
  renderFootprintAdmin();renderStatHints();
  toast('✅ New stat added to Our Footprint section.');
}

function renderFootprintAdmin(){
  const el=document.getElementById('footprint-admin-list');if(!el)return;
  const links=getStatLinks();
  const extra=getExtraStats();
  const allStats=[...DEFAULT_STATS,...extra];
  el.innerHTML='<div style="overflow-x:auto"><table class="dtable">'+
    '<thead><tr><th>Icon</th><th>Figure</th><th>Label</th><th>Proof Link</th><th>Actions</th></tr></thead>'+
    '<tbody>'+
    allStats.map(s=>{
      const link=links[s.key];
      const isExtra=extra.find(e=>e.key===s.key);
      return '<tr>'+
        '<td style="font-size:1.2rem">'+s.ico+'</td>'+
        '<td style="font-family:var(--ff-m);font-size:.82rem">'+(s.prefix||'')+s.val.toLocaleString()+(s.suffix||'')+'</td>'+
        '<td style="font-size:.8rem">'+s.label+'</td>'+
        '<td>'+(link&&link.url
          ?'<a href="'+link.url+'" target="_blank" style="color:var(--canopy-lt);font-size:.75rem;font-weight:600">'+( link.desc||link.url.slice(0,30)+'...')+'</a>'
          :'<span style="font-size:.74rem;color:var(--muted)">No link yet</span>')+
        '</td>'+
        '<td style="display:flex;gap:.35rem;flex-wrap:wrap">'+
          '<button class="btn btn-ghost btn-sm" onclick="openEditStatLink(\''+s.key+'\')">'+( link&&link.url?'✏ Edit':'+ Add Link')+'</button>'+
          (isExtra?'<button class="btn btn-danger btn-sm" onclick="deleteExtraStat(\''+s.key+'\')">Delete</button>':'')+
        '</td>'+
      '</tr>';
    }).join('')+
    '</tbody></table></div>';
}
function deleteExtraStat(key){
  let extra=getExtraStats();
  extra=extra.filter(s=>s.key!==key);
  LS.set('extra_stats',extra);
  const links=getStatLinks();
  delete links[key];
  LS.set('stat_links',links);
  // Remove cell from DOM
  const cell=document.querySelector('.stat-cell[data-key="'+key+'"]');
  if(cell)cell.remove();
  renderFootprintAdmin();
  toast('Stat removed.');
}

/* ═══ COUNTER ANIMATION ═══ */
function animCounters(){
  document.querySelectorAll('[data-t]').forEach(el=>{
    const target=+el.dataset.t;let cur=0;const step=target/55;
    const prefix=el.dataset.prefix||'';const suffix=el.dataset.suffix||'';
    const t=setInterval(()=>{
      cur=Math.min(cur+step,target);
      const n=Math.round(cur).toLocaleString();
      el.textContent=prefix+n+suffix;
      if(cur>=target)clearInterval(t);
    },22);
  });
}
const cntObs=new IntersectionObserver(en=>{en.forEach(e=>{if(e.isIntersecting){animCounters();cntObs.disconnect()}})},{threshold:.3});
const impEl=document.getElementById('impact');if(impEl)cntObs.observe(impEl);

/* ═══ SCROLL REVEAL ═══ */
const revObs=new IntersectionObserver(en=>{en.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revObs.unobserve(e.target)}})},{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

/* ═══ EMAIL POPUP (subscribe) — shows once per session, not on every visit ═══ */
function showEP(auto){
  if(sessionStorage.getItem('ubf_ep_shown')||currentUser)return;
  setTimeout(()=>{document.getElementById('ep').classList.add('show');sessionStorage.setItem('ubf_ep_shown','1');},auto?20000:800);
}
function openSubscribePopup(){
  document.getElementById('ep').classList.add('show');
}
function dismissEP(){document.getElementById('ep').classList.remove('show');}
async function subscribeEP(){
  const em=document.getElementById('ep-email').value.trim();
  if(!em||!em.includes('@')){toast('⚠ Enter a valid email address.');return}
  await logEmail('Newsletter Subscription','New subscriber: '+em+' · '+new Date().toLocaleDateString());
  dismissEP();toast('✅ Subscribed! You will receive UBF updates.');
}

/* ═══ COMMUNITY POSTS ═══ */
let POSTS=[];
let postImageData=null;
let currentPostFilter='all';

async function loadPosts(){
  const{data:posts,error}=await sb.from('member_posts')
    .select('*')
    .order('created_at',{ascending:false});
  if(error){console.error('loadPosts',error);return}

  // Load comments separately — more reliable than FK join
  const{data:comments}=await sb.from('post_comments')
    .select('*')
    .order('created_at',{ascending:true});

  POSTS=(posts||[]).map(p=>({
    ...p,
    comments:(comments||[]).filter(c=>c.post_id===p.id)
  }));
}

function _postsArchiveToggle(){
  const older=POSTS.filter(p=>_isArchived(p));
  if(!older.length)return '';
  return '<button class="archive-toggle" onclick="_showAll.posts=!_showAll.posts;renderPosts()">'+(_showAll.posts?'↑ Hide older posts':'View earlier posts ('+older.length+') →')+'</button>';
}
/* ═══ COMMUNITY — digest/feed views, sort, pin, open-post modal ═══ */
const POST_EMOJIS=[
  {key:'likes',emoji:'❤️',label:'Love'},
  {key:'thumbsup',emoji:'👍',label:'Like'},
  {key:'support',emoji:'🤝',label:'Support'},
  {key:'wow',emoji:'😮',label:'Wow'},
  {key:'celebrate',emoji:'🎉',label:'Celebrate'},
];
let _postView=LS.get('post_view','digest'); // 'digest' | 'feed'
let _postSort='new';                         // 'new' | 'top' | 'discussed'
let _openPostId=null;
function setPostView(v){_postView=v;LS.set('post_view',v);renderPosts();}
function setPostSort(v){_postSort=v;renderPosts();}
function _reactTotal(p){return Object.values(p.reactions||{}).reduce((a,b)=>a+(b||0),0);}
function _timeAgo(ts){if(!ts)return '';const d=(Date.now()-new Date(ts).getTime())/1000;if(isNaN(d))return String(ts).slice(0,10);if(d<3600)return Math.max(1,Math.round(d/60))+'m';if(d<86400)return Math.round(d/3600)+'h';if(d<604800)return Math.round(d/86400)+'d';return String(ts).slice(0,10);}
function _avatarColor(seed){const c=['#8A6E1E','#2E7D9A','#2D6A4F','#B5451B','#5b5cc4','#0f766e'];seed=String(seed||'');let h=0;for(let i=0;i<seed.length;i++)h=(h*31+seed.charCodeAt(i))>>>0;return c[h%c.length];}
function postTitle(p){
  if(p.title&&p.title.trim())return p.title.trim();
  const b=(p.body||'').trim();
  if(!b)return p.image_url?'📷 Photo':p.video_url?'🎬 Video':p.doc_url?('📄 '+(p.doc_name||'Document')):'Post';
  const first=b.split('\n')[0];
  return first.length>90?first.slice(0,90)+'…':first;
}
function postSnippet(p){
  const b=(p.body||'').trim();
  if(p.title&&p.title.trim())return b.slice(0,140);
  return b.split('\n').slice(1).join(' ').slice(0,140);
}
function _sortPosts(list){
  const arr=list.slice();
  if(_postSort==='top')arr.sort((a,b)=>_reactTotal(b)-_reactTotal(a));
  else if(_postSort==='discussed')arr.sort((a,b)=>((b.comments||[]).length)-((a.comments||[]).length));
  else arr.sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||'')));
  arr.sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0)); // pinned float to top (stable sort keeps order)
  return arr;
}
function _appGreeting(){
  if(!document.body.classList.contains('app-mode')||!currentUser)return '';
  const h=new Date().getHours();
  const g=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  return '<div class="app-greet">'+g+',<b>'+esc(currentUser.name.split(' ')[0])+' 🌿</b></div>';
}
let _postSearch='';
function setPostSearch(v){_postSearch=(v||'').trim().toLowerCase();renderPosts();
  const i=document.getElementById('post-search');if(i&&document.activeElement!==i)i.value=v||'';}
function _postsHeader(count){
  const opt={new:'🕐 Newest',top:'🔥 Top',discussed:'💬 Most discussed'};
  return _appGreeting()+'<div class="feed-head">'+
    '<div class="feed-title">🌿 Community <span class="fh-n">'+count+' post'+(count!==1?'s':'')+'</span></div>'+
    '<div class="feed-ctrls">'+
      '<select class="feed-sort" onchange="setPostSort(this.value)">'+
        ['new','top','discussed'].map(v=>'<option value="'+v+'"'+(_postSort===v?' selected':'')+'>'+opt[v]+'</option>').join('')+
      '</select>'+
      '<div class="feed-seg"><button class="'+(_postView==='digest'?'on':'')+'" onclick="setPostView(\'digest\')">☰ Digest</button><button class="'+(_postView==='feed'?'on':'')+'" onclick="setPostView(\'feed\')">▦ Feed</button></div>'+
    '</div>'+
    '<div class="feed-search"><span>🔍</span><input id="post-search" type="search" placeholder="Search all posts…" value="'+esc(_postSearch)+'" oninput="setPostSearch(this.value)" autocomplete="off"/></div>'+
  '</div>';
}
function _postStarter(){
  if(!currentUser)return '';
  return '<div class="post-prompt" onclick="openModal(\'m-create-post\')">'+
      '<div class="post-prompt-avatar">'+
        (currentUser.photo_url
          ?'<img src="'+currentUser.photo_url+'" style="width:40px;height:40px;border-radius:50%;object-fit:cover"/>'
          :'<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--canopy),var(--canopy-lt));display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--gold);font-size:.9rem">'+currentUser.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()+'</div>')+
      '</div>'+
      '<div class="post-prompt-input">Share a conservation story, project update...</div>'+
    '</div>'+
    '<div class="post-prompt-actions">'+
      '<button class="post-prompt-btn" onclick="openModal(\'m-create-post\')">📷 Photo</button>'+
      '<button class="post-prompt-btn" onclick="openModal(\'m-create-post\')">🎬 Video</button>'+
      '<button class="post-prompt-btn" onclick="openModal(\'m-create-post\')">✍ Write</button>'+
    '</div>';
}
function postDigestRowHTML(p){
  const initials=(p.author_name||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const td=TIERS_DATA[p.author_tier]||TIERS_DATA.silver;
  const am=MEMBERS.find(m=>m.id===p.author_id);
  const photo=am&&am.photo_url;
  const av=photo?'<img class="dg-av" src="'+photo+'" alt=""/>':'<div class="dg-av dg-init" style="background:'+_avatarColor(p.author_id)+'">'+initials+'</div>';
  const cc=(p.comments||[]).length,rc=_reactTotal(p);
  const thumb=p.image_url?'<img class="dg-thumb" src="'+esc(p.image_url)+'" alt="" onerror="this.style.display=\'none\'"/>':(p.video_url?'<div class="dg-thumb dg-vid">🎬</div>':'');
  const snip=postSnippet(p);
  return '<div class="dg-row" onclick="openPostModal(\''+p.id+'\')">'+
    av+
    '<div class="dg-main">'+
      '<div class="dg-title">'+(p.pinned?'<span class="dg-pin">📌 Pinned</span>':'')+escHtml(postTitle(p))+'</div>'+
      '<div class="dg-meta"><span class="dg-who">'+esc(p.author_name||'Member')+'</span> <span class="dg-tierb">'+td.emoji+' '+td.label+'</span> <span class="dg-dot">·</span> '+_timeAgo(p.created_at)+'</div>'+
      (snip?'<div class="dg-snip">'+escHtml(snip)+'</div>':'')+
    '</div>'+
    '<div class="dg-side">'+thumb+'<div class="dg-counts">💬 '+cc+' &nbsp; ❤ '+rc+'</div><span class="dg-chev">›</span></div>'+
  '</div>';
}
function postCardHTML(p){
  const myReacts=LS.get('post_reacts',{});
  const initials=(p.author_name||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const td=TIERS_DATA[p.author_tier]||TIERS_DATA.silver;
  const authorMember=MEMBERS.find(m=>m.id===p.author_id);
  const authorPhoto=authorMember&&authorMember.photo_url;
  const avatarHtml=authorPhoto
    ?'<img src="'+authorPhoto+'" style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid rgba(200,168,75,.3)"/>'
    :'<div class="post-avatar">'+initials+'</div>';
  const isOwner=currentUser&&currentUser.id===p.author_id;
  const isAdmin=currentUser&&currentUser.role==='admin';
  const pComments=p.comments||[];
  const commentCount=pComments.length;
  const totalReacts=_reactTotal(p);
  return '<div class="post-card" id="post-'+p.id+'">'+
    '<div class="post-header">'+
      avatarHtml+
      '<div class="post-meta">'+
        '<div class="post-author" onclick="viewMemberProfile(\''+p.author_id+'\')" style="cursor:pointer">'+p.author_name+(p.pinned?' <span class="post-pin-tag">📌 Pinned</span>':'')+'</div>'+
        '<div class="post-tier">'+td.emoji+' '+td.label+' · '+(p.created_at||'').slice(0,10)+'</div>'+
      '</div>'+
      (isOwner||isAdmin?
        '<div class="post-menu-wrap">'+
          '<button class="post-menu-btn" onclick="togglePostMenu(\'menu-'+p.id+'\')">⋯</button>'+
          '<div class="post-menu" id="menu-'+p.id+'" style="display:none">'+
            (isAdmin?'<button onclick="togglePin(\''+p.id+'\');document.getElementById(\'menu-'+p.id+'\').style.display=\'none\'">'+(p.pinned?'📌 Unpin':'📌 Pin to top')+'</button>':'')+
            (isOwner?'<button onclick="editPost(\''+p.id+'\');document.getElementById(\'menu-'+p.id+'\').style.display=\'none\'">✏ Edit</button>':'')+
            '<button onclick="deletePost(\''+p.id+'\');document.getElementById(\'menu-'+p.id+'\').style.display=\'none\'" style="color:var(--rust)">'+(isAdmin&&!isOwner?'🚫 Remove':'🗑 Delete')+'</button>'+
          '</div>'+
        '</div>'
      :'')+
    '</div>'+
    (p.title&&p.title.trim()?'<div class="post-title-h">'+escHtml(p.title.trim())+'</div>':'')+
    (p.body?'<div class="post-body">'+escHtml(p.body)+'</div>':'')+
    (p.image_url?'<img src="'+p.image_url+'" class="post-image" alt="Post image" onclick="openImageFull(\''+p.image_url+'\')"/>':'')+
    (p.video_url?'<div class="post-video-wrap"><video src="'+p.video_url+'" controls playsinline preload="metadata"></video></div>':'')+
    (p.doc_url?'<a class="post-doc" href="'+esc(p.doc_url)+'" target="_blank" rel="noopener"><span class="post-doc-ico">📄</span><span class="post-doc-meta"><span class="post-doc-name">'+esc(p.doc_name||'Document')+'</span><span class="post-doc-sub">Tap to open · PDF / document</span></span><span class="post-doc-dl">⬇</span></a>':'')+
    (totalReacts>0?'<div class="post-react-summary">'+POST_EMOJIS.filter(r=>(p.reactions[r.key]||0)>0).map(r=>r.emoji+' '+p.reactions[r.key]).join('  ')+'<span style="margin-left:auto">'+commentCount+' comment'+(commentCount!==1?'s':'')+'</span></div>':'<div class="post-react-summary"><span>'+commentCount+' comment'+(commentCount!==1?'s':'')+'</span></div>')+
    '<div class="post-reactions">'+
      POST_EMOJIS.map(r=>'<button class="post-react-btn'+(myReacts[p.id]===r.key?' active':'')+'" onclick="reactToPost(\''+p.id+'\',\''+r.key+'\',this)" title="'+r.label+'">'+r.emoji+' '+r.label+'</button>').join('')+
      '<button class="post-react-btn comment-btn" onclick="focusPostComment(\'pci-'+p.id+'\')">💬 Comment</button>'+
    '</div>'+
    '<div class="post-comments-wrap" id="pcomments-'+p.id+'">'+
      (pComments.length?pComments.map(c=>{
        const cM=MEMBERS.find(m=>m.id===c.author_id);
        const cP=cM&&cM.photo_url;
        const cI=(c.author_name||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
        const cTd=TIERS_DATA[c.author_tier]||TIERS_DATA.silver;
        const canDel=currentUser&&(currentUser.id===c.author_id||currentUser.role==='admin');
        return '<div class="post-comment" id="pcomment-'+c.id+'">'+
          '<div class="pc-avatar">'+(cP?'<img src="'+cP+'" style="width:32px;height:32px;border-radius:50%;object-fit:cover"/>':cI)+'</div>'+
          '<div class="pc-bubble">'+
            '<span class="pc-name">'+c.author_name+' <span class="pc-tier">'+cTd.emoji+'</span></span>'+
            '<div class="pc-text">'+escHtml(c.body)+'</div>'+
            '<div class="pc-time">'+(c.created_at||'').slice(0,16).replace('T',' ')+'</div>'+
          '</div>'+
          (canDel?'<button class="pc-del" onclick="deletePostComment(\''+c.id+'\',\''+p.id+'\')">✕</button>':'')+
        '</div>';
      }).join(''):'<div class="pc-empty">No comments yet — be the first!</div>')+
      (currentUser?
        '<div class="post-comment-input-wrap">'+
          '<div class="pc-avatar">'+(currentUser.photo_url?'<img src="'+currentUser.photo_url+'" style="width:32px;height:32px;border-radius:50%;object-fit:cover"/>':currentUser.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase())+'</div>'+
          '<div class="pc-input-row">'+
            '<input id="pci-'+p.id+'" class="pc-input" placeholder="Write a comment..." onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();submitPostComment(\''+p.id+'\')}" />'+
            '<button class="pc-send" onclick="submitPostComment(\''+p.id+'\')">➤</button>'+
          '</div>'+
        '</div>'
      :'<p style="font-size:.78rem;color:var(--muted);padding:.6rem 1.25rem"><a href="#" onclick="openModal(\'m-login\');return false" style="color:var(--canopy-lt);font-weight:600">Sign in</a> to comment</p>')+
    '</div>'+
  '</div>';
}
function openPostModal(id){
  const p=POSTS.find(x=>x.id===id);if(!p)return;
  _openPostId=id;
  const b=document.getElementById('open-post-body');if(b)b.innerHTML=postCardHTML(p);
  openModal('m-postview');
}
function closePostModal(){_openPostId=null;closeModal('m-postview');}
function refreshOpenPostModal(){
  if(!_openPostId)return;
  const p=POSTS.find(x=>x.id===_openPostId);
  const b=document.getElementById('open-post-body');
  if(p&&b)b.innerHTML=postCardHTML(p);
  else if(!p){_openPostId=null;closeModal('m-postview');}
}
async function togglePin(id){
  const p=POSTS.find(x=>x.id===id);if(!p)return;
  const {error}=await sb.from('member_posts').update({pinned:!p.pinned}).eq('id',id);
  if(error){toast('⚠ Could not update.');console.error(error);return}
  await loadPosts();renderPosts();toast(p.pinned?'Unpinned.':'📌 Pinned to top.');
}
function renderPosts(filter){
  currentPostFilter=filter||currentPostFilter;
  const el=document.getElementById('posts-feed');if(!el)return;
  // Search reaches EVERY post (incl. older/archived); the clean default feed shows
  // only recent posts so the timeline never clutters — older ones surface via search.
  const RECENT_CAP=12;
  let items,moreHidden=0,searching=!!_postSearch;
  if(searching){
    const q=_postSearch;
    items=POSTS.filter(p=>((p.title||'')+' '+(p.body||'')+' '+(p.author_name||'')).toLowerCase().includes(q));
    items=_sortPosts(items);
  }else{
    let fresh=POSTS.filter(p=>!_isArchived(p));
    fresh=_sortPosts(fresh);
    if(!_showAll.posts&&fresh.length>RECENT_CAP){moreHidden=fresh.length-RECENT_CAP;items=fresh.slice(0,RECENT_CAP);}
    else items=fresh;
  }
  const header=_postsHeader(items.length)+(searching?'':eventsCarouselHTML());
  const starter=searching?'':_postStarter();
  if(!items.length){
    const empty=searching
      ?'<div class="post-empty"><div style="font-size:2.5rem;margin-bottom:.75rem">🔍</div><h4>No posts match “'+esc(_postSearch)+'”</h4><p>Try a different word or clear the search.</p></div>'
      :'<div class="post-empty"><div style="font-size:2.5rem;margin-bottom:.75rem">🌿</div><h4>No posts yet</h4><p>Be the first to share a conservation story or community update.</p></div>';
    el.innerHTML=header+starter+empty;
    refreshOpenPostModal();return;
  }
  // Weave in live ad campaigns as Sponsored cards (after the 2nd item, then every 5)
  const ads=adsFor('feed');
  const pieces=items.map(_postView==='feed'?postCardHTML:postDigestRowHTML);
  if(ads.length){
    let ai=0;
    for(let pos=2;pos<=pieces.length&&ai<ads.length;pos+=6){pieces.splice(pos,0,adCardHTML(ads[ai%ads.length]));ai++;}
    if(pieces.length<=2&&ai===0)pieces.push(adCardHTML(ads[0]));
  }
  const body=_postView==='feed'
    ? pieces.join('')
    : '<div class="digest-list">'+pieces.join('')+'</div>';
  const footer=searching
    ? '<div class="feed-morehint">Showing all matches for “'+esc(_postSearch)+'”. <a href="#" onclick="setPostSearch(\'\');return false">Clear search</a></div>'
    : (moreHidden>0
        ? '<div class="feed-morehint">🔍 <b>'+moreHidden+'</b> older post'+(moreHidden!==1?'s':'')+' kept out of the way — search above to find any of them.</div>'
        : _postsArchiveToggle());
  el.innerHTML=header+starter+(searching?'':bannerStripHTML())+body+footer;
  refreshOpenPostModal();
  renderAdRail();
  maybeShowAdPopup();
}

function escHtml(t){return(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

/* Post comment helpers */
function focusPostComment(inputId){
  const el=document.getElementById(inputId);
  if(el){el.focus();el.scrollIntoView({behavior:'smooth',block:'nearest'});}
  else if(!currentUser){openModal('m-login');}
}

function togglePostMenu(menuId){
  const menu=document.getElementById(menuId);
  if(!menu)return;
  const isOpen=menu.style.display!=='none';
  // Close all other menus first
  document.querySelectorAll('.post-menu').forEach(m=>m.style.display='none');
  menu.style.display=isOpen?'none':'block';
  if(!isOpen){
    // Close on outside click
    setTimeout(()=>{
      const handler=e=>{if(!menu.contains(e.target)){menu.style.display='none';document.removeEventListener('click',handler);}};
      document.addEventListener('click',handler);
    },10);
  }
}

function openImageFull(url){
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:999;display:flex;align-items:center;justify-content:center;cursor:zoom-out';
  ov.onclick=()=>ov.remove();
  ov.innerHTML='<img src="'+url+'" style="max-width:96vw;max-height:92vh;object-fit:contain;border-radius:8px"/>';
  document.body.appendChild(ov);
}

async function submitPostComment(postId){
  if(!currentUser){toast('Sign in to comment.');return}
  const input=document.getElementById('pci-'+postId);
  if(!input)return;
  const body=input.value.trim();
  if(!body){return}
  input.disabled=true;
  const row={
    post_id:postId,
    author_id:currentUser.id,
    author_name:currentUser.name,
    author_tier:currentUser.tier||'silver',
    body,
  };
  const{error}=await sb.from('post_comments').insert(row);
  if(error){toast('⚠ Could not post comment.');console.error(error);input.disabled=false;return}
  input.value='';
  input.disabled=false;
  await loadPosts();renderPosts();
}

async function deletePostComment(commentId,postId){
  if(!currentUser){return}
  const{error}=await sb.from('post_comments').delete().eq('id',commentId);
  if(error){toast('⚠ Could not delete comment.');console.error(error);return}
  const el=document.getElementById('pcomment-'+commentId);
  if(el){el.style.opacity='0';el.style.transition='opacity .2s';setTimeout(()=>el.remove(),200);}
  await loadPosts();renderPosts();
}


function handlePostImage(e){
  const f=e.target.files[0];if(!f)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    postImageData=ev.target.result;
    document.getElementById('post-img-prev').innerHTML=
      '<div style="position:relative;margin-top:.5rem"><img src="'+postImageData+'" style="width:100%;max-height:200px;object-fit:cover;border-radius:var(--r-sm)"/><button onclick="postImageData=null;document.getElementById(\'post-img-prev\').innerHTML=\'\'" style="position:absolute;top:.4rem;right:.4rem;background:rgba(0,0,0,.6);color:#fff;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:.8rem">✕</button></div>';
  };
  reader.readAsDataURL(f);
}
let postVideoFile=null;
function handlePostVideo(e){
  const f=e.target.files[0];if(!f)return;
  postVideoFile=f;
  document.getElementById('post-vid-prev').innerHTML=
    '<div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem;padding:.5rem;background:var(--mist);border-radius:var(--r-sm)">'+
      '<span style="font-size:1.2rem">🎬</span>'+
      '<span style="font-size:.82rem;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+f.name+'</span>'+
      '<span style="font-size:.72rem;color:var(--muted)">'+(f.size/1024/1024).toFixed(1)+'MB</span>'+
      '<button onclick="postVideoFile=null;document.getElementById(\'post-vid-prev\').innerHTML=\'\'" style="background:none;border:none;cursor:pointer;color:var(--muted);font-size:1rem">✕</button>'+
    '</div>';
}

let postDocFile=null;
function handlePostDoc(e){
  const f=e.target.files[0];if(!f)return;
  postDocFile=f;
  document.getElementById('post-doc-prev').innerHTML=
    '<div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem;padding:.5rem;background:var(--mist);border-radius:var(--r-sm)">'+
      '<span style="font-size:1.2rem">📄</span>'+
      '<span style="font-size:.82rem;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(f.name)+'</span>'+
      '<span style="font-size:.72rem;color:var(--muted)">'+(f.size/1024/1024).toFixed(1)+'MB</span>'+
      '<button onclick="postDocFile=null;document.getElementById(\'post-doc-prev\').innerHTML=\'\'" style="background:none;border:none;cursor:pointer;color:var(--muted);font-size:1rem">✕</button>'+
    '</div>';
}

// Word count live feedback
document.addEventListener('input',e=>{
  if(e.target.id==='post-body'){
    const words=e.target.value.trim().split(/\s+/).filter(Boolean).length;
    let wc=document.getElementById('post-word-count');
    if(!wc){wc=document.createElement('div');wc.id='post-word-count';wc.className='word-count';e.target.parentNode.appendChild(wc);}
    wc.textContent=words+' / 400 words';
    wc.className='word-count'+(words>400?' over':'');
  }
});

async function submitPost(){
  if(!currentUser){toast('Sign in to post.');return}
  const body=document.getElementById('post-body').value.trim();
  const titleEl=document.getElementById('post-title');
  const title=titleEl?titleEl.value.trim().slice(0,90):'';
  const editId=document.getElementById('post-edit-id').value;
  if(!body&&!postImageData&&!postVideoFile&&!postDocFile){toast('⚠ Write something or attach a photo, video, or document.');return}
  const words=body.split(/\s+/).filter(Boolean).length;
  if(words>400){toast('⚠ Post exceeds 400 words. Please shorten it.');return}
  toast('⬆ Publishing...');

  let imageUrl='';
  if(postImageData){
    const blob=await(await fetch(postImageData)).blob();
    const path='posts/img_'+Date.now()+'_'+currentUser.id+'.jpg';
    const{error:upErr}=await sb.storage.from('content-files').upload(path,blob,{contentType:'image/jpeg'});
    if(!upErr){const{data}=sb.storage.from('content-files').getPublicUrl(path);imageUrl=data.publicUrl;}
    else{console.error('image upload',upErr);}
  }

  let videoUrl='';
  if(postVideoFile){
    const ext=postVideoFile.name.split('.').pop().toLowerCase();
    const path='posts/vid_'+Date.now()+'_'+currentUser.id+'.'+ext;
    const{error:upErr}=await sb.storage.from('content-files').upload(path,postVideoFile,{contentType:postVideoFile.type});
    if(!upErr){const{data}=sb.storage.from('content-files').getPublicUrl(path);videoUrl=data.publicUrl;}
    else{console.error('video upload',upErr);toast('⚠ Video upload failed — check your Supabase storage bucket size limit.');}
  }

  let docUrl='';let docName='';
  if(postDocFile){
    const ext=(postDocFile.name.split('.').pop()||'file').toLowerCase();
    const path='posts/doc_'+Date.now()+'_'+currentUser.id+'.'+ext;
    const{error:upErr}=await sb.storage.from('content-files').upload(path,postDocFile,{contentType:postDocFile.type||'application/octet-stream'});
    if(!upErr){const{data}=sb.storage.from('content-files').getPublicUrl(path);docUrl=data.publicUrl;docName=postDocFile.name;}
    else{console.error('doc upload',upErr);toast('⚠ Document upload failed — try a smaller file.');}
  }

  if(editId){
    const updates={body,title:title||null};
    if(imageUrl)updates.image_url=imageUrl;
    if(videoUrl)updates.video_url=videoUrl;
    if(docUrl){updates.doc_url=docUrl;updates.doc_name=docName;}
    const{error}=await sb.from('member_posts').update(updates).eq('id',editId);
    if(error){toast('⚠ Could not update post.');console.error(error);return}
    toast('✅ Post updated.');
  }else{
    const row={
      author_id:currentUser.id,
      author_name:currentUser.name,
      author_tier:currentUser.tier||'silver',
      body,
      title:title||null,
      image_url:imageUrl||null,
      video_url:videoUrl||null,
      doc_url:docUrl||null,
      doc_name:docName||null,
      reactions:{likes:0,thumbsup:0,support:0,wow:0,celebrate:0},
    };
    const{error}=await sb.from('member_posts').insert(row);
    if(error){toast('⚠ Could not publish post. Check Supabase RLS policies.');console.error(error);return}
    toast('✅ Post published!');
  }

  // Reset form
  document.getElementById('post-body').value='';
  {const pt=document.getElementById('post-title');if(pt)pt.value='';}
  document.getElementById('post-img-prev').innerHTML='';
  document.getElementById('post-vid-prev').innerHTML='';
  const dp=document.getElementById('post-doc-prev');if(dp)dp.innerHTML='';
  document.getElementById('post-edit-id').value='';
  document.getElementById('post-modal-title').textContent='Create a Post';
  const wc=document.getElementById('post-word-count');if(wc)wc.textContent='';
  postImageData=null;
  postVideoFile=null;
  postDocFile=null;
  closeModal('m-create-post');
  await loadPosts();renderPosts();renderAdminPosts();
}

function editPost(id){
  const p=POSTS.find(x=>x.id===id);if(!p)return;
  if(currentUser.id!==p.author_id&&currentUser.role!=='admin'){toast('You can only edit your own posts.');return}
  document.getElementById('post-edit-id').value=id;
  document.getElementById('post-modal-title').textContent='Edit Post';
  {const pt=document.getElementById('post-title');if(pt)pt.value=p.title||'';}
  document.getElementById('post-body').value=p.body||'';
  document.getElementById('post-img-prev').innerHTML='';
  document.getElementById('post-vid-prev').innerHTML='';
  const dp=document.getElementById('post-doc-prev');if(dp)dp.innerHTML='';
  postImageData=null;
  postVideoFile=null;
  postDocFile=null;
  openModal('m-create-post');
}

async function deletePost(id){
  const p=POSTS.find(x=>x.id===id);if(!p)return;
  const isOwner=currentUser&&currentUser.id===p.author_id;
  const isAdmin=currentUser&&currentUser.role==='admin';
  if(!isOwner&&!isAdmin){toast('You do not have permission to remove this post.');return}
  const msg=isAdmin&&!isOwner
    ?'Remove this post for violating community standards?'
    :'Delete your post permanently?';
  if(!confirm(msg))return;
  const{error}=await sb.from('member_posts').delete().eq('id',id);
  if(error){toast('⚠ Could not remove post.');console.error(error);return}
  document.getElementById('post-'+id)?.remove();
  POSTS=POSTS.filter(x=>x.id!==id);
  renderAdminPosts();
  toast(isAdmin&&!isOwner?'Post removed.':'Post deleted.');
}

async function reactToPost(id,key,btn){
  if(!currentUser){toast('Sign in to react.');openModal('m-login');return}
  const p=POSTS.find(x=>x.id===id);if(!p)return;
  const myReacts=LS.get('post_reacts',{});
  const reactions={...p.reactions};
  const prev=myReacts[id];
  if(prev===key){
    reactions[key]=Math.max(0,(reactions[key]||0)-1);
    delete myReacts[id];
  }else{
    if(prev)reactions[prev]=Math.max(0,(reactions[prev]||0)-1);
    reactions[key]=(reactions[key]||0)+1;
    myReacts[id]=key;
  }
  // Optimistic UI: update in-memory + repaint instantly, then sync in the background
  p.reactions=reactions;
  LS.set('post_reacts',myReacts);
  renderPosts();
  refreshOpenPostModal();
  const {error}=await sb.from('member_posts').update({reactions}).eq('id',id);
  if(error){console.error('react sync',error);toast('⚠ Reaction not saved — check your connection.');}
}

function filterAdminPosts(f){renderAdminPosts(f)}
function renderAdminPosts(filter){
  const el=document.getElementById('admin-posts-list');if(!el)return;
  const items=POSTS;
  if(!items.length){el.innerHTML='<p style="color:var(--muted);font-size:.87rem">No posts yet.</p>';return}
  el.innerHTML=items.map(p=>
    '<div class="adm-card" style="border-left:4px solid var(--canopy-lt);margin-bottom:.75rem">'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem">'+
        '<div>'+
          '<div style="font-weight:700;font-size:.88rem;color:var(--canopy)">'+esc(p.author_name)+' <span style="font-weight:400;color:var(--muted)">('+esc(p.author_tier)+')</span></div>'+
          '<div style="font-size:.72rem;color:var(--muted);margin-bottom:.45rem">'+(p.created_at||'').slice(0,16).replace('T',' ')+'</div>'+
          '<div style="font-size:.83rem;color:var(--text);line-height:1.6;margin-bottom:.35rem">'+esc(p.body||'')+'</div>'+
          (p.image_url?'<img src="'+p.image_url+'" style="max-width:200px;border-radius:var(--r-sm);margin-top:.4rem"/>':'')+
          (p.video_url?'<div style="font-size:.75rem;color:var(--canopy-lt);margin-top:.35rem">📹 '+p.video_url+'</div>':'')+
        '</div>'+
        '<button class="btn btn-danger btn-sm" style="flex-shrink:0" onclick="deletePost(\''+p.id+'\')">Remove</button>'+
      '</div>'+
    '</div>'
  ).join('');
}

/* ═══ LEAVE MEMBERSHIP & UNSUBSCRIBE ═══ */
async function confirmLeave(){
  const val=document.getElementById('leave-confirm').value.trim().toUpperCase();
  if(val!=='LEAVE'){toast('⚠ Type LEAVE in capitals to confirm.');return}
  if(!currentUser){return}
  const{error}=await sb.from('members').update({status:'inactive',role:'left'}).eq('id',currentUser.id);
  if(error){toast('⚠ Could not process. Please email info@ugandabiodiversityfund.org.');console.error(error);return}
  closeModal('m-leave');
  toast('You have left the Friends of Biodiversity programme. Goodbye and thank you for your contribution.');
  setTimeout(()=>doLogout(),2500);
}

/* ═══ ADMIN — REMOVE MEMBER ═══ */
async function adminRemoveMember(id,name){
  if(!confirm('Remove '+name+' from the membership? This will deactivate their account.'))return;
  const{error}=await sb.from('members').update({status:'removed',role:'removed'}).eq('id',id);
  if(error){toast('⚠ Could not remove member.');console.error(error);return}
  await loadMembers();renderAdminMembers();
  toast('✅ '+name+' has been removed from the membership.');
}

/* ═══ EDIT / DELETE FOOTPRINT STAT ═══ */
function editFootprintStat(key){
  const extra=getExtraStats();
  const s=extra.find(e=>e.key===key);
  if(!s){toast('Default stats can only have their proof link edited, not the figures. Use Edit Link.');return}
  document.getElementById('nfs-ico').value=s.ico||'';
  document.getElementById('nfs-val').value=s.val||'';
  document.getElementById('nfs-prefix').value=s.prefix||'';
  document.getElementById('nfs-suffix').value=s.suffix||'';
  document.getElementById('nfs-label').value=s.label||'';
  const links=getStatLinks();
  const link=links[key]||{};
  document.getElementById('nfs-url').value=link.url||'';
  document.getElementById('nfs-desc').value=link.desc||'';
  // Repurpose modal to edit mode
  document.querySelector('#m-add-footprint h2').textContent='Edit Stat';
  document.querySelector('#m-add-footprint .btn-canopy').textContent='Save Changes';
  document.querySelector('#m-add-footprint .btn-canopy').setAttribute('onclick','saveEditedStat(\''+key+'\')');
  openModal('m-add-footprint');
}
function saveEditedStat(key){
  const extra=getExtraStats();
  const idx=extra.findIndex(e=>e.key===key);if(idx===-1)return;
  extra[idx]={
    ...extra[idx],
    ico:document.getElementById('nfs-ico').value.trim()||extra[idx].ico,
    val:parseInt(document.getElementById('nfs-val').value)||extra[idx].val,
    prefix:document.getElementById('nfs-prefix').value.trim(),
    suffix:document.getElementById('nfs-suffix').value.trim(),
    label:document.getElementById('nfs-label').value.trim()||extra[idx].label,
  };
  LS.set('extra_stats',extra);
  const url=document.getElementById('nfs-url').value.trim();
  if(url){const links=getStatLinks();links[key]={url,desc:document.getElementById('nfs-desc').value.trim(),label:extra[idx].label};LS.set('stat_links',links);}
  // Reset modal back to add mode
  document.querySelector('#m-add-footprint h2').textContent='Add New Footprint Stat';
  document.querySelector('#m-add-footprint .btn-canopy').textContent='Add to Homepage';
  document.querySelector('#m-add-footprint .btn-canopy').setAttribute('onclick','addFootprintStat()');
  ['nfs-ico','nfs-val','nfs-prefix','nfs-suffix','nfs-label','nfs-url','nfs-desc'].forEach(id=>document.getElementById(id).value='');
  closeModal('m-add-footprint');
  // Update DOM cell
  const cell=document.querySelector('.stat-cell[data-key="'+key+'"]');
  if(cell){
    const stat=extra[idx];
    cell.querySelector('.stat-ico').textContent=stat.ico;
    cell.querySelector('.stat-l').textContent=stat.label;
  }
  renderFootprintAdmin();renderStatHints();
  toast('✅ Stat updated.');
}

/* ═══ TOAST ═══ */
let _tt;
function toast(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(_tt);_tt=setTimeout(()=>t.classList.remove('show'),4200);
}

/* ═══ GO ═══ */
bootstrapApp();
showEP(true);

/* ═══ PWA — SERVICE WORKER REGISTRATION & INSTALL PROMPT ═══ */
let pwaInstallPrompt=null;

// Register service worker
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('sw.js')
      .then(reg=>console.log('FoB PWA: Service worker registered',reg.scope))
      .catch(err=>console.log('FoB PWA: Service worker failed',err));
  });
}

// Capture the install prompt before it fires
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();
  pwaInstallPrompt=e;
  showPWABanner();
});

// Show a friendly install banner
function showPWABanner(){
  if(LS.get('pwa_dismissed',false))return;
  const existing=document.getElementById('pwa-banner');
  if(existing)return;
  const banner=document.createElement('div');
  banner.id='pwa-banner';
  banner.innerHTML=
    '<div style="display:flex;align-items:center;gap:.75rem;flex:1">'+
      '<img src="icon-96.png" style="width:42px;height:42px;border-radius:10px;flex-shrink:0"/>'+
      '<div>'+
        '<div style="font-weight:700;font-size:.88rem;color:var(--canopy)">Install Friends of Biodiversity</div>'+
        '<div style="font-size:.76rem;color:var(--muted);margin-top:.1rem">Add to your home screen for quick access</div>'+
      '</div>'+
    '</div>'+
    '<div style="display:flex;gap:.5rem;flex-shrink:0">'+
      '<button onclick="installPWA()" style="padding:.45rem 1rem;background:var(--canopy);color:#fff;border:none;border-radius:var(--r-sm);font-weight:700;font-size:.8rem;cursor:pointer">Install</button>'+
      '<button onclick="dismissPWABanner()" style="padding:.45rem .75rem;background:transparent;color:var(--muted);border:1px solid var(--border);border-radius:var(--r-sm);font-size:.8rem;cursor:pointer">Not now</button>'+
    '</div>';
  banner.style.cssText=
    'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);'+
    'width:calc(100vw - 2rem);max-width:520px;'+
    'background:#fff;border-radius:var(--r);padding:1rem 1.1rem;'+
    'box-shadow:0 4px 24px rgba(0,0,0,.18);z-index:700;'+
    'display:flex;align-items:center;gap:1rem;flex-wrap:wrap;'+
    'border-top:3px solid var(--canopy-lt);'+
    'animation:slideUp .4s ease;';
  document.body.appendChild(banner);
}

async function installPWA(){
  if(!pwaInstallPrompt)return;
  pwaInstallPrompt.prompt();
  const result=await pwaInstallPrompt.userChoice;
  if(result.outcome==='accepted'){
    toast('🌿 App installed! Find "FoB Green Card" on your home screen.');
    dismissPWABanner();
  }
  pwaInstallPrompt=null;
}

function dismissPWABanner(){
  const banner=document.getElementById('pwa-banner');
  if(banner)banner.remove();
  LS.set('pwa_dismissed',true);
}

// Show success message if app was launched from home screen
if(window.matchMedia('(display-mode: standalone)').matches){
  window.addEventListener('load',()=>{
    setTimeout(()=>toast('🌿 Welcome to the Friends of Biodiversity app!'),1000);
  });
}
