/* ═══════════════════════════════════════════
   FRIENDS OF BIODIVERSITY — APPLICATION LOGIC
   Uganda Biodiversity Fund
   
   NOTE FOR DEVELOPER: This file currently uses localStorage
   for data persistence (browser-only demo mode). To connect
   to Supabase, replace the LS.get/LS.set calls in the marked
   sections below with Supabase client calls. See comments
   tagged [SUPABASE] throughout this file.
═══════════════════════════════════════════ */

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
  silver:{r:1,emoji:'🥈',label:'Silver',color:'#909090'},
  gold:{r:2,emoji:'🥇',label:'Gold',color:'#C8A84B'},
  platinum:{r:3,emoji:'💎',label:'Platinum',color:'#5BC4BF'},
  diamond:{r:4,emoji:'🔷',label:'Diamond',color:'#7EB8C9'},
  partner:{r:2,emoji:'🤝',label:'Partner',color:'#C8A84B'},
};
const TIER_RANGES={
  silver:{individual:'500K–1M UGX',institution:'2M–5M UGX'},
  gold:{individual:'1.5M–2M UGX',institution:'6M–10M UGX'},
  platinum:{individual:'2.5M–4.5M UGX',institution:'20M–40M UGX'},
  diamond:{individual:'5M+ UGX',institution:'50M+ UGX'},
};
const PERKS_MAP={
  silver:['📦 Eco-friendly welcome kit & personalised certificates','📊 Contribution & accountability dashboard','🎓 Learning Exchange content library access','🏆 Wall of Fame listing','📜 Downloadable digital membership certificate'],
  gold:['All Silver perks','👁 Visibility in UBF conservation projects','🤝 Exclusive networking & partnership events','📬 Priority invitations to UBF events','📋 Quarterly impact report'],
  platinum:['All Gold perks','🎨 Co-branding on project materials & publications','🤝 Strategic partnership access','📰 Named in UBF annual report','💼 Private Executive Director briefing'],
  diamond:['All Platinum perks','🌟 Named conservation project or corridor','🏛 Board-level observer engagement','📈 Bespoke ESG biodiversity reporting package','📡 Media & PR recognition campaign','👑 Annual CEO briefing'],
};
const ACCESS_RANK={public:0,member:1,gold:2,platinum:3,diamond:4};

/* ═══ ADMIN TEAM — UBF Staff Accounts ═══
   [SUPABASE] Move this to a 'staff' table with role-based access (RLS policy:
   email LIKE '%@ugandabiodiversityfund.org' AND role='admin') */
const ADMIN_EMAILS=[
  'i.amani@ugandabiodiversityfund.org',
  'o.atuhaire@ugandabiodiversityfund.org',
  't.otieno@ugandabiodiversityfund.org',
  'p.musiime@ugandabiodiversityfund.org',
  'd.okullu@ugandabiodiversityfund.org',
];
const ADMIN_NAMES={
  'i.amani@ugandabiodiversityfund.org':'Executive Director',
  'o.atuhaire@ugandabiodiversityfund.org':'Projects Officer',
  't.otieno@ugandabiodiversityfund.org':'Digital Marketing Analyst & Systems Developer',
  'p.musiime@ugandabiodiversityfund.org':'Programs Officer',
  'd.okullu@ugandabiodiversityfund.org':'M&E Officer',
};
/* Default password for all admin accounts on first run. CHANGE IMMEDIATELY after first login
   by editing your member record, or once Supabase auth is wired, use password-reset emails. */
const ADMIN_DEFAULT_PASS='UBF@2026!';

/* ═══ HERO SLIDESHOW IMAGES — real UBF/Pexels conservation photography ═══
   [SUPABASE] When you add Supabase Storage, swap this array to fetch
   filenames from a 'slides' storage bucket dynamically. */
const SLIDE_IMAGES=Array.from({length:13},(_,i)=>`assets/images/slide-${i+1}.jpg`);

/* ═══ localStorage helpers ═══
   [SUPABASE] Replace LS.get/LS.set with supabase.from('table').select()/.insert()/.update()
   Keep the same function names so the rest of the app code does not need to change —
   just make LS.get and LS.set async-aware wrappers around Supabase calls. */
const LS={
  get:(k,d)=>{try{const v=localStorage.getItem('ubf_'+k);return v!==null?JSON.parse(v):d}catch{return d}},
  set:(k,v)=>{try{localStorage.setItem('ubf_'+k,JSON.stringify(v))}catch{}},
};

