window.GemmaEngine={run:function(box,p,cb){
cb=cb||{};box.innerHTML="";box.style.background=p.bg||"#1e3a8a";
var objs=JSON.parse(JSON.stringify(p.objects||[])),els={},tm=[],sc=0,done=false;
var TR="left .25s,top .25s,transform .25s,font-size .25s";
var ctrl={stop:function(){done=true;tm.forEach(clearInterval);box.innerHTML="";}};
var hud=document.createElement("div");
hud.style.cssText="position:absolute;top:12px;left:0;right:0;text-align:center;font:800 34px -apple-system,sans-serif;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.5);pointer-events:none;z-index:5";
hud.textContent=0;
if(!cb.edit)box.appendChild(hud);
function cl(v){return Math.max(0,Math.min(100,v));}
function find(id){for(var i=0;i<objs.length;i++)if(objs[i].id==id)return objs[i];}
function put(o){var d=els[o.id];d.style.left=o.x+"%";d.style.top=o.y+"%";d.style.fontSize=(o.s/100*box.clientWidth)+"px";d.style.transform="translate(-50%,-50%) rotate("+o.r+"deg)";d.style.display=o.hide?"none":"block";}
function end(w){done=true;tm.forEach(clearInterval);var v=document.createElement("div");
v.style.cssText="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font:800 38px -apple-system,sans-serif;z-index:9;text-align:center";
v.innerHTML=(w?"🎉 Kazandın!":"💥 Kaybettin")+'<div style="font:600 18px -apple-system,sans-serif;margin-top:10px">Skor: '+sc+' · Tekrar için dokun</div>';
v.onclick=function(){ctrl.stop();var n=GemmaEngine.run(box,p,cb);ctrl.stop=n.stop;};
box.appendChild(v);}
function act(a){var o=find(a.o);
if(a.t=="score"){sc+=+a.v||0;hud.textContent=sc;}
else if(a.t=="win"||a.t=="lose"){end(a.t=="win");}
else if(o){
if(a.t=="move"){o.x=cl(o.x+(+a.v||0));o.y=cl(o.y+(+a.v2||0));}
else if(a.t=="rotate"){o.r+=+a.v||0;}
else if(a.t=="grow"){o.s=Math.max(2,o.s*(1+(+a.v||0)/100));}
else if(a.t=="jump"){o.x=10+Math.random()*80;o.y=15+Math.random()*70;}
else if(a.t=="hide"){o.hide=true;}
put(o);}}
function fire(f){(p.rules||[]).forEach(function(r){if(!done&&f(r.when))act(r.do);});}
objs.forEach(function(o){
var d=document.createElement("div");d.textContent=o.e;
d.style.cssText="position:absolute;line-height:1;user-select:none;-webkit-user-select:none;touch-action:none;transition:"+TR;
if(cb.edit&&cb.sel==o.id)d.style.outline="2px dashed #fff";
box.appendChild(d);els[o.id]=d;put(o);
d.onpointerdown=function(ev){
if(cb.edit&&cb.onselect)cb.onselect(o.id);
if(!cb.edit)fire(function(w){return w.t=="tap"&&w.o==o.id;});
if(cb.edit||o.drag){
ev.preventDefault();d.setPointerCapture(ev.pointerId);d.style.transition="none";
d.onpointermove=function(e){var r=box.getBoundingClientRect();o.x=cl((e.clientX-r.left)/r.width*100);o.y=cl((e.clientY-r.top)/r.height*100);put(o);};
d.onpointerup=function(){d.onpointermove=null;d.style.transition=TR;if(cb.edit&&cb.onmove)cb.onmove(o.id,o.x,o.y);};
}};});
if(!cb.edit){
(p.rules||[]).forEach(function(r){if(r.when.t=="every")tm.push(setInterval(function(){if(!done)act(r.do);},Math.max(0.2,+r.when.sec||1)*1000));});
fire(function(w){return w.t=="start";});
}
return ctrl;}};
