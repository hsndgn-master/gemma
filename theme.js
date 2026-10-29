(function(){
var K="gemma_theme",root=document.documentElement;
var S='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
var ICON={dark:S+'<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>',
light:S+'<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>'};
function sys(){try{return window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}catch(e){return "dark";}}
function get(){try{var v=localStorage.getItem(K);if(v==="light"||v==="dark")return v;}catch(e){}return sys();}
function cur(){return root.getAttribute("data-theme")==="light"?"light":"dark";}
function paint(){
var t=cur();
document.querySelectorAll("[data-theme-btn]").forEach(function(b){b.innerHTML=ICON[t];b.setAttribute("aria-label",t=="dark"?"Aydınlık moda geç":"Karanlık moda geç");});
var m=document.querySelector('meta[name="theme-color"]');
if(!m){m=document.createElement("meta");m.name="theme-color";document.head.appendChild(m);}
m.content=t=="light"?"#f2f2f7":"#000000";
}
function apply(t,save){
root.setAttribute("data-theme",t);
if(save){try{localStorage.setItem(K,t);}catch(e){}}
paint();
window.dispatchEvent(new Event("gemma-theme"));
}
apply(get(),false);
window.GemmaTheme={toggle:function(){apply(cur()=="dark"?"light":"dark",true);},icon:function(){return ICON[cur()];},paint:paint};
try{var mq=window.matchMedia("(prefers-color-scheme: light)"),onSys=function(){var v=null;try{v=localStorage.getItem(K);}catch(e){}if(v!=="light"&&v!=="dark")apply(sys(),false);};if(mq.addEventListener)mq.addEventListener("change",onSys);else if(mq.addListener)mq.addListener(onSys);}catch(e){}
window.addEventListener("storage",function(e){if(e.key===K)apply(get(),false);});
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-theme-btn]");if(b)GemmaTheme.toggle();});
document.addEventListener("DOMContentLoaded",paint);
})();