/* ═══ APP STATE ═══ */
let MEMBERS=LS.get('members',[]);
let CONTENT=LS.get('content',[]);
let ANNOUNCES=LS.get('announces',[]);
let FIN_REPORTS=LS.get('fin_reports',[]);
let EMAIL_LOG=LS.get('email_log',[]);
let FAME=LS.get('fame',[]);
let PAYMENT=LS.get('payment',{});
let currentUser=null;
let selectedTier_=null;
let uploadedFile=null;
let famePhotoData=null;
let activeFilter='all';

/* ═══ INIT ADMIN ACCOUNTS IF MISSING ═══
   [SUPABASE] Run this once as a seed migration/SQL script instead of client-side init. */
function initAdmins(){
  let changed=false;
  ADMIN_EMAILS.forEach(email=>{
    if(!MEMBERS.find(m=>m.email.toLowerCase()===email)){
      MEMBERS.push({
        name:ADMIN_NAMES[email]||'Admin',
        email,pass:ADMIN_DEFAULT_PASS,type:'staff',tier:'diamond',
        amount:0,year:new Date().getFullYear(),org:'Uganda Biodiversity Fund',
        role:'admin',status:'active',payref:''
      });
      changed=true;
    }
  });
  if(changed)LS.set('members',MEMBERS);
}
initAdmins();

/* ═══ PAYMENT DETAILS — load saved values into public page ═══ */
function loadPaymentUI(){
  const pd=LS.get('payment',{});
  const map={
    'pay-bank-name':pd.bank,'pay-acc-no':pd.accno,'pay-branch':pd.branch,
    'pay-swift':pd.swift,'pay-mtn':pd.mtn,'pay-airtel':pd.airtel,
  };
  Object.entries(map).forEach(([id,val])=>{
    if(val){const el=document.getElementById(id);if(el)el.textContent=val}
  });
}
loadPaymentUI();

