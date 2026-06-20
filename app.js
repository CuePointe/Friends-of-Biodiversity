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
  'p.musiime@ugandabiodiversityfund.org',
  'd.okullu@ugandabiodiversityfund.org',
  'w.nabantanzi@ugandabiodiversityfund.org',
  's.abonyo@ugandabiodiversityfund.org',
];
const ADMIN_NAMES={
  'i.amani@ugandabiodiversityfund.org':'Executive Director',
  'o.atuhaire@ugandabiodiversityfund.org':'Projects Officer',
  't.otieno@ugandabiodiversityfund.org':'Office Assistant',
  'p.musiime@ugandabiodiversityfund.org':'Programs Officer',
  'd.okullu@ugandabiodiversityfund.org':'M&E Officer',
  'w.nabantanzi@ugandabiodiversityfund.org':'Finance Manager',
  's.abonyo@ugandabiodiversityfund.org':'Administration Officer',
};
const ADMIN_DEFAULT_PASS='UBF@2026!';

/* ═══ HERO SLIDESHOW IMAGES (static files shipped with the site) ═══ */
const SLIDE_IMAGES=Array.from({length:13},(_,i)=>`slide-${i+1}.jpg`);

/* ═══ LOCAL UI-ONLY STATE (not shared data — just this browser's session/cache) ═══ */
const LS={
  get:(k,d)=>{try{const v=localStorage.getItem('ubf_'+k);return v!==null?JSON.parse(v):d}catch{return d}},
  set:(k,v)=>{try{localStorage.setItem('ubf_'+k,JSON.stringify(v))}catch{}},
};

/* ═══ APP STATE — populated from Supabase on load, kept live ═══ */
let MEMBERS=[];
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

