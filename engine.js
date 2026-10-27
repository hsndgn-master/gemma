window.GemmaEngine={run:function(box,p,cb){
cb=cb||{};var edit=!!cb.edit;
box.innerHTML="";box.onpointerdown=null;box.style.background=p.bg||"#1e3a8a";
var objs=JSON.parse(JSON.stringify(p.objects||[])),rules=JSON.parse(JSON.stringify(p.rules||[])),spr=p.sprites||{};
var els={},timers=[],vars={score:0,life:3},done=false,last={x:50,y:50},tk=0;
var st=rules.map(function(){return {};});
var TR=edit?"none":"left .06s linear,top .06s linear,transform .1s,font-size .1s,width .1s,height .1s";
var usesLife=JSON.stringify(rules).indexOf('"life"')>-1;
var ctrl={stop:function(){done=true;timers.forEach(clearInterval);box.onpointerdown=null;box.innerHTML="";},select:select};
var hudEl=document.createElement("div");
hudEl.style.cssText="position:absolute;top:12px;left:0;right:0;text-align:center;font:800 34px -apple-system,sans-serif;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.5);pointer-events:none;z-index:5";
function hud(){hudEl.innerHTML=vars.score+(usesLife?'<div style="font-size:20px">❤️ '+vars.life+'</div>':"");}
hud();if(!edit)box.appendChild(hudEl);
function cl(v){return Math.max(0,Math.min(100,v));}
function find(id){for(var i=0;i<objs.length;i++)if(objs[i].id==id)return objs[i];}
function isSp(o){return !!(o.sp&&spr[o.sp]);}
function put(o){var d=els[o.id],px=o.s/100*box.clientWidth;
d.style.left=o.x+"%";d.style.top=o.y+"%";
if(isSp(o)){d.style.width=px+"px";d.style.height=px+"px";}else d.style.fontSize=px+"px";
d.style.transform="translate(-50%,-50%) rotate("+o.r+"deg)";
d.style.display=(o.hide&&!edit)?"none":"block";
d.style.opacity=(o.hide&&edit)?0.35:1;}
function startEdit(o,d){
d.style.userSelect="text";d.style.webkitUserSelect="text";
d.contentEditable="true";d.focus();
try{var rg=document.createRange();rg.selectNodeContents(d);var se=window.getSelection();se.removeAllRanges();se.addRange(rg);}catch(x){}
d.onkeydown=function(e){if(e.key=="Enter"){e.preventDefault();d.blur();}};
d.onblur=function(){d.onblur=null;d.onkeydown=null;d.contentEditable="false";d.style.userSelect="none";d.style.webkitUserSelect="none";
var t=(d.textContent||"").replace(/\s+/g," ").trim();if(!t)t="Yazı";o.tx=t;d.textContent=t;if(cb.onedit)cb.onedit(o.id,t);};
}
function select(id){objs.forEach(function(o){if(els[o.id])els[o.id].style.outline=(edit&&o.id==id)?"2px dashed #fff":"none";});}
function setLast(e){var r=box.getBoundingClientRect();last.x=cl((e.clientX-r.left)/r.width*100);last.y=cl((e.clientY-r.top)/r.height*100);}
function hit(a,b){if(!a||!b||a==b||a.hide||b.hide)return false;var W=box.clientWidth,H=box.clientHeight,dx=(a.x-b.x)/100*W,dy=(a.y-b.y)/100*H,r=(a.s+b.s)/100*W*0.42;return dx*dx+dy*dy<r*r;}
function cond(r){var c=r.if;if(!c||c.t=="none")return true;var v=vars[c.t],n=+c.n||0;return c.op==">"?v>n:c.op=="<"?v<n:v==n;}
function acts(r){var a=r.do;if(!Array.isArray(a))a=a?[a]:[];return a;}
function trig(r){if(done||!cond(r))return;acts(r).forEach(function(a){if(!done)act(a);});}
function fire(f){rules.forEach(function(r){if(!done&&f(r.when||{}))trig(r);});}
function end(w){if(done)return;done=true;timers.forEach(clearInterval);
var v=document.createElement("div");
v.style.cssText="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font:800 38px -apple-system,sans-serif;z-index:9;text-align:center";
v.innerHTML=(w?"🎉 Kazandın!":"💥 Kaybettin")+'<div style="font:600 18px -apple-system,sans-serif;margin-top:10px">Skor: '+vars.score+' · Tekrar için dokun</div>';
v.onclick=function(){ctrl.stop();var n=GemmaEngine.run(box,p,cb);ctrl.stop=n.stop;ctrl.select=n.select;};
box.appendChild(v);}
function act(a){var t=a.t,o=find(a.o);
if(t=="score"){vars.score+=+a.v||0;hud();}
else if(t=="life"){vars.life+=+a.v||0;hud();if(vars.life<=0)end(false);}
else if(t=="win"||t=="lose"){end(t=="win");}
else if(o){var W=box.clientWidth,H=box.clientHeight||1;
if(t=="move"){o.x=cl(o.x+(+a.v||0));o.y=cl(o.y+(+a.v2||0));}
else if(t=="forward"){var g=o.r*Math.PI/180,n=+a.v||0;o.x=cl(o.x+Math.sin(g)*n);o.y=cl(o.y-Math.cos(g)*n*W/H);}
else if(t=="goto"){o.x=cl(+a.v||0);o.y=cl(+a.v2||0);}
else if(t=="gotap"){o.x=last.x;o.y=last.y;}
else if(t=="jump"){o.x=10+Math.random()*80;o.y=15+Math.random()*70;}
else if(t=="rotate"){o.r+=+a.v||0;}
else if(t=="grow"){o.s=Math.max(2,Math.min(150,o.s*(1+(+a.v||0)/100)));}
else if(t=="hide"){o.hide=true;}
else if(t=="show"){o.hide=false;}
put(o);}}
objs.forEach(function(o){
var d=document.createElement("div");
d.style.cssText="position:absolute;line-height:1;user-select:none;-webkit-user-select:none;touch-action:none;transition:none";
if(isSp(o)){d.style.backgroundImage="url("+spr[o.sp]+")";d.style.backgroundSize="contain";d.style.backgroundRepeat="no-repeat";d.style.backgroundPosition="center";}
else if(o.tx!=null){d.textContent=o.tx;d.style.color=o.c||"#ffffff";d.style.whiteSpace="nowrap";d.style.fontWeight="800";d.style.textShadow="0 2px 6px rgba(0,0,0,.5)";}
else d.textContent=o.e||"⭐";
els[o.id]=d;put(o);box.appendChild(d);void d.offsetWidth;d.style.transition=TR;
d.onpointerdown=function(ev){
if(edit&&d.isContentEditable)return;
var sx=ev.clientX,sy=ev.clientY,mv=false;
setLast(ev);
if(edit){if(cb.onselect)cb.onselect(o.id);}
else fire(function(w){return w.t=="tap"&&w.o==o.id;});
if(edit||o.drag){
ev.preventDefault();try{d.setPointerCapture(ev.pointerId);}catch(x){}
d.style.transition="none";
d.onpointermove=function(e){if(!mv){if(Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy)<=6)return;mv=true;}var r=box.getBoundingClientRect();o.x=cl((e.clientX-r.left)/r.width*100);o.y=cl((e.clientY-r.top)/r.height*100);put(o);};
d.onpointerup=d.onpointercancel=function(){d.onpointermove=null;d.style.transition=TR;if(edit&&cb.onmove)cb.onmove(o.id,o.x,o.y);if(edit&&o.tx!=null&&!mv)startEdit(o,d);};
}};});
if(edit){select(cb.sel);}
else{
box.onpointerdown=function(e){setLast(e);fire(function(w){return w.t=="tapany";});};
timers.push(setInterval(function(){
if(done)return;tk+=0.05;
rules.forEach(function(r,i){if(done)return;var w=r.when||{},s=st[i];
if(w.t=="always")trig(r);
else if(w.t=="every"){var iv=Math.max(0.1,+w.sec||1);if(s.n==null)s.n=iv;if(tk>=s.n){s.n+=iv;trig(r);}}
else if(w.t=="after"){if(!s.f&&tk>=(+w.sec||0)){s.f=1;trig(r);}}
else if(w.t=="touch"){var h=hit(find(w.o),find(w.o2));if(h&&!s.h)trig(r);s.h=h;}
else if(w.t=="edge"){var o=find(w.o),e=!!o&&!o.hide&&(o.x<=1||o.x>=99||o.y<=1||o.y>=99);if(e&&!s.e)trig(r);s.e=e;}
});},50));
fire(function(w){return w.t=="start";});
}
return ctrl;}};
