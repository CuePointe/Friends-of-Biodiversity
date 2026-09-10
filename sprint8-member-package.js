/* FoB member package integration
 * Biodiversity Intelligence is the 5th package/benefit box inside the member account.
 * The legacy floating launcher is intentionally hidden.
 */
(function(global){'use strict';
const PACKAGE_ID='fob-bi-package';
function launch(){try{if(global.FoBSprint8UI&&typeof global.FoBSprint8UI.open==='function'){global.FoBSprint8UI.open();return;}const btn=document.getElementById('fob-bi-launch');if(btn)btn.click();}catch(err){console.error('[FoB BI] launch',err);}}
function mount(){
  const host=document.querySelector('#view-member #mem-body .perk-chips');
  if(!host||document.getElementById(PACKAGE_ID))return;
  const card=document.createElement('button');
  card.type='button';card.id=PACKAGE_ID;card.className='perk-chip fob-bi-package';
  card.setAttribute('aria-label','Open Biodiversity Intelligence');
  card.innerHTML='<span class="pc-ico">🧠</span><span class="pc-txt">Biodiversity Intelligence</span>';
  card.title='Briefings · EIA Data Pack · Citizen Science · Bring a Member';
  card.addEventListener('click',launch);host.appendChild(card);
  if(!document.getElementById('fob-bi-package-style')){
    const style=document.createElement('style');style.id='fob-bi-package-style';
    style.textContent=`#${PACKAGE_ID}{cursor:pointer;border:1px solid rgba(200,168,75,.55);background:linear-gradient(135deg,rgba(200,168,75,.10),rgba(45,106,79,.08));color:inherit;font:inherit;text-align:left;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}#${PACKAGE_ID}:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,0,0,.10);border-color:rgba(200,168,75,.9)}#${PACKAGE_ID}:focus-visible{outline:2px solid #C8A84B;outline-offset:2px}#${PACKAGE_ID} .pc-txt{font-weight:800}#fob-bi-launch{display:none!important}`;
    document.head.appendChild(style);
  }
}
function watch(){
  mount();
  const target=document.getElementById('view-member')||document.body;
  new MutationObserver(()=>mount()).observe(target,{subtree:true,childList:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();
})(window);
