/* ToDy Workspace — commissions tracker + social media helper.
 * Data lives in the browser (localStorage) and, if connected, in a PRIVATE
 * GitHub repository via the GitHub Contents API, so phone and PC stay in sync.
 */
'use strict';

/* ============================== constants ============================== */

const LS_DATA = 'tody.data.v1';
const LS_GH = 'tody.github.v1';
const LS_TAB = 'tody.tab';

const STATUSES = [
  { id: 'request', label: 'Заявка', badge: '' },
  { id: 'invoice', label: 'Ждёт оплату', badge: 'yellow' },
  { id: 'sketch', label: 'Скетч', badge: 'red' },
  { id: 'final', label: 'Финал', badge: 'red' },
  { id: 'done', label: 'Готово', badge: 'green' },
  { id: 'cancelled', label: 'Отменён', badge: '' },
];
const ACTIVE = ['request', 'invoice', 'sketch', 'final'];

const LS_SITE = 'tody.site.v1';
/* Where the public site (and its site.json) lives. Pages is built from this branch/folder. */
const SITE_DEFAULTS = { siteRepo: 'Yoyo', siteBranch: 'claude/social-media-commissions-l03dgx', siteDir: 'docs' };
const WD = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

const DEFAULT_TASKS = [
  'Завести PayPal (Kazakhstan, Business), привязать Visa/Mastercard',
  'Проверить вывод: получить $1–2 от друга и вывести на карту',
  'Перевести текст на рефах Джека, Леониды и Генри на английский',
  'Нарисовать по 1 примеру на каждую позицию прайса',
  'Обновить био в Instagram, TikTok, X, Telegram',
  'Завести Bluesky и VGen',
  'Сделать картинку-прайс (commission sheet)',
  'Поставить ссылку на страницу для клиентов в био',
  '4 недели постов по плану (2 в неделю)',
  'Открыть 3 слота 🚀',
];

const PLAN = [
  { title: 'Неделя 1 — «Кто я»', items: [
    ['Ср', 'Знакомство: коллаж из 4 лучших работ + «Hi, I\'m ToDy! I design characters 🖋». Закрепить.'],
    ['Сб', 'TikTok/Reels: таймлапс любого скетча 15–30 сек'],
  ]},
  { title: 'Неделя 2 — «Кто я»', items: [
    ['Ср', 'Реф-лист Генри Маунтайна на английском'],
    ['Сб', 'Разворот скетчбука (тушь)'],
  ]},
  { title: 'Неделя 3 — «Мой мир»', items: [
    ['Ср', 'Реф Джека Инкблада (EN) + «He\'s from my project Turn the Lights Off»'],
    ['Сб', 'D&D-арт (Escape the Legion) + «Tell me about your character 👇»'],
  ]},
  { title: 'Неделя 4 — «Мой мир»', items: [
    ['Ср', 'Пачка дудлов-стикеров + «Should I make these into commissions?»'],
    ['Сб', 'TikTok: «Drawing my D&D character» — процесс'],
  ]},
  { title: 'Неделя 5 — Открытие комишек 🚀', items: [
    ['Ср', '«Commissions OPEN — 3 slots» + commission sheet. Закрепить.'],
    ['Сб', 'Пример реф-листа + «This could be YOUR OC 📋»'],
  ]},
  { title: 'Неделя 6 — Открытие комишек 🚀', items: [
    ['Ср', 'WIP первого заказа (если клиент разрешил) или новый скетч'],
    ['Сб', 'TikTok: «POV: you commission me»'],
  ]},
  { title: 'Неделя 7 — Доверие', items: [
    ['Ср', 'Готовый заказ + скрин отзыва клиента'],
    ['Сб', 'Процесс: скетч → лайн → тени (карусель)'],
  ]},
  { title: 'Неделя 8 — Доверие', items: [
    ['Ср', '«1 slot left!» или «Slots full, thank you! ❤️»'],
    ['Сб', 'TikTok: before/after — референс клиента → твой арт'],
  ]},
];

const TEMPLATES = [
  { group: 'Ответы клиентам', items: [
    { t: 'Комишки открыты?', text: "Hi! Yes, they are open 🙌 Here's my price sheet: [link]. If you'd like to order, just send me the details here (or fill out this form: [link]). Let me know if you have any questions!", tr: 'Да, открыты. Вот прайс. Пришли детали или заполни форму.' },
    { t: 'Принять заказ + счёт', text: "Thank you for the details! I'd love to draw [character name] 😊\nTotal: $[price] ([type] + [extras]).\nI've sent a PayPal invoice to [email]. As soon as it's paid, I'll start working on the sketch. Estimated time: 1–3 weeks.", tr: 'Спасибо! Итого $X. Отправил(а) счёт в PayPal. После оплаты начну скетч.' },
    { t: 'Отправить скетч', text: "Here's the sketch! Let me know if you'd like any changes to the pose, expression or details — you have up to 2 free revisions at this stage. If everything looks good, I'll move on to the final!", tr: 'Вот скетч! 2 бесплатные правки. Если всё ок — делаю финал.' },
    { t: 'Сдать работу', text: "It's finished! 🎉 Here's your final artwork: [link]. Thank you so much for commissioning me! If you post it, please credit me as @_ToDyWhatever. I'd really appreciate a short review if you enjoyed it ❤️", tr: 'Готово! Спасибо за заказ. Отметь меня и оставь отзыв.' },
    { t: 'Вежливый отказ', text: "Thank you for reaching out! Unfortunately, this isn't something I can take on right now, as it's outside of what I draw. I hope you find the perfect artist for it! 🙏", tr: 'Спасибо, но это не то, что я рисую.' },
    { t: 'Просят скидку', text: "I understand! My prices are already set for my current level, so I can't lower them, but a sketch version of the same piece is cheaper — it would be $[price]. Would that work for you?", tr: 'Цены не снижаю, но могу предложить скетч-версию за $X.' },
    { t: 'Напомнить про оплату', text: "Hi! Just a friendly reminder about the invoice for your commission 😊 I'll hold your slot until [date]. Let me know if anything changed!", tr: 'Напоминаю про счёт, держу слот до [даты].' },
    { t: 'Задержка', text: "Hi [name]! Just a quick update: your commission is taking a bit longer than planned. I expect to send it by [date]. Sorry for the wait, and thank you for your patience!", tr: 'Небольшая задержка, отправлю к [дате].' },
  ]},
  { group: 'Подписи к постам', items: [
    { t: 'Открытие комишек', text: '🖋 COMMISSIONS OPEN 🖋\n{slots} slots · greyscale & sketch · OCs, D&D characters, ref sheets\nPrices start at {min}!\nInfo ↓ [link]\nRTs are super appreciated ❤️' },
    { t: 'Реф-лист', text: 'Reference sheet for [Name] — [one line about the character] 📋\nWant one for your OC? Commissions are open ↓' },
    { t: 'Скетчбук', text: 'some sketchbook pages from this week ✏️ which one is your favourite?' },
    { t: 'D&D', text: 'My [class] from our campaign "[name]" 🐉\nDo you want me to draw YOUR character? DM me!' },
    { t: 'Готовый заказ', text: 'Commission for @[client] — thank you so much! ❤️\n[Character name] was so fun to draw!\nSlots: [X/{slots}] left' },
    { t: 'Слоты закрыты', text: "Slots are full! Thank you so much for the support 🥹 I'll open again in [month]." },
  ]},
  { group: 'Хэштеги', items: [
    { t: 'X / Bluesky (3–5 шт.)', text: '#artistsontwitter #oc #characterdesign #commissionsopen' },
    { t: 'Instagram / TikTok', text: '#art #artist #digitalart #sketch #oc #originalcharacter #characterdesign #commissionsopen #artcommissions #dnd #dndart #ttrpg #refsheet #greyscale #sketchbook' },
    { t: 'Telegram (RU)', text: '#арт #скетч #ос #днд #комишки' },
  ]},
  { group: 'Био', items: [
    { t: 'X / Twitter', text: 'ToDy ✦ character designer & artist\nOCs · D&D · greyscale doodles\n🖋 Commissions: OPEN\n🇰🇿 RU/EN · no AI\n🔗 [link]' },
    { t: 'Bluesky', text: 'ToDy ✦ I draw OCs, D&D characters & sketchy doodles\nCommissions open 🖋 [link]' },
    { t: 'Instagram', text: 'ToDy ✦ character design\nOCs · D&D · doodles\n🖋 Commissions OPEN ↓' },
    { t: 'TikTok', text: 'drawing OCs & D&D characters ✏️\ncomms open ↓' },
    { t: 'VGen', text: "Hi! I'm ToDy — I design characters and draw them in greyscale and sketchy styles.\nI love OCs, TTRPG characters and character reference sheets 📋\nFast communication, sketch approval before the final." },
    { t: 'Telegram (справка)', text: '💸 Комишки — открыты! Прайс и правила: [ссылка]\nПринимаю $ (PayPal, VGen). Пиши в ЛС.' },
  ]},
];

