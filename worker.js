const SB = "https://ohheayjmexguxfgprzlo.supabase.co";
const KEY = "sb_publishable_HNpAnQXpp-I-IJCq8bRhkw__fM72Oa7";
const FILE_OK = /^(games\/[a-z0-9-]+\.json|thumbs\/[a-z0-9-]+\.jpg|avatars\/[a-z0-9-]+\.jpg)$/;
const DID = /^[a-z0-9]{1,20}$/;
const GID = /^[a-z0-9-]{1,64}$/;

function corsHeaders(req) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function J(req, obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ "Content-Type": "application/json" }, corsHeaders(req)),
  });
}

async function auth(req) {
  const h = req.headers.get("Authorization") || "";
  if (h.indexOf("Bearer ") !== 0) return null;
  const token = h.slice(7);
  const r = await fetch(SB + "/auth/v1/user", {
    headers: { apikey: KEY, Authorization: "Bearer " + token },
  });
  if (!r.ok) return null;
  const u = await r.json();
  return u && u.id ? { id: u.id, token: token } : null;
}

function sbh(token) {
  return { apikey: KEY, Authorization: "Bearer " + token, "Content-Type": "application/json" };
}

function cleanTags(v) {
  return String(v || "")
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(function (t) { return "#" + t.replace(/^#+/, "").replace(/[^\p{L}\p{N}_]/gu, ""); })
    .filter(function (t) { return t.length > 1 && t.length <= 25; })
    .slice(0, 5)
    .join(" ");
}

const BEH_TYPES = ["joy", "shoot", "spawn", "hit", "tap", "follow", "move", "gravity", "jump", "spin", "goal", "cam"];

function cleanBeh(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  list.slice(0, 100).forEach(function (b) {
    if (!b || typeof b !== "object" || BEH_TYPES.indexOf(b.t) < 0) return;
    const c = {};
    Object.keys(b).slice(0, 20).forEach(function (k) {
      if (!/^[a-zA-Z0-9_]{1,12}$/.test(k)) return;
      const v = b[k];
      if (typeof v === "number") { if (isFinite(v)) c[k] = v; }
      else if (typeof v === "boolean") c[k] = v;
      else if (typeof v === "string") c[k] = v.slice(0, 60);
    });
    c.t = b.t;
    out.push(c);
  });
  return out;
}

function cleanWorld(w) {
  if (!w || typeof w !== "object") return undefined;
  const f = function (n) { n = Number(n); return isFinite(n) ? Math.max(100, Math.min(1000, n)) : 100; };
  return { w: f(w.w), h: f(w.h) };
}

function cleanProject(p, allowEmpty) {
  if (!p || typeof p !== "object") return null;
  if (!Array.isArray(p.objects) || !Array.isArray(p.rules)) return null;
  if (p.objects.length < (allowEmpty ? 0 : 1) || p.objects.length > 100 || p.rules.length > 100) return null;
  const sprites = {};
  const src = p.sprites && typeof p.sprites === "object" ? p.sprites : {};
  Object.keys(src).forEach(function (k) {
    const v = src[k];
    if (/^s\d+$/.test(k) && typeof v === "string" && /^data:image\/png;base64,[A-Za-z0-9+\/=]+$/.test(v)) sprites[k] = v;
  });
  return {
    name: String(p.name || "").slice(0, 30),
    bg: /^#[0-9a-fA-F]{6}$/.test(p.bg) ? p.bg : "#1e3a8a",
    sprites: sprites,
    objects: p.objects,
    rules: p.rules,
    beh: cleanBeh(p.beh),
    world: cleanWorld(p.world),
    vars: (Array.isArray(p.vars) ? p.vars : []).slice(0, 30).map(function (v) { return { n: String((v && v.n) || "").slice(0, 20), v: Number(v && v.v) || 0 }; }).filter(function (v) { return v.n; }),
  };
}

function b64bytes(b64) {
  const bin = atob(b64);
  const a = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return a;
}

async function publish(req, env) {
  const u = await auth(req);
  if (!u) return J(req, { error: "Giriş gerekli." }, 401);

  const raw = await req.text();
  if (raw.length > 2000000) return J(req, { error: "Oyun çok büyük." }, 413);
  let b;
  try { b = JSON.parse(raw); } catch (e) { return J(req, { error: "Geçersiz istek." }, 400); }

  const title = String(b.title || "").trim();
  const descr = String(b.descr || "").trim();
  if (title.length < 1 || title.length > 40) return J(req, { error: "Başlık 1-40 karakter olmalı." }, 400);
  if (descr.length > 120) return J(req, { error: "Açıklama en fazla 120 karakter." }, 400);
  const tags = cleanTags(b.tags);

  const project = cleanProject(b.project);
  if (!project) return J(req, { error: "Proje verisi geçersiz." }, 400);
  const body = JSON.stringify(project);
  if (body.length > 1400000) return J(req, { error: "Oyun çok büyük (çizimleri küçült)." }, 413);

  let pr = await fetch(SB + "/rest/v1/profiles?select=username,banned&id=eq." + encodeURIComponent(u.id), {
    headers: sbh(u.token),
  });
  if (!pr.ok) pr = await fetch(SB + "/rest/v1/profiles?select=username&id=eq." + encodeURIComponent(u.id), { headers: sbh(u.token) });
  const prof = pr.ok ? await pr.json() : [];
  if (!prof.length) return J(req, { error: "Profil bulunamadı." }, 400);
  if (prof[0].banned) return J(req, { error: "Bu hesap banlandı." }, 403);
  const username = prof[0].username;

  const id = crypto.randomUUID();
  const fileKey = "games/" + id + ".json";
  const thumbKey = null;

  await env.BUCKET.put(fileKey, body, { httpMetadata: { contentType: "application/json" } });

  const ins = await fetch(SB + "/rest/v1/games", {
    method: "POST",
    headers: Object.assign({ Prefer: "return=minimal" }, sbh(u.token)),
    body: JSON.stringify({
      id: id,
      creator: username,
      title: title,
      descr: descr,
      tags: tags,
      file_key: fileKey,
      thumb_key: thumbKey,
    }),
  });
  if (!ins.ok) {
    await env.BUCKET.delete(fileKey);
    return J(req, { error: "Kaydedilemedi." }, 500);
  }
  return J(req, { id: id });
}

async function remove(req, env, id) {
  const u = await auth(req);
  if (!u) return J(req, { error: "Giriş gerekli." }, 401);
  if (!/^[a-z0-9-]+$/.test(id)) return J(req, { error: "Geçersiz id." }, 400);

  const q = "?select=file_key,thumb_key&id=eq." + id + "&creator_id=eq." + encodeURIComponent(u.id);
  const r = await fetch(SB + "/rest/v1/games" + q, { headers: sbh(u.token) });
  const rows = r.ok ? await r.json() : [];
  if (!rows.length) return J(req, { error: "Oyun bulunamadı." }, 404);

  const d = await fetch(SB + "/rest/v1/games?id=eq." + id, { method: "DELETE", headers: sbh(u.token) });
  if (!d.ok) return J(req, { error: "Silinemedi." }, 500);

  await env.BUCKET.delete(rows[0].file_key);
  if (rows[0].thumb_key) await env.BUCKET.delete(rows[0].thumb_key);
  return J(req, { ok: true });
}

async function file(req, env, key) {
  if (!FILE_OK.test(key)) return new Response("Not found", { status: 404 });
  const gm = /^games\/([a-z0-9-]+)\.json$/.exec(key);
  if (gm && env.SB_SERVICE_KEY) {
    /* Engellenmiş (blocked) oyunun dosyası admin olmayanlara kapalı */
    let bl;
    try {
      const r = await fetch(SB + "/rest/v1/games?select=blocked&id=eq." + gm[1], { headers: sbs(env) });
      bl = r.ok ? await r.json() : null;
    } catch (e) { bl = null; }
    if (bl && bl.length && bl[0].blocked) return new Response("Not found", { status: 404 });
  }
  const obj = await env.BUCKET.get(key);
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, {
    headers: {
      "Content-Type": (obj.httpMetadata && obj.httpMetadata.contentType) || "application/octet-stream",
      "Cache-Control": gm ? "public, max-age=600" : "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function cleanDraft(p) {
  const c = cleanProject(p, true);
  if (!c) return null;
  const id = String(p.id || "");
  if (!DID.test(id)) return null;
  c.id = id;
  c.nid = Math.max(1, Math.min(100000, Math.floor(Number(p.nid) || 1)));
  c.nsp = Math.max(1, Math.min(100000, Math.floor(Number(p.nsp) || 1)));
  c.ut = Math.floor(Number(p.ut) || Date.now());
  return c;
}

async function draftsList(req, env) {
  const u = await auth(req);
  if (!u) return J(req, { error: "Giriş gerekli." }, 401);
  const prefix = "drafts/" + u.id + "/";
  const l = await env.BUCKET.list({ prefix: prefix, limit: 100, include: ["customMetadata"] });
  const items = l.objects.map(function (o) {
    return { id: o.key.slice(prefix.length, -5), ut: Number((o.customMetadata && o.customMetadata.ut) || 0) };
  });
  return J(req, { items: items });
}

async function draftGet(req, env, id) {
  const u = await auth(req);
  if (!u) return J(req, { error: "Giriş gerekli." }, 401);
  const obj = await env.BUCKET.get("drafts/" + u.id + "/" + id + ".json");
  if (!obj) return J(req, { error: "Bulunamadı." }, 404);
  return new Response(obj.body, {
    headers: Object.assign({ "Content-Type": "application/json", "Cache-Control": "no-store" }, corsHeaders(req)),
  });
}

async function draftPut(req, env, id) {
  const u = await auth(req);
  if (!u) return J(req, { error: "Giriş gerekli." }, 401);
  const raw = await req.text();
  if (raw.length > 1500000) return J(req, { error: "Proje çok büyük." }, 413);
  let p;
  try { p = JSON.parse(raw); } catch (e) { return J(req, { error: "Geçersiz istek." }, 400); }
  const c = cleanDraft(p);
  if (!c || c.id !== id) return J(req, { error: "Proje verisi geçersiz." }, 400);
  const body = JSON.stringify(c);
  if (body.length > 1400000) return J(req, { error: "Proje çok büyük." }, 413);
  const key = "drafts/" + u.id + "/" + id + ".json";
  const ex = await env.BUCKET.head(key);
  if (!ex) {
    const l = await env.BUCKET.list({ prefix: "drafts/" + u.id + "/", limit: 100 });
    if (l.objects.length >= 50) return J(req, { error: "En fazla 50 taslak saklanabilir." }, 429);
  }
  await env.BUCKET.put(key, body, {
    httpMetadata: { contentType: "application/json" },
    customMetadata: { ut: String(c.ut) },
  });
  return J(req, { ok: true, ut: c.ut });
}

async function draftDel(req, env, id) {
  const u = await auth(req);
  if (!u) return J(req, { error: "Giriş gerekli." }, 401);
  await env.BUCKET.delete("drafts/" + u.id + "/" + id + ".json");
  return J(req, { ok: true });
}

async function avatar(req, env) {
  return J(req, { error: "Profil fotoğrafı yükleme kapatıldı." }, 403);
}

/* ---------- Admin ---------- */
const ADMIN_ROLES = ["owner", "helper"];

function sbs(env) {
  const k = env.SB_SERVICE_KEY || "";
  const h = { apikey: k, "Content-Type": "application/json" };
  if (!/^sb_secret_/.test(k)) h.Authorization = "Bearer " + k;
  return h;
}

async function adminAuth(req, env) {
  if (!env.SB_SERVICE_KEY) return { err: J(req, { error: "Admin servisi yapılandırılmamış." }, 500) };
  const u = await auth(req);
  if (!u) return { err: J(req, { error: "Giriş gerekli." }, 401) };
  const r = await fetch(SB + "/rest/v1/profiles?select=id,username,role,banned&id=eq." + encodeURIComponent(u.id), { headers: sbs(env) });
  const rows = r.ok ? await r.json() : [];
  const p = rows[0];
  if (!p || p.banned || ADMIN_ROLES.indexOf(p.role) < 0) return { err: J(req, { error: "Yetkin yok." }, 403) };
  return { me: p };
}

async function cnt(env, path) {
  try {
    const r = await fetch(SB + "/rest/v1/" + path, { headers: Object.assign({ Prefer: "count=exact", Range: "0-0" }, sbs(env)) });
    const n = Number((r.headers.get("content-range") || "").split("/")[1]);
    return isFinite(n) ? n : 0;
  } catch (e) { return 0; }
}

async function allRows(env, path, max) {
  let out = [], from = 0;
  try {
    while (out.length < max) {
      const r = await fetch(SB + "/rest/v1/" + path, { headers: Object.assign({ Range: from + "-" + (from + 999) }, sbs(env)) });
      if (!r.ok) break;
      const a = await r.json();
      out = out.concat(a);
      if (a.length < 1000) break;
      from += 1000;
    }
  } catch (e) {}
  return out;
}

async function authUsers(env) {
  let out = [];
  try {
    for (let p = 1; p <= 10; p++) {
      const r = await fetch(SB + "/auth/v1/admin/users?page=" + p + "&per_page=1000", { headers: sbs(env) });
      if (!r.ok) break;
      const j = await r.json();
      const a = j.users || [];
      out = out.concat(a);
      if (a.length < 1000) break;
    }
  } catch (e) {}
  return out;
}

async function storageStats(env) {
  const s = { games: 0, drafts: 0, avatars: 0, thumbs: 0, other: 0, total: 0 };
  try {
    let cursor;
    for (let i = 0; i < 20; i++) {
      const l = await env.BUCKET.list({ cursor: cursor, limit: 1000 });
      l.objects.forEach(function (o) {
        const k = o.key.split("/")[0];
        s[s.hasOwnProperty(k) && k !== "total" ? k : "other"] += o.size;
        s.total += o.size;
      });
      if (!l.truncated) break;
      cursor = l.cursor;
    }
  } catch (e) {}
  return s;
}

async function adminStats(req, env) {
  const DAY = 864e5, now = Date.now();
  const res = await Promise.all([
    authUsers(env),
    allRows(env, "games?select=id,creator,title,tags,created_at&order=created_at.desc", 5000),
    cnt(env, "likes?select=game_id"),
    cnt(env, "follows?select=followed"),
    allRows(env, "profiles?select=username,role,banned&or=(role.not.is.null,banned.eq.true)", 1000),
    allRows(env, "likes?select=game_id", 20000),
    storageStats(env),
  ]);
  const users = res[0], games = res[1], profs = res[4], likeRows = res[5];

  const days = [], idx = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * DAY).toISOString().slice(0, 10);
    idx[d] = days.length; days.push(d);
  }
  const signups = days.map(function () { return 0; }), gseries = days.map(function () { return 0; });
  let active7 = 0, new7 = 0, new30 = 0;
  users.forEach(function (u) {
    const c = Date.parse(u.created_at) || 0, d = new Date(c).toISOString().slice(0, 10);
    if (idx[d] != null) signups[idx[d]]++;
    if (now - c < 7 * DAY) new7++;
    if (now - c < 30 * DAY) new30++;
    if (u.last_sign_in_at && now - Date.parse(u.last_sign_in_at) < 7 * DAY) active7++;
  });

  const creators = {}, tagc = {}, likeBy = {};
  let g7 = 0, g30 = 0;
  games.forEach(function (g) {
    const c = Date.parse(g.created_at) || 0, d = new Date(c).toISOString().slice(0, 10);
    if (idx[d] != null) gseries[idx[d]]++;
    if (now - c < 7 * DAY) g7++;
    if (now - c < 30 * DAY) g30++;
    creators[g.creator] = (creators[g.creator] || 0) + 1;
    String(g.tags || "").split(" ").filter(Boolean).forEach(function (t) { tagc[t] = (tagc[t] || 0) + 1; });
  });
  likeRows.forEach(function (l) { likeBy[l.game_id] = (likeBy[l.game_id] || 0) + 1; });

  const top = function (o, k) { return Object.keys(o).map(function (x) { return [x, o[x]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, k); };
  const byId = {}; games.forEach(function (g) { byId[g.id] = g; });
  const topGames = top(likeBy, 5).filter(function (x) { return byId[x[0]]; }).map(function (x) { return { t: byId[x[0]].title, u: byId[x[0]].creator, c: x[1] }; });

  return J(req, {
    users: {
      total: users.length, active7: active7, new7: new7, new30: new30,
      banned: profs.filter(function (p) { return p.banned; }).length,
      helpers: profs.filter(function (p) { return p.role === "helper" && !p.banned; }).length,
    },
    games: { total: games.length, new7: g7, new30: g30, creators: Object.keys(creators).length },
    likes: res[2], follows: res[3],
    series: { days: days, signups: signups, games: gseries },
    storage: res[6],
    topGames: topGames,
    topCreators: top(creators, 5).map(function (x) { return { n: x[0], c: x[1] }; }),
    tags: top(tagc, 8).map(function (x) { return { t: x[0], c: x[1] }; }),
    banned: profs.filter(function (p) { return p.banned; }).map(function (p) { return p.username; }),
    helpers: profs.filter(function (p) { return p.role === "helper" && !p.banned; }).map(function (p) { return p.username; }),
  });
}

async function findProfile(env, name) {
  const u = String(name || "").trim().replace(/^@+/, "").toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(u)) return { err: "Geçersiz kullanıcı adı." };
  const r = await fetch(SB + "/rest/v1/profiles?select=id,username,role,banned&username=eq." + encodeURIComponent(u), { headers: sbs(env) });
  const rows = r.ok ? await r.json() : [];
  if (!rows.length) return { err: "Kullanıcı bulunamadı." };
  return { p: rows[0] };
}

async function readBody(req) { try { return await req.json(); } catch (e) { return {}; } }

async function adminBan(req, env, me) {
  const b = await readBody(req);
  const f = await findProfile(env, b.username);
  if (f.err) return J(req, { error: f.err }, f.err === "Kullanıcı bulunamadı." ? 404 : 400);
  const t = f.p, ban = !!b.ban;
  if (t.id === me.id) return J(req, { error: "Kendini banlayamazsın." }, 400);
  if (t.role === "owner") return J(req, { error: "Kurucu hesap banlanamaz." }, 403);
  if (t.role === "helper" && me.role !== "owner") return J(req, { error: "Yardımcı adminleri sadece kurucu banlayabilir." }, 403);

  const patch = ban ? { banned: true, role: null } : { banned: false };
  const r1 = await fetch(SB + "/rest/v1/profiles?id=eq." + encodeURIComponent(t.id), { method: "PATCH", headers: sbs(env), body: JSON.stringify(patch) });
  if (!r1.ok) return J(req, { error: "Banlanamadı." }, 500);
  const r2 = await fetch(SB + "/auth/v1/admin/users/" + encodeURIComponent(t.id), { method: "PUT", headers: sbs(env), body: JSON.stringify({ ban_duration: ban ? "876000h" : "none" }) });
  if (!r2.ok) return J(req, { error: "Banlanamadı." }, 500);
  return J(req, { ok: true });
}

async function adminHelper(req, env, me) {
  if (me.role !== "owner") return J(req, { error: "Bu işlem sadece kurucu içindir." }, 403);
  const b = await readBody(req);
  const f = await findProfile(env, b.username);
  if (f.err) return J(req, { error: f.err }, f.err === "Kullanıcı bulunamadı." ? 404 : 400);
  const t = f.p;
  if (t.role === "owner") return J(req, { error: "Kurucu hesap değiştirilemez." }, 403);
  if (b.on && t.banned) return J(req, { error: "Banlı kullanıcı yardımcı admin olamaz." }, 400);
  const r = await fetch(SB + "/rest/v1/profiles?id=eq." + encodeURIComponent(t.id), { method: "PATCH", headers: sbs(env), body: JSON.stringify({ role: b.on ? "helper" : null }) });
  if (!r.ok) return J(req, { error: "Güncellenemedi." }, 500);
  return J(req, { ok: true });
}

/* ---------- Report sistemi ---------- */
const SQL_MISSING = "Report tabloları eksik. report-sistemi.sql dosyasını Supabase'de çalıştır.";

async function report(req, env) {
  const u = await auth(req);
  if (!u) return J(req, { error: "Giriş gerekli." }, 401);
  if (!env.SB_SERVICE_KEY) return J(req, { error: "Report servisi yapılandırılmamış." }, 500);
  const b = await readBody(req);
  const id = String(b.game_id || "");
  if (!GID.test(id)) return J(req, { error: "Geçersiz id." }, 400);

  const pr = await fetch(SB + "/rest/v1/profiles?select=username,banned&id=eq." + encodeURIComponent(u.id), { headers: sbs(env) });
  const prof = pr.ok ? await pr.json() : [];
  if (!prof.length) return J(req, { error: "Profil bulunamadı." }, 400);
  if (prof[0].banned) return J(req, { error: "Bu hesap banlandı." }, 403);

  const gr = await fetch(SB + "/rest/v1/games?select=id,creator,blocked&id=eq." + id, { headers: sbs(env) });
  if (!gr.ok) return J(req, { error: SQL_MISSING }, 500);
  const games = await gr.json();
  if (!games.length || games[0].blocked) return J(req, { error: "Oyun bulunamadı." }, 404);
  if (games[0].creator === prof[0].username) return J(req, { error: "Kendi oyununu reportlayamazsın." }, 400);

  const since = new Date(Date.now() - 864e5).toISOString();
  const n = await cnt(env, "reports?select=id&reporter_id=eq." + encodeURIComponent(u.id) + "&created_at=gte." + encodeURIComponent(since));
  if (n >= 20) return J(req, { error: "Bugün çok fazla report gönderdin, yarın tekrar dene." }, 429);

  const ins = await fetch(SB + "/rest/v1/reports?on_conflict=game_id,reporter_id", {
    method: "POST",
    headers: Object.assign({ Prefer: "resolution=ignore-duplicates,return=minimal" }, sbs(env)),
    body: JSON.stringify({ game_id: id, reporter_id: u.id }),
  });
  if (!ins.ok) return J(req, { error: "Report gönderilemedi." }, 500);
  return J(req, { ok: true });
}

async function adminReports(req, env) {
  const t = await fetch(SB + "/rest/v1/reports?select=id&limit=1", { headers: sbs(env) });
  const t2 = await fetch(SB + "/rest/v1/games?select=blocked&limit=1", { headers: sbs(env) });
  if (!t.ok || !t2.ok) return J(req, { error: SQL_MISSING }, 500);

  const rows = await allRows(env, "reports?select=game_id,created_at&resolved=eq.false&order=created_at.desc", 5000);
  const agg = {}, order = [];
  rows.forEach(function (r) {
    if (!agg[r.game_id]) { agg[r.game_id] = { c: 0, last: r.created_at }; order.push(r.game_id); }
    agg[r.game_id].c++;
  });
  const ids = order.slice(0, 100);
  let byId = {};
  if (ids.length) {
    const r = await fetch(SB + "/rest/v1/games?select=id,title,creator,blocked&id=in.(" + ids.map(encodeURIComponent).join(",") + ")", { headers: sbs(env) });
    if (!r.ok) return J(req, { error: "Hata" }, 500);
    (await r.json()).forEach(function (g) { byId[g.id] = g; });
  }
  /* En yeni report alan oyun listenin en başında */
  const reported = ids.filter(function (i) { return byId[i] && !byId[i].blocked; }).map(function (i) {
    return { id: i, t: byId[i].title, u: byId[i].creator, c: agg[i].c };
  });
  const bl = await allRows(env, "games?select=id,title,creator&blocked=eq.true&order=created_at.desc", 500);
  const blocked = bl.map(function (g) { return { id: g.id, t: g.title, u: g.creator }; });
  return J(req, { reported: reported, blocked: blocked });
}

async function adminGame(req, env, id) {
  if (!GID.test(id)) return J(req, { error: "Geçersiz id." }, 400);
  const r = await fetch(SB + "/rest/v1/games?select=file_key&id=eq." + id, { headers: sbs(env) });
  const rows = r.ok ? await r.json() : [];
  if (!rows.length || !rows[0].file_key) return J(req, { error: "Oyun bulunamadı." }, 404);
  const obj = await env.BUCKET.get(rows[0].file_key);
  if (!obj) return J(req, { error: "Oyun bulunamadı." }, 404);
  return new Response(obj.body, {
    headers: Object.assign({ "Content-Type": "application/json", "Cache-Control": "no-store" }, corsHeaders(req)),
  });
}

async function adminReportAction(req, env) {
  const b = await readBody(req);
  const id = String(b.game_id || "");
  if (!GID.test(id)) return J(req, { error: "Geçersiz id." }, 400);
  if (b.action !== "block" && b.action !== "false") return J(req, { error: "Geçersiz istek." }, 400);
  const g = await fetch(SB + "/rest/v1/games?select=id&id=eq." + id, { headers: sbs(env) });
  const rows = g.ok ? await g.json() : [];
  if (!rows.length) return J(req, { error: "Oyun bulunamadı." }, 404);

  if (b.action === "block") {
    const r = await fetch(SB + "/rest/v1/games?id=eq." + id, { method: "PATCH", headers: sbs(env), body: JSON.stringify({ blocked: true }) });
    if (!r.ok) return J(req, { error: "Block yapılamadı." }, 500);
  }
  /* İki durumda da report'lar çözülmüş sayılır; oyun Reported listesinden kalkar */
  const r2 = await fetch(SB + "/rest/v1/reports?game_id=eq." + id + "&resolved=eq.false", { method: "PATCH", headers: sbs(env), body: JSON.stringify({ resolved: true }) });
  if (!r2.ok) return J(req, { error: "Güncellenemedi." }, 500);
  return J(req, { ok: true });
}

async function admin(req, env, path) {
  const a = await adminAuth(req, env);
  if (a.err) return a.err;
  if (req.method === "GET" && path === "/admin/stats") return adminStats(req, env);
  if (req.method === "POST" && path === "/admin/ban") return adminBan(req, env, a.me);
  if (req.method === "POST" && path === "/admin/helper") return adminHelper(req, env, a.me);
  if (req.method === "GET" && path === "/admin/reports") return adminReports(req, env);
  if (req.method === "GET" && path.indexOf("/admin/game/") === 0) return adminGame(req, env, path.slice(12));
  if (req.method === "POST" && path === "/admin/report-action") return adminReportAction(req, env);
  return J(req, { error: "Bulunamadı." }, 404);
}

export default {
  async fetch(req, env) {
    try {
      if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
      const path = new URL(req.url).pathname;

      if (req.method === "GET" && path.indexOf("/files/") === 0) return file(req, env, path.slice(7));
      if (path.indexOf("/admin/") === 0) return admin(req, env, path);
      if (req.method === "GET" && path === "/geo") return J(req, { c: String((req.cf && req.cf.country) || req.headers.get("CF-IPCountry") || "") });
      if (req.method === "POST" && path === "/publish") return publish(req, env);
      if (req.method === "POST" && path === "/report") return report(req, env);
      if (req.method === "DELETE" && path.indexOf("/games/") === 0) return remove(req, env, path.slice(7));
      if (req.method === "POST" && path === "/avatar") return avatar(req, env);
      if (req.method === "GET" && path === "/drafts") return draftsList(req, env);
      if (path.indexOf("/drafts/") === 0) {
        const did = path.slice(8);
        if (!DID.test(did)) return J(req, { error: "Geçersiz id." }, 400);
        if (req.method === "GET") return draftGet(req, env, did);
        if (req.method === "PUT") return draftPut(req, env, did);
        if (req.method === "DELETE") return draftDel(req, env, did);
      }

      return J(req, { error: "Bulunamadı." }, 404);
    } catch (e) {
      return J(req, { error: "Sunucu hatası." }, 500);
    }
  },
};
