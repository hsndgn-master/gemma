window.GemmaEngine={run:function(box,p,cb){
cb=cb||{};var edit=!!cb.edit,EN=window.GL=="en";
box.innerHTML="";box.onpointerdown=null;box.style.background=p.bg||"#1e3a8a";
var objs=JSON.parse(JSON.stringify(p.objects||[])),rules=JSON.parse(JSON.stringify(p.rules||[])),spr=p.sprites||{};
if(!edit)expandBeh();
var WW=Math.max(100,Math.min(1000,+(p.world&&p.world.w)||100)),WH=Math.max(100,Math.min(1000,+(p.world&&p.world.h)||100));
var els={},timers=[],vars=Object.create(null),done=false,last={x:50,y:50},tk=0,depth=0,AC,EC={},cam={x:0,y:0},ctx={self:null,other:null},loopI=0,nid=1,MAXI=300,ptr={};
if(edit&&cb.cam){cam.x=+cb.cam.x||0;cam.y=+cb.cam.y||0;}
vars.score=0;vars.life=3;(p.vars||[]).forEach(function(v){if(v&&v.n)vars[v.n]=+v.v||0;});
var st=rules.map(function(){return {};});
var TR=edit?"none":"left .06s linear,top .06s linear,transform .1s,font-size .1s,width .1s,height .1s";
var usesLife=/\blife\b|\bcan\b/.test(JSON.stringify(rules));
function onMv(e){var q=ptr[e.pointerId];if(!q)return;
if(q.obj&&q.obj.k=="joy"&&q.obj._pid==e.pointerId)joy(q.obj,e);else setLast(e);}
function onUp(e){var q=ptr[e.pointerId];if(!q||done)return;delete ptr[e.pointerId];
var o=q.obj,isJoy=!!(o&&o.k=="joy");
if(o){o.held=0;if(isJoy){o.jx=0;o.jy=0;o.ja=0;o._pid=null;knob(o);}
if(!o.dead)fire(function(w){return w.t=="up"&&w.o==o.src;},o);}
fire(function(w){return w.t=="upany";});
if(!isJoy&&e.type=="pointerup"){var r=box.getBoundingClientRect(),dx=e.clientX-q.sx,dy=e.clientY-q.sy,th=Math.max(20,r.width*0.08);
if(Math.max(Math.abs(dx),Math.abs(dy))>th){var dir=Math.abs(dx)>Math.abs(dy)?(dx>0?"right":"left"):(dy>0?"down":"up");
fire(function(w){return w.t=="swipe"&&w.dir==dir;});}}}
var ctrl={stop:function(){done=true;timers.forEach(clearInterval);window.removeEventListener("pointermove",onMv);window.removeEventListener("pointerup",onUp);window.removeEventListener("pointercancel",onUp);box.onpointerdown=null;box.innerHTML="";},select:select,setCam:function(x,y){cam.x=+x||0;cam.y=+y||0;applyCam();}};
var hudEl=document.createElement("div");
hudEl.style.cssText="position:absolute;top:12px;left:0;right:0;text-align:center;font:800 34px -apple-system,sans-serif;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.5);pointer-events:none;z-index:5";
function hud(){hudEl.innerHTML=Math.round(vars.score*100)/100+(usesLife?'<div style="font-size:20px">❤️ '+Math.round(vars.life*100)/100+'</div>':"");}
var wd=document.createElement("div");
wd.style.cssText="position:absolute;left:0;top:0;width:"+WW+"%;height:"+WH+"%;will-change:transform";
box.appendChild(wd);
hud();if(!edit)box.appendChild(hudEl);
/* ---- Temel mod davranışları: kurallara çevrilir ---- */
function expandBeh(){
var B=p.beh;if(!Array.isArray(B)||!B.length)return;
function D(id){for(var i=0;i<objs.length;i++)if(objs[i].id==id)return objs[i];}
function nmo(id){var o=D(id);if(!o)return "";if(!o.nm)o.nm="nesne"+o.id;return o.nm;}
function R(w,d){rules.push({when:w,if:{t:"none"},do:d});}
function n(v,d){v=+v;return isFinite(v)?v:d;}
B.forEach(function(b){var t=b.t,o=D(b.o);
if(t=="joy"){var j=D(b.j);if(!o||!j)return;var jn=nmo(j.id),sp=n(b.speed,5);
if(b.mode=="side"){o.body=true;R({t:"always"},[{t:"setp",o:o.id,p:"vx",v:jn+".jx*"+(sp*7)}]);}
else R({t:"always"},[{t:"move",o:o.id,v:jn+".jx*"+(sp*0.3),v2:jn+".jy*"+(sp*0.3)}]);}
else if(t=="shoot"){var bl=D(b.b);if(!o||!bl||bl===o)return;bl.hide=true;
var sp1=n(b.speed,6)*10,dr=b.dir||"up",vx=dr=="left"?-sp1:dr=="right"?sp1:0,vy=dr=="up"?-sp1:dr=="down"?sp1:0,ox=dr=="left"?-5:dr=="right"?5:0,oy=dr=="up"?-5:dr=="down"?5:0;
var ac=[{t:"clone",o:bl.id,tg:o.id,v:ox,v2:oy}];
if(b.mode=="tap")R({t:"tapany"},ac);
else if(b.mode=="btn")R({t:"tap",o:+b.btn},ac);
else R({t:"every",sec:Math.max(0.1,n(b.sec,0.5))},ac);
R({t:"oclone",o:bl.id},[{t:"vel",o:bl.id,v:vx,v2:vy}]);
R({t:"edge",o:bl.id},[{t:"delete",o:bl.id}]);}
else if(t=="spawn"){var sb=D(b.b);if(!sb)return;sb.hide=true;
var sp2=n(b.speed,4)*10,fr=b.from||"top",id=sb.id,st2=[];
R({t:"every",sec:Math.max(0.1,n(b.sec,1))},[{t:"clone",o:id,tg:0,v:0,v2:0}]);
if(fr=="top")st2=[{t:"setp",o:id,p:"x",v:"random(8,92)"},{t:"setp",o:id,p:"y",v:3},{t:"vel",o:id,v:0,v2:sp2}];
else if(fr=="bottom")st2=[{t:"setp",o:id,p:"x",v:"random(8,92)"},{t:"setp",o:id,p:"y",v:97},{t:"vel",o:id,v:0,v2:-sp2}];
else if(fr=="left")st2=[{t:"setp",o:id,p:"x",v:3},{t:"setp",o:id,p:"y",v:"random(8,92)"},{t:"vel",o:id,v:sp2,v2:0}];
else if(fr=="right")st2=[{t:"setp",o:id,p:"x",v:97},{t:"setp",o:id,p:"y",v:"random(8,92)"},{t:"vel",o:id,v:-sp2,v2:0}];
else st2=[{t:"setp",o:id,p:"x",v:"random(8,92)"},{t:"setp",o:id,p:"y",v:"random(8,92)"},{t:"wait",v:Math.max(0.2,n(b.stay,3)),do:[{t:"delete",o:id}]}];
R({t:"oclone",o:id},st2);
if(fr!="random"){var ed=[];if(b.lose)ed.push({t:"life",v:-1});ed.push({t:"delete",o:id});R({t:"edge",o:id},ed);}}
else if(t=="hit"){var A=D(b.a),Bo=D(b.b);if(!A||!Bo)return;var d=[];
if(n(b.score,0))d.push({t:"score",v:n(b.score,0)});
if(n(b.life,0))d.push({t:"life",v:n(b.life,0)});
if(b.killA)d.push({t:"delete",o:A.id});
if(b.killB)d.push({t:"delete",o:Bo.id});
if(b.end=="win")d.push({t:"win"});else if(b.end=="lose")d.push({t:"lose"});
R({t:"touch",o:A.id,o2:Bo.id},d);}
else if(t=="tap"){if(!o)return;var d2=[];
if(n(b.score,0))d2.push({t:"score",v:n(b.score,0)});
if(b.jump)d2.push({t:"jump",o:o.id});
if(b.kill)d2.push({t:"delete",o:o.id});
R({t:"tap",o:o.id},d2);}
else if(t=="follow"){var tg=D(b.tg);if(!o||!tg)return;R({t:"always"},[{t:"towards",o:o.id,tg:tg.id,v:n(b.speed,3)*0.3}]);}
else if(t=="move"){if(!o)return;var sp3=n(b.speed,4)*10,dm=b.dir||"right";
o.vx=dm=="right"||dm=="diag"?sp3:dm=="left"?-sp3:0;
o.vy=dm=="down"?sp3:dm=="up"?-sp3:dm=="diag"?sp3*0.75:0;
if(b.edge=="bounce"||b.edge=="wrap"||b.edge=="stop")o.edge=b.edge;}
else if(t=="gravity"){if(!o)return;o.body=true;o.g=n(b.strength,5)*30;}
else if(t=="jump"){if(!o)return;o.body=true;if(!o.g)o.g=150;
var jd=[{t:"if",a:nmo(o.id)+".ground",op:"=",n:1,more:[],do:[{t:"setp",o:o.id,p:"vy",v:-n(b.strength,7)*10}],els:[]}];
if(b.mode=="btn")R({t:"tap",o:+b.btn},jd);else R({t:"tapany"},jd);}
else if(t=="spin"){if(!o)return;R({t:"always"},[{t:"rotate",o:o.id,v:n(b.speed,5)*0.8}]);}
else if(t=="goal"){var gv=n(b.v,10);
if(b.kind=="twin")R({t:"after",sec:gv},[{t:"win"}]);
else if(b.kind=="tlose")R({t:"after",sec:gv},[{t:"lose"}]);
else R({t:"cond",a:"skor",op:">=",n:gv},[{t:"win"}]);}
else if(t=="cam"){if(o)o.cam=true;}
});}
function cl(v){return Math.max(0,Math.min(100,v));}
function bx(o){return o.fixed?100:WW;}
function by(o){return o.fixed?100:WH;}
function clx(o,v){return Math.max(0,Math.min(bx(o),v));}
function cly(o,v){return Math.max(0,Math.min(by(o),v));}
function find(id){for(var i=0;i<objs.length;i++)if(objs[i].src==id&&!objs[i].clone)return objs[i];}
function inst(id){return objs.filter(function(o){return o.src==id;});}
function tgt(id){
if(ctx.self&&!ctx.self.dead&&ctx.self.src==id)return [ctx.self];
if(ctx.other&&!ctx.other.dead&&ctx.other.src==id)return [ctx.other];
return inst(id);}
function one(id){return tgt(id)[0];}
function byName(n){
if(ctx.self&&ctx.self.nm==n)return ctx.self;
if(ctx.other&&ctx.other.nm==n)return ctx.other;
for(var i=0;i<objs.length;i++)if(objs[i].nm==n&&!objs[i].clone)return objs[i];}
function wpos(o){return o.fixed?{x:o.x+cam.x,y:o.y+cam.y}:{x:o.x,y:o.y};}
/* ---- hesap motoru (güvenli, eval yok) ---- */
var FN={rastgele:function(a,b){a=a||0;b=b==null?1:b;return a+Math.random()*(b-a);},yuvarla:Math.round,mutlak:Math.abs,min:Math.min,max:Math.max,taban:Math.floor,"kök":Math.sqrt,random:function(a,b){return FN.rastgele(a,b);},round:Math.round,abs:Math.abs,floor:Math.floor,sqrt:Math.sqrt,
sin:function(d){return Math.sin(d*Math.PI/180);},cos:function(d){return Math.cos(d*Math.PI/180);},tan:function(d){return Math.tan(d*Math.PI/180);},
ceil:Math.ceil,tavan:Math.ceil,pow:Math.pow,"üs":Math.pow,log:Math.log,sign:Math.sign,"işaret":Math.sign,
clamp:function(v,a,b){return Math.max(a,Math.min(b,v));},
lerp:function(a,b,t){return a+(b-a)*t;},
dist:function(a,b,c,d){return Math.sqrt((c-a)*(c-a)+(d-b)*(d-b));},
angle:function(a,b,c,d){return (Math.atan2(c-a,-(d-b))*180/Math.PI+360)%360;},
randint:function(a,b){a=Math.ceil(a||0);b=Math.floor(b==null?1:b);return a+Math.floor(Math.random()*(b-a+1));}};
FN["sınır"]=FN.clamp;FN.sinir=FN.clamp;FN.mesafe=FN.dist;FN["açı"]=FN.angle;FN.aci=FN.angle;FN.rastgeleint=FN.randint;FN.us=Math.pow;FN.isaret=Math.sign;FN.kok=Math.sqrt;
var PK={x:"x",y:"y",s:"s",r:"r",vx:"vx",vy:"vy",g:"g",w:"w",h:"h",op:"op",jx:"jx",jy:"jy",ja:"ja",held:"held",basili:"held",ground:"ground",zemin:"ground",count:"count",sayi:"count"};
function idf(t){var m=t.split(".");
if(m.length==2){var pk=PK.hasOwnProperty(m[1])?PK[m[1]]:null;
return function(){if(!pk)return 0;
if(pk=="count"){var c=0;for(var i=0;i<objs.length;i++)if(objs[i].nm==m[0]&&!objs[i].hide)c++;return c;}
var o=byName(m[0]);if(!o)return 0;var v=o[pk];return v===true?1:(+v||0);};}
return function(){return t=="skor"?vars.score:t=="can"?vars.life:t=="zaman"?tk:t=="dokunX"?last.x:t=="dokunY"?last.y:t=="pi"?Math.PI:(vars[t]!=null?vars[t]:t=="time"?tk:(t=="tapX"||t=="touchX")?last.x:(t=="tapY"||t=="touchY")?last.y:t=="i"?loopI:(t=="pressed"||t=="basili")?(Object.keys(ptr).length?1:0):0);};}
function parse(s){
var T=s.match(/\d+\.?\d*|\.\d+|[\p{L}_][\p{L}\p{N}_]*(?:\.\p{L}+)?|>=|<=|==|!=|&&|\|\||[-+*\/%(),<>!=]|\S/gu)||[],i=0;
function bin(l,r,o){switch(o){
case"+":return function(){return l()+r();};
case"-":return function(){return l()-r();};
case"*":return function(){return l()*r();};
case"/":return function(){return l()/r();};
case"%":return function(){return l()%r();};
case">":return function(){return l()>r()?1:0;};
case"<":return function(){return l()<r()?1:0;};
case">=":return function(){return l()>=r()?1:0;};
case"<=":return function(){return l()<=r()?1:0;};
case"!=":return function(){return Math.abs(l()-r())>1e-9?1:0;};
case"&&":return function(){return (l()&&r())?1:0;};
case"||":return function(){return (l()||r())?1:0;};
default:return function(){return Math.abs(l()-r())<1e-9?1:0;};}}
function ex(){var l=an(),o;while((o=T[i])=="||"||o=="or"||o=="veya"){i++;l=bin(l,an(),"||");}return l;}
function an(){var l=cm(),o;while((o=T[i])=="&&"||o=="and"||o=="ve"){i++;l=bin(l,cm(),"&&");}return l;}
function cm(){var l=ad(),o;while((o=T[i])==">"||o=="<"||o==">="||o=="<="||o=="=="||o=="="||o=="!="){i++;l=bin(l,ad(),o);}return l;}
function ad(){var l=tm(),o;while((o=T[i])=="+"||o=="-"){i++;l=bin(l,tm(),o);}return l;}
function tm(){var l=un(),o;while((o=T[i])=="*"||o=="/"||o=="%"){i++;l=bin(l,un(),o);}return l;}
function un(){var o=T[i];
if(o=="-"){i++;var u=un();return function(){return -u();};}
if(o=="!"||o=="not"||o=="degil"){i++;var q=un();return function(){return q()?0:1;};}
return pr();}
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
function condOK(c){var ok=cmp(c.a,c.op,c.n),m=c.more||[];
for(var i=0;i<m.length;i++){var q=cmp(m[i].a,m[i].op,m[i].n);ok=(m[i].j=="or")?(ok||q):(ok&&q);}
return ok;}
function txt(s){return String(s).replace(/\{([^{}]+)\}/g,function(_,e){return Math.round(ev(e)*100)/100;});}
function beep(f){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();var o=AC.createOscillator(),g=AC.createGain();o.frequency.value=Math.max(50,Math.min(4000,f||440));g.gain.value=.15;o.connect(g);g.connect(AC.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.18);o.stop(AC.currentTime+.2);}catch(e){}}
/* ---- nesneler ---- */
function isSp(o){return !!(o.sp&&spr[o.sp]);}
function applyCam(){var W=box.clientWidth,H=box.clientHeight;wd.style.transform="translate("+(-cam.x/100*W)+"px,"+(-cam.y/100*H)+"px)";}
function knob(o){var kn=o._kn;if(!kn)return;var px=o.s/100*box.clientWidth,kd=px*.45,R=px/2-kd/2;
kn.style.width=kd+"px";kn.style.height=kd+"px";
kn.style.transform="translate(-50%,-50%) translate("+((o.jx||0)*R)+"px,"+((o.jy||0)*R)+"px)";}
function put(o){var d=els[o.id];if(!d)return;var W=box.clientWidth,px=o.s/100*W;
d.style.left=(o.fixed?o.x:o.x/WW*100)+"%";d.style.top=(o.fixed?o.y:o.y/WH*100)+"%";
if(o.k=="box"){d.style.width=((o.w||30)/100*W)+"px";d.style.height=((o.h||6)/100*W)+"px";}
else if(o.k=="joy"){d.style.width=px+"px";d.style.height=px+"px";knob(o);}
else if(isSp(o)){d.style.width=px+"px";d.style.height=px+"px";}
else d.style.fontSize=px+"px";
d.style.transform="translate(-50%,-50%) rotate("+(o.r||0)+"deg)";
d.style.display=(o.hide&&!edit)?"none":"block";
d.style.opacity=(o.hide&&edit)?0.35:(o.op==null?1:Math.max(0,Math.min(100,o.op))/100);}
function startEdit(o,d){
d.style.userSelect="text";d.style.webkitUserSelect="text";
d.contentEditable="true";d.focus();
try{var rg=document.createRange();rg.selectNodeContents(d);var se=window.getSelection();se.removeAllRanges();se.addRange(rg);}catch(x){}
d.onkeydown=function(e){if(e.key=="Enter"){e.preventDefault();d.blur();}};
d.onblur=function(){d.onblur=null;d.onkeydown=null;d.contentEditable="false";d.style.userSelect="none";d.style.webkitUserSelect="none";
var t=(d.textContent||"").replace(/\s+/g," ").trim();if(!t)t=EN?"Text":"Yazı";o.tx=t;d.textContent=t;if(cb.onedit)cb.onedit(o.id,t);};
}
function select(id){objs.forEach(function(o){if(els[o.id])els[o.id].style.outline=(edit&&o.id==id)?"2px dashed #fff":"none";});}
function scr(e){var r=box.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*100,y:(e.clientY-r.top)/r.height*100};}
function setLast(e){var s=scr(e);last.x=Math.max(0,Math.min(WW,s.x+cam.x));last.y=Math.max(0,Math.min(WH,s.y+cam.y));}
function joy(o,e){var d=els[o.id];if(!d)return;var r=d.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,kd=r.width*.45,R=Math.max(1,r.width/2-kd/2),dx=(e.clientX-cx)/R,dy=(e.clientY-cy)/R,m=Math.sqrt(dx*dx+dy*dy);
if(m>1){dx/=m;dy/=m;m=1;}
if(m<.12){dx=0;dy=0;}
o.jx=dx;o.jy=dy;o.ja=(Math.atan2(dx,-dy)*180/Math.PI+360)%360;knob(o);}
function half(o){var W=box.clientWidth;
if(o.k=="box")return [(o.w||30)/200*W,(o.h||6)/200*W];
if(o.k=="joy")return [o.s/200*W,o.s/200*W];
var r=o.s/100*W*0.42;return [r,r];}
function hit(a,b){if(!a||!b||a==b||a.hide||b.hide)return false;var W=box.clientWidth,H=box.clientHeight,pa=wpos(a),pb=wpos(b),dx=(pa.x-pb.x)/100*W,dy=(pa.y-pb.y)/100*H;
if(a.k=="box"||b.k=="box"||a.k=="joy"||b.k=="joy"){var ha=half(a),hb=half(b);return Math.abs(dx)<ha[0]+hb[0]&&Math.abs(dy)<ha[1]+hb[1];}
var r=(a.s+b.s)/100*W*0.42;return dx*dx+dy*dy<r*r;}
function cond(r){var c=r.if;if(!c||c.t=="none")return true;
if(c.t=="expr")return condOK(c);
return cmp(c.t=="score"?"skor":"can",c.op,c.n);}
function acts(r){var a=r.do;if(!Array.isArray(a))a=a?[a]:[];return a;}
function runList(l){if(!Array.isArray(l))return;for(var i=0;i<l.length&&!done;i++)act(l[i]);}
function run(r,self,other){if(done)return;var s0=ctx;ctx={self:self||null,other:other||null};
try{if(cond(r))runList(acts(r));}finally{ctx=s0;}}
function fire(f,self,other){rules.forEach(function(r){if(!done&&f(r.when||{}))run(r,self,other);});}
function emit(n){if(done||depth>40)return;depth++;fire(function(w){return w.t=="event"&&w.name==n;});depth--;}
function restart(){ctrl.stop();var n=GemmaEngine.run(box,p,cb);ctrl.stop=n.stop;ctrl.select=n.select;ctrl.setCam=n.setCam;}
function end(w){if(done)return;done=true;timers.forEach(clearInterval);
var v=document.createElement("div");
v.style.cssText="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font:800 38px -apple-system,sans-serif;z-index:9;text-align:center";
v.innerHTML=(w?(EN?"🎉 You won!":"🎉 Kazandın!"):(EN?"💥 You lost":"💥 Kaybettin"))+'<div style="font:600 18px -apple-system,sans-serif;margin-top:10px">'+(EN?"Score: ":"Skor: ")+Math.round(vars.score*100)/100+' · '+(EN?"Tap to retry":"Tekrar için dokun")+'</div>';
v.onclick=restart;
box.appendChild(v);}
function cp(o){var c={};Object.keys(o).forEach(function(k){if(k.charAt(0)!="_"&&k!="dead")c[k]=o[k];});return c;}
function kill(o){if(o.dead)return;
if(!o.clone){o.hide=true;put(o);return;}
o.dead=true;var i=objs.indexOf(o);if(i>-1)objs.splice(i,1);
var d=els[o.id];if(d&&d.parentNode)d.parentNode.removeChild(d);delete els[o.id];}
function doClone(a){
var src=one(a.o);if(!src||objs.length>=MAXI)return;
var base=a.tg?one(a.tg):null,c=cp(src);
c.id="c"+(nid++);c.clone=true;c.src=src.src;c.hide=false;c.held=0;c.ground=false;
var pb=wpos(base||src),ox=ev(a.v),oy=ev(a.v2);
c.x=clx(c,(c.fixed?pb.x-cam.x:pb.x)+ox);c.y=cly(c,(c.fixed?pb.y-cam.y:pb.y)+oy);
objs.push(c);mk(c);
fire(function(w){return w.t=="oclone"&&w.o==c.src;},c);}
function objAct(o,a){
var t=a.t,W=box.clientWidth,H=box.clientHeight||1,v=ev(a.v),v2=ev(a.v2),tg=one(a.tg);
if(t=="move"){o.x=clx(o,o.x+v);o.y=cly(o,o.y+v2);}
else if(t=="forward"){var g=(o.r||0)*Math.PI/180;o.x=clx(o,o.x+Math.sin(g)*v);o.y=cly(o,o.y-Math.cos(g)*v*W/H);}
else if(t=="goto"){o.x=clx(o,v);o.y=cly(o,v2);}
else if(t=="gotap"){o.x=clx(o,o.fixed?last.x-cam.x:last.x);o.y=cly(o,o.fixed?last.y-cam.y:last.y);}
else if(t=="jump"){o.x=bx(o)*(0.1+Math.random()*0.8);o.y=by(o)*(0.15+Math.random()*0.7);}
else if(t=="rotate"){o.r=(o.r||0)+v;}
else if(t=="grow"){o.s=Math.max(2,Math.min(150,o.s*(1+v/100)));}
else if(t=="hide"){o.hide=true;}
else if(t=="show"){o.hide=false;}
else if(t=="setp"){var k=a.p;
if(k=="x")o.x=clx(o,v);else if(k=="y")o.y=cly(o,v);
else if(k=="s")o.s=Math.max(2,Math.min(150,v));
else if(k=="r")o.r=v;
else if(k=="vx"||k=="vy"||k=="g")o[k]=v;
else if(k=="op")o.op=Math.max(0,Math.min(100,v));
else if(k=="w"||k=="h")o[k]=Math.max(1,Math.min(400,v));}
else if(t=="goobj"){if(tg){var q=wpos(tg);o.x=clx(o,o.fixed?q.x-cam.x:q.x);o.y=cly(o,o.fixed?q.y-cam.y:q.y);}}
else if(t=="towards"){if(tg){var po=wpos(o),q2=wpos(tg),dx=(q2.x-po.x)/100*W,dy=(q2.y-po.y)/100*H,dd=Math.sqrt(dx*dx+dy*dy);if(dd>0){var sp=Math.min(dd,Math.abs(v)/100*W);o.x=clx(o,o.x+dx/dd*sp/W*100);o.y=cly(o,o.y+dy/dd*sp/H*100);}}}
else if(t=="vel"){o.vx=v;o.vy=v2;}
put(o);}
function act(a){var t=a.t;
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
else if(t=="repeat"){var n=Math.max(0,Math.min(500,Math.floor(ev(a.v)))),sv=loopI;for(var k=1;k<=n&&!done;k++){loopI=k;runList(a.do);}loopI=sv;}
else if(t=="while"){var g=0,sv2=loopI;while(g<300&&!done&&condOK(a)){g++;loopI=g;runList(a.do);}loopI=sv2;}
else if(t=="if"){runList(condOK(a)?a.do:a.els);}
else if(t=="wait"){var sc=ctx,ls=a.do;timers.push(setTimeout(function(){if(done)return;var s0=ctx;
ctx={self:sc.self&&!sc.self.dead?sc.self:null,other:sc.other&&!sc.other.dead?sc.other:null};
try{runList(ls);}finally{ctx=s0;}},Math.max(0,ev(a.v))*1000));}
else if(t=="clone"){doClone(a);}
else if(t=="delete"){tgt(a.o).slice().forEach(kill);}
else{tgt(a.o).slice().forEach(function(o){objAct(o,a);});}}
function physBody(o){
var W=box.clientWidth,H=box.clientHeight||1,h=half(o);o.ground=false;
o.vx=o.vx||0;o.vy=(o.vy||0)+(o.g||0)*.05;
var dxp=Math.abs(o.vx*.05/100*W),dyp=Math.abs(o.vy*.05/100*H),n=Math.min(8,Math.max(1,Math.ceil(Math.max(dxp,dyp)/Math.max(3,Math.min(h[0],h[1]))))),
sol=objs.filter(function(s){return s!==o&&s.solid&&!s.hide&&!s.dead;});
for(var k=0;k<n;k++){
o.x+=o.vx*.05/n;
for(var i=0;i<sol.length;i++){var s=sol[i],hs=half(s),ps=wpos(s),sx=ps.x/100*W,sy=ps.y/100*H,px=wpos(o).x/100*W,py=wpos(o).y/100*H;
if(Math.abs(px-sx)<h[0]+hs[0]&&Math.abs(py-sy)<h[1]+hs[1]){
if(o.vx>0)o.x=(sx-hs[0]-h[0])/W*100;else if(o.vx<0)o.x=(sx+hs[0]+h[0])/W*100;
o.vx=0;}}
o.y+=o.vy*.05/n;
for(var j=0;j<sol.length;j++){var s2=sol[j],hs2=half(s2),ps2=wpos(s2),sx2=ps2.x/100*W,sy2=ps2.y/100*H,px2=wpos(o).x/100*W,py2=wpos(o).y/100*H;
if(Math.abs(px2-sx2)<h[0]+hs2[0]&&Math.abs(py2-sy2)<h[1]+hs2[1]){
if(o.vy>0){o.y=(sy2-hs2[1]-h[1])/H*100;o.ground=true;o.vy=0;}
else if(o.vy<0){o.y=(sy2+hs2[1]+h[1])/H*100;o.vy=0;}}}}}
function phys(){objs.slice().forEach(function(o){
if(o.hide||o.dead)return;var x0=o.x,y0=o.y,e=o.edge,X=bx(o),Y=by(o);
if(o.body)physBody(o);
else if(o.vx||o.vy||o.g){o.vy=(o.vy||0)+(o.g||0)*.05;o.x+=(o.vx||0)*.05;o.y+=o.vy*.05;}
if(e=="bounce"){
if(o.x<0){o.x=-o.x;o.vx=Math.abs(o.vx||0);}if(o.x>X){o.x=2*X-o.x;o.vx=-Math.abs(o.vx||0);}
if(o.y<0){o.y=-o.y;o.vy=Math.abs(o.vy||0);}if(o.y>Y){o.y=2*Y-o.y;o.vy=-Math.abs(o.vy||0);}
}else if(e=="wrap"){
if(o.x<0)o.x+=X;if(o.x>X)o.x-=X;if(o.y<0)o.y+=Y;if(o.y>Y)o.y-=Y;
}else{
if(o.x<0||o.x>X){o.x=clx(o,o.x);if(e=="stop")o.vx=0;}
if(o.y<0||o.y>Y){o.y=cly(o,o.y);if(e=="stop")o.vy=0;}
}
if(o.x!=x0||o.y!=y0)put(o);});}
function camStep(snap){
if(WW<=100&&WH<=100)return;
var t=null;for(var i=0;i<objs.length;i++)if(objs[i].cam&&!objs[i].hide&&!objs[i].dead){t=objs[i];break;}
if(!t)return;
var tx=Math.max(0,Math.min(WW-100,t.x-50)),ty=Math.max(0,Math.min(WH-100,t.y-50)),f=snap?1:.25;
cam.x+=(tx-cam.x)*f;cam.y+=(ty-cam.y)*f;applyCam();}
function texts(){objs.forEach(function(o){var d=els[o.id];if(o.tx!=null&&d&&o.tx.indexOf("{")>-1){var s=txt(o.tx);if(d._t!==s){d._t=s;d.textContent=s;}}});}
function mk(o){
var d=document.createElement("div");
d.style.cssText="position:absolute;line-height:1;user-select:none;-webkit-user-select:none;touch-action:none;transition:none";
if(o.k=="joy"){
d.style.borderRadius="50%";d.style.background="rgba(255,255,255,.14)";d.style.border="2px solid rgba(255,255,255,.45)";d.style.boxSizing="border-box";
var kn=document.createElement("div");
kn.style.cssText="position:absolute;left:50%;top:50%;border-radius:50%;background:rgba(255,255,255,.82);box-shadow:0 2px 8px rgba(0,0,0,.35);pointer-events:none";
d.appendChild(kn);o._kn=kn;o.jx=o.jx||0;o.jy=o.jy||0;o.ja=o.ja||0;}
else if(o.k=="box"){d.style.background=o.c||"#8b5cf6";d.style.borderRadius=o.shape=="ellipse"?"50%":o.shape=="round"?"22%":"0";}
else if(isSp(o)){d.style.backgroundImage="url("+spr[o.sp]+")";d.style.backgroundSize="contain";d.style.backgroundRepeat="no-repeat";d.style.backgroundPosition="center";}
else if(o.tx!=null){d.textContent=edit?o.tx:txt(o.tx);d.style.color=o.c||"#ffffff";d.style.whiteSpace="nowrap";d.style.fontWeight="800";d.style.fontFamily="-apple-system,sans-serif";d.style.textShadow="0 2px 6px rgba(0,0,0,.5)";}
else d.textContent=o.e||"⭐";
els[o.id]=d;d._o=o;put(o);(o.fixed?box:wd).appendChild(d);void d.offsetWidth;d.style.transition=TR;
d.onpointerdown=function(ev){
if(!(edit||o.drag))return;
if(edit&&d.isContentEditable)return;
var sx=ev.clientX,sy=ev.clientY,mv=false;
if(edit){if(cb.onselect)cb.onselect(o.id);}
ev.preventDefault();try{d.setPointerCapture(ev.pointerId);}catch(x){}
d.style.transition="none";
d.onpointermove=function(e){if(!mv){if(Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy)<=6)return;mv=true;}var s=scr(e);o.x=clx(o,s.x+(o.fixed?0:cam.x));o.y=cly(o,s.y+(o.fixed?0:cam.y));put(o);};
d.onpointerup=d.onpointercancel=function(){d.onpointermove=null;d.style.transition=TR;if(edit&&cb.onmove)cb.onmove(o.id,o.x,o.y);if(edit&&o.tx!=null&&!mv)startEdit(o,d);};
};}
objs.forEach(function(o){o.src=o.id;o.held=0;mk(o);});
applyCam();
if(edit){select(cb.sel);}
else{
function objAt(e){var el=e.target;while(el&&el!==box){if(el._o)return el._o;el=el.parentNode;}return null;}
box.onpointerdown=function(e){
setLast(e);var o=objAt(e);
ptr[e.pointerId]={sx:e.clientX,sy:e.clientY,obj:o};
if(o&&!o.dead){o.held=1;if(o.k=="joy"){o._pid=e.pointerId;joy(o,e);}
fire(function(w){return w.t=="tap"&&w.o==o.src;},o);}
if(!(o&&o.k=="joy"))fire(function(w){return w.t=="tapany";});
};
window.addEventListener("pointermove",onMv);
window.addEventListener("pointerup",onUp);
window.addEventListener("pointercancel",onUp);
timers.push(setInterval(function(){
if(done)return;tk+=0.05;
rules.forEach(function(r,i){if(done)return;var w=r.when||{},s=st[i];
if(w.t=="always")run(r);
else if(w.t=="every"){var iv=Math.max(0.1,ev(w.sec)||1);if(s.n==null)s.n=iv;if(tk>=s.n){s.n+=iv;run(r);}}
else if(w.t=="after"){if(!s.f&&tk>=ev(w.sec)){s.f=1;run(r);}}
else if(w.t=="touch"){var A=inst(w.o),B=inst(w.o2);
for(var x=0;x<A.length;x++)for(var y=0;y<B.length;y++){var a=A[x],b=B[y];if(a.dead||b.dead||a===b)continue;
var key=a.id+"|"+b.id,h=hit(a,b);if(h&&!s[key])run(r,a,b);s[key]=h;}}
else if(w.t=="edge"){inst(w.o).forEach(function(o){if(o.dead)return;var key="e"+o.id,e=!o.hide&&(o.x<=1||o.x>=bx(o)-1||o.y<=1||o.y>=by(o)-1);if(e&&!s[key])run(r,o);s[key]=e;});}
else if(w.t=="cond"){var c=condOK(w);if(c&&!s.c)run(r);s.c=c;}
else if(w.t=="hold"){inst(w.o).forEach(function(o){if(o.held&&!o.dead&&!o.hide)run(r,o);});}
else if(w.t=="holdany"){if(Object.keys(ptr).length)run(r);}
});
if(!done){phys();texts();camStep();}
},50));
camStep(true);
fire(function(w){return w.t=="start";});
}
return ctrl;}};