/* ============================== helpers ============================== */

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const now = () => Date.now();
const uid = () => Math.random().toString(36).slice(2, 9) + now().toString(36).slice(-4);
const money = (n) => '$' + (Math.round((+n || 0) * 100) / 100).toLocaleString('en-US');
/* local (not UTC) date as YYYY-MM-DD */
const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayISO = () => isoOf(new Date());
const parseISO = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return isoOf(d); };
const mondayOf = (iso) => { const d = parseISO(iso); return addDays(iso, -((d.getDay() + 6) % 7)); };
const daysUntil = (iso) => {
  if (!iso) return null;
  const d = new Date(iso + 'T00:00:00');
  const t = new Date(todayISO() + 'T00:00:00');
  return Math.round((d - t) / 86400000);
};
const statusOf = (id) => STATUSES.find((s) => s.id === id) || STATUSES[0];

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 1800);
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch {}
    ta.remove();
  }
  toast('Скопировано ✓');
}

/* ============================== data ============================== */

function freshData() {
  const t = now();
  return {
    version: 1,
    orders: [],
    tasks: DEFAULT_TASKS.map((text, i) => ({ id: 'default-' + i, text, done: false, updated: 0 })),
    checks: {},             // planItemId -> { v: bool, updated }
    settings: { name: 'ToDy', slots: 3, postDays: [3, 6], postTime: '19:00–23:00', planStart: todayISO(), updated: 0 },
    created: t,
  };
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_DATA);
    if (raw) return normalize(JSON.parse(raw));
  } catch {}
  return freshData();
}

function normalize(d) {
  const base = freshData();
  d = d && typeof d === 'object' ? d : {};
  return {
    version: 1,
    orders: Array.isArray(d.orders) ? d.orders : [],
    tasks: Array.isArray(d.tasks) ? d.tasks : base.tasks,
    checks: d.checks && typeof d.checks === 'object' ? d.checks : {},
    settings: { ...base.settings, ...(d.settings || {}) },
    created: d.created || base.created,
  };
}