/* ═══ INIT ADMIN ACCOUNTS IF MISSING (runs once against Supabase) ═══ */
async function initAdmins(){
  let failCount=0;
  for(const email of ADMIN_EMAILS){
    const exists=MEMBERS.find(m=>m.email.toLowerCase()===email);
    if(!exists){
      const {error}=await sb.from('members').insert({
        name:ADMIN_NAMES[email]||'Admin',
        email,pass:ADMIN_DEFAULT_PASS,type:'staff',tier:'diamond',
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
function renderPaymentUI(){
  const map={
    'pay-bank-name':PAYMENT.bank,'pay-acc-no':PAYMENT.accno,'pay-branch':PAYMENT.branch,
    'pay-swift':PAYMENT.swift,'pay-mtn':PAYMENT.mtn,'pay-airtel':PAYMENT.airtel,
  };
  Object.entries(map).forEach(([id,val])=>{
    if(val){const el=document.getElementById(id);if(el)el.textContent=val}
  });
}

/* ═══ APP BOOTSTRAP — load everything from Supabase, then render ═══ */
async function bootstrapApp(){
  preloadSlides(); // start downloading all slide images immediately in background
  showLoadingToast();
  await Promise.all([loadMembers(),loadContent(),loadAnnouncements(),loadFinReports(),loadFame(),loadPayment()]);
  await initAdmins();
  await loadMembers(); // refresh in case admins were just inserted
  renderPaymentUI();
  initSlideshow();
  renderThemes();
  renderFilters();
  renderContent();
  renderFame();
  renderPublicAnnounces();
  hideLoadingToast();
  subscribeRealtime();
}
function showLoadingToast(){toast('🌿 Loading live data...')}
function hideLoadingToast(){/* toast auto-clears */}

/* ═══ REALTIME — auto-refresh when any user changes shared data ═══ */
function subscribeRealtime(){
  sb.channel('public:content').on('postgres_changes',{event:'*',schema:'public',table:'content'},async()=>{await loadContent();renderContent();renderAdminContent()}).subscribe();
  sb.channel('public:comments').on('postgres_changes',{event:'*',schema:'public',table:'comments'},async()=>{await loadContent();renderContent()}).subscribe();
  sb.channel('public:wall_of_fame').on('postgres_changes',{event:'*',schema:'public',table:'wall_of_fame'},async()=>{await loadFame();renderFame();renderAdminFame()}).subscribe();
  sb.channel('public:announcements').on('postgres_changes',{event:'*',schema:'public',table:'announcements'},async()=>{await loadAnnouncements();renderPublicAnnounces();renderAdminAnnounces()}).subscribe();
  sb.channel('public:fin_reports').on('postgres_changes',{event:'*',schema:'public',table:'fin_reports'},async()=>{await loadFinReports();renderFinancials()}).subscribe();
  sb.channel('public:members').on('postgres_changes',{event:'*',schema:'public',table:'members'},async()=>{await loadMembers();renderAdminMembers()}).subscribe();
  sb.channel('public:payment_details').on('postgres_changes',{event:'*',schema:'public',table:'payment_details'},async()=>{await loadPayment();renderPaymentUI()}).subscribe();
}

/* ═══ HERO SLIDESHOW ═══ */
let curSlide=0;
/* ═══ PRELOAD ALL SLIDE IMAGES — ensures instant transitions, no delay ═══ */
function preloadSlides(){
  SLIDE_IMAGES.forEach(src=>{
    const img=new Image();
    img.src=src;
  });
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
    d.style.backgroundImage=`url('${src}')`;
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
  await loadMembers();
  const u=MEMBERS.find(m=>m.email.toLowerCase()===em&&m.pass===pw);
  if(!u){toast('⚠ Email or password incorrect.');return}
  if(u.role==='admin'){toast('⚠ Admin accounts must use the admin sign-in.');return}
  currentUser=u;closeModal('m-login');updateNav();
  toast('🌿 Welcome back, '+u.name.split(' ')[0]+'!');showView('member');
}
async function doAdminLogin(){
  const em=document.getElementById('al-email').value.trim().toLowerCase();
  const pw=document.getElementById('al-pass').value;
  if(!ADMIN_EMAILS.includes(em)){toast('⚠ This email is not authorised for admin access.');return}
  if(!em.endsWith('@ugandabiodiversityfund.org')){toast('⚠ Admin login requires a @ugandabiodiversityfund.org email.');return}
  await loadMembers();
  const acct=MEMBERS.find(m=>m.email.toLowerCase()===em&&m.role==='admin');
  if(!acct){toast('⚠ No admin account found for this email in the database — ask your developer to check the members table.');return}
  if(acct.pass!==pw){toast('⚠ Incorrect password. Default for first login: '+ADMIN_DEFAULT_PASS);return}
  currentUser=acct;closeModal('m-admin-login');updateNav();
  document.getElementById('adm-user-info').textContent=acct.name+' ('+ADMIN_NAMES[em]+') — '+em;
  toast('⚙ Admin access granted. Welcome, '+acct.name+'.');showView('admin');
}
function doLogout(){currentUser=null;updateNav();showView('main');toast('Signed out successfully.')}
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
  renderContent();
}

/* ═══ ENROLL ═══ */
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
  const nm={name,email,pass,tel,type,tier,amount,year,payref,
    org:document.getElementById('ef-org').value.trim(),
    engage:document.getElementById('ef-engage').value,
    role:'member',status:'active'};
  const {error}=await sb.from('members').insert(nm);
  if(error){toast('⚠ Could not register — please try again.');console.error(error);return}
  await loadMembers();
  this.style.display='none';document.getElementById('enroll-success').style.display='block';
  await logEmail('Welcome to Friends of Biodiversity','New member: '+email+' ('+tier+') · '+new Date().toLocaleDateString());
  toast('🌿 Welcome, '+name.split(' ')[0]+'! Enrollment registered.');
  showEP(false);
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

function renderFilters(){
  const el=document.getElementById('content-filters');
  if(!el)return;
  const types=['All','Video','Documentary','Podcast','Interview','Article','Research'];
  el.innerHTML=types.map((t,i)=>'<button class="ftag'+(i===0?' active':'')+'" data-cf="'+(t==='All'?'all':t.toLowerCase())+'" onclick="setFilter(this)">'+t+'</button>').join('');
}
function setFilter(btn){document.querySelectorAll('[data-cf]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeFilter=btn.dataset.cf;renderContent()}

function uRank(){
  if(!currentUser)return 0;
  return TIERS_DATA[currentUser.tier]?.r||1;
}
function renderContent(){
  const grid=document.getElementById('content-grid');if(!grid)return;
  const ur=uRank();
  let items=CONTENT;
  if(activeFilter!=='all')items=items.filter(c=>c.type===activeFilter);
  if(!items.length){grid.innerHTML='<p style="color:var(--muted);font-size:.9rem;padding:1.5rem 0;grid-column:1/-1">No content published yet. Admins can upload videos, documentaries, podcasts, interviews, articles and research via the Admin panel.</p>';return}
  const bkd=LS.get('bookmarked',[]);const myReactions=LS.get('my_reactions',{});
  grid.innerHTML=items.map(c=>{
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
    const thumbContent=ytThumb
      ?`<img src="${ytThumb}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.classList.add('thumb-fallback');this.remove()"/>`
      :(c.mediaUrl&&c.mediaType==='video'
        ?`<video src="${c.mediaUrl}" style="width:100%;height:100%;object-fit:cover" preload="metadata" muted></video>`
        :`<div class="cc-thumb-icon">${ico}</div>`);
    return '<div class="content-card" id="card-'+c.id+'">'+
      '<div class="cc-thumb '+thumbCls+(ytThumb||c.mediaUrl?' cc-has-media':'')+'" onclick="openContent(\''+c.id+'\')">'+thumbContent+
      '<span class="cc-badge '+bc+'">'+typeLabel+'</span>'+
      (locked?'<div class="cc-lock"><span style="font-size:1.6rem">🔒</span><span>'+c.access.charAt(0).toUpperCase()+c.access.slice(1)+'+ Members</span></div>':'')+
      '</div>'+
      '<div class="cc-body">'+
        '<span class="cc-win-tag">'+c.window+'</span>'+
        '<div class="cc-title">'+c.title+'</div>'+
        '<div class="cc-meta"><span>📅 '+c.date+'</span><span>👤 '+c.author+'</span>'+(c.theme?'<span>🏷 '+c.theme+'</span>':'')+'</div>'+
        '<p class="cc-desc">'+c.desc+'</p>'+
        '<div class="cc-reactbar">'+REACTION_EMOJIS.map(r=>
          '<button class="ebt'+(myReactions[c.id]===r.key?' picked':'')+'" onclick="toggleEmoji(\''+c.id+'\',\''+r.key+'\',this)" title="'+r.label+'">'+r.emoji+' <span>'+(c.reactions[r.key]||0)+'</span></button>'
        ).join('')+'</div>'+
        '<div class="cc-actions">'+
          '<button class="rbt'+(bkd.includes(c.id)?' bkd':'')+'" onclick="toggleReact(\''+c.id+'\',\'bookmark\',this)">🔖 '+(c.reactions.bookmarks||0)+' Save</button>'+
          '<button class="rbt" onclick="shareItem(\''+c.id+'\')">🔗 Share</button>'+
          '<button class="cc-open" onclick="openContent(\''+c.id+'\')">'+(locked?'🔒 Unlock':'▶ Open')+' →</button>'+
        '</div>'+
      '</div>'+
      '<div class="comments-wrap">'+
        '<h5>Comments ('+c.comments.length+')</h5>'+
        (locked
          ?'<p style="font-size:.76rem;color:var(--muted)"><a href="#" onclick="openModal(\'m-login\');return false" style="color:var(--canopy-lt);font-weight:600">Sign in as a member</a> to read and post comments.</p>'
          :'<div class="comment-list" id="cl-'+c.id+'">'+
            (c.comments.length?c.comments.map(cm=>'<div class="comment-item"><span class="comment-author">'+cm.user+'</span><span class="comment-time">'+cm.time+'</span><br>'+cm.text+'</div>').join('')
              :'<p style="font-size:.76rem;color:var(--muted)">No comments yet.</p>')+
          '</div>'+
          (currentUser
            ?'<div class="comment-input-row"><input id="ci-'+c.id+'" placeholder="Add a comment..." onkeydown="if(event.key===\'Enter\')postComment(\''+c.id+'\')"/><button class="btn btn-ghost btn-sm" onclick="postComment(\''+c.id+'\')">Post</button></div>'
            :'<p style="font-size:.76rem;color:var(--muted);margin-top:.35rem"><a href="#" onclick="openModal(\'m-login\');return false" style="color:var(--canopy-lt);font-weight:600">Sign in</a> to comment.</p>')
        )+
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
  renderContent();
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
}
async function postComment(cid){
  if(!currentUser){toast('Sign in to comment.');return}
  const inp=document.getElementById('ci-'+cid);if(!inp)return;
  const text=inp.value.trim();if(!text)return;
  inp.value='';
  const {error}=await sb.from('comments').insert({content_id:cid,user_name:currentUser.name,text});
  if(error){toast('⚠ Could not post comment.');console.error(error);return}
  await loadContent();renderContent();
  toast('Comment posted.');
}
function openContent(cid){
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
  let mediaBlock='';
  if(item.mediaUrl&&item.mediaType==='video'){
    mediaBlock='<video controls style="width:100%;border-radius:var(--r-sm);margin-bottom:1rem;background:#000" src="'+item.mediaUrl+'"></video>';
  }else if(item.mediaUrl&&item.mediaType==='audio'){
    mediaBlock='<audio controls style="width:100%;margin-bottom:1rem" src="'+item.mediaUrl+'"></audio>';
  }else if(item.url&&item.url.length>5){
    mediaBlock='<a href="'+item.url+'" target="_blank" rel="noopener" class="btn btn-canopy btn-full" style="margin-bottom:1rem">▶ Open External Link →</a>';
  }
  let bodyBlock='';
  if(item.fullText&&item.fullText.length>0){
    bodyBlock='<div style="font-size:.87rem;color:var(--text);line-height:1.8;max-height:340px;overflow-y:auto;padding:1rem;background:var(--mist);border-radius:var(--r-sm);margin-bottom:1rem;white-space:pre-line">'+item.fullText+'</div>';
  }
  if(!mediaBlock&&!bodyBlock){
    mediaBlock='<div style="background:var(--mist);border-radius:var(--r-sm);padding:1.1rem;text-align:center;font-size:.82rem;color:var(--muted);margin-bottom:.7rem">Content will be available once the admin adds the file or text.</div>';
  }
  document.getElementById('content-modal-body').innerHTML=
    '<span class="cc-badge '+bc+'" style="display:inline-block;margin-bottom:.9rem">'+typeLabel+'</span>'+
    '<h3 style="font-family:var(--ff-d);font-size:1.2rem;color:var(--canopy);margin-bottom:.45rem">'+item.title+'</h3>'+
    '<p style="font-size:.76rem;color:var(--muted);margin-bottom:.9rem">By '+item.author+' · '+item.date+' · '+item.window+'</p>'+
    mediaBlock+bodyBlock+
    (!bodyBlock?'<p style="font-size:.87rem;color:var(--text);line-height:1.72;margin-bottom:1.2rem">'+item.desc+'</p>':'')+
    '<button class="btn btn-ghost btn-full btn-sm" onclick="shareItem(\''+cid+'\')">🔗 Share This Content</button>';
  openModal('m-content');
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
    el.innerHTML='<div class="fame-empty"><h4>Our Champions Will Appear Here</h4><p>The UBF admin team is curating our Wall of Fame. Conservation champions — members and partners — will be featured here with photos and stories.</p></div>';
    return;
  }
  el.innerHTML=FAME.map(m=>{
    const td=TIERS_DATA[m.tier]||TIERS_DATA.silver;
    const initials=m.name.split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase();
    return '<div class="fame-card">'+
      (m.photo
        ?'<img src="'+m.photo+'" alt="'+m.name+'" style="width:100%;height:175px;object-fit:cover"/>'
        :'<div class="fame-img-placeholder"><div class="fame-initials">'+initials+'</div></div>')+
      '<div class="fame-body">'+
        '<div class="fame-name">'+m.name+'</div>'+
        '<div class="fame-tier">'+td.emoji+' '+td.label+'</div>'+
        (m.caption?'<div class="fame-caption">'+m.caption+'</div>':'')+
        '<div class="fame-year">'+m.year+'</div>'+
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
  el.innerHTML=ANNOUNCES.slice(0,5).map(a=>
    '<div class="announce-pub-card"><div class="apc-type">'+a.type+'</div><div class="apc-title">'+a.title+'</div><p class="apc-body">'+a.body+'</p><div class="apc-date">'+a.date+'</div></div>'
  ).join('');
}

/* ═══ MEMBER DASHBOARD ═══ */
function renderMemberView(){
  if(!currentUser)return;
  const u=currentUser;const td=TIERS_DATA[u.tier]||TIERS_DATA.silver;
  document.getElementById('mem-greeting').textContent='Welcome back, '+u.name.split(' ')[0]+' '+td.emoji;
  document.getElementById('mem-sub').textContent=td.label+' Member · '+u.year+(u.org?' · '+u.org:'');
  const accessible=CONTENT.filter(c=>ACCESS_RANK[c.access]<=(td.r||1));
  document.getElementById('mem-strip').innerHTML=
    '<div class="mem-mini"><div class="val">'+td.emoji+'</div><div class="lbl">'+td.label+' Tier</div></div>'+
    '<div class="mem-mini"><div class="val">'+(u.amount?u.amount.toLocaleString():'—')+'</div><div class="lbl">UGX Commitment '+u.year+'</div></div>'+
    '<div class="mem-mini"><div class="val">'+accessible.length+'</div><div class="lbl">Content Unlocked</div></div>'+
    '<div class="mem-mini"><div class="val">'+((PERKS_MAP[u.tier]||[]).length)+'</div><div class="lbl">Active Perks</div></div>';
  const perks=PERKS_MAP[u.tier]||[];
  document.getElementById('mem-body').innerHTML=
    '<div class="mem-sec-title">Your Perks</div>'+
    '<div class="perk-grid">'+perks.map(p=>'<div class="perk-card"><div class="pk-icon">'+p.split(' ')[0]+'</div><div class="pk-title">'+p.replace(/^[^\s]+\s/,'')+'</div></div>').join('')+'</div>'+
    '<div class="mem-sec-title" style="display:flex;justify-content:space-between;align-items:center">Your Certificate <button class="btn btn-gold btn-sm" onclick="openCertModal()">⬇ Download Certificate</button></div>'+
    '<div style="margin-bottom:1.5rem"><button class="btn btn-ghost btn-sm" onclick="openModal(\'m-change-pass\')">🔑 Change My Password</button></div>'+
    '<div class="mem-sec-title">Announcements</div>'+
    (ANNOUNCES.length?ANNOUNCES.slice(0,5).map(a=>'<div class="mem-announce-card"><div class="mac-type">'+a.type+'</div><div class="mac-title">'+a.title+'</div><p class="mac-body">'+a.body+'</p><div class="mac-meta">'+a.date+'</div></div>').join(''):'<p style="color:var(--muted);font-size:.87rem">No announcements yet.</p>')+
    '<div class="mem-sec-title">Financial Reports</div>'+
    (FIN_REPORTS.length?FIN_REPORTS.map(r=>'<div class="mem-announce-card"><div class="mac-type">Financial Report · '+r.period+'</div><div class="mac-title">'+r.title+'</div><p class="mac-body">'+r.summary+'</p><div class="mac-meta">'+r.date+(r.url&&r.url!=='#'?' &nbsp;<a href="'+r.url+'" target="_blank" style="color:var(--canopy-lt);font-weight:600">⬇ Download</a>':'')+'</div></div>').join(''):'<p style="color:var(--muted);font-size:.87rem">No reports published yet.</p>')+
    '<div style="margin-top:2rem;display:flex;gap:.75rem;flex-wrap:wrap">'+
      '<button class="btn btn-ghost btn-sm" onclick="showView(\'main\');setTimeout(()=>document.getElementById(\'learn\').scrollIntoView({behavior:\'smooth\'}),200)">Go to Learning Exchange →</button>'+
      '<button class="btn btn-ghost btn-sm" onclick="showView(\'main\');setTimeout(()=>document.getElementById(\'wallfame\').scrollIntoView({behavior:\'smooth\'}),200)">Wall of Fame →</button>'+
    '</div>';
}

/* ═══ CERTIFICATE ═══ */
/* ═══ CHANGE PASSWORD — works for both admins and members ═══ */
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
    'Date:      '+new Date().toLocaleDateString('en-UG',{year:'numeric',month:'long',day:'numeric'}),
    '════════════════════════════════════════════════',
  ].filter(Boolean).join('\n');
  const blob=new Blob([content],{type:'text/plain'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='UBF_Certificate_'+u.name.replace(/\s+/g,'_')+'_'+u.year+'.txt';
  a.click();URL.revokeObjectURL(a.href);
  toast('📜 Certificate downloaded!');
}

/* ═══ ADMIN PANEL ═══ */
function renderAdminAll(){renderAdminMembers();renderAdminContent();renderAdminFame();renderAdminAnnounces();renderFinancials();renderEmailLog();loadPaymentAdmin()}

function renderAdminMembers(){
  const tb=document.getElementById('members-tbody');if(!tb)return;
  tb.innerHTML=MEMBERS.map(m=>'<tr><td>'+m.name+'</td><td style="font-size:.76rem">'+m.email+'</td><td>'+(m.type||'—')+'</td><td><span class="pill pill-'+((m.tier||'silver'))+'">'+((m.tier||'').charAt(0).toUpperCase()+(m.tier||'').slice(1)||'—')+'</span></td><td>'+(m.amount?m.amount.toLocaleString():'—')+'</td><td>'+(m.year||'—')+'</td><td style="font-size:.74rem">'+(m.payref||'—')+'</td><td><span class="pill '+(m.role==='admin'?'pill-admin':'pill-ok')+'">'+m.role+'</span></td></tr>').join('');
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
  const {error}=await sb.from('wall_of_fame').delete().eq('id',id);
  if(error){toast('⚠ Could not remove.');console.error(error);return}
  await loadFame();renderAdminFame();renderFame();toast('Champion removed.');
}

function renderAdminAnnounces(){
  const el=document.getElementById('announce-admin-list');if(!el)return;
  if(!ANNOUNCES.length){el.innerHTML='<p style="color:var(--muted);font-size:.87rem">No announcements yet.</p>';return}
  el.innerHTML=ANNOUNCES.map(a=>
    '<div class="adm-card" style="border-left:4px solid var(--canopy-lt)">'+
      '<div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--canopy-lt);margin-bottom:.3rem">'+a.type+'</div>'+
      '<div style="font-family:var(--ff-d);font-size:.98rem;color:var(--canopy);margin-bottom:.28rem">'+a.title+'</div>'+
      '<p style="font-size:.82rem;color:var(--muted);line-height:1.6">'+a.body+'</p>'+
      '<div style="font-size:.7rem;color:rgba(0,0,0,.32);margin-top:.45rem;display:flex;justify-content:space-between">'+a.date+'<button class="btn btn-danger btn-sm" onclick="delAnnounce(\''+a.id+'\')">Delete</button></div>'+
    '</div>'
  ).join('');
}
async function delAnnounce(id){
  const {error}=await sb.from('announcements').delete().eq('id',id);
  if(error){toast('⚠ Could not delete.');console.error(error);return}
  await loadAnnouncements();renderAdminAnnounces();renderPublicAnnounces();toast('Announcement deleted.');
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
  toast('✅ Announcement published.'+(notify?' Email notification queued.':''));
}

function renderFinancials(){
  const bEl=document.getElementById('fin-bars');const lEl=document.getElementById('fin-list');
  if(!bEl||!lEl)return;
  bEl.innerHTML='';
  [['Albertine Rift Landscape',52],['Karamoja Landscape',32],['Capacity Building',10],['Admin & Operations',6]].forEach(([label,pct])=>{
    bEl.innerHTML+='<div style="padding:.5rem 0;border-bottom:1px solid var(--border)"><div style="display:flex;justify-content:space-between;font-size:.82rem"><span style="color:var(--muted)">'+label+'</span><strong style="color:var(--canopy)">'+pct+'%</strong></div><div class="bar-wrap"><div class="bar-fill" style="width:'+pct+'%"></div></div></div>';
  });
  lEl.innerHTML=FIN_REPORTS.length?FIN_REPORTS.map(r=>
    '<div style="padding:.72rem 0;border-bottom:1px solid var(--border)">'+
      '<div style="font-weight:700;font-size:.87rem;color:var(--canopy)">'+r.title+'</div>'+
      '<div style="font-size:.73rem;color:var(--muted);margin:.18rem 0">'+r.period+'</div>'+
      '<div style="font-size:.77rem;color:var(--text);line-height:1.55;margin-bottom:.38rem">'+r.summary+'</div>'+
      '<div style="display:flex;gap:.45rem"><a href="'+r.url+'" target="_blank" class="btn btn-ghost btn-sm">View</a><button class="btn btn-danger btn-sm" onclick="delReport(\''+r.id+'\')">Delete</button></div>'+
    '</div>'
  ).join(''):'<p style="font-size:.82rem;color:var(--muted)">No reports yet.</p>';
}
async function delReport(id){
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
async function savePaymentDetails(){
  const pd={
    id:1,
    bank:document.getElementById('pd-bank').value.trim(),
    accno:document.getElementById('pd-accno').value.trim(),
    branch:document.getElementById('pd-branch').value.trim(),
    swift:document.getElementById('pd-swift').value.trim(),
    mtn:document.getElementById('pd-mtn').value.trim(),
    airtel:document.getElementById('pd-airtel').value.trim(),
  };
  const {error}=await sb.from('payment_details').upsert(pd);
  if(error){toast('⚠ Could not save payment details.');console.error(error);return}
  await loadPayment();renderPaymentUI();toast('✅ Payment details saved and updated on the public site.');
}
function loadPaymentAdmin(){
  const map={'pd-bank':PAYMENT.bank,'pd-accno':PAYMENT.accno,'pd-branch':PAYMENT.branch,'pd-swift':PAYMENT.swift,'pd-mtn':PAYMENT.mtn,'pd-airtel':PAYMENT.airtel};
  Object.entries(map).forEach(([id,val])=>{if(val){const el=document.getElementById(id);if(el)el.value=val}});
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

/* ═══ ADMIN TABS ═══ */
document.querySelectorAll('.atab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.atab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    const p=btn.dataset.ap;
    document.querySelectorAll('.adm-panel').forEach(ap=>ap.classList.remove('active'));
    document.getElementById(p).classList.add('active');
  });
});

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

/* ═══ EMAIL POPUP (subscribe) — local dismiss flag only, not shared data ═══ */
function showEP(auto){
  if(LS.get('ep_dismissed',false)||currentUser)return;
  setTimeout(()=>document.getElementById('ep').classList.add('show'),auto?20000:800);
}
function openSubscribePopup(){
  document.getElementById('ep').classList.add('show');
}
function dismissEP(){document.getElementById('ep').classList.remove('show');LS.set('ep_dismissed',true)}
async function subscribeEP(){
  const em=document.getElementById('ep-email').value.trim();
  if(!em||!em.includes('@')){toast('⚠ Enter a valid email address.');return}
  await logEmail('Newsletter Subscription','New subscriber: '+em+' · '+new Date().toLocaleDateString());
  dismissEP();toast('✅ Subscribed! You will receive UBF updates.');
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
