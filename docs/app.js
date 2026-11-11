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

const PRICES = {
  'Doodle': { Sketch: 8 },
  'Bust': { Sketch: 12, Greyscale: 18 },
  'Half body': { Sketch: 18, Greyscale: 28 },
  'Full body': { Sketch: 28, Greyscale: 40 },
  'Reference sheet': { Greyscale: 75 },
  'D&D character': { Greyscale: 50 },
  'Другое': {},
};

const DEFAULT_TASKS = [
  'Завести PayPal (Kazakhstan, Business), привязать Visa/Mastercard',
  'Проверить вывод: получить $1–2 от друга и вывести на карту',
  'Перевести текст на рефах Джека, Леониды и Генри на английский',
  'Нарисовать по 1 примеру на каждую позицию прайса',
  'Обновить био в Instagram, TikTok, X, Telegram',
  'Завести Bluesky и VGen',
  'Сделать картинку-прайс (commission sheet)',
  'Поставить ссылку на страницу для клиентов в био',
  '2 недели регулярных постов',
  'Открыть 3–5 слотов 🚀',
];

const PLAN = [
  { title: 'Неделя 1 — «Кто я»', items: [
    ['Пн', 'Знакомство: коллаж из 4 лучших работ + «Hi, I\'m ToDy! I design characters 🖋». Закрепить.'],
    ['Ср', 'Реф-лист Генри Маунтайна на английском'],
    ['Пт', 'Разворот скетчбука (тушь)'],
    ['📱', 'TikTok/Reels: таймлапс любого скетча 15–30 сек'],
  ]},
  { title: 'Неделя 2 — «Мой мир»', items: [
    ['Пн', 'Реф Джека Инкблада (EN) + «He\'s from my project Turn the Lights Off»'],
    ['Ср', 'Пачка дудлов-стикеров + «Should I make these into commissions?»'],
    ['Пт', 'D&D-арт (Escape the Legion) + «Tell me about your character 👇»'],
    ['📱', 'TikTok: «Drawing my D&D character» — процесс'],
  ]},
  { title: 'Неделя 3 — Открытие комишек 🚀', items: [
    ['Пн', '«Commissions OPEN — 5 slots» + commission sheet. Закрепить.'],
    ['Ср', 'Пример реф-листа + «This could be YOUR OC 📋»'],
    ['Пт', 'WIP первого заказа (если клиент разрешил) или новый скетч'],
    ['📱', 'TikTok: «POV: you commission me»'],
  ]},
  { title: 'Неделя 4 — Доверие', items: [
    ['Пн', 'Готовый заказ + скрин отзыва клиента'],
    ['Ср', 'Процесс: скетч → лайн → тени (карусель)'],
    ['Пт', '«2 slots left!» или «Slots full, thank you! ❤️»'],
    ['📱', 'TikTok: before/after — референс клиента → твой арт'],
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
    { t: 'Открытие комишек', text: '🖋 COMMISSIONS OPEN 🖋\n5 slots · greyscale & sketch · OCs, D&D characters, ref sheets\nPrices start at $8!\nInfo ↓ [link]\nRTs are super appreciated ❤️' },
    { t: 'Реф-лист', text: 'Reference sheet for [Name] — [one line about the character] 📋\nWant one for your OC? Commissions are open ↓' },
    { t: 'Скетчбук', text: 'some sketchbook pages from this week ✏️ which one is your favourite?' },
    { t: 'D&D', text: 'My [class] from our campaign "[name]" 🐉\nDo you want me to draw YOUR character? DM me!' },
    { t: 'Готовый заказ', text: 'Commission for @[client] — thank you so much! ❤️\n[Character name] was so fun to draw!\nSlots: [X/5] left' },
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
const todayISO = () => new Date().toISOString().slice(0, 10);
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
    settings: { slots: 5, planStart: todayISO(), updated: 0 },
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

async function gh(conf, method, body) {
  const url = `https://api.github.com/repos/${encodeURIComponent(conf.owner)}/${encodeURIComponent(conf.repo)}/contents/${conf.path.split('/').map(encodeURIComponent).join('/')}`;
  const res = await fetch(method === 'GET' ? url + '?t=' + now() : url, {
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

function planWeek() {
  const start = new Date((data.settings.planStart || todayISO()) + 'T00:00:00');
  const diff = Math.floor((new Date(todayISO() + 'T00:00:00') - start) / 86400000);
  return Math.min(PLAN.length - 1, Math.max(0, Math.floor(diff / 7)));
}

/* ============================== views ============================== */

const views = {};
let tab = (() => { try { return localStorage.getItem(LS_TAB) || 'home'; } catch { return 'home'; } })();
let orderFilter = 'active';

function render() {
  if (!views[tab]) tab = 'home';
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  $('#view').innerHTML = views[tab]();
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
  <h1>Привет, ToDy 👋</h1>
  <div class="grid stats">
    <div class="card stat"><div class="num">${s.active.length}</div><div class="lbl">активных заказов</div></div>
    <div class="card stat accent"><div class="num">${s.slotsLeft}/${esc(data.settings.slots)}</div><div class="lbl">свободных слотов</div></div>
    <div class="card stat"><div class="num">${money(s.monthIncome)}</div><div class="lbl">сдано за этот месяц</div></div>
    <div class="card stat"><div class="num">${money(s.awaiting)}</div><div class="lbl">ещё должны заплатить</div></div>
    <div class="card stat"><div class="num">${s.perHour == null ? '—' : money(s.perHour)}</div><div class="lbl">в среднем за час</div></div>
    <div class="card stat"><div class="num">${money(s.totalPaid)}</div><div class="lbl">получено всего</div></div>
  </div>

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
  return PLAN[w].items.map(([day, text], i) => {
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
  <p class="muted">3 поста в неделю + короткие видео. Лучшее время для англоязычной аудитории — <b>19:00–23:00 по Астане</b>. Каждый пост: картинка + 1–2 предложения + 3–5 хэштегов.</p>
  <div class="row"><span class="muted small">План начат: ${esc(data.settings.planStart)}</span><span class="spacer"></span><button class="btn small" data-act="plan-reset">Начать заново с сегодня</button></div>
  ${PLAN.map((w, i) => `
    <div class="card" style="margin-top:12px; ${i === wk ? 'border-color: var(--accent)' : ''}">
      <div class="row"><h3 style="margin:0">${esc(w.title)}</h3>${i === wk ? '<span class="badge red">сейчас</span>' : ''}</div>
      ${planItems(i)}
    </div>`).join('')}

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
          <pre>${esc(it.text)}</pre>
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

views.settings = () => {
  const c = ghConf();
  const clientUrl = new URL('commissions.html', location.href).href;
  return `
  <h1>Настройки</h1>

  <h2>Страница для клиентов</h2>
  <div class="card stack">
    <div>Публичная страница на английском: прайс, примеры, правила. Ставь эту ссылку в био.</div>
    <div class="row"><input readonly value="${esc(clientUrl)}" style="flex:1"><button class="btn small" data-act="copy-text" data-text="${esc(clientUrl)}">Копировать</button><a class="btn small" href="commissions.html" target="_blank">Открыть</a></div>
  </div>

  <h2>Слоты</h2>
  <div class="card row">
    <label style="margin:0">Сколько заказов одновременно</label>
    <span class="spacer"></span>
    <input type="number" min="1" max="30" value="${esc(data.settings.slots)}" data-act="slots" style="width:90px">
  </div>

  <h2>Синхронизация через GitHub</h2>
  <div class="card stack">
    ${c ? `
      <div>✅ Подключено: <code>${esc(c.owner)}/${esc(c.repo)}</code> → <code>${esc(c.path)}</code></div>
      <div class="muted small">${esc(syncState.msg)}</div>
      <div class="row"><button class="btn primary" data-act="sync-now">Синхронизировать сейчас</button><button class="btn danger" data-act="gh-off">Отключить на этом устройстве</button></div>
    ` : `
      <div>Сейчас данные хранятся <b>только в этом браузере</b>. Подключи GitHub, чтобы заказы были одинаковые на телефоне и ПК.</div>
      <details>
        <summary><b>Как подключить (один раз, ~5 минут)</b></summary>
        <ol class="steps">
          <li>Создай <b>приватный</b> репозиторий: <a href="https://github.com/new?name=Yoyo-data&visibility=private" target="_blank" rel="noopener">github.com/new</a> → имя <code>Yoyo-data</code> → <b>Private</b> → Create.</li>
          <li>Создай токен: <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">github.com/settings/personal-access-tokens/new</a>
            <ul>
              <li>Token name: <code>ToDy workspace</code></li>
              <li>Expiration: на сколько хочешь (например, 1 год)</li>
              <li>Repository access: <b>Only select repositories</b> → <code>Yoyo-data</code></li>
              <li>Permissions → Repository permissions → <b>Contents: Read and write</b></li>
              <li>Generate token → скопируй его (начинается на <code>github_pat_</code>)</li>
            </ul>
          </li>
          <li>Вставь токен ниже и нажми «Подключить».</li>
          <li>На телефоне открой этот же сайт и повтори шаг 3 с тем же токеном.</li>
        </ol>
        <p class="muted small">Токен хранится только в браузере на твоём устройстве и даёт доступ только к <code>Yoyo-data</code>. Никому его не показывай. Если потеряешь телефон — удали токен на github.com/settings/tokens.</p>
      </details>
      <form class="form-grid" data-act="gh-on">
        <div><label>Владелец (GitHub ник)</label><input name="owner" value="ToDyHehe" required></div>
        <div><label>Приватный репозиторий</label><input name="repo" value="Yoyo-data" required></div>
        <div class="full"><label>Токен</label><input name="token" type="password" placeholder="github_pat_…" required autocomplete="off"></div>
        <div class="full"><button class="btn primary">Подключить</button></div>
      </form>
    `}
  </div>

  <h2>Резервная копия</h2>
  <div class="card row">
    <button class="btn" data-act="export">Скачать данные (.json)</button>
    <label class="btn" style="margin:0; color:var(--text); font-size:inherit">Загрузить из файла<input type="file" accept="application/json" data-act="import" hidden></label>
  </div>`;
};

/* ============================== order dialog ============================== */

const dlg = $('#orderDlg');
const form = $('#orderForm');
let editingId = null;

form.type.innerHTML = Object.keys(PRICES).map((t) => `<option>${t}</option>`).join('');
form.status.innerHTML = STATUSES.map((s) => `<option value="${s.id}">${s.label}</option>`).join('');

function suggestPrice() {
  const p = PRICES[form.type.value] && PRICES[form.type.value][form.style.value];
  if (p != null && (form.price.dataset.auto === '1' || !form.price.value)) {
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
  const v = o || { type: 'Full body', style: 'Greyscale', status: 'request', canPost: 'yes' };
  for (const k of ['client', 'contact', 'type', 'style', 'extras', 'price', 'paid', 'status', 'deadline', 'hours', 'canPost', 'notes']) {
    if (form[k]) form[k].value = v[k] ?? '';
  }
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
  else if (act === 'copy') { const it = TEMPLATES[el.dataset.g].items[el.dataset.i]; copy(it.text); }
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
  } else if (act === 'slots') {
    data.settings = { ...data.settings, slots: Math.max(1, +el.value || 1), updated: now() };
    save();
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
    } catch (err) {
      setGhConf(null);
      setSync('local');
      btn.disabled = false; btn.textContent = 'Подключить';
      alert('Не получилось подключиться:\n' + (err.message || err));
    }
  }
});

/* pull fresh data when coming back to the tab (e.g. phone → PC) */
document.addEventListener('visibilitychange', () => { if (!document.hidden && ghConf()) sync(); });

/* ============================== boot ============================== */

setSync(ghConf() ? 'busy' : 'local');
render();
if (ghConf()) sync();
