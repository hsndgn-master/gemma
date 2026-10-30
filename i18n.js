(function(){
var API="https://gemma-api.hasanalid120.workers.dev",CK="gemma_cc",root=document.documentElement;
var dl=((navigator.languages&&navigator.languages[0])||navigator.language||"en").toLowerCase();
var devTR=dl.indexOf("tr")===0,cc=null;
try{var o=JSON.parse(localStorage.getItem(CK));if(o&&Date.now()-o.t<6048e5)cc=o.c;}catch(e){}
/* Türkçe: cihaz dili Türkçe VE Türkiye'den bağlanıyorsa. Aksi halde İngilizce. */
var GL=(devTR&&!(cc&&cc!=="TR"))?"tr":"en";
window.GL=GL;root.lang=GL;
if(devTR&&cc===null){
try{fetch(API+"/geo").then(function(r){return r.json();}).then(function(j){
var c=(j&&j.c)||"";
try{localStorage.setItem(CK,JSON.stringify({c:c,t:Date.now()}));if(localStorage.getItem(CK)&&c&&c!=="TR"&&window.GL==="tr")location.reload();}catch(e){}
}).catch(function(){});}catch(e){}
}
if(GL==="tr"){window.t=function(s){return s;};return;}

var D={
/* ana sayfa */
"Oyun oluştur":"Create a game","Oyun fikrin (prompt)":"Your game idea (prompt)","Örn: Neon renkli bir uzayda küpleri toplayan 3D bir top oyunu":"E.g. A 3D ball game collecting cubes in a neon-colored space",
"Başlık":"Title","Oyunun adı":"Game name","Açıklama":"Description","Oyun hakkında kısa bir cümle":"A short sentence about the game","Hashtag'ler (en fazla 5)":"Hashtags (up to 5)","refleks 3d uzay":"reflex 3d space","Oyunu oluştur":"Create game",
"Ev":"Home","Oluştur":"Create","Profil":"Profile","Aydınlık moda geç":"Switch to light mode","Karanlık moda geç":"Switch to dark mode","Takip et":"Follow","Takiptesin":"Following",
/* admin */
"Doğrulanmış admin":"Verified admin","Admin paneli":"Admin panel","Yenile":"Refresh","Kurucu":"Owner","Yardımcı admin":"Helper admin","Yükleniyor...":"Loading...","Hata":"Error",
"Kayıtlı kullanıcı":"Registered users","Aktif kullanıcı (7 gün)":"Active users (7 days)","Yeni kullanıcı (7 gün)":"New users (7 days)","Yeni kullanıcı (30 gün)":"New users (30 days)","Yayımlanan oyun":"Published games","Yeni oyun (7 gün)":"New games (7 days)","Yeni oyun (30 gün)":"New games (30 days)","Oyun yapan kullanıcı":"Users who made games","Toplam beğeni":"Total likes","Toplam takip":"Total follows","Oyun / kullanıcı":"Games / user","Beğeni / oyun":"Likes / game","Banlı kullanıcı":"Banned users","Yardımcı adminler":"Helper admins","Depolama (R2)":"Storage (R2)",
"Yeni kullanıcılar (son 14 gün)":"New users (last 14 days)","Yeni oyunlar (son 14 gün)":"New games (last 14 days)","Depolama dağılımı":"Storage breakdown","Oyunlar":"Games","Taslaklar":"Drafts","Profil fotoğrafları":"Profile photos","Kapak resimleri":"Cover images","Diğer":"Other",
"En çok beğenilen oyunlar":"Most liked games","En çok oyun yapanlar":"Top creators","Popüler hashtag'ler":"Popular hashtags","Henüz veri yok.":"No data yet.",
"Kullanıcı banla":"Ban a user","Kullanıcı adı":"Username","Banla":"Ban","Banı kaldır":"Unban","Banlı kullanıcılar":"Banned users","Yardımcı admin ata":"Appoint helper admin","Yardımcı admin yap":"Make helper admin","Yetkiyi al":"Remove role",
"Banlandı:":"Banned:","Banı kaldırıldı:":"Unbanned:","Yardımcı admin yapıldı:":"Made helper admin:","Yetki alındı:":"Role removed:","Bu kullanıcı banlansın mı?":"Ban this user?","Kullanıcı adını yaz.":"Enter a username.","Bu hesap banlandı.":"This account has been banned.",
"Admin servisi yapılandırılmamış.":"Admin service is not configured.","Yetkin yok.":"You don't have permission.","Kullanıcı bulunamadı.":"User not found.","Geçersiz kullanıcı adı.":"Invalid username.","Kendini banlayamazsın.":"You can't ban yourself.","Kurucu hesap banlanamaz.":"The owner account can't be banned.","Yardımcı adminleri sadece kurucu banlayabilir.":"Only the owner can ban helper admins.","Bu işlem sadece kurucu içindir.":"Only the owner can do this.","Kurucu hesap değiştirilemez.":"The owner account can't be changed.","Banlı kullanıcı yardımcı admin olamaz.":"A banned user can't be a helper admin.","Banlanamadı.":"Could not ban.","Güncellenemedi.":"Could not update.",
"Haydi sen de oluştur!":"Now it's your turn to create!","Kendi oyununu yap, yayınla, herkes oynasın.":"Make your own game, publish it and let everyone play.","Oluşturmaya başla!":"Start creating!","Başa dönmek için tekrar aşağı kaydır":"Scroll down again to go back to the start",
"Giriş yap":"Log in","Hesap oluştur":"Create account","Beğenmek, takip etmek ve oyun paylaşmak için":"To like, follow and share games","Kullanıcı adı (harf, rakam, _)":"Username (letters, numbers, _)","E-posta":"Email","Şifre (en az 6 karakter)":"Password (at least 6 characters)","Kayıt ol":"Sign up","Zaten hesabım var":"I already have an account","Hesabım yok, kayıt ol":"I don't have an account, sign up",
"E-posta ve şifreyi yaz.":"Enter your email and password.","Kullanıcı adı 3-20 karakter olmalı, sadece harf, rakam ve _ kullan.":"Username must be 3-20 characters; use only letters, numbers and _.","Kayıt oldu. Şimdi giriş yap.":"Signed up. Now log in.","Bağlantı hatası, tekrar dene.":"Connection error, try again.",
"E-posta veya şifre yanlış.":"Wrong email or password.","Bu e-posta zaten kayıtlı.":"This email is already registered.","Bu kullanıcı adı alınmış olabilir, başka bir tane dene.":"This username may be taken, try another.","Şifre en az 6 karakter olmalı.":"Password must be at least 6 characters.","Çok fazla deneme yapıldı, biraz bekleyip tekrar dene.":"Too many attempts, wait a bit and try again.","E-postanı doğrulaman gerekiyor.":"You need to verify your email.","E-posta adresi geçersiz.":"Invalid email address.",
"Hakkında":"About","Kendinden kısaca bahset":"Tell us a little about yourself","Kaydet":"Save","Kaydedildi.":"Saved.","Kaydedilemedi.":"Could not save.","(UPDATE izni eksik olabilir)":"(UPDATE permission may be missing)","Bağlantı hatası.":"Connection error.","Çıkış yap":"Log out","Sil":"Delete","Bu oyun silinsin mi?":"Delete this game?","Silinemedi.":"Could not delete.",
"Oyun fikrini biraz daha ayrıntılı yaz (en az 10 karakter).":"Describe your game idea in a bit more detail (at least 10 characters).","Oyuna bir başlık yaz.":"Give your game a title.","Bilgilerin hazır. Yapay zeka bağlantısını bir sonraki adımda kuracağız.":"Your info is ready. We'll connect the AI in the next step.",
/* sunucu */
"Giriş gerekli.":"Login required.","Oyun çok büyük.":"Game is too large.","Geçersiz istek.":"Invalid request.","Başlık 1-40 karakter olmalı.":"Title must be 1-40 characters.","Açıklama en fazla 120 karakter.":"Description can be at most 120 characters.","Proje verisi geçersiz.":"Invalid project data.","Oyun çok büyük (çizimleri küçült).":"Game is too large (make your drawings smaller).","Profil bulunamadı.":"Profile not found.","Geçersiz id.":"Invalid id.","Oyun bulunamadı.":"Game not found.","Bulunamadı.":"Not found.","Proje çok büyük.":"Project is too large.","En fazla 50 taslak saklanabilir.":"You can store at most 50 drafts.","Sunucu hatası.":"Server error.","Profil fotoğrafı yükleme kapatıldı.":"Profile photo upload is disabled.",
/* editör */
"Gemma Editör":"Gemma Editor","Projelerim":"My projects","+ Yeni proje":"+ New project","Yeni proje":"New project","Henüz proje yok. \"+ Yeni proje\" ile başla.":"No projects yet. Start with \"+ New project\".","Bu proje silinsin mi?":"Delete this project?","Kayıt için yer kalmadı. Bazı projeleri silmen gerekebilir.":"No storage space left. You may need to delete some projects.",
"İptal":"Cancel","Çizim":"Drawing","Kalınlık":"Thickness","Dolu şekil":"Filled shape","↶ Geri al":"↶ Undo","Temizle":"Clear",
"✏️ Kalem":"✏️ Pen","🧽 Silgi":"🧽 Eraser","🪣 Boya":"🪣 Fill","╱ Çizgi":"╱ Line","◯ Daire":"◯ Circle","▢ Kare":"▢ Square","▢ Yuvarlak kare":"▢ Rounded square",
"Oyunu yayınla":"Publish game","Yayınla":"Publish","▶ Oyna":"▶ Play","✎ Düzenle":"✎ Edit",
"Nesneler":"Objects","Kurallar":"Rules","Değişkenler":"Variables",
"Oyun başlayınca":"When the game starts","Ekrana dokunulunca":"When the screen is tapped","Nesneye dokunulunca":"When an object is tapped","Nesne başka nesneye değince":"When an object touches another","Nesne kenara değince":"When an object hits the edge","Sürekli (her an)":"Continuously","Her … saniyede":"Every … seconds","… saniye sonra (bir kez)":"After … seconds (once)","Şart doğru olunca":"When a condition becomes true","Olay gelince":"When an event arrives",
"Her zaman":"Always","Şart var":"With a condition",
"büyükse":"greater than","küçükse":"less than","eşitse":"equals","eşit değilse":"not equal","büyük/eşitse":"greater or equal","küçük/eşitse":"less or equal",
"Taşı":"Move","İleri git (dönüş yönünde)":"Move forward (facing direction)","Şu konuma git":"Go to position","Dokunulan yere git":"Go to tapped spot","Rastgele yere git":"Go to random spot","Nesnenin yerine git":"Go to object's position","Nesneye doğru ilerle":"Move toward object","Nesnenin özelliğini ayarla":"Set object property","Hızı ayarla":"Set velocity","Döndür":"Rotate","Büyüt / küçült (%)":"Grow / shrink (%)","Gizle":"Hide","Göster":"Show","Skor ekle":"Add score","Can ekle (eksi = azalt)":"Add life (negative = reduce)","Değişkene ata (=)":"Set variable (=)","Değişkene ekle (+=)":"Add to variable (+=)","Arka plan rengi":"Background color","Arka plan renk tonu (0-360)":"Background hue (0-360)","Olay gönder":"Send event","Ses çal":"Play sound","Oyunu baştan başlat":"Restart game","Oyunu kazan":"Win the game","Oyunu kaybet":"Lose the game",
"Sol-sağ (x)":"Left-right (x)","Yukarı-aşağı (y)":"Up-down (y)","Boyut":"Size","Dönüş":"Rotation","Sınırda kalsın":"Stay at the edge","Dur":"Stop","Sek":"Bounce","Öbür taraftan çıksın":"Wrap around",
"İsim":"Name","Arka plan":"Background","✏️ Yeni karakter çiz":"✏️ Draw new character","🔤 Yazı ekle":"🔤 Add text","Hazır emoji (hızlı ekle):":"Ready-made emoji (quick add):","Sahnedeki nesneler (sahnede sürükleyerek de taşıyabilirsin):":"Objects on stage (you can also drag them on the stage):",
"Sol-sağ (0-100)":"Left-right (0-100)","Yukarı-aşağı (0-100)":"Up-down (0-100)","Dönüş (derece)":"Rotation (degrees)","Sürüklensin":"Draggable","Başta gizli":"Hidden at start","Yatay hız":"Horizontal speed","Dikey hız":"Vertical speed","Yerçekimi":"Gravity","Kenara değince":"On hitting edge","Yazı":"Text","Yazı rengi":"Text color","✏️ Çizimi düzenle":"✏️ Edit drawing","Nesneyi sil":"Delete object",
"+ Kural ekle":"+ Add rule","+ Eylem ekle":"+ Add action","Kuralı sil":"Delete rule","Eylemi sil":"Delete action","Ne zaman":"When","Hangisi":"Which","Bu nesne":"This object","Buna değince":"Touches this","Saniye":"Seconds","Olay adı":"Event name","Şart":"Condition","Sol taraf":"Left side","Karşılaştır":"Compare","Sağ taraf":"Right side","Ne olsun:":"What happens:",
"Eylem":"Action","Sağa(+) Sola(−)":"Right(+) Left(−)","Aşağı(+) Yukarı(−)":"Down(+) Up(−)","Yukarı-aşağı":"Up-down","Özellik":"Property","Yeni değer":"New value","Hedef":"Target","Adım":"Step","Derece":"Degrees","Yüzde":"Percent","Sayı":"Number","Değişken":"Variable","Değer":"Value","Renk":"Color","Ton (0-360)":"Hue (0-360)","Kaç sn sonra":"After how many sec","Tiz-pes (Hz)":"Pitch (Hz)",
"Ad":"Name","Başlangıç":"Start value","+ Değişken ekle":"+ Add variable","Değişken, oyunda sakladığın bir sayıdır (puan, hız, seviye…). Kurallarda adını yazarak kullanırsın.":"A variable is a number you store in the game (points, speed, level…). Use it in rules by typing its name.","Önce \"Değişkenler\" sekmesinden değişken ekle":"First add a variable in the \"Variables\" tab","sayı veya hesap":"number or formula",
"Bağlantı kurulamadı, sayfayı yenile.":"Could not connect, refresh the page.","Yayınlamak için önce giriş yapmalısın. Ana sayfadan giriş yap.":"You need to log in to publish. Log in from the home page.","Yayınlanıyor...":"Publishing...","Oturum bitti. Ana sayfadan tekrar giriş yap.":"Session expired. Log in again from the home page.","Yayınlanamadı.":"Could not publish.","Yayınlandı! 🎉":"Published! 🎉","Ana sayfaya dön":"Back to home","Önce bir şey çiz.":"Draw something first.",
"☁ Kaydediliyor…":"☁ Saving…","Sadece bu cihazda":"Only on this device","☁ Kaydedildi":"☁ Saved","☁ Kaydedilemedi":"☁ Could not save","☁ Bağlantı yok":"☁ No connection",
/* v6: motor güncellemesi */
"Nesneye basılı tutulurken":"While an object is held down","Ekrana basılı tutulurken":"While the screen is held down","Nesne bırakılınca":"When an object is released","Ekran bırakılınca":"When the screen is released","Kaydırma yapılınca":"When the screen is swiped","Klon oluşunca":"When a clone is created",
"Klonla (kopya oluştur)":"Clone (make a copy)","Sil (klon) / gizle":"Delete (clone) / hide","Eğer … ise":"If … then","Tekrarla (döngü)":"Repeat (loop)","Şart doğruyken tekrarla":"Repeat while condition is true","Bekle, sonra yap":"Wait, then do",
"Yön":"Direction","Sola":"Left","Sağa":"Right","Yukarı":"Up","Aşağı":"Down",
"Nerede doğsun":"Spawn at","— (kendi konumu)":"— (its own position)","Kaç kez":"How many times","Tekrarlanacak eylemler:":"Actions to repeat:","Doğruysa:":"If true:","Değilse:":"Otherwise:","Sonra yapılacaklar:":"Then do:","Bağlaç":"Join","ve":"and","veya":"or","+ Şart ekle (ve/veya)":"+ Add condition (and/or)","Şartı sil":"Delete condition",
"Saydamlık (%)":"Opacity (%)","Genişlik":"Width","Yükseklik":"Height","Şekil":"Shape","Dikdörtgen":"Rectangle","Yuvarlak köşeli":"Rounded","Elips":"Ellipse",
"Ekrana sabit":"Fixed to screen","Katı (üstüne basılır)":"Solid (can be stood on)","Fizik gövdesi (katılara çarpar)":"Physics body (collides with solids)","Kamera bunu takip etsin":"Camera follows this",
"🕹️ Joystick ekle":"🕹️ Add joystick","▬ Kutu / Platform ekle":"▬ Add box / platform",
"Dünya genişliği (%)":"World width (%)","Dünya yüksekliği (%)":"World height (%)","Sahneyi kaydır →":"Scroll stage →","Sahneyi kaydır ↓":"Scroll stage ↓",
/* varsayılan adlar (kodda window.t ile kullanılır) */
"nesne":"object","degisken":"variable","olay1":"event1"
};
var PAT=[
[/^(\d+) beğeni · (\d+) takip$/,"$1 likes · $2 following"],
[/^(\d+) oyun$/,"$1 games"],
[/^Kural (\d+)$/,"Rule $1"],
[/^Hata: (.*)$/,function(m){return "Error: "+m[1];}],
[/^Bağlantı hatası: (.*)$/,function(m){return "Connection error: "+m[1];}],
[/^Kaydedilemedi\. (.*)$/,function(m){return "Could not save. "+tr(m[1]);}],
[/^☁ (.+)$/,function(m){return "☁ "+tr(m[1]);}]
];
function tr(s){
if(typeof s!=="string"||!s)return s;
if(Object.prototype.hasOwnProperty.call(D,s))return D[s];
for(var i=0;i<PAT.length;i++){var m=PAT[i][0].exec(s);if(m)return typeof PAT[i][1]==="function"?PAT[i][1](m):s.replace(PAT[i][0],PAT[i][1]);}
return s;
}
window.t=tr;

/* kullanıcı içeriği ve oyun sahnesi çevrilmez */
var NT=".title,.desc,.tags,.name,.gt,.pbio,#pn,#pl .card span,#stage,[data-nt]";
var ATT=["placeholder","aria-label","title"];
function skip(n){var e=n.nodeType===1?n:n.parentNode;if(!e||e.nodeType!==1)return true;var g=e.tagName;if(g==="SCRIPT"||g==="STYLE"||g==="TEXTAREA")return true;return !!(e.closest&&e.closest(NT));}
function tx(n){if(skip(n))return;var v=n.nodeValue,tv=v.trim();if(!tv)return;var r=tr(tv);if(r!==tv)n.nodeValue=v.replace(tv,function(){return r;});}
function at(el){if(skip(el))return;for(var i=0;i<ATT.length;i++){var v=el.getAttribute&&el.getAttribute(ATT[i]);if(v){var r=tr(v);if(r!==v)el.setAttribute(ATT[i],r);}}}
function walk(n){
if(n.nodeType===3){tx(n);return;}
if(n.nodeType!==1)return;
at(n);
var els=n.querySelectorAll("[placeholder],[aria-label],[title]");for(var i=0;i<els.length;i++)at(els[i]);
var w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT,null),x,list=[];while((x=w.nextNode()))list.push(x);
list.forEach(tx);
}
var mo=new MutationObserver(function(rs){
rs.forEach(function(r){
if(r.type==="childList")r.addedNodes.forEach(walk);
else if(r.type==="characterData")tx(r.target);
else if(r.type==="attributes")at(r.target);
});
});
mo.observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATT});
document.addEventListener("DOMContentLoaded",function(){walk(root);});

/* alert / confirm */
var oa=window.alert,oc=window.confirm;
window.alert=function(m){return oa.call(window,tr(String(m)));};
window.confirm=function(m){return oc.call(window,tr(String(m)));};
})();
