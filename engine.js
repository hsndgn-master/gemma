window.GemmaEngine={run:function(box,p,cb){
cb=cb||{};var edit=!!cb.edit;
box.innerHTML="";box.onpointerdown=null;box.style.background=p.bg||"#1e3a8a";
var objs=JSON.parse(JSON.stringify(p.objects||[])),rules=JSON.parse(JSON.stringify(p.rules||[])),spr=p.sprites||{};
var els={},timers=[],vars=Object.create(null),done=false,last={x:50,y:50},tk=0,depth=0,AC,EC={};
vars.score=0;vars.life=3;(p.vars||[]).forEach(function(v){if(v&&v.n)vars[v.n]=+v.v||0;});
var st=rules.map(function(){return {};});
var TR=edit?"none":"left .06s linear,top .06s linear,transform .1s,font-size .1s,width .1s,height .1s";
var usesLife=/"life"|\bcan\b/.test(JSON.stringify(rules));
var ctrl={stop:function(){done=true;timers.forEach(clearInterval);box.onpointerdown=null;box.innerHTML="";},select:select};
var hudEl=document.createElement("div");
hudEl.style.cssText="position:absolute;top:12px;left:0;right:0;text-align:center;font:800 34px -apple-system,sans-serif;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.5);pointer-events:none;z-index:5";
function hud(){hudEl.innerHTML=Math.round(vars.score*100)/100+(usesLife?'<div style="font-size:20px">❤️ '+Math.round(vars.life*100)/100+'</div>':"");}
hud();if(!edit)box.appendChild(hudEl);
function cl(v){return Math.max(0,Math.min(100,v));}
function find(id){for(var i=0;i<objs.length;i++)if(objs[i].id==id)return objs[i];}
function byName(n){for(var i=0;i<objs.length;i++)if(objs[i].nm==n)return objs[i];}
/* ---- hesap motoru (güvenli, eval yok) ---- */
var FN={rastgele:function(a,b){a=a||0;b=b==null?1:b;return a+Math.random()*(b-a);},yuvarla:Math.round,mutlak:Math.abs,min:Math.min,max:Math.max,taban:Math.floor,"kök":Math.sqrt,
sin:function(d){return Math.sin(d*Math.PI/180);},cos:function(d){return Math.cos(d*Math.PI/180);}};
function idf(t){var m=t.split(".");
if(m.length==2){return function(){var o=byName(m[0]),k=m[1];return o&&(k=="x"||k=="y"||k=="s"||k=="r")?o[k]:0;};}
return function(){return t=="skor"?vars.score:t=="can"?vars.life:t=="zaman"?tk:t=="dokunX"?last.x:t=="dokunY"?last.y:t=="pi"?Math.PI:(vars[t]||0);};}
function parse(s){
var T=s.match(/\d+\.?\d*|\.\d+|[\p{L}_][\p{L}\p{N}_]*(?:\.\p{L}+)?|[-+*\/%(),]|\S/gu)||[],i=0;
function bin(l,r,o){return o=="+"?function(){return l()+r();}:o=="-"?function(){return l()-r();}:o=="*"?function(){return l()*r();}:o=="/"?function(){return l()/r();}:function(){return l()%r();};}
function ex(){var l=tm(),o;while((o=T[i])=="+"||o=="-"){i++;l=bin(l,tm(),o);}return l;}
function tm(){var l=un(),o;while((o=T[i])=="*"||o=="/"||o=="%"){i++;l=bin(l,un(),o);}return l;}
function un(){if(T[i]=="-"){i++;var u=un();return function(){return -u();};}return pr();}
function pr(){var t=T[i++];if(t==null)throw 0;
if(t=="("){var e=ex();if(T[i++]!=")")throw 0;return e;}
if(/^[\d.]/.test(t)){var n=+t;return function(){return n;};}
if(/^[\p{L}_]/u.test(t)){
if(T[i]=="("){i++;var a=[];if(T[i]!=")"){do{a.push(ex());}while(T[i]==","&&++i);}if(T[i++]!=")")throw 0;
if(!FN.hasOwnProperty(t))throw 0;var f=FN[t];return function(){return f.apply(null,a.map(function(x){return x();}));};}
return idf(t);}
throw 0;}
var f=ex();if(i<T.length)throw 0;return f;}
function ev(s){
if(typeof s=="number")return isFinite(s)?s:0;
s=String(s==null?"":s).trim();if(s==="")return 0;if(!isNaN(+s))return +s;
var f=EC[s];if(!f){try{f=EC[s]=parse(s);}catch(e){f=EC[s]=function(){return 0;};}}
try{var r=f();return isFinite(r)?r:0;}catch(e){return 0;}}
function cmp(a,op,b){var x=ev(a),y=ev(b);return op==">"?x>y:op=="<"?x<y:op==">="?x>=y:op=="<="?x<=y:op=="!="?Math.abs(x-y)>1e-9:Math.abs(x-y)<1e-9;}
function txt(s){return String(s).replace(/\{([^{}]+)\}/g,function(_,e){return Math.round(ev(e)*100)/100;});}
function beep(f){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();var o=AC.createOscillator(),g=AC.createGain();o.frequency.value=Math.max(50,Math.min(4000,f||440));g.gain.value=.15;o.connect(g);g.connect(AC.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.18);o.stop(AC.currentTime+.2);}catch(e){}}
/* ---- nesneler ---- */
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
function cond(r){var c=r.if;if(!c||c.t=="none")return true;
if(c.t=="expr")return cmp(c.a,c.op,c.n);
return cmp(c.t=="score"?"skor":"can",c.op,c.n);}
function acts(r){var a=r.do;if(!Array.isArray(a))a=a?[a]:[];return a;}
function trig(r){if(done||!cond(r))return;acts(r).forEach(function(a){if(!done)act(a);});}
function fire(f){rules.forEach(function(r){if(!done&&f(r.when||{}))trig(r);});}
function emit(n){if(done||depth>40)return;depth++;fire(function(w){return w.t=="event"&&w.name==n;});depth--;}
function restart(){ctrl.stop();var n=GemmaEngine.run(box,p,cb);ctrl.stop=n.stop;ctrl.select=n.select;}
function end(w){if(done)return;done=true;timers.forEach(clearInterval);
var v=document.createElement("div");
v.style.cssText="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font:800 38px -apple-system,sans-serif;z-index:9;text-align:center";
v.innerHTML=(w?"🎉 Kazandın!":"💥 Kaybettin")+'<div style="font:600 18px -apple-system,sans-serif;margin-top:10px">Skor: '+Math.round(vars.score*100)/100+' · Tekrar için dokun</div>';
v.onclick=restart;
box.appendChild(v);}
function act(a){var t=a.t,o=find(a.o);
if(t=="score"){vars.score+=ev(a.v);hud();}
else if(t=="life"){vars.life+=ev(a.v);hud();if(vars.life<=0)end(false);}
else if(t=="win"||t=="lose"){end(t=="win");}
else if(t=="set"){if(a.name){vars[a.name]=ev(a.v);hud();}}
else if(t=="add"){if(a.name){vars[a.name]=(vars[a.name]||0)+ev(a.v);hud();}}
else if(t=="bg"){if(/^#[0-9a-f]{6}$/i.test(a.c))box.style.background=a.c;}
else if(t=="bghue"){box.style.background="hsl("+(((ev(a.v)%360)+360)%360)+",65%,45%)";}
else if(t=="emit"){var d=ev(a.v),nm=a.name;if(d>0)timers.push(setTimeout(function(){emit(nm);},d*1000));else emit(nm);}
else if(t=="beep"){beep(ev(a.v));}
else if(t=="restart"){restart();}
else if(o){var W=box.clientWidth,H=box.clientHeight||1,v=ev(a.v),v2=ev(a.v2),tg=find(a.tg);
if(t=="move"){o.x=cl(o.x+v);o.y=cl(o.y+v2);}
else if(t=="forward"){var g=o.r*Math.PI/180;o.x=cl(o.x+Math.sin(g)*v);o.y=cl(o.y-Math.cos(g)*v*W/H);}
else if(t=="goto"){o.x=cl(v);o.y=cl(v2);}
else if(t=="gotap"){o.x=last.x;o.y=last.y;}
else if(t=="jump"){o.x=10+Math.random()*80;o.y=15+Math.random()*70;}
else if(t=="rotate"){o.r+=v;}
else if(t=="grow"){o.s=Math.max(2,Math.min(150,o.s*(1+v/100)));}
else if(t=="hide"){o.hide=true;}
else if(t=="show"){o.hide=false;}
else if(t=="setp"){var k=a.p;if(k=="x"||k=="y")o[k]=cl(v);else if(k=="s")o.s=Math.max(2,Math.min(150,v));else if(k=="r")o.r=v;}
else if(t=="goobj"){if(tg){o.x=tg.x;o.y=tg.y;}}
else if(t=="towards"){if(tg){var dx=(tg.x-o.x)/100*W,dy=(tg.y-o.y)/100*H,dd=Math.sqrt(dx*dx+dy*dy);if(dd>0){var sp=Math.min(dd,Math.abs(v)/100*W);o.x=cl(o.x+dx/dd*sp/W*100);o.y=cl(o.y+dy/dd*sp/H*100);}}}
else if(t=="vel"){o.vx=v;o.vy=v2;}
put(o);}}
function phys(){objs.forEach(function(o){
if(o.hide)return;var x0=o.x,y0=o.y,e=o.edge;
if(o.vx||o.vy||o.g){o.vy=(o.vy||0)+(o.g||0)*.05;o.x+=(o.vx||0)*.05;o.y+=o.vy*.05;}
if(e=="bounce"){
if(o.x<0){o.x=-o.x;o.vx=Math.abs(o.vx||0);}if(o.x>100){o.x=200-o.x;o.vx=-Math.abs(o.vx||0);}
if(o.y<0){o.y=-o.y;o.vy=Math.abs(o.vy||0);}if(o.y>100){o.y=200-o.y;o.vy=-Math.abs(o.vy||0);}
}else if(e=="wrap"){
if(o.x<0)o.x+=100;if(o.x>100)o.x-=100;if(o.y<0)o.y+=100;if(o.y>100)o.y-=100;
}else{
if(o.x<0||o.x>100){o.x=cl(o.x);if(e=="stop")o.vx=0;}
if(o.y<0||o.y>100){o.y=cl(o.y);if(e=="stop")o.vy=0;}
}
if(o.x!=x0||o.y!=y0)put(o);});}
function texts(){objs.forEach(function(o){var d=els[o.id];if(o.tx!=null&&d&&o.tx.indexOf("{")>-1){var s=txt(o.tx);if(d._t!==s){d._t=s;d.textContent=s;}}});}
objs.forEach(function(o){
var d=document.createElement("div");
d.style.cssText="position:absolute;line-height:1;user-select:none;-webkit-user-select:none;touch-action:none;transition:none";
if(isSp(o)){d.style.backgroundImage="url("+spr[o.sp]+")";d.style.backgroundSize="contain";d.style.backgroundRepeat="no-repeat";d.style.backgroundPosition="center";}
else if(o.tx!=null){d.textContent=edit?o.tx:txt(o.tx);d.style.color=o.c||"#ffffff";d.style.whiteSpace="nowrap";d.style.fontWeight="800";d.style.fontFamily="-apple-system,sans-serif";d.style.textShadow="0 2px 6px rgba(0,0,0,.5)";}
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
else if(w.t=="every"){var iv=Math.max(0.1,ev(w.sec)||1);if(s.n==null)s.n=iv;if(tk>=s.n){s.n+=iv;trig(r);}}
else if(w.t=="after"){if(!s.f&&tk>=ev(w.sec)){s.f=1;trig(r);}}
else if(w.t=="touch"){var h=hit(find(w.o),find(w.o2));if(h&&!s.h)trig(r);s.h=h;}
else if(w.t=="edge"){var o=find(w.o),e=!!o&&!o.hide&&(o.x<=1||o.x>=99||o.y<=1||o.y>=99);if(e&&!s.e)trig(r);s.e=e;}
else if(w.t=="cond"){var c=cmp(w.a,w.op,w.n);if(c&&!s.c)trig(r);s.c=c;}
});
if(!done){phys();texts();}
},50));
fire(function(w){return w.t=="start";});
}
return ctrl;}};