/* Merge two copies item-by-item, newest `updated` wins. Deleted items keep a tombstone. */
function mergeList(a = [], b = []) {
  const map = new Map();
  for (const it of [...a, ...b]) {
    const cur = map.get(it.id);
    if (!cur || (it.updated || 0) >= (cur.updated || 0)) map.set(it.id, it); // ties: later (remote) wins
  }
  return [...map.values()].sort((x, y) => (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
}
/* Key-order independent JSON, used to tell whether two copies really differ. */
function canon(v) {
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
  return JSON.stringify(v === undefined ? null : v);
}
function merge(a, b) {
  a = normalize(a); b = normalize(b);
  const checks = { ...a.checks };
  for (const [k, v] of Object.entries(b.checks)) {
    if (!checks[k] || (v.updated || 0) >= (checks[k].updated || 0)) checks[k] = v;
  }
  return {
    version: 1,
    orders: mergeList(a.orders, b.orders),
    tasks: mergeList(a.tasks, b.tasks),
    checks,
    settings: (b.settings.updated || 0) >= (a.settings.updated || 0) ? b.settings : a.settings,
    created: Math.min(a.created || now(), b.created || now()),
  };
}

let data = loadLocal();

function save() {
  try { localStorage.setItem(LS_DATA, JSON.stringify(data)); } catch {}
  schedulePush();
}

/* ============================== GitHub sync ============================== */

function ghConf() {
  try { return JSON.parse(localStorage.getItem(LS_GH) || 'null'); } catch { return null; }
}
function setGhConf(c) {
  try { c ? localStorage.setItem(LS_GH, JSON.stringify(c)) : localStorage.removeItem(LS_GH); } catch {}
}

const b64encode = (str) => {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const b64decode = (b64) => {
  const bin = atob(b64.replace(/\s/g, ''));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

function gh(conf, method, body) { return ghApi(conf, conf.repo, conf.path, method, body); }

async function ghApi(conf, repo, path, method = 'GET', body = null, ref = null) {
  let url = `https://api.github.com/repos/${encodeURIComponent(conf.owner)}/${encodeURIComponent(repo)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;
  if (method === 'GET') url += '?' + (ref ? 'ref=' + encodeURIComponent(ref) + '&' : '') + 't=' + now();
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: 'Bearer ' + conf.token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  return res;
}

async function ghRead(conf) {
  const res = await gh(conf, 'GET');
  if (res.status === 404) return { data: null, sha: null };
  if (!res.ok) throw new Error(await errText(res));
  const j = await res.json();
  return { data: JSON.parse(b64decode(j.content)), sha: j.sha };
}

async function ghWrite(conf, obj, sha) {
  const res = await gh(conf, 'PUT', {
    message: 'Update workspace data',
    content: b64encode(JSON.stringify(obj, null, 1)),
    ...(sha ? { sha } : {}),
  });
  if (res.status === 409 || res.status === 422) return { conflict: true };
  if (!res.ok) throw new Error(await errText(res));
  return { ok: true };
}

async function errText(res) {
  let msg = res.status + '';
  try { msg += ': ' + (await res.json()).message; } catch {}
  if (res.status === 401) return 'Токен неверный или истёк (401)';
  if (res.status === 403) return 'Нет прав. Проверь доступ токена к репозиторию (403)';
  if (res.status === 404) return 'Репозиторий не найден или токен не имеет к нему доступа (404)';
  return msg;
}

let syncState = { s: 'local', msg: '' };
function setSync(s, msg = '') {
  syncState = { s, msg };
  const el = $('#sync');
  el.className = 'sync ' + ({ ok: 'ok', busy: 'busy', err: 'err' }[s] || '');
  $('#syncText').textContent = { local: 'Только это устройство', ok: 'Синхронизировано', busy: 'Сохраняю…', err: 'Ошибка синхр.' }[s];
  el.title = msg || '';
}

let pushTimer = null;
let syncing = false;
let pending = false;

function schedulePush() {
  if (!ghConf()) return;
  setSync('busy');
  clearTimeout(pushTimer);
  pushTimer = setTimeout(sync, 1200);
}

/* Pull remote, merge with local, write back if something changed. */
async function sync() {
  const conf = ghConf();
  if (!conf) { setSync('local'); return; }
  if (syncing) { pending = true; return; }
  syncing = true;
  setSync('busy');
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const remote = await ghRead(conf);
      const merged = remote.data ? merge(data, remote.data) : data;
      const changedLocal = canon(merged) !== canon(data);
      const changedRemote = !remote.data || canon(merged) !== canon(normalize(remote.data));
      data = merged;
      try { localStorage.setItem(LS_DATA, JSON.stringify(data)); } catch {}
      if (changedLocal) render();
      if (!changedRemote) break;
      const w = await ghWrite(conf, data, remote.sha);
      if (w.ok) break;
    }
    setSync('ok', 'Последняя синхронизация: ' + new Date().toLocaleTimeString());
  } catch (e) {
    setSync('err', String(e.message || e));
  } finally {
    syncing = false;
    if (pending) { pending = false; schedulePush(); }
  }
}

/* ============================== public site config ============================== */

let site = (() => { try { return JSON.parse(localStorage.getItem(LS_SITE) || 'null'); } catch { return null; } })();
let siteDraft = null;          // copy being edited in Settings
let siteDirty = false;
let siteBusy = '';             // publish progress text
const imgPreview = new Map();  // src -> dataURL, so freshly uploaded images show before Pages rebuilds

function siteConf() { const c = ghConf(); return c ? { ...SITE_DEFAULTS, ...c } : null; }
const clone = (o) => JSON.parse(JSON.stringify(o));

function setSite(c) {
  site = c;
  try { localStorage.setItem(LS_SITE, JSON.stringify(c)); } catch {}
  if (typeof refreshOrderSelects === 'function') refreshOrderSelects();
}

async function loadSite() {
  let fresh = null;
  const c = siteConf();
  try {
    if (c) {
      const res = await ghApi(c, c.siteRepo, `${c.siteDir}/site.json`, 'GET', null, c.siteBranch);
      if (res.ok) fresh = JSON.parse(b64decode((await res.json()).content));
    }
  } catch {}
  if (!fresh) {
    try { const r = await fetch('site.json?t=' + now(), { cache: 'no-store' }); if (r.ok) fresh = await r.json(); } catch {}
  }
  if (fresh && canon(fresh) !== canon(site)) {
    setSite(fresh);
    if (!siteDirty) { siteDraft = null; render(); }
  }
}

async function ghSha(c, path) {
  const res = await ghApi(c, c.siteRepo, path, 'GET', null, c.siteBranch);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await siteErr(res));
  return (await res.json()).sha;
}

async function putFile(c, path, b64, message) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const sha = await ghSha(c, path);
    const res = await ghApi(c, c.siteRepo, path, 'PUT', { message, content: b64, branch: c.siteBranch, ...(sha ? { sha } : {}) });
    if (res.ok) return;
    if (res.status !== 409 && res.status !== 422) throw new Error(await siteErr(res));
  }
  throw new Error('Конфликт при сохранении, попробуй ещё раз');
}

async function deleteFile(c, path, message) {
  const sha = await ghSha(c, path);
  if (!sha) return;
  const res = await ghApi(c, c.siteRepo, path, 'DELETE', { message, sha, branch: c.siteBranch });
  if (!res.ok && res.status !== 404) throw new Error(await siteErr(res));
}

async function siteErr(res) {
  if (res.status === 403 || res.status === 404) {
    return `Ключ не имеет доступа к репозиторию «${siteConf().siteRepo}» (${res.status}).\n\n` +
      'Открой github.com/settings/personal-access-tokens → свой токен → Edit → Repository access → добавь Yoyo → Update. Права: Contents — Read and write.';
  }
  return errText(res);
}

async function publishSite() {
  const c = siteConf();
  if (!c) { alert('Чтобы публиковать изменения, сначала подключи GitHub (внизу этой страницы).'); return; }
  const draft = siteDraft;
  const dir = c.siteDir ? c.siteDir.replace(/\/+$/, '') + '/' : '';
  const step = (t) => { siteBusy = t; updateDirtyUI(); };
  try {
    const fresh = draft.gallery.filter((g) => g.pending);
    for (let i = 0; i < fresh.length; i++) {
      step(`Загружаю фото ${i + 1}/${fresh.length}…`);
      const g = fresh[i];
      const name = `img/u-${now().toString(36)}${Math.random().toString(36).slice(2, 6)}.jpg`;
      await putFile(c, dir + name, g.pending.split(',')[1], 'Add artwork image');
      imgPreview.set(name, g.pending);
      g.src = name;
      delete g.pending;
    }
    const keep = new Set(draft.gallery.map((g) => g.src));
    const removed = ((site && site.gallery) || []).map((g) => g.src).filter((s) => s && s.startsWith('img/') && !keep.has(s));
    for (const src of removed) { step('Удаляю убранные фото…'); await deleteFile(c, dir + src, 'Remove artwork image'); }
    step('Сохраняю страницу…');
    const clean = clone(draft);
    await putFile(c, dir + 'site.json', b64encode(JSON.stringify(clean, null, 1) + '\n'), 'Update commission page settings');
    setSite(clean);
    siteDirty = false;
    siteDraft = null;
    toast('Опубликовано ✓ Страница обновится через 1–2 мин');
    render();
  } catch (e) {
    alert('Не получилось опубликовать:\n' + (e.message || e));
  } finally {
    siteBusy = '';
    updateDirtyUI();
  }
}

function minPrice() {
  const c = site || {};
  const all = (c.prices || []).flatMap((r) => (c.styles || []).map((st) => r.prices && r.prices[st]))
    .filter((v) => v !== null && v !== undefined && v !== '').map(Number);
  return all.length ? (c.currency || '$') + Math.min(...all) : '$8';
}
const fillTpl = (text) => text.replaceAll('{min}', minPrice()).replaceAll('{slots}', String(data.settings.slots));

/* ---------- images ---------- */

function readImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Не удалось открыть ' + file.name)); };
    im.src = url;
  });
}

/* Shrink to max 1600px on the long side and re-encode as JPEG: keeps the repo and page light. */
async function toJpeg(file, max = 1600) {
  const im = await readImage(file);
  const w0 = im.naturalWidth, h0 = im.naturalHeight;
  const k = Math.min(1, max / Math.max(w0, h0));
  const cv = document.createElement('canvas');
  cv.width = Math.round(w0 * k); cv.height = Math.round(h0 * k);
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.drawImage(im, 0, 0, cv.width, cv.height);
  URL.revokeObjectURL(im.src);
  return { dataUrl: cv.toDataURL('image/jpeg', 0.86), wide: w0 / h0 > 1.25 };
}

/* ============================== stats ============================== */

function liveOrders() { return data.orders.filter((o) => !o.deleted); }

function stats() {
  const orders = liveOrders();
  const active = orders.filter((o) => ACTIVE.includes(o.status));
  const done = orders.filter((o) => o.status === 'done');
  const month = todayISO().slice(0, 7);
  const monthDone = done.filter((o) => (o.doneDate || '').startsWith(month));
  const hours = done.reduce((s, o) => s + (+o.hours || 0), 0);
  const earnedDone = done.reduce((s, o) => s + (+o.price || 0), 0);
  return {
    active,
    done,
    slotsLeft: Math.max(0, (+data.settings.slots || 0) - active.filter((o) => o.status !== 'request').length),
    monthIncome: monthDone.reduce((s, o) => s + (+o.price || 0), 0),
    totalPaid: orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + (+o.paid || 0), 0),
    awaiting: active.reduce((s, o) => s + Math.max(0, (+o.price || 0) - (+o.paid || 0)), 0),
    perHour: hours > 0 ? earnedDone / hours : null,
  };
}

/* The plan is aligned to the Monday of the week it was started. */
function planMonday() { return mondayOf(data.settings.planStart || todayISO()); }
function planWeek() {
  const diff = Math.round((parseISO(todayISO()) - parseISO(planMonday())) / 86400000);
  return Math.min(PLAN.length - 1, Math.max(0, Math.floor(diff / 7)));
}

/* ============================== calendar ============================== */

/* Posting weekdays (0 = Sun … 6 = Sat), Monday-first. Plan item i of a week goes to postDays[i]. */
function postDays() {
  const d = [...new Set((data.settings.postDays || []).map(Number).filter((x) => x >= 0 && x <= 6))];
  return (d.length ? d : [3, 6]).sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
}
const planItemDay = (i) => { const d = postDays(); return d[i % d.length]; };
const plural = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many);

function calEvents(fromISO, toISO) {
  const ev = {};
  const at = (d) => (ev[d] ||= { deadlines: [], done: [], posts: [], reminder: false });
  for (const o of liveOrders()) {
    if (o.deadline && ACTIVE.includes(o.status) && o.deadline >= fromISO && o.deadline <= toISO) at(o.deadline).deadlines.push(o);
    if (o.status === 'done' && o.doneDate && o.doneDate >= fromISO && o.doneDate <= toISO) at(o.doneDate).done.push(o);
  }
  const mon = planMonday();
  PLAN.forEach((w, wi) => w.items.forEach(([, text], i) => {
    const wd = planItemDay(i);
    const d = addDays(mon, wi * 7 + (wd + 6) % 7);
    if (d < fromISO || d > toISO) return;
    const id = `w${wi}-${i}`;
    at(d).posts.push({ id, day: WD[wd], text, done: !!(data.checks[id] && data.checks[id].v) });
  }));
  const planEnd = addDays(mon, PLAN.length * 7);
  for (let d = fromISO > planEnd ? fromISO : planEnd; d <= toISO; d = addDays(d, 1)) {
    if (postDays().includes(parseISO(d).getDay())) at(d).reminder = true;
  }
  return ev;
}

let calMonth = todayISO().slice(0, 7);
let calSel = todayISO();

function calendarView() {
  const first = calMonth + '-01';
  const gridStart = mondayOf(first);
  const last = isoOf(new Date(parseISO(first).getFullYear(), parseISO(first).getMonth() + 1, 0));
  const gridEnd = addDays(mondayOf(last), 6);
  const ev = calEvents(gridStart, gridEnd);
  const today = todayISO();
  const title = parseISO(first).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(' г.', '');
  const cells = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
    const e = ev[d];
    const cls = ['cal-day'];
    if (d.slice(0, 7) !== calMonth) cls.push('out');
    if (d === today) cls.push('today');
    if (d === calSel) cls.push('sel');
    let dots = '';
    if (e) {
      if (e.deadlines.length) dots += `<i class="dot red" title="Дедлайн"></i>`;
      if (e.done.length) dots += `<i class="dot green" title="Сдан заказ"></i>`;
      if (e.posts.length) dots += e.posts.every((p) => p.done) ? '<i class="mark done">✓</i>' : '<i class="mark">✏️</i>';
      else if (e.reminder) dots += '<i class="mark faint">✏️</i>';
    }
    cells.push(`<button class="${cls.join(' ')}" data-act="cal-day" data-d="${d}"><span class="n">${parseISO(d).getDate()}</span><span class="dots">${dots}</span></button>`);
  }

  const se = ev[calSel] || calEvents(calSel, calSel)[calSel];
  const selTitle = parseISO(calSel).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  let details = '';
  if (se) {
    details += se.deadlines.map((o) => `<button class="cal-item" data-act="edit" data-id="${o.id}"><i class="dot red"></i><span><b>Дедлайн:</b> ${esc(o.client)} — ${esc(o.type || '')}</span><span class="badge ${statusOf(o.status).badge}">${esc(statusOf(o.status).label)}</span></button>`).join('');
    details += se.done.map((o) => `<button class="cal-item" data-act="edit" data-id="${o.id}"><i class="dot green"></i><span><b>Сдан:</b> ${esc(o.client)} — ${money(o.price)}</span></button>`).join('');
    details += se.posts.map((p) => `
      <label class="check ${p.done ? 'done' : ''}">
        <input type="checkbox" data-act="plan" data-id="${p.id}" ${p.done ? 'checked' : ''}>
        <span class="day">${esc(p.day)}</span><span class="txt">${esc(p.text)}</span>
      </label>`).join('');
    if (se.reminder && !se.posts.length) details += `<div class="cal-item static">✏️ <span>День поста: выложи арт, скетч или WIP (${esc(data.settings.postTime)})</span></div>`;
  }
  if (!details) details = '<div class="muted small" style="padding:6px 0">Ничего не запланировано</div>';

  return `
  <div class="card cal">
    <div class="row cal-head">
      <button class="btn ghost small" data-act="cal-prev" aria-label="Предыдущий месяц">‹</button>
      <h3 class="cal-title">${esc(title)}</h3>
      <button class="btn ghost small" data-act="cal-next" aria-label="Следующий месяц">›</button>
      <span class="spacer"></span>
      ${calMonth !== today.slice(0, 7) || calSel !== today ? '<button class="btn small" data-act="cal-today">Сегодня</button>' : ''}
    </div>
    <div class="cal-grid">
      ${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((w) => `<div class="cal-wd">${w}</div>`).join('')}
      ${cells.join('')}
    </div>
    <div class="cal-legend small muted"><span><i class="dot red"></i> дедлайн</span><span><i class="dot green"></i> сдан</span><span>✏️ пост</span><span>✓ выложено</span></div>
    <div class="cal-details">
      <div class="cal-sel-title">${esc(selTitle)}</div>
      ${details}
    </div>
  </div>`;
}

/* ============================== views ============================== */

const views = {};
let tab = (() => { try { return localStorage.getItem(LS_TAB) || 'home'; } catch { return 'home'; } })();
let orderFilter = 'active';

function render() {
  if (!views[tab]) tab = 'home';
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  $('#view').innerHTML = views[tab]();
  updateDirtyUI();
  window.scrollTo({ top: Math.min(window.scrollY, document.body.scrollHeight) });
}

function deadlineBadge(o) {
  if (!o.deadline || !ACTIVE.includes(o.status)) return '';
  const d = daysUntil(o.deadline);
  if (d < 0) return `<span class="badge red">просрочен на ${-d} дн.</span>`;
  if (d === 0) return '<span class="badge red">сегодня</span>';
  if (d <= 3) return `<span class="badge yellow">через ${d} дн.</span>`;
  return `<span class="badge">до ${esc(o.deadline.slice(5).split('-').reverse().join('.'))}</span>`;
}

function orderCard(o) {
  const st = statusOf(o.status);
  const stepIdx = ['request', 'invoice', 'sketch', 'final', 'done'].indexOf(o.status);
  const unpaid = Math.max(0, (+o.price || 0) - (+o.paid || 0));
  const payBadge = o.status === 'cancelled' ? '' :
    unpaid <= 0 && (+o.price || 0) > 0 ? '<span class="badge green">оплачен</span>' :
    (+o.paid || 0) > 0 ? `<span class="badge yellow">оплачено ${money(o.paid)}</span>` :
    '<span class="badge">не оплачен</span>';
  return `
  <div class="card order">
    <div class="row">
      <span class="title">${esc(o.client || 'Без имени')}</span>
      <span class="badge ${st.badge}">${esc(st.label)}</span>
      <span class="spacer"></span>
      <span class="price">${money(o.price)}</span>
    </div>
    <div class="meta">${esc([o.type, o.style, o.extras].filter(Boolean).join(' · '))}${o.contact ? ' — ' + esc(o.contact) : ''}</div>
    ${stepIdx >= 0 ? `<div class="progress">${[0, 1, 2, 3, 4].map((i) => `<i class="${i <= stepIdx ? 'on' : ''}"></i>`).join('')}</div>` : ''}
    <div class="row">
      ${payBadge} ${deadlineBadge(o)}
      <span class="spacer"></span>
      <select data-act="status" data-id="${o.id}" aria-label="Статус">
        ${STATUSES.map((s) => `<option value="${s.id}" ${s.id === o.status ? 'selected' : ''}>${s.label}</option>`).join('')}
      </select>
      <button class="btn small" data-act="edit" data-id="${o.id}">Открыть</button>
    </div>
  </div>`;
}

views.home = () => {
  const s = stats();
  const upcoming = s.active
    .filter((o) => o.deadline)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 4);
  const wk = planWeek();
  const tasks = data.tasks.filter((t) => !t.deleted);
  const tasksDone = tasks.filter((t) => t.done).length;
  return `
  <h1>Привет, ${esc(data.settings.name || 'ToDy')} 👋</h1>
  <div class="grid stats">
    <div class="card stat"><div class="num">${s.active.length}</div><div class="lbl">активных заказов</div></div>
    <div class="card stat accent"><div class="num">${s.slotsLeft}/${esc(data.settings.slots)}</div><div class="lbl">свободных слотов</div></div>
    <div class="card stat"><div class="num">${money(s.monthIncome)}</div><div class="lbl">сдано за этот месяц</div></div>
    <div class="card stat"><div class="num">${money(s.awaiting)}</div><div class="lbl">ещё должны заплатить</div></div>
    <div class="card stat"><div class="num">${s.perHour == null ? '—' : money(s.perHour)}</div><div class="lbl">в среднем за час</div></div>
    <div class="card stat"><div class="num">${money(s.totalPaid)}</div><div class="lbl">получено всего</div></div>
  </div>

  <h2>Календарь</h2>
  ${calendarView()}

  <div class="row" style="margin-top:16px"><h2 style="margin:0">Ближайшие дедлайны</h2><span class="spacer"></span><button class="btn primary small" data-act="new">+ Заказ</button></div>
  <div class="stack" style="margin-top:10px">
    ${upcoming.length ? upcoming.map(orderCard).join('') : `<div class="card empty">Пока нет заказов с дедлайном. ${s.active.length ? '' : 'Первый заказ уже близко ✨'}</div>`}
  </div>

  <h2>Контент на этой неделе</h2>
  <div class="card">
    <h3>${esc(PLAN[wk].title)}</h3>
    ${planItems(wk)}
  </div>

  <h2>Чек-лист запуска <span class="muted small">${tasksDone}/${tasks.length}</span></h2>
  <div class="card">
    ${tasks.map((t) => `
      <label class="check ${t.done ? 'done' : ''}">
        <input type="checkbox" data-act="task" data-id="${t.id}" ${t.done ? 'checked' : ''}>
        <span class="txt">${esc(t.text)}</span>
        <button class="btn ghost small del" data-act="task-del" data-id="${t.id}" title="Удалить" aria-label="Удалить">✕</button>
      </label>`).join('')}
    <form class="row" data-act="task-add" style="margin-top:10px">
      <input name="t" placeholder="Новая задача…" style="flex:1">
      <button class="btn small">Добавить</button>
    </form>
  </div>`;
};

function planItems(w) {
  return PLAN[w].items.map(([, text], i) => {
    const day = WD[planItemDay(i)];
    const id = `w${w}-${i}`;
    const on = !!(data.checks[id] && data.checks[id].v);
    return `
    <label class="check ${on ? 'done' : ''}">
      <input type="checkbox" data-act="plan" data-id="${id}" ${on ? 'checked' : ''}>
      <span class="day">${esc(day)}</span><span class="txt">${esc(text)}</span>
    </label>`;
  }).join('');
}

views.orders = () => {
  const all = liveOrders().sort((a, b) => (b.created || 0) - (a.created || 0));
  const filters = {
    active: ['Активные', (o) => ACTIVE.includes(o.status)],
    done: ['Готовые', (o) => o.status === 'done'],
    cancelled: ['Отменённые', (o) => o.status === 'cancelled'],
    all: ['Все', () => true],
  };
  const list = all.filter(filters[orderFilter][1]);
  return `
  <div class="row"><h1 style="margin:0">Заказы</h1><span class="spacer"></span><button class="btn primary" data-act="new">+ Заказ</button></div>
  <div class="chips" style="margin:14px 0">
    ${Object.entries(filters).map(([k, [lbl, fn]]) => `<button class="chip ${k === orderFilter ? 'active' : ''}" data-act="filter" data-f="${k}">${lbl} · ${all.filter(fn).length}</button>`).join('')}
  </div>
  <div class="stack">
    ${list.length ? list.map(orderCard).join('') : '<div class="card empty">Здесь пока пусто. Нажми «+ Заказ», когда кто-то напишет 🙌</div>'}
  </div>
  <p class="muted small" style="margin-top:16px">Статусы: Заявка → Ждёт оплату → Скетч → Финал → Готово. «Свободные слоты» считают все активные заказы, кроме заявок.</p>`;
};

views.content = () => {
  const wk = planWeek();
  return `
  <h1>Контент-план</h1>
  <p class="muted">Темп: <b>${postDays().length} ${plural(postDays().length, 'пост', 'поста', 'постов')} в неделю — ${postDays().map((d) => WD[d]).join(', ')}</b>, время: <b>${esc(data.settings.postTime)}</b> (меняется в Настройках). Каждый пост: картинка + 1–2 предложения + 3–5 хэштегов.</p>
  <div class="row"><span class="muted small">План начат: ${esc(data.settings.planStart)}</span><span class="spacer"></span><button class="btn small" data-act="plan-reset">Начать заново с сегодня</button></div>
  ${PLAN.map((w, i) => `
    <div class="card" style="margin-top:12px; ${i === wk ? 'border-color: var(--accent)' : ''}">
      <div class="row"><h3 style="margin:0">${esc(w.title)}</h3>${i === wk ? '<span class="badge red">сейчас</span>' : ''}</div>
      ${planItems(i)}
    </div>`).join('')}

  <h2>Как экономить время</h2>
  <div class="card stack small">
    <div>• Один арт = два поста: финал в один день постов, таймлапс/процесс того же арта — в следующий</div>
    <div>• Всегда записывай экран во время рисования (Clip Studio / Procreate) — видео для TikTok почти бесплатно</div>
    <div>• Один пост выкладывай сразу везде: X, Bluesky, Instagram, Telegram</div>
    <div>• Сессия? Напиши «exams, back in 2 weeks!» и закрой слоты — это нормально</div>
  </div>

  <h2>Где что постить</h2>
  <div class="card stack small">
    <div><b>X / Bluesky</b> — готовые арты, скетчи, WIP, «commissions open», репосты клиентов</div>
    <div><b>Instagram</b> — карусели (финал → скетч → процесс), Reels с таймлапсом</div>
    <div><b>TikTok</b> — таймлапсы, «рисую персонажа по описанию», before/after</div>
    <div><b>Telegram</b> — всё + новости, на русском</div>
  </div>

  <h2>Как расти в X / Bluesky</h2>
  <div class="card stack small">
    <div>• Участвуй в #PortfolioDay, #VisibleArtistDay, #OCtober</div>
    <div>• Отвечай на посты «Drop your art», «Artists, show your OCs», ищи <code>looking for artist</code>, <code>LF artist</code></div>
    <div>• Комментируй художников своего уровня — взаимные подписки</div>
    <div>• Делай DTIYS (draw this in your style) — их часто репостят авторы</div>
  </div>`;
};

views.templates = () => `
  <h1>Шаблоны</h1>
  <p class="muted">Нажми «Копировать», вставь в чат и замени <code>[ ]</code> на своё. Перевод — серым, клиенту не отправляй.</p>
  ${TEMPLATES.map((g, gi) => `
    <h2>${esc(g.group)}</h2>
    <div class="stack">
      ${g.items.map((it, ii) => `
        <div class="card tpl">
          <div class="row"><h3 style="margin:0">${esc(it.t)}</h3><span class="spacer"></span><button class="btn small" data-act="copy" data-g="${gi}" data-i="${ii}">Копировать</button></div>
          <pre>${esc(fillTpl(it.text))}</pre>
          ${it.tr ? `<div class="tr">${esc(it.tr)}</div>` : ''}
        </div>`).join('')}
    </div>`).join('')}

  <h2>🚩 Красные флаги — не бери такие заказы</h2>
  <div class="card stack small">
    <div>• Просит оплатить <b>после</b> работы или «сначала покажи финал»</div>
    <div>• Хочет платить через PayPal <b>Friends &amp; Family</b>, картой, подарочными картами, чеками</div>
    <div>• «Я перешлю больше, а ты верни разницу» — <b>это скам</b></div>
    <div>• Просит код/ссылку «для проверки аккаунта» или скачать файл</div>
    <div>• «I'm interested in your art, contact me on WhatsApp/email» без деталей</div>
  </div>`;

/* ---------- settings ---------- */

const openSecs = new Set(['me']);   // which <details> sections are expanded
const sec = (id, title, body, note = '') => `
  <details class="card sec" data-sec="${id}" ${openSecs.has(id) ? 'open' : ''}>
    <summary><span>${title}</span>${note ? `<span class="muted small">${note}</span>` : ''}</summary>
    <div class="sec-body">${body}</div>
  </details>`;

/* An input bound to a path inside the site draft, e.g. data-sp="prices.2.name". */
const sp = (path, val, { type = 'text', ph = '', cls = '', attrs = '' } = {}) =>
  `<input data-sp="${path}" data-t="${type === 'number' ? 'num' : 'text'}" type="${type}" value="${esc(val ?? '')}" placeholder="${esc(ph)}" class="${cls}" ${type === 'number' ? 'inputmode="decimal" step="any"' : ''} ${attrs}>`;

function siteEditor() {
  const d = siteDraft;
  const t = d.terms || (d.terms = {});
  const cur = d.currency || '$';

  const main = `
    <label class="switch"><input type="checkbox" data-sp="open" data-t="bool" ${d.open ? 'checked' : ''}><span>Комишки <b>открыты</b> (если выключить — страница покажет CLOSED и спрячет форму)</span></label>
    <div class="form-grid" style="margin-top:10px">
      <div><label>Имя / ник</label>${sp('name', d.name)}</div>
      <div><label>Валюта</label>${sp('currency', d.currency, { ph: '$' })}</div>
      <div class="full"><label>Подзаголовок</label>${sp('tagline', d.tagline)}</div>
      <div class="full"><label>Как тебя отмечать (credit)</label>${sp('credit', d.credit, { ph: '@nickname' })}</div>
    </div>`;

  const gallery = `
    <p class="muted small" style="margin-top:0">Первые картинки клиенты видят сразу — ставь лучшие наверх. «Широкая» — на две колонки (для рефов и горизонтальных работ). Фото автоматически сжимаются до 1600px.</p>
    <div class="thumbs">
      ${d.gallery.map((g, i) => `
        <div class="thumb ${g.wide ? 'wide' : ''}">
          <div class="img"><img src="${esc(g.pending || imgPreview.get(g.src) || g.src)}" alt="" loading="lazy">${g.pending ? '<span class="badge yellow new">новое</span>' : ''}</div>
          <input data-sp="gallery.${i}.alt" data-t="text" value="${esc(g.alt || '')}" placeholder="Подпись (необязательно)">
          <div class="row tools">
            <button class="btn small ghost" data-act="img-move" data-i="${i}" data-dir="-1" ${i === 0 ? 'disabled' : ''} title="Раньше">↑</button>
            <button class="btn small ghost" data-act="img-move" data-i="${i}" data-dir="1" ${i === d.gallery.length - 1 ? 'disabled' : ''} title="Позже">↓</button>
            <label class="mini"><input type="checkbox" data-sp="gallery.${i}.wide" data-t="bool" data-rerender="1" ${g.wide ? 'checked' : ''}> широкая</label>
            <span class="spacer"></span>
            <button class="btn small ghost danger" data-act="img-del" data-i="${i}" title="Убрать">✕</button>
          </div>
        </div>`).join('')}
      <label class="thumb add">
        <input type="file" accept="image/*" multiple data-act="img-add" hidden>
        <span>＋<br>Добавить фото</span>
      </label>
    </div>`;

  const prices = `
    <div class="row" style="margin-bottom:8px"><span class="muted small">Колонки (стили):</span>
      ${d.styles.map((st) => `<span class="chip">${esc(st)} <button class="x" data-act="style-del" data-s="${esc(st)}" title="Убрать колонку">✕</button></span>`).join('')}
      <span class="row" style="gap:4px"><input id="newStyle" placeholder="напр. Flat color" style="width:150px;min-height:34px;padding:4px 10px"><button class="btn small" data-act="style-add">+ колонка</button></span>
    </div>
    <div class="stack">
      ${d.prices.map((r, i) => `
        <div class="price-edit ${r.star ? 'star' : ''}">
          <div class="row">
            ${sp(`prices.${i}.name`, r.name, { ph: 'Название', cls: 'grow' })}
            <button class="btn small ghost" data-act="price-move" data-i="${i}" data-dir="-1" ${i === 0 ? 'disabled' : ''}>↑</button>
            <button class="btn small ghost" data-act="price-move" data-i="${i}" data-dir="1" ${i === d.prices.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="btn small ghost danger" data-act="price-del" data-i="${i}">✕</button>
          </div>
          ${sp(`prices.${i}.desc`, r.desc, { ph: 'Описание (необязательно)' })}
          <div class="row">
            ${d.styles.map((st) => `<label class="pr"><span>${esc(st)}, ${esc(cur)}</span>${sp(`prices.${i}.prices.${st}`, r.prices && r.prices[st], { type: 'number', ph: '—' })}</label>`).join('')}
            <label class="mini"><input type="checkbox" data-sp="prices.${i}.star" data-t="bool" data-rerender="1" ${r.star ? 'checked' : ''}> ⭐ выделить</label>
          </div>
        </div>`).join('')}
    </div>
    <button class="btn small" data-act="price-add" style="margin-top:10px">+ Добавить позицию</button>
    <p class="muted small">Пустая цена = «—» (этот стиль недоступен). Эти же позиции и цены подставляются в новые заказы.</p>`;

  const extras = `
    <label>Доп. опции — по одной на строку</label>
    <textarea data-sp="extras" data-t="lines" rows="6">${esc((d.extras || []).join('\n'))}</textarea>
    <div class="form-grid" style="margin-top:10px">
      <div class="full"><label>✅ Рисую</label><textarea data-sp="willDraw" data-t="text" rows="2">${esc(d.willDraw)}</textarea></div>
      <div class="full"><label>❌ Не рисую</label><textarea data-sp="wontDraw" data-t="text" rows="2">${esc(d.wontDraw)}</textarea></div>
    </div>`;

  const terms = `
    <p class="muted small" style="margin-top:0">Эти значения подставляются в «How to order» и в правила (ToS) на странице.</p>
    <div class="form-grid">
      <div><label>Срок выполнения</label>${sp('terms.turnaround', t.turnaround, { ph: '2–4 weeks' })}</div>
      <div><label>Отвечаю в течение, часов</label>${sp('terms.replyHours', t.replyHours, { type: 'number' })}</div>
      <div><label>Бесплатных правок на скетче</label>${sp('terms.revisions', t.revisions, { type: 'number' })}</div>
      <div><label>Полная предоплата для заказов до, ${esc(cur)}</label>${sp('terms.fullUpfrontUnder', t.fullUpfrontUnder, { type: 'number' })}</div>
      <div><label>Дней на оплату счёта</label>${sp('terms.payDays', t.payDays, { type: 'number' })}</div>
      <div><label>Срочный заказ — если меньше, дней</label>${sp('terms.rushDays', t.rushDays, { type: 'number' })}</div>
      <div><label>Доплата за срочность</label>${sp('terms.rush', t.rush, { ph: '+30%' })}</div>
      <div><label>Изменения после скетча</label>${sp('terms.extraChange', t.extraChange, { ph: '+$5–15' })}</div>
      <div><label>Коммерческое использование</label>${sp('terms.commercial', t.commercial, { ph: '×2' })}</div>
      <div><label>Приватный заказ (не постить)</label>${sp('terms.privateFee', t.privateFee, { ph: '+20%' })}</div>
      <div><label>Мин. размер файла, px</label>${sp('terms.minResolution', t.minResolution, { type: 'number' })}</div>
      <div><label>Храню файлы, месяцев</label>${sp('terms.storeMonths', t.storeMonths, { type: 'number' })}</div>
    </div>`;

  const links = `
    <div class="stack">
      ${d.links.map((l, i) => `
        <div class="row">
          ${sp(`links.${i}.label`, l.label, { ph: 'Название', cls: 'lbl-in' })}
          ${sp(`links.${i}.url`, l.url, { type: 'url', ph: 'https://…', cls: 'grow' })}
          <button class="btn small ghost danger" data-act="link-del" data-i="${i}">✕</button>
        </div>`).join('')}
    </div>
    <button class="btn small" data-act="link-add" style="margin-top:10px">+ Добавить ссылку</button>
    <p class="muted small">Первые две ссылки показываются в «How to order» как куда писать в личку.</p>`;

  return [
    sec('s-main', '⚙️ Основное', main, d.open ? 'открыты' : 'закрыты'),
    sec('s-gallery', '🖼 Примеры работ', gallery, `${d.gallery.length} шт.`),
    sec('s-prices', '💲 Прайс', prices, `${d.prices.length} поз.`),
    sec('s-extras', '➕ Доп. опции и что рисую', extras),
    sec('s-terms', '📜 Условия и сроки', terms, esc(t.turnaround || '')),
    sec('s-links', '🔗 Ссылки', links, `${d.links.length}`),
  ].join('');
}

views.settings = () => {
  const c = siteConf();
  const st = data.settings;
  const clientUrl = new URL('commissions.html', location.href).href;
  if (!siteDirty || !siteDraft) siteDraft = clone(site || {});
  for (const k of ['styles', 'prices', 'extras', 'links', 'gallery']) if (!Array.isArray(siteDraft[k])) siteDraft[k] = [];

  const me = `
    <div class="form-grid">
      <div><label>Как тебя называть</label><input data-act="set" data-k="name" value="${esc(st.name || '')}"></div>
      <div><label>Слотов (заказов одновременно)</label><input type="number" min="1" max="30" data-act="set" data-k="slots" value="${esc(st.slots)}"></div>
      <div class="full"><label>Дни постов</label>
        <div class="chips">${[1, 2, 3, 4, 5, 6, 0].map((d) => `<button class="chip ${postDays().includes(d) ? 'active' : ''}" data-act="post-day" data-d="${d}">${WD[d]}</button>`).join('')}</div>
      </div>
      <div><label>Время постов</label><input data-act="set" data-k="postTime" value="${esc(st.postTime || '')}" placeholder="19:00–23:00"></div>
      <div><label>Начало контент-плана</label><input type="date" data-act="set" data-k="planStart" value="${esc(st.planStart || '')}"></div>
    </div>
    <p class="muted small">Дни постов задают календарь и контент-план: 1-й пост недели — в первый выбранный день, 2-й — во второй.</p>`;

  return `
  <h1>Настройки</h1>

  <h2>Мои параметры</h2>
  ${sec('me', '🙂 Имя, слоты, дни постов', me)}

  <div class="row" style="margin-top:1.4em"><h2 style="margin:0">Страница для клиентов</h2><span class="spacer"></span><a class="btn small" href="commissions.html" target="_blank">Открыть ↗</a></div>
  <div class="row" style="margin:10px 0"><input readonly value="${esc(clientUrl)}" style="flex:1"><button class="btn small" data-act="copy-text" data-text="${esc(clientUrl)}">Копировать ссылку</button></div>
  ${site ? `<div class="stack">${siteEditor()}</div>` : '<div class="card empty">Загружаю настройки страницы…</div>'}
  ${c ? '' : '<p class="muted small">✏️ Редактировать можно и без GitHub, но чтобы <b>опубликовать</b> изменения, подключи синхронизацию ниже.</p>'}

  <h2>Синхронизация через GitHub</h2>
  <div class="card stack">
    ${c ? `
      <div>✅ Подключено: заказы — <code>${esc(c.owner)}/${esc(c.repo)}</code>, страница — <code>${esc(c.owner)}/${esc(c.siteRepo)}</code></div>
      <div class="muted small">${esc(syncState.msg)}</div>
      <div class="row"><button class="btn primary" data-act="sync-now">Синхронизировать сейчас</button><button class="btn danger" data-act="gh-off">Отключить на этом устройстве</button></div>
      <details>
        <summary class="small"><b>Ключ подключён давно и публикация страницы не работает?</b></summary>
        <ol class="steps small">
          <li>Открой <a href="https://github.com/settings/personal-access-tokens" target="_blank" rel="noopener">github.com/settings/personal-access-tokens</a> → свой токен → <b>Edit</b>.</li>
          <li>Repository access → добавь <code>${esc(c.siteRepo)}</code> (рядом с <code>${esc(c.repo)}</code>).</li>
          <li>Permissions → <b>Contents: Read and write</b> → <b>Update</b>. Новый ключ вставлять не нужно.</li>
        </ol>
      </details>
      <details>
        <summary class="small"><b>Где лежит сайт</b> (менять, только если переносишь сайт)</summary>
        <form class="form-grid" data-act="site-loc" style="margin-top:8px">
          <div><label>Репозиторий сайта</label><input name="siteRepo" value="${esc(c.siteRepo)}" required></div>
          <div><label>Папка</label><input name="siteDir" value="${esc(c.siteDir)}"></div>
          <div class="full"><label>Ветка (из которой собирается GitHub Pages)</label><input name="siteBranch" value="${esc(c.siteBranch)}" required></div>
          <div class="full"><button class="btn small">Сохранить</button></div>
        </form>
      </details>
    ` : `
      <div>Сейчас заказы хранятся <b>только в этом браузере</b>, а изменения страницы для клиентов нельзя опубликовать. Подключи GitHub — один раз на каждом устройстве.</div>
      <details>
        <summary><b>Как подключить (один раз, ~5 минут)</b></summary>
        <ol class="steps">
          <li>Создай <b>приватный</b> репозиторий: <a href="https://github.com/new?name=Yoyo-data&visibility=private" target="_blank" rel="noopener">github.com/new</a> → имя <code>Yoyo-data</code> → <b>Private</b> → Create.</li>
          <li>Создай ключ (токен): <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">github.com/settings/personal-access-tokens/new</a>
            <ul>
              <li>Token name: <code>ToDy workspace</code></li>
              <li>Expiration: на сколько хочешь (например, 1 год)</li>
              <li>Repository access: <b>Only select repositories</b> → выбери <code>Yoyo-data</code> <b>и</b> <code>Yoyo</code></li>
              <li>Permissions → Repository permissions → <b>Contents: Read and write</b></li>
              <li>Generate token → скопируй его (начинается на <code>github_pat_</code>)</li>
            </ul>
          </li>
          <li>Вставь ключ ниже и нажми «Подключить».</li>
          <li>На телефоне открой этот же сайт и повтори шаг 3 с тем же ключом.</li>
        </ol>
        <p class="muted small">Ключ хранится только в браузере на твоём устройстве и даёт доступ только к этим двум репозиториям. Никому его не показывай. Потерял(а) телефон — удали ключ на github.com/settings/tokens.</p>
      </details>
      <form class="form-grid" data-act="gh-on">
        <div><label>Владелец (GitHub ник)</label><input name="owner" value="ToDyHehe" required></div>
        <div><label>Приватный репозиторий</label><input name="repo" value="Yoyo-data" required></div>
        <div class="full"><label>Ключ (токен)</label><input name="token" type="password" placeholder="github_pat_…" required autocomplete="off"></div>
        <div class="full"><button class="btn primary">Подключить</button></div>
      </form>
    `}
  </div>

  <h2>Резервная копия заказов</h2>
  <div class="card row">
    <button class="btn" data-act="export">Скачать данные (.json)</button>
    <label class="btn" style="margin:0; color:var(--text); font-size:inherit">Загрузить из файла<input type="file" accept="application/json" data-act="import" hidden></label>
  </div>
  <div style="height:70px"></div>`;
};

/* Bottom bar with Publish / Discard — updated without re-rendering so typing isn't interrupted. */
function updateDirtyUI() {
  let bar = document.getElementById('publishBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'publishBar';
    bar.className = 'publish-bar';
    document.body.appendChild(bar);
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || siteBusy) return;
      if (b.dataset.do === 'publish') publishSite();
      if (b.dataset.do === 'discard' && confirm('Отменить все неопубликованные изменения страницы?')) {
        siteDirty = false; siteDraft = null; render();
      }
    });
  }
  const show = tab === 'settings' && (siteDirty || siteBusy);
  bar.classList.toggle('show', !!show);
  bar.innerHTML = siteBusy
    ? `<span>⏳ ${esc(siteBusy)}</span>`
    : `<span>Есть неопубликованные изменения</span><span class="spacer"></span><button class="btn small" data-do="discard">Отменить</button><button class="btn small primary" data-do="publish">Опубликовать</button>`;
}

function markDirty() { siteDirty = true; updateDirtyUI(); }

function setPath(obj, path, val) {
  const ks = path.split('.');
  let o = obj;
  for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]] ??= {};
  o[ks[ks.length - 1]] = val;
}

/* ============================== order dialog ============================== */

const dlg = $('#orderDlg');
const form = $('#orderForm');
let editingId = null;

form.status.innerHTML = STATUSES.map((s) => `<option value="${s.id}">${s.label}</option>`).join('');

/* Order types and styles come from the price list on the client page. */
function refreshOrderSelects() {
  const types = ((site && site.prices) || []).map((r) => r.name).filter(Boolean);
  const styles = ((site && site.styles) || ['Sketch', 'Greyscale']).filter(Boolean);
  form.type.innerHTML = [...types, 'Другое'].map((t) => `<option>${esc(t)}</option>`).join('');
  form.style.innerHTML = styles.map((t) => `<option>${esc(t)}</option>`).join('');
}
refreshOrderSelects();

/* Select a value, adding it as an option if an old order uses a type/style that was renamed. */
function setSelect(sel, val) {
  if (val && ![...sel.options].some((o) => o.value === val)) sel.add(new Option(val, val));
  if (val) sel.value = val;
}

function suggestPrice() {
  const row = ((site && site.prices) || []).find((r) => r.name === form.type.value);
  const p = row && row.prices ? row.prices[form.style.value] : null;
  if (p !== null && p !== undefined && p !== '' && (form.price.dataset.auto === '1' || !form.price.value)) {
    form.price.value = p;
    form.price.dataset.auto = '1';
  }
}
form.type.addEventListener('change', suggestPrice);
form.style.addEventListener('change', suggestPrice);
form.price.addEventListener('input', () => { form.price.dataset.auto = '0'; });

function openOrder(id) {
  editingId = id;
  const o = id ? data.orders.find((x) => x.id === id) : null;
  $('#orderDlgTitle').textContent = o ? 'Заказ' : 'Новый заказ';
  $('#orderDelete').style.visibility = o ? 'visible' : 'hidden';
  form.reset();
  refreshOrderSelects();
  const types = ((site && site.prices) || []).map((r) => r.name);
  const styles = (site && site.styles) || [];
  const v = o || {
    type: types.includes('Full body') ? 'Full body' : types[0],
    style: styles.includes('Greyscale') ? 'Greyscale' : styles[styles.length - 1],
    status: 'request', canPost: 'yes',
  };
  for (const k of ['client', 'contact', 'extras', 'price', 'paid', 'status', 'deadline', 'hours', 'canPost', 'notes']) {
    if (form[k]) form[k].value = v[k] ?? '';
  }
  setSelect(form.type, v.type);
  setSelect(form.style, v.style);
  form.price.dataset.auto = o ? '0' : '1';
  if (!o) suggestPrice();
  dlg.showModal();
}

function setStatus(o, status) {
  o.status = status;
  if (status === 'done' && !o.doneDate) o.doneDate = todayISO();
  if (status !== 'done') delete o.doneDate;
  o.updated = now();
}

dlg.addEventListener('close', () => {
  if (dlg.returnValue !== 'save') return;
  const f = Object.fromEntries(new FormData(form).entries());
  let o = editingId && data.orders.find((x) => x.id === editingId);
  if (!o) { o = { id: uid(), created: now() }; data.orders.push(o); }
  const prevStatus = o.status;
  Object.assign(o, {
    client: f.client.trim(), contact: f.contact.trim(), type: f.type, style: f.style, extras: f.extras.trim(),
    price: +f.price || 0, paid: +f.paid || 0, deadline: f.deadline, hours: +f.hours || 0,
    canPost: f.canPost, notes: f.notes,
  });
  if (prevStatus !== f.status) setStatus(o, f.status);
  o.updated = now();
  save(); render();
  toast('Сохранено ✓');
});

$('#orderDelete').addEventListener('click', () => {
  const o = data.orders.find((x) => x.id === editingId);
  if (!o || !confirm(`Удалить заказ «${o.client}»?`)) return;
  Object.assign(o, { deleted: true, updated: now() });
  dlg.close('deleted');
  save(); render();
  toast('Удалено');
});

/* ============================== events ============================== */

$('#tabs').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-tab]');
  if (!b) return;
  tab = b.dataset.tab;
  try { localStorage.setItem(LS_TAB, tab); } catch {}
  render();
  window.scrollTo({ top: 0 });
});

$('#sync').addEventListener('click', () => {
  if (ghConf()) sync(); else { tab = 'settings'; render(); }
});

const view = $('#view');

view.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  if (act === 'new') openOrder(null);
  else if (act === 'edit') openOrder(el.dataset.id);
  else if (act === 'filter') { orderFilter = el.dataset.f; render(); }
  else if (act === 'copy') { const it = TEMPLATES[el.dataset.g].items[el.dataset.i]; copy(fillTpl(it.text)); }
  else if (act === 'copy-text') copy(el.dataset.text);
  else if (act === 'task-del') {
    e.preventDefault();
    const t = data.tasks.find((x) => x.id === el.dataset.id);
    if (t && confirm('Удалить задачу?')) { Object.assign(t, { deleted: true, updated: now() }); save(); render(); }
  }
  else if (act === 'plan-reset') {
    if (!confirm('Начать контент-план заново с сегодняшнего дня? Все галочки снимутся.')) return;
    const t = now();
    data.settings = { ...data.settings, planStart: todayISO(), updated: t };
    for (const k of Object.keys(data.checks)) data.checks[k] = { v: false, updated: t };
    save(); render();
  }
  else if (act === 'cal-day') {
    calSel = el.dataset.d;
    if (calSel.slice(0, 7) !== calMonth) calMonth = calSel.slice(0, 7);
    render();
  }
  else if (act === 'cal-prev' || act === 'cal-next') {
    const d = parseISO(calMonth + '-01');
    d.setMonth(d.getMonth() + (act === 'cal-next' ? 1 : -1));
    calMonth = isoOf(d).slice(0, 7);
    calSel = calMonth === todayISO().slice(0, 7) ? todayISO() : calMonth + '-01';
    render();
  }
  else if (act === 'cal-today') { calMonth = todayISO().slice(0, 7); calSel = todayISO(); render(); }
  else if (act === 'post-day') {
    const d = +el.dataset.d;
    let days = postDays();
    days = days.includes(d) ? days.filter((x) => x !== d) : [...days, d];
    if (!days.length) { toast('Нужен хотя бы один день'); return; }
    data.settings = { ...data.settings, postDays: days, updated: now() };
    save(); render();
  }
  /* ----- client page editor ----- */
  else if (act === 'img-move' || act === 'price-move') {
    const list = act === 'img-move' ? siteDraft.gallery : siteDraft.prices;
    const i = +el.dataset.i, j = i + +el.dataset.dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    markDirty(); render();
  }
  else if (act === 'img-del') {
    if (!confirm('Убрать это фото со страницы?')) return;
    siteDraft.gallery.splice(+el.dataset.i, 1);
    markDirty(); render();
  }
  else if (act === 'price-add') {
    siteDraft.prices.push({ name: 'New item', desc: '', star: false, prices: {} });
    markDirty(); render();
  }
  else if (act === 'price-del') {
    const r = siteDraft.prices[+el.dataset.i];
    if (!confirm(`Удалить «${r.name}» из прайса?`)) return;
    siteDraft.prices.splice(+el.dataset.i, 1);
    markDirty(); render();
  }
  else if (act === 'style-add') {
    const inp = $('#newStyle');
    const name = (inp.value || '').replace(/\./g, ' ').trim();
    if (!name) { inp.focus(); return; }
    if (siteDraft.styles.includes(name)) { toast('Такая колонка уже есть'); return; }
    siteDraft.styles.push(name);
    markDirty(); render();
  }
  else if (act === 'style-del') {
    const name = el.dataset.s;
    if (siteDraft.styles.length <= 1) { toast('Нужна хотя бы одна колонка'); return; }
    if (!confirm(`Убрать колонку «${name}» из прайса?`)) return;
    siteDraft.styles = siteDraft.styles.filter((x) => x !== name);
    for (const r of siteDraft.prices) if (r.prices) delete r.prices[name];
    markDirty(); render();
  }
  else if (act === 'link-add') { siteDraft.links.push({ label: '', url: '' }); markDirty(); render(); }
  else if (act === 'link-del') { siteDraft.links.splice(+el.dataset.i, 1); markDirty(); render(); }
  else if (act === 'sync-now') sync();
  else if (act === 'gh-off') {
    if (!confirm('Отключить синхронизацию на этом устройстве? Данные останутся в браузере и в репозитории.')) return;
    setGhConf(null); setSync('local'); render();
  }
  else if (act === 'export') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `tody-backup-${todayISO()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
});

view.addEventListener('change', async (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  if (act === 'status') {
    const o = data.orders.find((x) => x.id === el.dataset.id);
    if (o) { setStatus(o, el.value); save(); render(); }
  } else if (act === 'task') {
    const t = data.tasks.find((x) => x.id === el.dataset.id);
    if (t) { t.done = el.checked; t.updated = now(); save(); render(); }
  } else if (act === 'plan') {
    data.checks[el.dataset.id] = { v: el.checked, updated: now() };
    save(); render();
  } else if (act === 'set') {
    const k = el.dataset.k;
    let v = el.value;
    if (k === 'slots') v = Math.max(1, Math.min(30, +v || 1));
    if (k === 'planStart' && !v) v = todayISO();
    data.settings = { ...data.settings, [k]: v, updated: now() };
    save();
    toast('Сохранено ✓');
  } else if (act === 'img-add') {
    const files = [...(el.files || [])];
    el.value = '';
    if (!files.length) return;
    toast('Обрабатываю фото…');
    for (const f of files) {
      try {
        const { dataUrl, wide } = await toJpeg(f);
        siteDraft.gallery.push({ pending: dataUrl, alt: '', wide });
      } catch (err) { alert(err.message || err); }
    }
    markDirty(); render();
  } else if (act === 'import') {
    const file = el.files && el.files[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      data = merge(data, imported);
      save(); render();
      toast('Данные загружены ✓');
    } catch { toast('Не получилось прочитать файл'); }
  }
});

view.addEventListener('submit', async (e) => {
  const el = e.target.closest('form[data-act]');
  if (!el) return;
  e.preventDefault();
  const f = Object.fromEntries(new FormData(el).entries());
  if (el.dataset.act === 'task-add') {
    const text = (f.t || '').trim();
    if (!text) return;
    data.tasks.push({ id: uid(), text, done: false, updated: now() });
    save(); render();
  } else if (el.dataset.act === 'site-loc') {
    const c = ghConf();
    setGhConf({ ...c, siteRepo: f.siteRepo.trim(), siteBranch: f.siteBranch.trim(), siteDir: f.siteDir.trim().replace(/^\/+|\/+$/g, '') });
    toast('Сохранено ✓');
    siteDirty = false; siteDraft = null;
    loadSite(); render();
  } else if (el.dataset.act === 'gh-on') {
    const conf = { owner: f.owner.trim(), repo: f.repo.trim(), path: 'workspace.json', token: f.token.trim() };
    const btn = el.querySelector('button');
    btn.disabled = true; btn.textContent = 'Проверяю…';
    try {
      await ghRead(conf);
      setGhConf(conf);
      await sync();
      if (syncState.s === 'err') throw new Error(syncState.msg);
      toast('GitHub подключён ✓');
      render();
      loadSite();
    } catch (err) {
      setGhConf(null);
      setSync('local');
      btn.disabled = false; btn.textContent = 'Подключить';
      alert('Не получилось подключиться:\n' + (err.message || err));
    }
  }
});

/* site draft fields: text/number/lines update on every keystroke, checkboxes on change */
view.addEventListener('input', (e) => {
  const el = e.target.closest('[data-sp]');
  if (!el || el.dataset.t === 'bool') return;
  let v = el.value;
  if (el.dataset.t === 'num') v = v.trim() === '' ? null : Number(v);
  if (el.dataset.t === 'lines') v = v.split('\n').map((x) => x.trim()).filter(Boolean);
  setPath(siteDraft, el.dataset.sp, v);
  markDirty();
});
view.addEventListener('change', (e) => {
  const el = e.target.closest('[data-sp][data-t="bool"]');
  if (!el) return;
  setPath(siteDraft, el.dataset.sp, el.checked);
  markDirty();
  if (el.dataset.rerender) render();
});
view.addEventListener('toggle', (e) => {
  const d = e.target;
  if (!d.dataset || !d.dataset.sec) return;
  if (d.open) openSecs.add(d.dataset.sec); else openSecs.delete(d.dataset.sec);
}, true);
window.addEventListener('beforeunload', (e) => {
  if (siteDirty) { e.preventDefault(); e.returnValue = ''; }
});

/* pull fresh data when coming back to the tab (e.g. phone → PC) */
document.addEventListener('visibilitychange', () => { if (!document.hidden && ghConf()) sync(); });

/* ============================== boot ============================== */

setSync(ghConf() ? 'busy' : 'local');
render();
if (ghConf()) sync();
loadSite();