/* ═══ HERO SLIDESHOW ═══ */
let curSlide=0;
function initSlideshow(){
  const track=document.getElementById('slide-track');
  const dots=document.getElementById('slide-dots');
  const countEl=document.getElementById('slide-count');
  if(!track)return;
  track.innerHTML='';dots.innerHTML='';
  const extras=LS.get('extra_slides',[]);
  const imgs=[...SLIDE_IMAGES,...extras];
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
initSlideshow();
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
   [SUPABASE] Replace doLogin/doAdminLogin body with:
   const {data,error}=await supabase.auth.signInWithPassword({email,password:pw})
   then fetch the matching row from 'members' table by user id. */
function doLogin(){
  const em=document.getElementById('li-email').value.trim().toLowerCase();
  const pw=document.getElementById('li-pass').value;
  if(!em||!pw){toast('⚠ Enter your email and password.');return}
  const u=MEMBERS.find(m=>m.email.toLowerCase()===em&&m.pass===pw);
  if(!u){toast('⚠ Email or password incorrect.');return}
  if(u.role==='admin'){toast('⚠ Admin accounts must use the admin sign-in.');return}
  currentUser=u;closeModal('m-login');updateNav();
  toast('🌿 Welcome back, '+u.name.split(' ')[0]+'!');showView('member');
}
function doAdminLogin(){
  const em=document.getElementById('al-email').value.trim().toLowerCase();
  const pw=document.getElementById('al-pass').value;
  if(!ADMIN_EMAILS.includes(em)){toast('⚠ This email is not authorised for admin access.');return}
  if(!em.endsWith('@ugandabiodiversityfund.org')){toast('⚠ Admin login requires a @ugandabiodiversityfund.org email.');return}
  const u=MEMBERS.find(m=>m.email.toLowerCase()===em&&m.pass===pw&&m.role==='admin');
  if(!u){toast('⚠ Invalid admin credentials. Default password: '+ADMIN_DEFAULT_PASS);return}
  currentUser=u;closeModal('m-admin-login');updateNav();
  document.getElementById('adm-user-info').textContent=u.name+' ('+ADMIN_NAMES[em]+') — '+em;
  toast('⚙ Admin access granted. Welcome, '+u.name+'.');showView('admin');
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

/* ═══ ENROLL ═══
   [SUPABASE] On submit: await supabase.auth.signUp({email,password:pass})
   then await supabase.from('members').insert({...}) with the returned user id. */
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
document.getElementById('enroll-form').addEventListener('submit',function(e){
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
  if(MEMBERS.find(m=>m.email.toLowerCase()===email)){toast('⚠ This email is already registered. Please sign in.');return}
  const nm={name,email,pass,tel,type,tier,amount,year,payref,
    org:document.getElementById('ef-org').value.trim(),
    engage:document.getElementById('ef-engage').value,
    role:'member',status:'active'};
  MEMBERS.push(nm);LS.set('members',MEMBERS);
  this.style.display='none';document.getElementById('enroll-success').style.display='block';
  logEmail('Welcome to Friends of Biodiversity','New member: '+email+' ('+tier+') · '+new Date().toLocaleDateString());
  toast('🌿 Welcome, '+name.split(' ')[0]+'! Enrollment registered.');
  showEP(false);
});

/* ═══ THEMES & PROGRAMMES ═══ */
function renderThemes(){
  const tabsEl=document.getElementById('theme-tabs');
  const panelsEl=document.getElementById('theme-panels');
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
renderThemes();

/* ═══ LEARNING EXCHANGE CONTENT ═══
   [SUPABASE] CONTENT array becomes a 'content' table. Replace renderContent's
   data source with: const {data}=await supabase.from('content').select('*').order('date',{ascending:false}) */
const TYPE_ICONS={video:'🎬',documentary:'🎥',podcast:'🎙',interview:'🎤',article:'📰',research:'🔬'};
const TYPE_BADGE_CLS={video:'badge-video',documentary:'badge-documentary',podcast:'badge-podcast',interview:'badge-interview',article:'badge-article',research:'badge-research'};

function renderFilters(){
  const el=document.getElementById('content-filters');
  const types=['All','Video','Documentary','Podcast','Interview','Article','Research'];
  el.innerHTML=types.map((t,i)=>'<button class="ftag'+(i===0?' active':'')+'" data-cf="'+(t==='All'?'all':t.toLowerCase())+'" onclick="setFilter(this)">'+t+'</button>').join('');
}
renderFilters();
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
  const liked=LS.get('liked',[]);const bkd=LS.get('bookmarked',[]);
  grid.innerHTML=items.map(c=>{
    const ar=ACCESS_RANK[c.access]||0;
    const locked=ar>0&&ur<ar;
    const bc=TYPE_BADGE_CLS[c.type]||'badge-article';
    const ico=TYPE_ICONS[c.type]||'📄';
    const typeLabel=c.type?c.type.charAt(0).toUpperCase()+c.type.slice(1):'';
    return '<div class="content-card" id="card-'+c.id+'">'+
      '<div class="cc-thumb"><div class="cc-thumb-icon">'+ico+'</div>'+
      '<span class="cc-badge '+bc+'">'+typeLabel+'</span>'+
      (locked?'<div class="cc-lock"><span style="font-size:1.6rem">🔒</span><span>'+c.access.charAt(0).toUpperCase()+c.access.slice(1)+'+ Members</span></div>':'')+
      '</div>'+
      '<div class="cc-body">'+
        '<span class="cc-win-tag">'+c.window+'</span>'+
        '<div class="cc-title">'+c.title+'</div>'+
        '<div class="cc-meta"><span>📅 '+c.date+'</span><span>👤 '+c.author+'</span>'+(c.theme?'<span>🏷 '+c.theme+'</span>':'')+'</div>'+
        '<p class="cc-desc">'+c.desc+'</p>'+
        '<div class="cc-actions">'+
          '<div class="cc-reacts">'+
            '<button class="rbt'+(liked.includes(c.id)?' liked':'')+'" onclick="toggleReact(\''+c.id+'\',\'like\',this)">❤ '+c.reactions.likes+'</button>'+
            '<button class="rbt'+(bkd.includes(c.id)?' bkd':'')+'" onclick="toggleReact(\''+c.id+'\',\'bookmark\',this)">🔖 '+c.reactions.bookmarks+'</button>'+
          '</div>'+
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
renderContent();

function toggleReact(id,type,btn){
  if(!currentUser){toast('Sign in to react.');return}
  const key=type==='like'?'liked':'bookmarked';
  let arr=LS.get(key,[]);
  const item=CONTENT.find(c=>c.id===id);if(!item)return;
  const field=type==='like'?'likes':'bookmarks';
  if(arr.includes(id)){arr=arr.filter(x=>x!==id);item.reactions[field]--;btn.classList.remove(type==='like'?'liked':'bkd')}
  else{arr.push(id);item.reactions[field]++;btn.classList.add(type==='like'?'liked':'bkd')}
  btn.innerHTML=(type==='like'?'❤ ':'🔖 ')+item.reactions[field];
  LS.set(key,arr);LS.set('content',CONTENT);
}
function postComment(cid){
  if(!currentUser){toast('Sign in to comment.');return}
  const inp=document.getElementById('ci-'+cid);if(!inp)return;
  const text=inp.value.trim();if(!text)return;
  const item=CONTENT.find(c=>c.id===cid);if(!item)return;
  const cm={user:currentUser.name,text,time:new Date().toISOString().slice(0,10)};
  item.comments.push(cm);LS.set('content',CONTENT);inp.value='';
  const list=document.getElementById('cl-'+cid);if(!list)return;
  const d=document.createElement('div');d.className='comment-item';
  d.innerHTML='<span class="comment-author">'+cm.user+'</span><span class="comment-time">'+cm.time+'</span><br>'+cm.text;
  const ph=list.querySelector('p');if(ph)list.innerHTML='';
  list.appendChild(d);list.scrollTop=list.scrollHeight;
  const h5=list.closest('.comments-wrap').querySelector('h5');
  if(h5)h5.textContent='Comments ('+item.comments.length+')';
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
  document.getElementById('content-modal-body').innerHTML=
    '<span class="cc-badge '+bc+'" style="display:inline-block;margin-bottom:.9rem">'+typeLabel+'</span>'+
    '<h3 style="font-family:var(--ff-d);font-size:1.2rem;color:var(--canopy);margin-bottom:.45rem">'+item.title+'</h3>'+
    '<p style="font-size:.76rem;color:var(--muted);margin-bottom:.9rem">By '+item.author+' · '+item.date+' · '+item.window+'</p>'+
    '<p style="font-size:.87rem;color:var(--text);line-height:1.72;margin-bottom:1.2rem">'+item.desc+'</p>'+
    (item.url&&item.url.length>5
      ?'<a href="'+item.url+'" target="_blank" rel="noopener" class="btn btn-canopy btn-full" style="margin-bottom:.7rem">▶ Open / Watch →</a>'
      :'<div style="background:var(--mist);border-radius:var(--r-sm);padding:1.1rem;text-align:center;font-size:.82rem;color:var(--muted);margin-bottom:.7rem">Content will be available once the admin adds the file link.</div>')+
    '<button class="btn btn-ghost btn-full btn-sm" onclick="shareItem(\''+cid+'\')">🔗 Share This Content</button>';
  openModal('m-content');
}
function shareItem(cid){
  const item=CONTENT.find(c=>c.id===cid);if(!item)return;
  const url=location.origin+location.pathname+'#learn';
  if(navigator.share){navigator.share({title:item.title,text:item.desc.slice(0,100)+'...',url}).catch(()=>{})}
  else{navigator.clipboard.writeText(url+' — '+item.title).then(()=>toast('🔗 Link copied!')).catch(()=>toast('Copy link: '+url))}
}

/* ═══ UPLOAD CONTENT ═══
   [SUPABASE] For files, use supabase.storage.from('content-files').upload(path,file)
   then store the returned public URL in the 'url' field of the content row. */
function onDragOver(e){e.preventDefault();document.getElementById('upload-zone').classList.add('drag')}
function onDrop(e){e.preventDefault();document.getElementById('upload-zone').classList.remove('drag');const f=e.dataTransfer.files[0];if(f)processFile(f)}
function onFileSelect(e){const f=e.target.files[0];if(f)processFile(f)}
function processFile(f){
  uploadedFile=f;
  document.getElementById('file-prev-wrap').innerHTML=
    '<div class="file-prev"><span>📄</span><span class="fp-name">'+f.name+'</span><span style="font-size:.7rem;color:var(--muted)">'+(f.size/1024/1024).toFixed(2)+' MB</span><button class="fp-rm" onclick="uploadedFile=null;document.getElementById(\'file-prev-wrap\').innerHTML=\'\'">✕</button></div>';
}
function submitUpload(){
  if(!currentUser){toast('⚠ You must be logged in to upload content.');return}
  const title=document.getElementById('up-title').value.trim();
  const type=document.getElementById('up-type').value;
  const win=document.getElementById('up-window').value;
  if(!title||!type||!win){toast('⚠ Title, type, and programme window are required.');return}
  const item={
    id:'c'+Date.now(),title,type,window:win,
    theme:document.getElementById('up-theme').value||'Biodiversity',
    desc:document.getElementById('up-desc').value||'',
    author:document.getElementById('up-author').value||currentUser.name,
    date:new Date().toISOString().slice(0,10),
    access:document.getElementById('up-access').value||'member',
    url:document.getElementById('up-url').value||'',
    reactions:{likes:0,bookmarks:0},comments:[],
    fileName:uploadedFile?uploadedFile.name:'',
  };
  CONTENT.unshift(item);LS.set('content',CONTENT);
  uploadedFile=null;document.getElementById('file-prev-wrap').innerHTML='';
  ['up-title','up-type','up-window','up-theme','up-desc','up-author','up-url'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
  closeModal('m-upload');renderContent();renderAdminContent();
  toast('✅ Content published to Learning Exchange.');
}

/* ═══ WALL OF FAME — admin-curated, no placeholders ═══
   [SUPABASE] FAME array becomes a 'wall_of_fame' table. Photos go to
   supabase.storage.from('fame-photos').upload(...) and store the public URL. */
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
renderFame();

function handleFamePhoto(e){
  const f=e.target.files[0];if(!f)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    famePhotoData=ev.target.result;
    document.getElementById('fame-photo-prev').innerHTML=
      '<div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem;padding:.5rem;background:var(--mist);border-radius:var(--r-sm)">'+
        '<img src="'+famePhotoData+'" style="width:48px;height:48px;border-radius:50%;object-fit:cover"/>'+
        '<span style="font-size:.82rem;color:var(--text)">'+f.name+'</span>'+
        '<button onclick="famePhotoData=null;document.getElementById(\'fame-photo-prev\').innerHTML=\'\'" style="margin-left:auto;background:none;border:none;cursor:pointer;color:var(--muted)">✕</button>'+
      '</div>';
  };
  reader.readAsDataURL(f);
}
function addFameChampion(){
  const name=document.getElementById('fame-name').value.trim();
  const caption=document.getElementById('fame-caption').value.trim();
  const tier=document.getElementById('fame-tier').value;
  const year=parseInt(document.getElementById('fame-year').value)||new Date().getFullYear();
  if(!name||!caption){toast('⚠ Name and caption required.');return}
  FAME.push({name,caption,tier,year,photo:famePhotoData||null});
  LS.set('fame',FAME);famePhotoData=null;
  closeModal('m-fame-add');
  document.getElementById('fame-name').value='';document.getElementById('fame-caption').value='';
  document.getElementById('fame-photo-prev').innerHTML='';
  renderFame();renderAdminFame();toast('✅ Champion added to Wall of Fame.');
}

/* ═══ ANNOUNCEMENTS — public strip ═══ */
function renderPublicAnnounces(){
  const el=document.getElementById('announce-pub-list');if(!el)return;
  if(!ANNOUNCES.length){el.innerHTML='<p style="color:rgba(255,255,255,.4);font-size:.88rem">No announcements yet. Check back soon for project updates and news.</p>';return}
  el.innerHTML=ANNOUNCES.slice(0,5).map(a=>
    '<div class="announce-pub-card"><div class="apc-type">'+a.type+'</div><div class="apc-title">'+a.title+'</div><p class="apc-body">'+a.body+'</p><div class="apc-date">'+a.date+'</div></div>'
  ).join('');
}
renderPublicAnnounces();

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
    '<div class="mem-sec-title">Announcements</div>'+
    (ANNOUNCES.length?ANNOUNCES.slice(0,5).map(a=>'<div class="mem-announce-card"><div class="mac-type">'+a.type+'</div><div class="mac-title">'+a.title+'</div><p class="mac-body">'+a.body+'</p><div class="mac-meta">'+a.date+'</div></div>').join(''):'<p style="color:var(--muted);font-size:.87rem">No announcements yet.</p>')+
    '<div class="mem-sec-title">Financial Reports</div>'+
    (FIN_REPORTS.length?FIN_REPORTS.map(r=>'<div class="mem-announce-card"><div class="mac-type">Financial Report · '+r.period+'</div><div class="mac-title">'+r.title+'</div><p class="mac-body">'+r.summary+'</p><div class="mac-meta">'+r.date+(r.url&&r.url!=='#'?' &nbsp;<a href="'+r.url+'" target="_blank" style="color:var(--canopy-lt);font-weight:600">⬇ Download</a>':'')+'</div></div>').join(''):'<p style="color:var(--muted);font-size:.87rem">No reports published yet.</p>')+
    '<div style="margin-top:2rem;display:flex;gap:.75rem;flex-wrap:wrap">'+
      '<button class="btn btn-ghost btn-sm" onclick="showView(\'main\');setTimeout(()=>document.getElementById(\'learn\').scrollIntoView({behavior:\'smooth\'}),200)">Go to Learning Exchange →</button>'+
      '<button class="btn btn-ghost btn-sm" onclick="showView(\'main\');setTimeout(()=>document.getElementById(\'wallfame\').scrollIntoView({behavior:\'smooth\'}),200)">Wall of Fame →</button>'+
    '</div>';
}

/* ═══ CERTIFICATE — restored ═══ */
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
function deleteContent(id){
  if(!confirm('Delete this content item?'))return;
  CONTENT=CONTENT.filter(c=>c.id!==id);LS.set('content',CONTENT);renderAdminContent();renderContent();toast('Content deleted.');
}
function renderAdminFame(){
  const el=document.getElementById('adm-fame-list');if(!el)return;
  if(!FAME.length){el.innerHTML='<p style="color:var(--muted);font-size:.87rem">No champions yet. Add your first conservation champion using the button above.</p>';return}
  el.innerHTML='<div style="overflow-x:auto"><table class="dtable"><thead><tr><th>Photo</th><th>Name</th><th>Caption</th><th>Tier</th><th>Year</th><th>Actions</th></tr></thead><tbody>'+
    FAME.map((m,i)=>'<tr>'+
      '<td>'+(m.photo?'<img src="'+m.photo+'" style="width:36px;height:36px;border-radius:50%;object-fit:cover"/>':'<div style="width:36px;height:36px;border-radius:50%;background:var(--canopy);display:flex;align-items:center;justify-content:center;color:var(--gold);font-size:.7rem">'+m.name.charAt(0)+'</div>')+'</td>'+
      '<td>'+m.name+'</td>'+
      '<td style="font-size:.75rem;max-width:200px">'+m.caption+'</td>'+
      '<td><span class="pill pill-'+(m.tier||'silver')+'">'+(m.tier||'silver')+'</span></td>'+
      '<td>'+m.year+'</td>'+
      '<td><button class="btn btn-danger btn-sm" onclick="removeFame('+i+')">Remove</button></td>'+
    '</tr>').join('')+
  '</tbody></table></div>';
}
function removeFame(i){FAME.splice(i,1);LS.set('fame',FAME);renderAdminFame();renderFame();toast('Champion removed.')}
function renderAdminAnnounces(){
  const el=document.getElementById('announce-admin-list');if(!el)return;
  if(!ANNOUNCES.length){el.innerHTML='<p style="color:var(--muted);font-size:.87rem">No announcements yet.</p>';return}
  el.innerHTML=ANNOUNCES.map((a,i)=>
    '<div class="adm-card" style="border-left:4px solid var(--canopy-lt)">'+
      '<div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--canopy-lt);margin-bottom:.3rem">'+a.type+'</div>'+
      '<div style="font-family:var(--ff-d);font-size:.98rem;color:var(--canopy);margin-bottom:.28rem">'+a.title+'</div>'+
      '<p style="font-size:.82rem;color:var(--muted);line-height:1.6">'+a.body+'</p>'+
      '<div style="font-size:.7rem;color:rgba(0,0,0,.32);margin-top:.45rem;display:flex;justify-content:space-between">'+a.date+'<button class="btn btn-danger btn-sm" onclick="delAnnounce('+i+')">Delete</button></div>'+
    '</div>'
  ).join('');
}
function delAnnounce(i){ANNOUNCES.splice(i,1);LS.set('announces',ANNOUNCES);renderAdminAnnounces();renderPublicAnnounces();toast('Announcement deleted.')}
function postAnnouncement(){
  const type=document.getElementById('ann-type').value;
  const title=document.getElementById('ann-title').value.trim();
  const body=document.getElementById('ann-body').value.trim();
  const notify=document.getElementById('ann-notify').checked;
  if(!title||!body){toast('⚠ Title and body required.');return}
  ANNOUNCES.unshift({type,title,body,date:new Date().toISOString().slice(0,10)});
  LS.set('announces',ANNOUNCES);closeModal('m-announce');
  document.getElementById('ann-title').value='';document.getElementById('ann-body').value='';
  renderAdminAnnounces();renderPublicAnnounces();
  if(notify)logEmail('['+type+'] '+title,'Broadcast to all members · '+new Date().toLocaleDateString());
  toast('✅ Announcement published.'+(notify?' Email notification queued.':''));
}
function renderFinancials(){
  const bEl=document.getElementById('fin-bars');const lEl=document.getElementById('fin-list');
  if(!bEl||!lEl)return;
  bEl.innerHTML='';
  [['Albertine Rift Landscape',52],['Karamoja Landscape',32],['Capacity Building',10],['Admin & Operations',6]].forEach(([label,pct])=>{
    bEl.innerHTML+='<div style="padding:.5rem 0;border-bottom:1px solid var(--border)"><div style="display:flex;justify-content:space-between;font-size:.82rem"><span style="color:var(--muted)">'+label+'</span><strong style="color:var(--canopy)">'+pct+'%</strong></div><div class="bar-wrap"><div class="bar-fill" style="width:'+pct+'%"></div></div></div>';
  });
  lEl.innerHTML=FIN_REPORTS.length?FIN_REPORTS.map((r,i)=>
    '<div style="padding:.72rem 0;border-bottom:1px solid var(--border)">'+
      '<div style="font-weight:700;font-size:.87rem;color:var(--canopy)">'+r.title+'</div>'+
      '<div style="font-size:.73rem;color:var(--muted);margin:.18rem 0">'+r.period+'</div>'+
      '<div style="font-size:.77rem;color:var(--text);line-height:1.55;margin-bottom:.38rem">'+r.summary+'</div>'+
      '<div style="display:flex;gap:.45rem"><a href="'+r.url+'" target="_blank" class="btn btn-ghost btn-sm">View</a><button class="btn btn-danger btn-sm" onclick="delReport('+i+')">Delete</button></div>'+
    '</div>'
  ).join(''):'<p style="font-size:.82rem;color:var(--muted)">No reports yet.</p>';
}
function delReport(i){FIN_REPORTS.splice(i,1);LS.set('fin_reports',FIN_REPORTS);renderFinancials();toast('Report removed.')}
function addFinReport(){
  const title=document.getElementById('fin-title').value.trim();
  const period=document.getElementById('fin-period').value.trim();
  const summary=document.getElementById('fin-summary').value.trim();
  const url=document.getElementById('fin-url').value.trim();
  if(!title){toast('⚠ Report title required.');return}
  FIN_REPORTS.unshift({title,period,summary,url:url||'#',date:new Date().toISOString().slice(0,10)});
  LS.set('fin_reports',FIN_REPORTS);closeModal('m-finance');
  ['fin-title','fin-period','fin-summary','fin-url'].forEach(id=>document.getElementById(id).value='');
  renderFinancials();toast('✅ Financial report published.');
}

/* ═══ PAYMENT DETAILS — admin-editable, drives public Payment section ═══ */
function savePaymentDetails(){
  const pd={
    bank:document.getElementById('pd-bank').value.trim(),
    accno:document.getElementById('pd-accno').value.trim(),
    branch:document.getElementById('pd-branch').value.trim(),
    swift:document.getElementById('pd-swift').value.trim(),
    mtn:document.getElementById('pd-mtn').value.trim(),
    airtel:document.getElementById('pd-airtel').value.trim(),
  };
  LS.set('payment',pd);loadPaymentUI();toast('✅ Payment details saved and updated on the public site.');
}
function loadPaymentAdmin(){
  const pd=LS.get('payment',{});
  const map={'pd-bank':pd.bank,'pd-accno':pd.accno,'pd-branch':pd.branch,'pd-swift':pd.swift,'pd-mtn':pd.mtn,'pd-airtel':pd.airtel};
  Object.entries(map).forEach(([id,val])=>{if(val){const el=document.getElementById(id);if(el)el.value=val}});
}

/* ═══ EMAIL CAMPAIGNS ═══
   [SUPABASE] Wire sendEmail() to a Supabase Edge Function that calls
   SendGrid/Brevo/Resend's API with the audience list filtered by tier. */
function previewEmail(){
  const subj=document.getElementById('em-subj').value;
  const body=document.getElementById('em-body').value;
  const aud=document.getElementById('em-audience').value;
  const el=document.getElementById('email-prev');el.style.display='block';
  el.textContent='FROM: info@ugandabiodiversityfund.org\nTO: '+(aud==='all'?'All Members':aud.charAt(0).toUpperCase()+aud.slice(1)+' Members')+'\nSUBJECT: '+(subj||'(no subject)')+'\n\n'+body+'\n\n—\nUganda Biodiversity Fund\nwww.ugandabiodiversityfund.org\n+256 (039) 3216445';
}
function sendEmail(){
  const subj=document.getElementById('em-subj').value.trim();
  const body=document.getElementById('em-body').value.trim();
  const aud=document.getElementById('em-audience').value;
  if(!subj||!body){toast('⚠ Subject and message required.');return}
  logEmail(subj,'Audience: '+aud+' · '+new Date().toLocaleString());
  document.getElementById('em-subj').value='';document.getElementById('em-body').value='';
  document.getElementById('email-prev').style.display='none';
  toast('✅ Campaign queued for delivery.');
}
function logEmail(subj,meta){EMAIL_LOG.unshift({subj,meta});LS.set('email_log',EMAIL_LOG);renderEmailLog()}
function renderEmailLog(){
  const el=document.getElementById('email-log-list');if(!el)return;
  el.innerHTML=EMAIL_LOG.slice(0,12).map(e=>'<div style="padding:.58rem 0;border-bottom:1px solid var(--border)"><div style="font-size:.82rem;font-weight:600;color:var(--canopy)">'+e.subj+'</div><div style="font-size:.7rem;color:var(--muted);margin-top:.14rem">'+e.meta+'</div></div>').join('')||'<p style="font-size:.82rem;color:var(--muted)">No campaigns sent yet.</p>';
}
function exportCSV(){
  const rows=['Name,Email,Type,Tier,Amount (UGX),Year,PayRef,Role,Status',...MEMBERS.map(m=>'"'+m.name+'","'+m.email+'","'+(m.type||'')+'","'+(m.tier||'')+'","'+(m.amount||'')+'","'+(m.year||'')+'","'+(m.payref||'')+'","'+(m.role||'')+'","'+(m.status||'')+'"')];
  const blob=new Blob([rows.join('\n')],{type:'text/csv'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ubf_members_'+new Date().toISOString().slice(0,10)+'.csv';a.click();URL.revokeObjectURL(a.href);
}

/* ═══ SLIDE IMAGE UPLOADS (admin) ═══
   [SUPABASE] Replace with supabase.storage.from('slides').upload(filename,file) */
function handleSlideUpload(e){
  const files=Array.from(e.target.files);
  const extras=LS.get('extra_slides',[]);
  let pending=files.length;
  files.forEach(f=>{
    const reader=new FileReader();
    reader.onload=ev=>{
      extras.push(ev.target.result);
      LS.set('extra_slides',extras);
      initSlideshow();
      const prev=document.getElementById('slide-preview-list');
      prev.innerHTML+='<div style="display:flex;align-items:center;gap:.5rem;padding:.4rem;background:var(--mist);border-radius:var(--r-sm);margin-top:.4rem"><img src="'+ev.target.result+'" style="width:40px;height:30px;object-fit:cover;border-radius:4px"/><span style="font-size:.8rem">'+f.name+' added to slideshow</span></div>';
      document.getElementById('slide-count-adm').textContent=document.querySelectorAll('#slide-track .slide').length+' slides';
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
    const t=setInterval(()=>{cur=Math.min(cur+step,target);el.textContent=Math.round(cur);if(cur>=target)clearInterval(t)},22);
  });
}
const cntObs=new IntersectionObserver(en=>{en.forEach(e=>{if(e.isIntersecting){animCounters();cntObs.disconnect()}})},{threshold:.3});
const impEl=document.getElementById('impact');if(impEl)cntObs.observe(impEl);

/* ═══ SCROLL REVEAL ═══ */
const revObs=new IntersectionObserver(en=>{en.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revObs.unobserve(e.target)}})},{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

/* ═══ EMAIL POPUP ═══ */
function showEP(auto){
  if(LS.get('ep_dismissed',false)||currentUser)return;
  setTimeout(()=>document.getElementById('ep').classList.add('show'),auto?20000:800);
}
function dismissEP(){document.getElementById('ep').classList.remove('show');LS.set('ep_dismissed',true)}
function subscribeEP(){
  const em=document.getElementById('ep-email').value.trim();
  if(!em||!em.includes('@')){toast('⚠ Enter a valid email address.');return}
  logEmail('Newsletter Subscription','New subscriber: '+em+' · '+new Date().toLocaleDateString());
  dismissEP();toast('✅ Subscribed! You will receive UBF updates.');
}
showEP(true);

/* ═══ TOAST ═══ */
let _tt;
function toast(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(_tt);_tt=setTimeout(()=>t.classList.remove('show'),4200);
}
