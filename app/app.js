/* Merecido — recompensas por hábitos (PWA, dados só no aparelho) */
(() => {
'use strict';

// ---------- utilidades ----------
const KEY = 'merecido.v1';
const DAY = 864e5;
const $ = s => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const localDate = d => { const z = new Date(d); z.setMinutes(z.getMinutes() - z.getTimezoneOffset()); return z.toISOString().slice(0, 10); };
const today = () => localDate(new Date());
const parseD = ds => new Date(ds + 'T12:00:00');
const addDays = (ds, n) => { const d = parseD(ds); d.setDate(d.getDate() + n); return localDate(d); };
const weekStart = ds => { const d = parseD(ds); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return localDate(d); };
const dnum = ds => Math.round(Date.parse(ds + 'T00:00:00Z') / DAY);
const weekday = ds => parseD(ds).getDay();
const num = (n, max = 2) => Number(n || 0).toLocaleString('pt-BR', { maximumFractionDigits: max });
const plural = (w, n) => {
  if (!w) return '';
  if (Math.abs(n) === 1) return w;
  if (/ão$/.test(w)) return w.replace(/ão$/, 'ões');
  if (/[aeiouáéíóúê]$/i.test(w)) return w + 's';
  return w;
};
const fmtMin = m => {
  const neg = m < 0; m = Math.round(Math.abs(m));
  const h = Math.floor(m / 60), mm = m % 60;
  const s = h ? `${h}h${mm ? ` ${String(mm).padStart(2, '0')}min` : ''}` : `${mm}min`;
  return (neg ? '−' : '') + s;
};
const fmtClock = ms => {
  const neg = ms < 0; let s = Math.floor(Math.abs(ms) / 1000);
  const h = Math.floor(s / 3600); s %= 3600; const m = Math.floor(s / 60); s %= 60;
  return (neg ? '−' : '') + `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
const fmtQty = (g, n) => `${num(n)} ${plural(g.unit, n)}`;
const isMoney = r => r.type === 'item' && /^r\$$/i.test(r.unit.trim());
const fmtR = (r, n) => {
  if (r.type === 'time') return fmtMin(n);
  if (isMoney(r)) return (n < 0 ? '−' : '') + 'R$ ' + Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${num(n)} ${plural(r.unit, n)}`;
};
const fmtDate = ds => {
  const t = today();
  if (ds === t) return 'Hoje';
  if (ds === addDays(t, -1)) return 'Ontem';
  return parseD(ds).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
};
const WD = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const WDN = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const COLORS = ['#ff9f43', '#5fe3b0', '#8f7bff', '#4cc3ff', '#ff5e62', '#ffc35a', '#ff7ac6', '#a3e05f'];
const EMOJIS = ['🏃', '🚴', '🏊', '🏋️', '🧘', '🚶', '🥗', '💧', '📚', '📖', '✍️', '🧠', '💻', '🎸', '🧹', '😴',
  '🎮', '📺', '🍔', '🍫', '🍕', '🍺', '☕', '🛍️', '💸', '🎬', '📱', '🎧', '🏖️', '🎟️', '🍦', '🎁'];

// ---------- ícones ----------
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><circle cx="16" cy="14.5" r="1.2"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3"/>',
  down: '<path d="M12 4v12M6 11l6 6 6-6M4 20h16"/>',
  up: '<path d="M12 20V8M6 13l6-6 6 6M4 4h16"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20a6.5 6.5 0 0 0-4-6"/>',
  phone: '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M11 18.5h2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8S10.5 3 8 4s.5 4 4 4zM12 8s1.5-5 4-4-.5 4-4 4z"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.9-3.9M4 4v4h4M4 13a8 8 0 0 0 14.9 3.9M20 20v-4h-4"/>',
};
const ic = (n, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24">${P[n]}</svg>`;

// ---------- estado ----------
const blank = () => ({
  v: 1, created: Date.now(), profile: { name: '', onboarded: false, theme: 'auto' },
  goals: [], rewards: [], entries: [], ledger: [], timers: {}, ach: {},
  settings: { pin: null, lastBackup: null, alerted: {} },
});
let S;
try { S = JSON.parse(localStorage.getItem(KEY)) || blank(); } catch { S = blank(); }
S = Object.assign(blank(), S);
S.settings = Object.assign(blank().settings, S.settings);
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Não foi possível salvar: ' + e.message); } };
const goal = id => S.goals.find(g => g.id === id);
const reward = id => S.rewards.find(r => r.id === id);
const activeGoals = () => S.goals.filter(g => !g.archived);

// ---------- motor de recompensas ----------
function dayTotals(g) {
  const m = {};
  for (const e of S.entries) if (e.goalId === g.id) m[e.date] = (m[e.date] || 0) + e.amount;
  return m;
}
function streakOf(days) {
  const set = new Set(Object.keys(days).filter(d => days[d] > 0));
  let cur = 0, d = today();
  if (!set.has(d)) d = addDays(d, -1);
  while (set.has(d)) { cur++; d = addDays(d, -1); }
  let best = 0, run = 0, prev = null;
  for (const x of [...set].sort()) { run = prev && dnum(x) - dnum(prev) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = x; }
  return { cur, best, doneToday: set.has(today()) };
}
function weekTotal(g, ws = weekStart(today())) {
  let t = 0; const end = addDays(ws, 6);
  for (const e of S.entries) if (e.goalId === g.id && e.date >= ws && e.date <= end) t += e.amount;
  return t;
}

// eventos derivados das metas (não ficam salvos: apagar um registro desfaz o bônus)
function earnEvents() {
  const ev = [];
  for (const g of S.goals) {
    const r = reward(g.rewardId); if (!r) continue;
    const rate = g.gain / (g.per || 1);
    const entries = S.entries.filter(e => e.goalId === g.id).sort((a, b) => a.date.localeCompare(b.date) || a.ts - b.ts);
    for (const e of entries) {
      let amt = e.amount * rate, tag = '';
      if (g.mult?.on && g.mult.factor > 1 && g.mult.days.includes(weekday(e.date))) { amt *= g.mult.factor; tag = ` · ×${num(g.mult.factor)}`; }
      ev.push({ rid: r.id, date: e.date, ts: e.ts, amount: amt, kind: 'earn', icon: g.emoji, label: `${g.name}: ${fmtQty(g, e.amount)}${tag}`, goalId: g.id, entryId: e.id });
    }
    const days = dayTotals(g), sorted = Object.keys(days).sort();
    // meta semanal
    if (g.weekly?.on && g.weekly.target > 0 && g.weekly.bonus > 0) {
      const acc = {};
      for (const d of sorted) {
        const w = weekStart(d), before = acc[w] || 0; acc[w] = before + days[d];
        if (before < g.weekly.target && acc[w] >= g.weekly.target)
          ev.push({ rid: r.id, date: d, ts: parseD(d).getTime() + 1, amount: g.weekly.bonus, kind: 'bonus', icon: '🎯', label: `Meta semanal: ${g.name}`, goalId: g.id });
      }
    }
    // sequência
    if (g.streak?.on && g.streak.every > 0 && g.streak.bonus > 0) {
      let run = 0, prev = null;
      for (const d of sorted) {
        if (!(days[d] > 0)) continue;
        run = prev && dnum(d) - dnum(prev) === 1 ? run + 1 : 1; prev = d;
        if (run % g.streak.every === 0)
          ev.push({ rid: r.id, date: d, ts: parseD(d).getTime() + 2, amount: g.streak.bonus, kind: 'bonus', icon: '🔥', label: `Sequência de ${run} dias: ${g.name}`, goalId: g.id });
      }
    }
    // penalidade: semana fechada abaixo da meta
    if (g.penalty?.on && g.penalty.amount > 0 && g.weekly?.target > 0) {
      const curW = weekStart(today());
      for (let w = weekStart(localDate(g.created || Date.now())); w < curW; w = addDays(w, 7)) {
        const t = weekTotal(g, w);
        if (t < g.weekly.target) {
          const end = addDays(w, 6);
          ev.push({ rid: r.id, date: end, ts: parseD(end).getTime() + 3, amount: -g.penalty.amount, kind: 'penalty', icon: '⚠️', label: `Meta não batida: ${g.name} (${fmtQty(g, t)} de ${num(g.weekly.target)})`, goalId: g.id });
        }
      }
    }
  }
  return ev;
}
const KIND = { spend: '⏯️', redeem: '🎁', adjust: '✏️' };
function ledgerEvents() {
  return S.ledger.map(l => ({ rid: l.rid, date: l.date, ts: l.ts, amount: l.amount, kind: l.kind, icon: l.kind === 'redeem' ? (reward(l.rid)?.emoji || '🎁') : KIND[l.kind] || '•', label: l.note || ({ spend: 'Tempo usado', redeem: 'Resgate', adjust: 'Correção manual' })[l.kind], id: l.id }));
}
let _cache = null;
const invalidate = () => { _cache = null; };
function allEvents() {
  if (!_cache) _cache = [...earnEvents(), ...ledgerEvents()];
  return _cache;
}
// saldo com validade (FIFO: gasta primeiro o que vence primeiro)
function computeReward(r) {
  const ev = allEvents().filter(e => e.rid === r.id).sort((a, b) => a.date.localeCompare(b.date) || a.ts - b.ts);
  const exp = r.expiry > 0 ? r.expiry : 0;
  let lots = [], debt = 0, expired = 0, earned = 0, spent = 0;
  const expireBefore = dn => { if (!exp) return; for (const l of lots) if (l.rem > 0 && l.dn + exp <= dn) { expired += l.rem; l.rem = 0; } lots = lots.filter(l => l.rem > 1e-9); };
  for (const e of ev) {
    const dn = dnum(e.date);
    expireBefore(dn);
    if (e.amount > 0) {
      earned += e.amount;
      let a = e.amount;
      if (debt > 0) { const p = Math.min(debt, a); debt -= p; a -= p; }
      if (a > 0) lots.push({ dn, rem: a });
    } else {
      spent += -e.amount;
      let a = -e.amount;
      for (const l of lots) { if (a <= 0) break; const p = Math.min(l.rem, a); l.rem -= p; a -= p; }
      lots = lots.filter(l => l.rem > 1e-9);
      debt += a;
    }
  }
  expireBefore(dnum(today()));
  let bal = lots.reduce((s, l) => s + l.rem, 0) - debt;
  let soon = null;
  if (exp) {
    const t = dnum(today()); const amt = lots.filter(l => l.dn + exp - t <= 3).reduce((s, l) => s + l.rem, 0);
    if (amt > 0) soon = { amount: amt, days: Math.min(...lots.filter(l => l.dn + exp - t <= 3).map(l => l.dn + exp - t)) };
  }
  let live = 0;
  if (r.type === 'time' && S.timers[r.id]) live = (Date.now() - S.timers[r.id]) / 60000;
  return { bal: bal - live, earned, spent, expired, soon, live, events: ev };
}

// ---------- conquistas ----------
const ACH = [
  { id: 'first', ic: '👣', t: 'Primeiro passo', d: 'Fez o 1º registro', ok: () => S.entries.length > 0 },
  { id: 'redeem', ic: '🏆', t: 'Merecido!', d: 'Usou uma recompensa', ok: () => S.ledger.some(l => l.kind === 'spend' || l.kind === 'redeem') },
  { id: 'week', ic: '🎯', t: 'Meta batida', d: 'Bateu uma meta semanal', ok: () => allEvents().some(e => e.label.startsWith('Meta semanal')) },
  { id: 's7', ic: '🔥', t: 'Semana firme', d: '7 dias seguidos', ok: () => S.goals.some(g => streakOf(dayTotals(g)).best >= 7) },
  { id: 's30', ic: '💎', t: 'Mês de ferro', d: '30 dias seguidos', ok: () => S.goals.some(g => streakOf(dayTotals(g)).best >= 30) },
  { id: 'weeks5', ic: '📈', t: 'Constância', d: '5 metas semanais', ok: () => allEvents().filter(e => e.label.startsWith('Meta semanal')).length >= 5 },
  { id: 'multi', ic: '🧩', t: 'Multitarefa', d: '3 objetivos ativos', ok: () => activeGoals().length >= 3 },
  { id: 'e50', ic: '🏅', t: 'Meio cento', d: '50 registros', ok: () => S.entries.length >= 50 },
  { id: 'early', ic: '🌅', t: 'Madrugador', d: 'Registro antes das 7h', ok: () => S.entries.some(e => e.date === localDate(e.ts) && new Date(e.ts).getHours() < 7) },
  { id: 'backup', ic: '🛟', t: 'Precavido', d: 'Fez um backup', ok: () => !!S.settings.lastBackup },
  { id: 'family', ic: '🔐', t: 'Combinado', d: 'Ativou o PIN da família', ok: () => !!S.settings.pin },
  { id: 'saver', ic: '🐷', t: 'Poupador', d: 'Juntou 10h de tempo', ok: () => S.rewards.some(r => r.type === 'time' && computeReward(r).bal >= 600) },
];
function checkAch(quiet) {
  let got = [];
  for (const a of ACH) if (!S.ach[a.id] && a.ok()) { S.ach[a.id] = Date.now(); got.push(a); }
  if (got.length) { save(); if (!quiet) got.forEach((a, i) => setTimeout(() => { toast(`${a.ic} Conquista: <b>${esc(a.t)}</b>`, 'gold'); confetti(); }, 400 + i * 900)); }
}

// ---------- modelos prontos ----------
const TEMPLATES = [
  { id: 'run', title: 'Corrida → Games', desc: '1 km = 1h de jogo · meta de 15 km/semana dá +2h',
    goal: { name: 'Correr', emoji: '🏃', unit: 'km', mode: 'qty', step: 1, per: 1, gain: 60, color: COLORS[0], weekly: { on: true, target: 15, bonus: 120 } },
    reward: { name: 'Videogame', emoji: '🎮', type: 'time', unit: 'min' } },
  { id: 'diet', title: 'Dieta → Fast-food', desc: '3 dias comendo bem = 1 lanche livre · 7 dias seguidos dá +1',
    goal: { name: 'Comer saudável', emoji: '🥗', unit: 'dia', mode: 'check', step: 1, per: 3, gain: 1, color: COLORS[1], streak: { on: true, every: 7, bonus: 1 } },
    reward: { name: 'Lanche livre', emoji: '🍔', type: 'item', unit: 'vale' } },
  { id: 'study', title: 'Estudo → Séries', desc: '1h de estudo = 30 min de série · 5h na semana dá +1h',
    goal: { name: 'Estudar', emoji: '📚', unit: 'min', mode: 'qty', step: 25, per: 60, gain: 30, color: COLORS[2], weekly: { on: true, target: 300, bonus: 60 } },
    reward: { name: 'Séries', emoji: '📺', type: 'time', unit: 'min' } },
  { id: 'read', title: 'Leitura → Compras', desc: '10 páginas = R$ 2 para gastar no que quiser',
    goal: { name: 'Ler', emoji: '📖', unit: 'página', mode: 'qty', step: 10, per: 10, gain: 2, color: COLORS[3], weekly: { on: true, target: 100, bonus: 10 } },
    reward: { name: 'Mimos', emoji: '🛍️', type: 'item', unit: 'R$' } },
  { id: 'gym', title: 'Treino → Doce', desc: 'Cada treino = 1 doce · treino no fim de semana vale dobrado',
    goal: { name: 'Treinar', emoji: '🏋️', unit: 'treino', mode: 'check', step: 1, per: 1, gain: 1, color: COLORS[4], mult: { on: true, days: [0, 6], factor: 2 } },
    reward: { name: 'Doce', emoji: '🍫', type: 'item', unit: 'doce' } },
  { id: 'phone', title: 'Menos celular → Rolê', desc: 'Dia sem redes antes de dormir = R$ 5 para o fim de semana',
    goal: { name: 'Noite sem celular', emoji: '😴', unit: 'noite', mode: 'check', step: 1, per: 1, gain: 5, color: COLORS[5], streak: { on: true, every: 5, bonus: 10 } },
    reward: { name: 'Rolê do fim de semana', emoji: '🎟️', type: 'item', unit: 'R$' } },
];
const goalDefaults = () => ({ id: uid(), created: Date.now(), name: '', emoji: '🎯', unit: 'vez', mode: 'qty', step: 1, per: 1, gain: 1, color: COLORS[0],
  rewardId: null, weekly: { on: false, target: 0, bonus: 0 }, streak: { on: false, every: 7, bonus: 0 }, mult: { on: false, days: [0, 6], factor: 2 }, penalty: { on: false, amount: 0 }, archived: false });
const rewardDefaults = () => ({ id: uid(), created: Date.now(), name: '', emoji: '🎁', type: 'time', unit: 'min', expiry: 0 });
function fromTemplate(t) {
  const r = Object.assign(rewardDefaults(), structuredClone(t.reward));
  const g = Object.assign(goalDefaults(), structuredClone(t.goal), { rewardId: r.id });
  for (const k of ['weekly', 'streak', 'mult', 'penalty']) g[k] = Object.assign(goalDefaults()[k], t.goal[k] || {});
  return { g, r };
}

// ---------- UI base ----------
function toast(html, cls = '') {
  const root = $('#toast-root'); while (root.children.length >= 2) root.firstChild.remove();
  const el = document.createElement('div'); el.className = 'toast ' + cls; el.innerHTML = `<span>${html}</span>`;
  root.appendChild(el); setTimeout(() => el.remove(), 3200);
}
function confetti() {
  const box = document.createElement('div'); box.className = 'confetti';
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('i');
    c.style.left = Math.random() * 100 + '%'; c.style.background = COLORS[i % COLORS.length];
    c.style.animationDelay = Math.random() * .4 + 's'; c.style.animationDuration = 1.2 + Math.random() * .9 + 's';
    box.appendChild(c);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 2600);
}
let sheetClose = null;
function openSheet(html, mount) {
  closeSheet();
  const ov = document.createElement('div'); ov.className = 'overlay';
  ov.innerHTML = `<div class="sheet" role="dialog"><div class="grab"></div>${html}</div>`;
  ov.addEventListener('click', e => { if (e.target === ov) closeSheet(); });
  $('#sheet-root').appendChild(ov);
  const sh = ov.querySelector('.sheet');
  sheetClose = () => ov.remove();
  mount && mount(sh);
  return sh;
}
function closeSheet() { sheetClose && sheetClose(); sheetClose = null; }
const confirmSheet = (title, text, okLabel, onOk, danger = true) => openSheet(`<h2>${esc(title)}</h2><p class="muted">${text}</p>
  <div class="sheet-actions"><button class="btn" data-x>Cancelar</button><button class="btn ${danger ? 'dark' : 'primary'}" data-ok>${esc(okLabel)}</button></div>`, sh => {
  sh.querySelector('[data-x]').onclick = closeSheet;
  sh.querySelector('[data-ok]').onclick = () => { closeSheet(); onOk(); };
});

// PIN do modo família: protege resgates, correções e mudanças de regra
const hashPin = p => { let h = 5381; for (const c of 'merecido:' + p) h = (h * 33 ^ c.charCodeAt(0)) >>> 0; return h.toString(36); };
let pinOkUntil = 0;
function guard(fn, why = 'Ação protegida') {
  if (!S.settings.pin || Date.now() < pinOkUntil) return fn();
  pinPad(why, p => {
    if (hashPin(p) === S.settings.pin) { pinOkUntil = Date.now() + 2 * 60 * 1000; closeSheet(); fn(); return true; }
    return false;
  });
}
function pinPad(title, onDone, sub = 'Digite o PIN do responsável') {
  let v = '';
  openSheet(`<h2 style="text-align:center">${esc(title)}</h2><p class="muted" style="text-align:center;margin:0">${esc(sub)}</p>
    <div class="pin-dots">${'<i></i>'.repeat(4)}</div>
    <div class="pinpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => k === '' ? '<span></span>' : `<button data-k="${k}">${k}</button>`).join('')}</div>`, sh => {
    const dots = [...sh.querySelectorAll('.pin-dots i')];
    const paint = () => dots.forEach((d, i) => d.classList.toggle('on', i < v.length));
    sh.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
      const k = b.dataset.k;
      if (k === '⌫') v = v.slice(0, -1); else if (v.length < 4) v += k;
      paint();
      if (v.length === 4) setTimeout(() => { if (!onDone(v)) { v = ''; paint(); sh.querySelector('.pin-dots').animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'none' }], 250); } }, 120);
    });
  });
}

// ---------- roteamento ----------
const TABS = [['hoje', 'home', 'Hoje'], ['objetivos', 'target', 'Objetivos'], ['carteira', 'wallet', 'Carteira'], ['progresso', 'chart', 'Progresso'], ['ajustes', 'gear', 'Ajustes']];
let obState = { step: 0, tpl: null, draft: null };
function route() { return (location.hash.slice(1) || 'hoje').split('/'); }
function go(h) { if (location.hash.slice(1) === h) render(); else location.hash = h; }
window.addEventListener('hashchange', () => { closeSheet(); render(); window.scrollTo(0, 0); });

function render() {
  invalidate();
  applyTheme();
  const app = $('#app'), tb = $('#tabbar');
  if (!S.profile.onboarded) { app.classList.add('no-tabs'); tb.classList.add('hidden'); app.innerHTML = viewOnboarding(); mountOnboarding(); return; }
  const [r, a] = route();
  app.classList.remove('no-tabs'); tb.classList.remove('hidden');
  tb.innerHTML = `<div class="inner">${TABS.map(([h, i, l]) => `<a href="#${h}" class="${(r === h || (r === 'objetivo' && h === 'objetivos') || (r === 'recompensa' && h === 'carteira')) ? 'on' : ''}">${ic(i)}${l}</a>`).join('')}</div>`;
  const views = { hoje: viewHome, objetivos: viewGoals, objetivo: () => viewGoal(a), carteira: viewWallet, recompensa: () => viewReward(a), progresso: viewProgress, ajustes: viewSettings, familia: viewFamily, distribuir: viewInstall };
  app.innerHTML = (views[r] || viewHome)();
  bindImport();
  tick();
}
function applyTheme() {
  const t = S.profile.theme || 'auto';
  if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = t;
}

// ---------- componentes ----------
function walletCard(r, solo) {
  const c = computeReward(r), running = !!S.timers[r.id];
  const hero = r.type === 'time';
  let bal, foot;
  if (r.type === 'time') {
    bal = running ? `<span data-clock="${r.id}">${fmtClock(c.bal * 60000)}</span>` : (() => { const m = Math.round(c.bal); const h = Math.trunc(m / 60), mm = Math.abs(m % 60); return h ? `${m < 0 && h === 0 ? '−' : ''}${h}<small>h</small> ${String(mm).padStart(2, '0')}<small>min</small>` : `${m}<small>min</small>`; })();
    foot = `<button class="play" data-act="timer" data-id="${r.id}" aria-label="${running ? 'Pausar' : 'Começar'}">${ic(running ? 'pause' : 'play')}</button>
      <div class="grow small"><b>${running ? 'Valendo! O saldo está descendo.' : 'Pronto para usar'}</b><div class="muted tiny">${running ? 'Começou às ' + new Date(S.timers[r.id]).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Toque no play quando começar'}</div></div>`;
  } else if (isMoney(r)) {
    bal = `<small style="margin:0 4px 0 0">R$</small>${Math.max(0, c.bal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    foot = `<button class="btn sm ${hero ? 'dark' : ''}" data-act="redeem" data-id="${r.id}">${ic('gift')}Usar</button><div class="grow small muted">Saldo para gastar</div>`;
  } else {
    const whole = Math.floor(c.bal + 1e-9), frac = c.bal - whole;
    bal = `${whole}<small>${esc(plural(r.unit, whole))}</small>`;
    foot = `<button class="btn sm" data-act="redeem" data-id="${r.id}" ${whole < 1 ? 'disabled' : ''}>${ic('gift')}Resgatar</button>
      <div class="grow"><div class="tiny muted" style="margin-bottom:5px">Próximo: ${Math.round(frac * 100)}%</div><div class="mini-progress"><i style="width:${Math.round(frac * 100)}%"></i></div></div>`;
  }
  return `<div class="wallet ${hero ? 'hero' : ''} ${running ? 'running' : ''} ${solo ? 'solo' : ''}">
    <a href="#recompensa/${r.id}" style="color:inherit;text-decoration:none"><div class="w-head"><span class="emoji">${r.emoji}</span><span class="ell">${esc(r.name)}</span></div>
    <div class="bal num">${bal}</div>
    ${c.soon ? `<div class="tiny" style="font-weight:600">⏳ ${fmtR(r, c.soon.amount)} vence${c.soon.days <= 0 ? ' hoje' : ` em ${c.soon.days} dia${c.soon.days > 1 ? 's' : ''}`}</div>` : `<div class="tiny muted">Ganho total: ${fmtR(r, c.earned)}</div>`}</a>
    <div class="w-foot">${foot}</div></div>`;
}
function goalRow(g) {
  const days = dayTotals(g), t = today(), todayAmt = days[t] || 0, wk = weekTotal(g), st = streakOf(days), r = reward(g.rewardId);
  const target = g.weekly?.target || 0, pct = target ? Math.min(100, wk / target * 100) : 0;
  const quick = g.mode === 'check'
    ? `<button class="qbtn ${todayAmt ? 'on' : ''}" data-act="check" data-id="${g.id}" aria-label="Feito hoje">${ic('check')}</button>`
    : `<button class="qbtn" data-act="quick" data-id="${g.id}">+${num(g.step)}</button><button class="qbtn add" data-act="log" data-id="${g.id}" aria-label="Registrar">${ic('plus')}</button>`;
  const sub = g.mode === 'check'
    ? (todayAmt ? 'Feito hoje ✓' : 'Ainda não hoje')
    : `Hoje: ${fmtQty(g, todayAmt)}`;
  return `<div class="goal" style="--gc:${g.color}">
    <a class="g-emoji" href="#objetivo/${g.id}" style="text-decoration:none">${g.emoji}</a>
    <a class="grow" href="#objetivo/${g.id}" style="color:inherit;text-decoration:none">
      <div class="row between"><span class="g-name ell">${esc(g.name)}</span>${st.cur >= 2 ? `<span class="tiny" style="color:var(--mango);font-weight:700">🔥 ${st.cur}</span>` : ''}</div>
      <div class="tiny muted ell">${sub}${target ? ` · semana ${num(wk)}/${num(target)}` : r ? ` · ${esc(r.emoji)} ${esc(r.name)}` : ''}</div>
      ${target ? `<div class="bar"><i style="width:${pct}%"></i></div>` : ''}
    </a>
    <div class="quick">${quick}</div></div>`;
}
function insights() {
  const out = [];
  for (const g of activeGoals()) {
    const r = reward(g.rewardId); if (!r) continue;
    if (g.weekly?.on && g.weekly.target > 0) {
      const wk = weekTotal(g), left = g.weekly.target - wk;
      const daysLeft = 7 - ((new Date().getDay() + 6) % 7);
      if (left > 0 && wk > 0) out.push({ ic: '🎯', t: `Faltam <b>${fmtQty(g, left)}</b> na meta de ${esc(g.name.toLowerCase())} para ganhar <b>+${fmtR(r, g.weekly.bonus)}</b> de bônus. ${daysLeft} dia${daysLeft > 1 ? 's' : ''} até domingo.` });
      if (left > 0 && g.penalty?.on && daysLeft <= 2) out.push({ warn: true, ic: '⚠️', t: `Se não bater a meta de ${esc(g.name.toLowerCase())} até domingo, perde <b>${fmtR(r, g.penalty.amount)}</b>.` });
    }
    if (g.streak?.on && g.streak.every > 0) {
      const st = streakOf(dayTotals(g));
      if (st.cur >= 2 && !st.doneToday) out.push({ ic: '🔥', t: `Sua sequência de <b>${st.cur} dia${st.cur > 1 ? 's' : ''}</b> em ${esc(g.name.toLowerCase())} acaba hoje se você não registrar.` });
      else if (st.cur > 0) { const left = g.streak.every - (st.cur % g.streak.every); if (left <= 3) out.push({ ic: '🔥', t: `Mais <b>${left} dia${left > 1 ? 's' : ''}</b> seguidos e você ganha <b>+${fmtR(r, g.streak.bonus)}</b>.` }); }
    }
    if (g.mult?.on && g.mult.days.includes(new Date().getDay())) out.push({ ic: '⚡', t: `Hoje ${esc(g.name.toLowerCase())} vale <b>×${num(g.mult.factor)}</b>!` });
  }
  for (const r of S.rewards) { const c = computeReward(r); if (c.soon) out.push({ warn: true, ic: '⏳', t: `<b>${fmtR(r, c.soon.amount)}</b> de ${esc(r.name)} ${c.soon.days <= 0 ? 'vence hoje' : `vence em ${c.soon.days} dia${c.soon.days > 1 ? 's' : ''}`}. Aproveite!` }); }
  return out.slice(0, 3);
}

// ---------- telas ----------
function greeting() { const h = new Date().getHours(); return h < 5 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }
function viewHome() {
  const goals = activeGoals();
  const best = Math.max(0, ...goals.map(g => streakOf(dayTotals(g)).cur));
  const rewards = S.rewards.filter(r => S.goals.some(g => g.rewardId === r.id && !g.archived) || computeReward(r).bal !== 0);
  const ins = insights();
  return `<header class="top"><div><div class="kicker">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      <h1>${greeting()}${S.profile.name ? ', ' + esc(S.profile.name) : ''}</h1></div>
      ${best >= 1 ? `<span class="chip flame">🔥 ${best} dia${best > 1 ? 's' : ''}</span>` : ''}</header>
    ${rewards.length ? `<div class="wallets">${rewards.map(r => walletCard(r, rewards.length === 1)).join('')}</div>` : ''}
    ${ins.length ? `<div class="list" style="margin-top:14px">${ins.map(i => `<div class="insight ${i.warn ? 'warn' : ''}"><span class="ic">${i.ic}</span><div class="small">${i.t}</div></div>`).join('')}</div>` : ''}
    <div class="section-title"><h2>Registrar</h2><a href="#objetivos">Objetivos</a></div>
    <div class="list">${goals.length ? goals.map(goalRow).join('') : `<div class="card empty"><div class="big">🎯</div><p>Nenhum objetivo ativo.</p><button class="btn primary" data-act="new-goal">${ic('plus')}Criar objetivo</button></div>`}</div>
    ${goals.length ? `<div class="section-title"><h2>Esta semana</h2></div>${weekStrip()}` : ''}`;
}
function weekStrip() {
  const ws = weekStart(today());
  const cells = [...Array(7)].map((_, i) => {
    const d = addDays(ws, i);
    const done = activeGoals().filter(g => S.entries.some(e => e.goalId === g.id && e.date === d));
    return `<div style="flex:1;text-align:center"><div class="tiny muted" style="font-weight:600">${WD[parseD(d).getDay()]}</div>
      <div style="margin-top:6px;height:46px;border-radius:14px;display:grid;place-items:center;background:${d === today() ? 'var(--surface2)' : 'var(--surface)'};border:1px solid ${d === today() ? 'var(--mango)' : 'var(--line)'};font-size:${done.length > 1 ? 13 : 18}px">${done.length ? done.map(g => g.emoji).slice(0, 3).join('') : d > today() ? '' : '<span class="faint">·</span>'}</div></div>`;
  }).join('');
  return `<div class="row" style="gap:6px">${cells}</div>`;
}

function viewGoals() {
  const goals = S.goals.filter(g => !g.archived), arch = S.goals.filter(g => g.archived);
  const card = g => {
    const r = reward(g.rewardId), st = streakOf(dayTotals(g));
    const b = [];
    if (g.weekly?.on) b.push(`<span class="badge">🎯 ${fmtQty(g, g.weekly.target)}/sem → +${r ? fmtR(r, g.weekly.bonus) : ''}</span>`);
    if (g.streak?.on) b.push(`<span class="badge">🔥 a cada ${g.streak.every} dias → +${r ? fmtR(r, g.streak.bonus) : ''}</span>`);
    if (g.mult?.on) b.push(`<span class="badge">⚡ ×${num(g.mult.factor)} ${g.mult.days.map(d => WDN[d]).join('/')}</span>`);
    if (g.penalty?.on) b.push(`<span class="badge">⚠️ −${r ? fmtR(r, g.penalty.amount) : ''} se falhar</span>`);
    if (st.cur > 1) b.push(`<span class="badge hot">🔥 ${st.cur} dias seguidos</span>`);
    return `<a class="card" href="#objetivo/${g.id}" style="display:block;color:inherit;text-decoration:none;--gc:${g.color}">
      <div class="row"><div class="goal" style="padding:0;border:0;background:none"><div class="g-emoji">${g.emoji}</div></div>
      <div class="grow"><h3>${esc(g.name)}</h3><div class="small muted">${ruleText(g, r)}</div></div>${ic('right')}</div>
      ${b.length ? `<div class="badges">${b.join('')}</div>` : ''}</a>`;
  };
  return `<header class="top"><div><div class="kicker">Seus hábitos</div><h1>Objetivos</h1></div><button class="icon-btn" data-act="new-goal" aria-label="Novo objetivo">${ic('plus')}</button></header>
    <div class="list">${goals.map(card).join('') || `<div class="card empty"><div class="big">🎯</div><p>Crie seu primeiro objetivo.</p></div>`}</div>
    <div class="section-title"><h2>Modelos prontos</h2></div>
    <div class="list">${TEMPLATES.map(t => `<button class="tpl" data-act="use-tpl" data-id="${t.id}"><div class="pair">${t.goal.emoji}<span class="arrow">→</span>${t.reward.emoji}</div><div class="grow"><b>${t.title}</b><div class="small muted">${t.desc}</div></div>${ic('plus')}</button>`).join('')}</div>
    ${arch.length ? `<div class="section-title"><h2>Arquivados</h2></div><div class="list">${arch.map(card).join('')}</div>` : ''}`;
}
function ruleText(g, r) {
  if (!r) return 'Sem recompensa';
  return `${g.mode === 'check' ? `${num(g.per)} ${plural(g.unit, g.per)}` : fmtQty(g, g.per)} = ${fmtR(r, g.gain)} de ${esc(r.name.toLowerCase())}`;
}

function barChart(vals, labels, color, fmt) {
  const W = 320, H = 130, n = vals.length, max = Math.max(1, ...vals), bw = W / n * .62;
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H + 22}">${vals.map((v, i) => {
    const h = v / max * H, x = i * W / n + (W / n - bw) / 2;
    return `<rect x="${x}" y="${H - h}" width="${bw}" height="${Math.max(h, 2)}" rx="6" fill="${v ? color : 'var(--surface2)'}" opacity="${i === n - 1 ? 1 : .8}"/>
      ${v ? `<text x="${x + bw / 2}" y="${H - h - 5}" text-anchor="middle">${fmt(v)}</text>` : ''}
      <text x="${x + bw / 2}" y="${H + 16}" text-anchor="middle">${labels[i]}</text>`;
  }).join('')}</svg></div>`;
}
function viewGoal(id) {
  const g = goal(id); if (!g) return `<a class="back" href="#objetivos">${ic('left')}Objetivos</a><div class="empty">Objetivo não encontrado.</div>`;
  const r = reward(g.rewardId), days = dayTotals(g), st = streakOf(days);
  const total = S.entries.filter(e => e.goalId === g.id).reduce((s, e) => s + e.amount, 0);
  const earned = allEvents().filter(e => e.goalId === g.id).reduce((s, e) => s + e.amount, 0);
  const ws = weekStart(today());
  const weeks = [...Array(8)].map((_, i) => addDays(ws, (i - 7) * 7));
  const wv = weeks.map(w => weekTotal(g, w));
  const entries = S.entries.filter(e => e.goalId === g.id).sort((a, b) => b.date.localeCompare(a.date) || b.ts - a.ts).slice(0, 40);
  return `<a class="back" href="#objetivos">${ic('left')}Objetivos</a>
    <header class="top"><div class="row" style="--gc:${g.color}"><div class="goal" style="padding:0;border:0;background:none"><div class="g-emoji" style="width:56px;height:56px;font-size:30px">${g.emoji}</div></div>
      <div><h1>${esc(g.name)}</h1><div class="small muted">${ruleText(g, r)}</div></div></div>
      <button class="icon-btn" data-act="edit-goal" data-id="${g.id}" aria-label="Editar">${ic('edit')}</button></header>
    <div class="stats"><div class="stat"><div class="v num">${num(total, 1)}</div><div class="l">${esc(plural(g.unit, 2))} no total</div></div>
      <div class="stat"><div class="v num">${st.cur}</div><div class="l">dias seguidos · recorde ${st.best}</div></div>
      <div class="stat"><div class="v num" style="font-size:${r && r.type === 'time' ? 20 : 24}px">${r ? fmtR(r, earned) : '—'}</div><div class="l">ganhos aqui</div></div></div>
    <button class="btn primary block" style="margin-top:14px" data-act="${g.mode === 'check' ? 'check' : 'log'}" data-id="${g.id}">${ic(g.mode === 'check' ? 'check' : 'plus')}${g.mode === 'check' ? (days[today()] ? 'Feito hoje ✓ (desfazer)' : 'Marcar hoje como feito') : 'Registrar ' + esc(plural(g.unit, 2))}</button>
    <div class="section-title"><h2>Últimas 8 semanas</h2>${g.weekly?.target ? `<span class="small muted">meta ${num(g.weekly.target)}</span>` : ''}</div>
    <div class="card">${barChart(wv, weeks.map(w => { const d = parseD(w); return `${d.getDate()}/${d.getMonth() + 1}`; }), g.color, v => num(v, 1))}</div>
    <div class="section-title"><h2>Últimos 90 dias</h2></div>
    <div class="card">${heatmap(d => days[d] || 0, g.color)}</div>
    <div class="section-title"><h2>Registros</h2></div>
    <div class="card" style="padding:4px 14px">${entries.map(e => `<div class="hist"><div class="h-ic">${g.emoji}</div><div class="grow"><div style="font-weight:600">${fmtQty(g, e.amount)}</div><div class="tiny muted ell">${fmtDate(e.date)}${e.note ? ' · ' + esc(e.note) : ''}</div></div>
      <button class="del" data-act="edit-entry" data-id="${e.id}" aria-label="Editar">${ic('edit')}</button><button class="del" data-act="del-entry" data-id="${e.id}" aria-label="Apagar">${ic('trash')}</button></div>`).join('') || '<div class="empty small">Nenhum registro ainda.</div>'}</div>`;
}
function heatmap(valFn, color) {
  const t = today(), start = addDays(weekStart(t), -12 * 7);
  const vals = []; for (let d = start; d <= addDays(weekStart(t), 6); d = addDays(d, 1)) vals.push([d, d > t ? null : valFn(d)]);
  const max = Math.max(1, ...vals.map(v => v[1] || 0));
  const cell = v => v === null ? 'transparent' : v ? `color-mix(in srgb, ${color} ${Math.round(30 + 70 * v / max)}%, var(--surface2))` : 'var(--surface2)';
  return `<div class="heat">${vals.map(([d, v]) => `<i title="${d}: ${v ?? ''}" style="background:${cell(v)}"></i>`).join('')}</div>
    <div class="heat-legend">menos <i style="background:var(--surface2)"></i><i style="background:color-mix(in srgb, ${color} 45%, var(--surface2))"></i><i style="background:color-mix(in srgb, ${color} 75%, var(--surface2))"></i><i style="background:${color}"></i> mais</div>`;
}

function viewWallet() {
  const rs = S.rewards;
  return `<header class="top"><div><div class="kicker">O que você já mereceu</div><h1>Carteira</h1></div><button class="icon-btn" data-act="new-reward" aria-label="Nova recompensa">${ic('plus')}</button></header>
    <div class="list">${rs.map(r => walletCard(r, true)).join('') || '<div class="card empty"><div class="big">🎁</div><p>Nenhuma recompensa ainda.</p></div>'}</div>
    <p class="small muted" style="margin:16px 4px">Tempo (🎮 jogo, 📺 série) tem cronômetro com play/pause. Itens e vales (🍔, 🍫, R$) você resgata quando quiser.</p>`;
}
function viewReward(id) {
  const r = reward(id); if (!r) return `<a class="back" href="#carteira">${ic('left')}Carteira</a><div class="empty">Recompensa não encontrada.</div>`;
  const c = computeReward(r), feeders = S.goals.filter(g => g.rewardId === r.id);
  const ev = [...c.events].reverse().slice(0, 80);
  return `<a class="back" href="#carteira">${ic('left')}Carteira</a>
    <header class="top"><div><div class="kicker">${r.type === 'time' ? 'Recompensa de tempo' : 'Itens e vales'}${r.expiry ? ` · vence em ${r.expiry} dias` : ''}</div><h1>${r.emoji} ${esc(r.name)}</h1></div>
      <button class="icon-btn" data-act="edit-reward" data-id="${r.id}" aria-label="Editar">${ic('edit')}</button></header>
    ${walletCard(r, true)}
    <div class="stats" style="margin-top:12px"><div class="stat"><div class="v num" style="font-size:18px">${fmtR(r, c.earned)}</div><div class="l">ganho</div></div>
      <div class="stat"><div class="v num" style="font-size:18px">${fmtR(r, c.spent)}</div><div class="l">usado / perdido</div></div>
      <div class="stat"><div class="v num" style="font-size:18px">${fmtR(r, c.expired)}</div><div class="l">expirado</div></div></div>
    <div class="row" style="margin-top:12px"><button class="btn block" data-act="adjust" data-id="${r.id}">${ic('sliders')}Corrigir saldo</button>${r.type === 'time' ? `<button class="btn block" data-act="manual-spend" data-id="${r.id}">${ic('minus')}Lançar uso</button>` : ''}</div>
    <div class="section-title"><h2>Quem alimenta</h2></div>
    <div class="list">${feeders.map(g => `<a class="card tight row" href="#objetivo/${g.id}" style="color:inherit;text-decoration:none"><span style="font-size:22px">${g.emoji}</span><div class="grow"><b>${esc(g.name)}</b><div class="small muted">${ruleText(g, r)}</div></div>${ic('right')}</a>`).join('') || '<div class="small muted">Nenhum objetivo ligado a esta recompensa.</div>'}</div>
    <div class="section-title"><h2>Histórico</h2></div>
    <div class="card" style="padding:4px 14px">${ev.map(e => `<div class="hist"><div class="h-ic">${e.icon}</div><div class="grow"><div class="ell" style="font-weight:600">${esc(e.label)}</div><div class="tiny muted">${fmtDate(e.date)}${e.kind === 'spend' && e.ts ? ' · ' + new Date(e.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</div></div>
      <span class="amt ${e.amount >= 0 ? 'pos' : 'neg'}">${e.amount >= 0 ? '+' : ''}${fmtR(r, e.amount)}</span>${e.id ? `<button class="del" data-act="del-ledger" data-id="${e.id}" aria-label="Apagar">${ic('x')}</button>` : ''}</div>`).join('') || '<div class="empty small">Nada por aqui ainda.</div>'}</div>`;
}

function viewProgress() {
  const goals = activeGoals();
  const got = Object.keys(S.ach).length;
  const best = Math.max(0, ...S.goals.map(g => streakOf(dayTotals(g)).best));
  const anyDay = d => S.entries.filter(e => e.date === d).length;
  const ws = weekStart(today());
  const weeks = [...Array(8)].map((_, i) => addDays(ws, (i - 7) * 7));
  return `<header class="top"><div><div class="kicker">Sua evolução</div><h1>Progresso</h1></div></header>
    <div class="stats"><div class="stat"><div class="v num">${S.entries.length}</div><div class="l">registros</div></div>
      <div class="stat"><div class="v num">${best}</div><div class="l">maior sequência</div></div>
      <div class="stat"><div class="v num">${got}/${ACH.length}</div><div class="l">conquistas</div></div></div>
    <div class="section-title"><h2>Constância</h2><span class="small muted">todos os objetivos</span></div>
    <div class="card">${heatmap(anyDay, 'var(--mango)')}</div>
    ${goals.map(g => `<div class="section-title"><h2>${g.emoji} ${esc(g.name)}</h2><a href="#objetivo/${g.id}">detalhes</a></div>
      <div class="card">${barChart(weeks.map(w => weekTotal(g, w)), weeks.map(w => { const d = parseD(w); return `${d.getDate()}/${d.getMonth() + 1}`; }), g.color, v => num(v, 1))}<div class="tiny muted" style="text-align:center;margin-top:4px">${esc(plural(g.unit, 2))} por semana</div></div>`).join('')}
    <div class="section-title"><h2>Conquistas</h2><button data-act="share">Compartilhar</button></div>
    <div class="ach-grid">${ACH.map(a => `<div class="ach ${S.ach[a.id] ? 'got' : ''}"><div class="a-ic">${a.ic}</div><div class="a-t">${a.t}</div><div class="a-d">${a.d}</div></div>`).join('')}</div>`;
}

function viewSettings() {
  const t = S.profile.theme || 'auto';
  const lb = S.settings.lastBackup ? Math.floor((Date.now() - S.settings.lastBackup) / DAY) : null;
  const hasOld = !!localStorage.getItem('correjoga.v1');
  return `<header class="top"><div><div class="kicker">Merecido</div><h1>Ajustes</h1></div></header>
    <div class="group"><label class="set"><div class="s-ic">🙂</div><div class="grow"><b>Seu nome</b></div><input class="input" style="width:150px;height:40px" id="nm" value="${esc(S.profile.name)}" placeholder="Opcional"></label>
      <div class="set"><div class="s-ic">${ic('sun')}</div><div class="grow"><b>Tema</b></div><div class="seg" style="width:190px">${[['auto', 'Auto'], ['light', 'Claro'], ['dark', 'Escuro']].map(([k, l]) => `<button data-act="theme" data-id="${k}" class="${t === k ? 'on' : ''}">${l}</button>`).join('')}</div></div></div>

    <div class="section-title"><h2>Família e parceiro</h2></div>
    <div class="group"><button class="set" data-act="pin">${`<div class="s-ic">${ic('lock')}</div>`}<div class="grow"><b>PIN do responsável</b><div class="small muted">${S.settings.pin ? 'Ativo: resgates, correções e regras pedem PIN' : 'Para pais e casais: só libera resgate com PIN'}</div></div>${S.settings.pin ? '<span class="pill-note">ATIVO</span>' : ic('right')}</button>
      <a class="set" href="#familia" style="color:inherit;text-decoration:none"><div class="s-ic">${ic('users')}</div><div class="grow"><b>Modo parceiro</b><div class="small muted">Aprovar resgates pelo celular de outra pessoa</div></div><span class="pill-note">EM BREVE</span></a></div>

    <div class="section-title"><h2>Seus dados</h2></div>
    <div class="group"><button class="set" data-act="export"><div class="s-ic">${ic('down')}</div><div class="grow"><b>Exportar backup</b><div class="small muted">${lb === null ? 'Você ainda não fez backup' : lb === 0 ? 'Último backup: hoje' : `Último backup há ${lb} dia${lb > 1 ? 's' : ''}`}</div></div></button>
      <label class="set"><div class="s-ic">${ic('up')}</div><div class="grow"><b>Importar backup</b><div class="small muted">Substitui os dados deste aparelho</div></div><input type="file" accept="application/json,.json" id="imp" hidden></label>
      ${hasOld ? `<button class="set" data-act="import-old"><div class="s-ic">🏃</div><div class="grow"><b>Trazer dados do Corre &amp; Joga</b><div class="small muted">Corridas, jogatinas e meta semanal</div></div></button>` : ''}
    </div>
    <p class="tiny muted" style="margin:8px 6px 0">Tudo fica só neste aparelho, sem conta e sem servidor. Faça backup de vez em quando, principalmente antes de trocar de celular.</p>

    <div class="section-title"><h2>App</h2></div>
    <div class="group"><a class="set" href="#distribuir" style="color:inherit;text-decoration:none"><div class="s-ic">${ic('phone')}</div><div class="grow"><b>Instalar no celular</b><div class="small muted">${standalone() ? 'Já instalado ✓' : 'Adicionar à Tela de Início'}</div></div>${ic('right')}</a>
      <button class="set" data-act="demo"><div class="s-ic">✨</div><div class="grow"><b>Carregar dados de exemplo</b><div class="small muted">Para ver o app cheio de vida</div></div></button>
      <button class="set" data-act="reset"><div class="s-ic" style="color:var(--coral)">${ic('trash')}</div><div class="grow"><b style="color:var(--coral)">Apagar tudo</b><div class="small muted">Recomeça do zero</div></div></button></div>
    <p class="tiny faint" style="text-align:center;margin-top:22px">Merecido · protótipo v0.1 · funciona offline</p>`;
}
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

function viewFamily() {
  return `<a class="back" href="#ajustes">${ic('left')}Ajustes</a>
    <header class="top"><div><div class="kicker">Esboço · ainda não funciona</div><h1>Modo parceiro</h1></div></header>
    <p class="muted">A ideia: outra pessoa (pai, mãe, parceiro, amigo de treino) acompanha seus objetivos e aprova os resgates pelo próprio celular. Precisa de sincronização na nuvem, então fica para depois do protótipo.</p>
    <div class="mock stack" style="margin-top:16px">
      <div class="row"><div style="width:44px;height:44px;border-radius:50%;background:var(--violet);display:grid;place-items:center;font-weight:800;color:#fff">A</div><div class="grow"><b>Ana</b><div class="small muted">Responsável · aprova resgates</div></div><span class="pill-note">convite enviado</span></div>
      <div class="card tight"><div class="small muted">Pedido de resgate · agora</div><div style="font-weight:700;margin-top:4px">🍔 Lucas quer usar 1 vale de lanche livre</div><div class="row" style="margin-top:10px"><button class="btn sm block" disabled>Recusar</button><button class="btn sm primary block" disabled>Aprovar</button></div></div>
      <div class="card tight"><div class="small muted">Objetivo compartilhado</div><div style="font-weight:700;margin-top:4px">🏃 Correr juntos 30 km na semana → 🍕 pizza a dois</div><div class="goal" style="padding:0;background:none;border:0;--gc:var(--mint)"><div class="grow"><div class="bar"><i style="width:62%"></i></div></div></div><div class="tiny muted" style="margin-top:6px">Você 11 km · Ana 7,6 km</div></div>
    </div>
    <div class="section-title"><h2>Já funciona hoje</h2></div>
    <div class="card"><b>🔐 PIN do responsável</b><p class="small muted" style="margin:6px 0 12px">No mesmo aparelho (ex.: celular ou tablet da criança), resgates, correções de saldo e mudanças de regra só acontecem com o PIN.</p><button class="btn sm" data-act="pin">${S.settings.pin ? 'Alterar ou remover PIN' : 'Criar PIN'}</button></div>`;
}

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; if (route()[0] === 'distribuir') render(); });
function viewInstall() {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return `<a class="back" href="#ajustes">${ic('left')}Ajustes</a>
    <header class="top"><div><div class="kicker">Sem App Store</div><h1>Instalar no celular</h1></div></header>
    ${standalone() ? '<div class="insight"><span class="ic">✅</span><div class="small"><b>Já está instalado.</b> Abre direto da tela de início e funciona sem internet.</div></div>' : ''}
    ${deferredPrompt ? `<button class="btn primary block" data-act="install" style="margin-bottom:14px">${ic('down')}Instalar agora</button>` : ''}
    <div class="card"><h3>📱 iPhone (Safari)</h3><ol class="small muted" style="margin:8px 0 0;padding-left:20px;line-height:1.8"><li>Abra o link no <b>Safari</b></li><li>Toque em <b>Compartilhar</b> (quadrado com seta)</li><li>Escolha <b>Adicionar à Tela de Início</b></li></ol></div>
    <div class="card" style="margin-top:10px"><h3>🤖 Android (Chrome)</h3><ol class="small muted" style="margin:8px 0 0;padding-left:20px;line-height:1.8"><li>Abra o link no <b>Chrome</b></li><li>Toque em <b>Instalar app</b> no aviso, ou no menu ⋮</li></ol></div>
    <div class="card" style="margin-top:10px"><h3>🔗 Compartilhe com alguém</h3><p class="small muted" style="margin:6px 0 12px">Cada pessoa tem os próprios dados, guardados só no aparelho dela.</p><button class="btn sm" data-act="share-app">Compartilhar link</button></div>
    ${ios ? '' : ''}`;
}

// ---------- onboarding ----------
function viewOnboarding() {
  const s = obState.step;
  const dots = `<div class="ob-steps">${[0, 1, 2].map(i => `<i class="${i <= s ? 'on' : ''}"></i>`).join('')}</div>`;
  if (s === 0) return `<div class="ob"><div class="ob-hero"><img src="icons/icon-192.png" alt=""><h1>Merecido</h1><p>Faça o que precisa. Ganhe o que quer. Cada km, página ou dia saudável vira tempo de jogo, série ou aquele lanche.</p></div>
    <div class="how"><div class="card tight"><span class="n">1</span><div class="small"><b>Escolha um hábito</b><br><span class="muted">Correr, estudar, comer bem…</span></div></div>
      <div class="card tight"><span class="n">2</span><div class="small"><b>Defina quanto ele vale</b><br><span class="muted">1 km = 1h de jogo, 3 dias = 1 lanche</span></div></div>
      <div class="card tight"><span class="n">3</span><div class="small"><b>Gaste sem culpa</b><br><span class="muted">Play no cronômetro ou resgate o vale</span></div></div></div>
    <label class="field"><span>Como você quer ser chamado? (opcional)</span><input class="input" id="ob-name" value="${esc(S.profile.name)}" placeholder="Seu nome" autocomplete="given-name"></label>
    <div class="ob-foot"><button class="btn primary block" data-act="ob-next">Começar</button>
      ${localStorage.getItem('correjoga.v1') ? `<button class="btn block" data-act="import-old">🏃 Trazer meus dados do Corre &amp; Joga</button>` : ''}
      <label class="btn ghost block">Restaurar um backup<input type="file" accept="application/json,.json" id="imp" hidden></label></div></div>`;
  if (s === 1) return `<div class="ob">${dots}<h1>O que você quer fazer mais?</h1><p class="muted">Escolha um modelo e ajuste depois, ou crie do zero.</p>
    <div class="list" style="margin-top:16px">${TEMPLATES.map(t => `<button class="tpl" data-act="ob-tpl" data-id="${t.id}"><div class="pair">${t.goal.emoji}<span class="arrow">→</span>${t.reward.emoji}</div><div class="grow"><b>${t.title}</b><div class="small muted">${t.desc}</div></div></button>`).join('')}
      <button class="tpl" data-act="ob-tpl" data-id="blank"><div class="pair">✨</div><div class="grow"><b>Criar do zero</b><div class="small muted">Qualquer hábito, qualquer recompensa</div></div></button></div>
    <div class="ob-foot"><button class="btn ghost block" data-act="ob-back">Voltar</button></div></div>`;
  return `<div class="ob">${dots}<h1>Ajuste do seu jeito</h1><p class="muted">Dá para mudar tudo depois.</p><div id="ob-form"></div>
    <div class="ob-foot"><button class="btn primary block" data-act="ob-finish">Pronto, bora!</button><button class="btn ghost block" data-act="ob-back">Voltar</button></div></div>`;
}
function mountOnboarding() {
  bindImport();
  if (obState.step === 2) { const box = $('#ob-form'); box.innerHTML = goalFormHTML(obState.draft.g, obState.draft.r, true); bindGoalForm(box, obState.draft); }
}

// ---------- formulário de objetivo ----------
function goalFormHTML(g, newR, onboarding) {
  const rOpts = S.rewards.map(r => `<option value="${r.id}" ${g.rewardId === r.id ? 'selected' : ''}>${r.emoji} ${esc(r.name)}</option>`).join('');
  const useNew = !reward(g.rewardId);
  return `
  <div class="three" style="margin-top:14px"><button class="input" data-pick-emoji style="font-size:28px;height:56px">${g.emoji}</button><label><input class="input" style="height:56px" name="name" value="${esc(g.name)}" placeholder="Ex.: Correr, Ler, Meditar"></label></div>
  <div class="emoji-grid hidden" data-emoji-grid>${EMOJIS.map(e => `<button type="button" data-e="${e}">${e}</button>`).join('')}</div>
  <div class="colors">${COLORS.map(c => `<button type="button" data-color="${c}" class="${g.color === c ? 'on' : ''}" style="background:${c}" aria-label="cor"></button>`).join('')}</div>
  <div class="field"><span>Como você registra?</span><div class="type-pick">
    <button type="button" data-mode="qty" class="${g.mode === 'qty' ? 'on' : ''}">🔢<b>Quantidade</b><span>km, páginas, minutos…</span></button>
    <button type="button" data-mode="check" class="${g.mode === 'check' ? 'on' : ''}">✅<b>Feito / não feito</b><span>1 toque por dia</span></button></div></div>
  <div class="two"><label class="field"><span>Unidade</span><input class="input" name="unit" value="${esc(g.unit)}" placeholder="km, página, dia"></label>
    <label class="field" data-only="qty"><span>Botão rápido (+)</span><input class="input" type="number" inputmode="decimal" step="any" min="0" name="step" value="${g.step}"></label></div>

  <div class="field"><span>Recompensa</span>
    ${S.rewards.length ? `<select class="input" name="rewardId">${rOpts}<option value="__new" ${useNew ? 'selected' : ''}>＋ Nova recompensa…</option></select>` : '<input type="hidden" name="rewardId" value="__new">'}
  </div>
  <div data-newr class="${useNew ? '' : 'hidden'}">
    <div class="type-pick" style="margin-top:10px">
      <button type="button" data-rtype="time" class="${newR.type === 'time' ? 'on' : ''}">⏱️<b>Tempo</b><span>Jogo, série, celular. Com cronômetro.</span></button>
      <button type="button" data-rtype="item" class="${newR.type === 'item' ? 'on' : ''}">🎁<b>Item / vale</b><span>Lanche, doce, R$, passeio</span></button></div>
    <div class="three" style="margin-top:10px"><button type="button" class="input" data-pick-remoji style="font-size:26px">${newR.emoji}</button><input class="input" name="rname" value="${esc(newR.name)}" placeholder="Ex.: Videogame, Pizza"></div>
    <div class="emoji-grid hidden" data-remoji-grid>${EMOJIS.map(e => `<button type="button" data-re="${e}">${e}</button>`).join('')}</div>
    <label class="field ${newR.type === 'time' ? 'hidden' : ''}" data-runit><span>Nome do item (singular)</span><input class="input" name="runit" value="${esc(newR.type === 'item' ? newR.unit : 'vale')}" placeholder="vale, doce, R$"></label>
  </div>

  <div class="field"><span>Quanto vale</span><div class="sentence">Cada <input type="number" inputmode="decimal" step="any" min="0" name="per" value="${g.per}"> <span data-unitlabel></span> = <input type="number" inputmode="decimal" step="any" min="0" name="gain" value="${g.gain}"> <span data-gainlabel></span>
    <div class="preview" data-preview></div></div></div>

  <div class="field"><span>Boosters ${onboarding ? '(opcional)' : ''}</span><div class="card" style="padding:4px 16px">
    ${boosterRow('weekly', '🎯', 'Meta semanal', 'Bônus quando bater a meta da semana', g.weekly.on, `<div class="two"><label class="field"><span>Meta (<i data-u></i>)</span><input class="input" type="number" inputmode="decimal" step="any" name="wtarget" value="${g.weekly.target || ''}"></label><label class="field"><span>Bônus (<i data-g></i>)</span><input class="input" type="number" inputmode="decimal" step="any" name="wbonus" value="${g.weekly.bonus || ''}"></label></div>`)}
    ${boosterRow('streak', '🔥', 'Sequência', 'Bônus a cada X dias seguidos', g.streak.on, `<div class="two"><label class="field"><span>A cada (dias)</span><input class="input" type="number" inputmode="numeric" name="severy" value="${g.streak.every || 7}"></label><label class="field"><span>Bônus (<i data-g></i>)</span><input class="input" type="number" inputmode="decimal" step="any" name="sbonus" value="${g.streak.bonus || ''}"></label></div>`)}
    ${boosterRow('mult', '⚡', 'Multiplicador', 'Dias em que vale mais', g.mult.on, `<div class="field"><span>Dias</span><div class="days">${WD.map((d, i) => `<button type="button" data-day="${i}" class="${g.mult.days.includes(i) ? 'on' : ''}">${d}</button>`).join('')}</div></div><label class="field"><span>Multiplica por</span><input class="input" type="number" inputmode="decimal" step="any" name="mfactor" value="${g.mult.factor || 2}"></label>`)}
    ${boosterRow('penalty', '⚠️', 'Penalidade', 'Perde saldo se não bater a meta semanal', g.penalty.on, `<label class="field"><span>Perde (<i data-g></i>) por semana não batida</span><input class="input" type="number" inputmode="decimal" step="any" name="pamount" value="${g.penalty.amount || ''}"></label><p class="tiny muted">Usa a meta semanal acima. Conta só semanas completas desde a criação.</p>`)}
  </div></div>`;
}
const boosterRow = (k, icon, t, d, on, body) => `<div class="toggle-row" style="flex-wrap:wrap"><span style="font-size:20px">${icon}</span><div class="grow"><b>${t}</b><div class="tiny muted">${d}</div></div>
  <label class="switch"><input type="checkbox" data-boost="${k}" ${on ? 'checked' : ''}><i></i></label>
  <div class="booster-body ${on ? '' : 'hidden'}" data-boost-body="${k}" style="flex-basis:100%">${body}</div></div>`;

function bindGoalForm(root, draft) {
  const { g } = draft; const r = draft.r;
  const q = s => root.querySelector(s), qa = s => [...root.querySelectorAll(s)];
  const curReward = () => { const v = q('[name=rewardId]').value; return v === '__new' ? r : reward(v); };
  const refresh = () => {
    g.name = q('[name=name]').value.trim(); g.unit = q('[name=unit]').value.trim() || 'vez';
    g.step = +q('[name=step]').value || 1; g.per = +q('[name=per]').value || 1; g.gain = +q('[name=gain]').value || 0;
    r.name = q('[name=rname]').value.trim(); if (r.type === 'item') r.unit = q('[name=runit]').value.trim() || 'vale'; else r.unit = 'min';
    const rr = curReward();
    q('[data-newr]').classList.toggle('hidden', q('[name=rewardId]').value !== '__new');
    q('[data-runit]').classList.toggle('hidden', r.type === 'time');
    qa('[data-only=qty]').forEach(e => e.classList.toggle('hidden', g.mode !== 'qty'));
    const gl = rr.type === 'time' ? 'min' : rr.unit;
    q('[data-unitlabel]').textContent = plural(g.unit, g.per);
    q('[data-gainlabel]').textContent = `${rr.type === 'time' ? 'min' : plural(rr.unit, g.gain)} de ${rr.name || 'recompensa'}`;
    qa('[data-u]').forEach(e => e.textContent = plural(g.unit, 2)); qa('[data-g]').forEach(e => e.textContent = rr.type === 'time' ? 'min' : plural(gl, 2));
    const ex = g.mode === 'check' ? 7 : g.per * 5;
    q('[data-preview]').innerHTML = `Exemplo: ${fmtQty(g, ex)} → <b>${fmtR(rr, ex / g.per * g.gain)}</b>${rr.type === 'time' ? ' de ' + esc((rr.name || 'tempo').toLowerCase()) : ''}`;
  };
  root.addEventListener('input', refresh);
  root.addEventListener('change', refresh);
  q('[data-pick-emoji]').onclick = () => q('[data-emoji-grid]').classList.toggle('hidden');
  qa('[data-e]').forEach(b => b.onclick = () => { g.emoji = b.dataset.e; q('[data-pick-emoji]').textContent = g.emoji; q('[data-emoji-grid]').classList.add('hidden'); });
  q('[data-pick-remoji]').onclick = () => q('[data-remoji-grid]').classList.toggle('hidden');
  qa('[data-re]').forEach(b => b.onclick = () => { r.emoji = b.dataset.re; q('[data-pick-remoji]').textContent = r.emoji; q('[data-remoji-grid]').classList.add('hidden'); });
  qa('[data-color]').forEach(b => b.onclick = () => { g.color = b.dataset.color; qa('[data-color]').forEach(x => x.classList.toggle('on', x === b)); });
  qa('[data-mode]').forEach(b => b.onclick = () => {
    g.mode = b.dataset.mode; qa('[data-mode]').forEach(x => x.classList.toggle('on', x === b));
    if (g.mode === 'check' && !q('[name=unit]').value.trim()) q('[name=unit]').value = 'dia';
    refresh();
  });
  qa('[data-rtype]').forEach(b => b.onclick = () => { r.type = b.dataset.rtype; qa('[data-rtype]').forEach(x => x.classList.toggle('on', x === b)); refresh(); });
  qa('[data-boost]').forEach(c => c.onchange = () => { g[c.dataset.boost].on = c.checked; q(`[data-boost-body=${c.dataset.boost}]`).classList.toggle('hidden', !c.checked); });
  qa('[data-day]').forEach(b => b.onclick = () => { b.classList.toggle('on'); g.mult.days = qa('[data-day].on').map(x => +x.dataset.day); });
  refresh();
  draft.read = () => {
    refresh();
    g.weekly.target = +q('[name=wtarget]').value || 0; g.weekly.bonus = +q('[name=wbonus]').value || 0;
    g.streak.every = Math.max(1, Math.round(+q('[name=severy]').value || 7)); g.streak.bonus = +q('[name=sbonus]').value || 0;
    g.mult.factor = +q('[name=mfactor]').value || 1;
    g.penalty.amount = +q('[name=pamount]').value || 0;
    if (g.penalty.on && !(g.weekly.target > 0)) { toast('A penalidade precisa de uma meta semanal.'); return false; }
    if (!g.name) { toast('Dê um nome ao objetivo.'); q('[name=name]').focus(); return false; }
    const rv = q('[name=rewardId]').value;
    if (rv === '__new') { if (!r.name) { toast('Dê um nome à recompensa.'); q('[name=rname]').focus(); return false; } g.rewardId = r.id; draft.createReward = true; }
    else { g.rewardId = rv; draft.createReward = false; }
    if (!(g.gain > 0)) { toast('Defina quanto o hábito vale.'); return false; }
    return true;
  };
}
function openGoalEditor(existing, preset) {
  const isNew = !existing;
  const draft = preset || { g: existing ? structuredClone(existing) : goalDefaults(), r: rewardDefaults() };
  if (isNew && !preset && S.rewards.length) draft.g.rewardId = S.rewards[0].id;
  if (isNew && !preset) draft.g.color = COLORS[S.goals.length % COLORS.length];
  openSheet(`<h2>${isNew ? 'Novo objetivo' : 'Editar objetivo'}</h2><div data-form>${goalFormHTML(draft.g, draft.r)}</div>
    <div class="sheet-actions"><button class="btn" data-x>Cancelar</button><button class="btn primary" data-ok>${isNew ? 'Criar' : 'Salvar'}</button></div>
    ${!isNew ? `<div class="row" style="margin-top:12px"><button class="btn ghost block" data-arch>${existing.archived ? 'Reativar' : 'Arquivar'}</button><button class="btn ghost danger block" data-del>Excluir</button></div>` : ''}`, sh => {
    bindGoalForm(sh.querySelector('[data-form]'), draft);
    sh.querySelector('[data-x]').onclick = closeSheet;
    sh.querySelector('[data-ok]').onclick = () => {
      if (!draft.read()) return;
      const doIt = () => {
        if (draft.createReward) S.rewards.push(draft.r);
        if (isNew) S.goals.push(draft.g); else Object.assign(existing, draft.g);
        save(); closeSheet(); checkAch(); toast(isNew ? `${draft.g.emoji} Objetivo criado!` : 'Salvo'); render();
      };
      isNew ? doIt() : guard(doIt, 'Mudar regras');
    };
    if (!isNew) {
      sh.querySelector('[data-arch]').onclick = () => guard(() => { existing.archived = !existing.archived; save(); closeSheet(); render(); });
      sh.querySelector('[data-del]').onclick = () => guard(() => confirmSheet('Excluir objetivo?', `Os registros de <b>${esc(existing.name)}</b> e tudo que eles renderam saem do saldo. Se quiser só pausar, use Arquivar.`, 'Excluir', () => {
        S.goals = S.goals.filter(x => x.id !== existing.id); S.entries = S.entries.filter(e => e.goalId !== existing.id); save(); go('objetivos');
      }));
    }
  });
}
function openRewardEditor(existing) {
  const r = existing ? structuredClone(existing) : rewardDefaults();
  openSheet(`<h2>${existing ? 'Editar recompensa' : 'Nova recompensa'}</h2>
    <div class="type-pick"><button type="button" data-rtype="time" class="${r.type === 'time' ? 'on' : ''}">⏱️<b>Tempo</b><span>Com cronômetro</span></button><button type="button" data-rtype="item" class="${r.type === 'item' ? 'on' : ''}">🎁<b>Item / vale</b><span>Resgate por unidade</span></button></div>
    <div class="three" style="margin-top:12px"><button type="button" class="input" data-pe style="font-size:26px">${r.emoji}</button><input class="input" name="rname" value="${esc(r.name)}" placeholder="Nome"></div>
    <div class="emoji-grid hidden" data-eg>${EMOJIS.map(e => `<button type="button" data-re="${e}">${e}</button>`).join('')}</div>
    <label class="field ${r.type === 'time' ? 'hidden' : ''}" data-ru><span>Nome do item (singular)</span><input class="input" name="runit" value="${esc(r.type === 'item' ? r.unit : 'vale')}" placeholder="vale, doce, R$"></label>
    <label class="field"><span>Validade do saldo (dias, 0 = nunca vence)</span><input class="input" type="number" inputmode="numeric" min="0" name="exp" value="${r.expiry || 0}"></label>
    <p class="tiny muted" style="margin:6px 4px 0">Com validade, o que você ganhou e não usou some depois do prazo. O que vence antes é gasto primeiro.</p>
    <div class="sheet-actions"><button class="btn" data-x>Cancelar</button><button class="btn primary" data-ok>Salvar</button></div>
    ${existing ? '<button class="btn ghost danger block" style="margin-top:10px" data-del>Excluir recompensa</button>' : ''}`, sh => {
    const q = s => sh.querySelector(s);
    sh.querySelectorAll('[data-rtype]').forEach(b => b.onclick = () => { r.type = b.dataset.rtype; sh.querySelectorAll('[data-rtype]').forEach(x => x.classList.toggle('on', x === b)); q('[data-ru]').classList.toggle('hidden', r.type === 'time'); });
    q('[data-pe]').onclick = () => q('[data-eg]').classList.toggle('hidden');
    sh.querySelectorAll('[data-re]').forEach(b => b.onclick = () => { r.emoji = b.dataset.re; q('[data-pe]').textContent = r.emoji; q('[data-eg]').classList.add('hidden'); });
    q('[data-x]').onclick = closeSheet;
    q('[data-ok]').onclick = () => {
      r.name = q('[name=rname]').value.trim(); if (!r.name) return toast('Dê um nome.');
      r.unit = r.type === 'time' ? 'min' : (q('[name=runit]').value.trim() || 'vale'); r.expiry = Math.max(0, Math.round(+q('[name=exp]').value || 0));
      guard(() => { if (existing) Object.assign(existing, r); else S.rewards.push(r); save(); closeSheet(); render(); }, 'Mudar recompensa');
    };
    if (existing) q('[data-del]').onclick = () => {
      if (S.goals.some(g => g.rewardId === existing.id)) return toast('Há objetivos ligados a ela. Troque a recompensa deles antes.');
      guard(() => confirmSheet('Excluir recompensa?', 'O histórico de uso dela também será apagado.', 'Excluir', () => { S.rewards = S.rewards.filter(x => x.id !== existing.id); S.ledger = S.ledger.filter(l => l.rid !== existing.id); delete S.timers[existing.id]; save(); go('carteira'); }));
    };
  });
}

// ---------- registrar ----------
function addEntry(g, amount, date = today(), note = '') {
  const r = reward(g.rewardId);
  const beforeBal = r ? computeReward(r).bal : 0;
  S.entries.push({ id: uid(), goalId: g.id, date, amount, note, ts: Date.now() });
  save(); invalidate();
  if (r) {
    const gained = computeReward(r).bal - beforeBal;
    const bonus = allEvents().filter(e => e.goalId === g.id && e.kind === 'bonus' && e.date === date);
    toast(`${g.emoji} +${fmtQty(g, amount)} · <b>+${fmtR(r, gained)}</b> de ${esc(r.name.toLowerCase())}`);
    if (bonus.length && gained > amount / g.per * g.gain * 1.001 * (g.mult?.on && g.mult.days.includes(weekday(date)) ? g.mult.factor : 1)) { confetti(); toast(`${bonus[bonus.length - 1].icon} ${esc(bonus[bonus.length - 1].label)}!`, 'gold'); }
  }
  if (navigator.vibrate) navigator.vibrate(15);
  checkAch(); render();
}
function openLog(g, entry) {
  const e = entry || { amount: g.step, date: today(), note: '' };
  const presets = [...new Set([g.step, g.step * 2, g.step * 5, g.per].filter(x => x > 0))].slice(0, 4);
  openSheet(`<h2>${g.emoji} ${entry ? 'Editar registro' : esc(g.name)}</h2>
    ${g.mode === 'check' ? '' : `<div class="stepper"><button type="button" data-d="-1">−</button><input class="input big" type="number" inputmode="decimal" step="any" min="0" name="amt" value="${e.amount}"><button type="button" data-d="1">+</button></div>
    <div class="row" style="justify-content:center;margin-top:6px" class="muted"><span class="muted small">${esc(plural(g.unit, 2))}</span></div>
    <div class="presets" style="justify-content:center">${presets.map(p => `<button type="button" data-p="${p}">${num(p)}</button>`).join('')}</div>`}
    <div class="two"><label class="field"><span>Data</span><input class="input" type="date" name="date" value="${e.date}" max="${today()}"></label>
    <label class="field"><span>Nota</span><input class="input" name="note" value="${esc(e.note)}" placeholder="Opcional"></label></div>
    <div class="preview" data-prev style="text-align:center;margin-top:14px"></div>
    <div class="sheet-actions"><button class="btn" data-x>Cancelar</button><button class="btn primary" data-ok>${entry ? 'Salvar' : 'Registrar'}</button></div>`, sh => {
    const q = s => sh.querySelector(s), r = reward(g.rewardId);
    const upd = () => {
      if (!r) return; const a = g.mode === 'check' ? 1 : +(q('[name=amt]')?.value || 0); const d = q('[name=date]').value;
      const f = g.mult?.on && g.mult.days.includes(weekday(d)) ? g.mult.factor : 1;
      q('[data-prev]').innerHTML = `Vale <b>${fmtR(r, a / g.per * g.gain * f)}</b> de ${esc(r.name.toLowerCase())}${f > 1 ? ` <span class="pill-note">×${num(f)}</span>` : ''}`;
    };
    sh.addEventListener('input', upd); upd();
    sh.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { const i = q('[name=amt]'); i.value = Math.max(0, Math.round(((+i.value || 0) + +b.dataset.d * g.step) * 100) / 100); upd(); });
    sh.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { q('[name=amt]').value = b.dataset.p; upd(); });
    q('[data-x]').onclick = closeSheet;
    q('[data-ok]').onclick = () => {
      const a = g.mode === 'check' ? 1 : +(q('[name=amt]').value || 0), d = q('[name=date]').value || today(), note = q('[name=note]').value.trim();
      if (!(a > 0)) return toast('Informe um valor.');
      if (d > today()) return toast('Não dá para registrar no futuro 😉');
      if (g.mode === 'check' && S.entries.some(x => x.goalId === g.id && x.date === d && x !== entry)) return toast('Esse dia já está marcado.');
      closeSheet();
      if (entry) { Object.assign(entry, { amount: a, date: d, note }); save(); checkAch(); render(); toast('Registro atualizado'); }
      else addEntry(g, a, d, note);
    };
  });
}

// ---------- recompensas: cronômetro e resgate ----------
function toggleTimer(r) {
  if (S.timers[r.id]) {
    const start = S.timers[r.id], mins = (Date.now() - start) / 60000;
    delete S.timers[r.id];
    if (mins >= 1 / 60) S.ledger.push({ id: uid(), rid: r.id, date: localDate(start), ts: start, amount: -mins, kind: 'spend', note: `${r.name}: ${fmtMin(Math.max(1, mins))}` });
    delete S.settings.alerted[r.id];
    save(); checkAch(); toast(`⏸ Pausado · usou ${fmtMin(Math.max(mins, 0))}`); render();
  } else {
    const c = computeReward(r);
    const start = () => { S.timers[r.id] = Date.now(); save(); askNotify(); render(); };
    if (c.bal <= 0) confirmSheet('Sem saldo', `Você está com <b>${fmtR(r, c.bal)}</b> de ${esc(r.name.toLowerCase())}. Começar mesmo assim vai deixar o saldo negativo.`, 'Começar assim mesmo', () => guard(start, 'Usar sem saldo'), false);
    else guard(start, `Liberar ${r.name}`);
  }
}
function askNotify() { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {}); }
function beep() {
  try { const a = new (window.AudioContext || window.webkitAudioContext)(); [0, .25, .5].forEach(t => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; g.gain.value = .15; o.connect(g); g.connect(a.destination); o.start(a.currentTime + t); o.stop(a.currentTime + t + .15); }); } catch {}
}
function openRedeem(r) {
  const c = computeReward(r), money = isMoney(r);
  openSheet(`<h2>${r.emoji} ${money ? 'Usar saldo' : 'Resgatar'}</h2><p class="muted" style="margin-top:-6px">Disponível: <b>${fmtR(r, c.bal)}</b></p>
    <div class="stepper"><button type="button" data-d="-1">−</button><input class="input big" type="number" inputmode="decimal" step="any" min="0" name="amt" value="${money ? Math.max(0, Math.floor(c.bal)) || 1 : 1}"><button type="button" data-d="1">+</button></div>
    <label class="field"><span>Com o quê? (opcional)</span><input class="input" name="note" placeholder="${money ? 'Ex.: livro novo' : 'Ex.: McDonald’s com a turma'}"></label>
    <div class="sheet-actions"><button class="btn" data-x>Cancelar</button><button class="btn primary" data-ok>${ic('gift')}${money ? 'Usar' : 'Resgatar'}</button></div>`, sh => {
    const q = s => sh.querySelector(s);
    sh.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { const i = q('[name=amt]'); i.value = Math.max(0, (+i.value || 0) + +b.dataset.d); });
    q('[data-x]').onclick = closeSheet;
    q('[data-ok]').onclick = () => {
      const a = +q('[name=amt]').value || 0, note = q('[name=note]').value.trim();
      if (!(a > 0)) return toast('Informe a quantidade.');
      if (a > c.bal + 1e-9) return toast(`Saldo insuficiente (${fmtR(r, c.bal)}).`);
      guard(() => {
        S.ledger.push({ id: uid(), rid: r.id, date: today(), ts: Date.now(), amount: -a, kind: 'redeem', note: `Resgate: ${fmtR(r, a)}${note ? ' · ' + note : ''}` });
        save(); closeSheet(); confetti(); toast(`${r.emoji} Aproveite, é merecido!`, 'gold'); checkAch(); render();
      }, 'Liberar resgate');
    };
  });
}
function openAdjust(r, spend) {
  openSheet(`<h2>${spend ? 'Lançar uso' : 'Corrigir saldo'}</h2><p class="muted" style="margin-top:-6px">${spend ? 'Esqueceu de dar play? Lance o tempo usado.' : 'Some ou tire saldo à mão. Fica registrado no histórico.'}</p>
    ${spend ? '' : `<div class="seg" style="margin-bottom:10px"><button data-s="1" class="on">＋ Adicionar</button><button data-s="-1">− Remover</button></div>`}
    <label class="field"><span>Quantidade (${r.type === 'time' ? 'minutos' : esc(plural(r.unit, 2))})</span><input class="input big" type="number" inputmode="decimal" step="any" min="0" name="amt" value="${r.type === 'time' ? 30 : 1}"></label>
    ${r.type === 'time' ? `<div class="presets">${[15, 30, 60, 120].map(p => `<button type="button" data-p="${p}">${fmtMin(p)}</button>`).join('')}</div>` : ''}
    <div class="two"><label class="field"><span>Data</span><input class="input" type="date" name="date" value="${today()}" max="${today()}"></label><label class="field"><span>Motivo</span><input class="input" name="note" placeholder="Opcional"></label></div>
    <div class="sheet-actions"><button class="btn" data-x>Cancelar</button><button class="btn primary" data-ok>Salvar</button></div>`, sh => {
    let sign = spend ? -1 : 1; const q = s => sh.querySelector(s);
    sh.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { sign = +b.dataset.s; sh.querySelectorAll('[data-s]').forEach(x => x.classList.toggle('on', x === b)); });
    sh.querySelectorAll('[data-p]').forEach(b => b.onclick = () => q('[name=amt]').value = b.dataset.p);
    q('[data-x]').onclick = closeSheet;
    q('[data-ok]').onclick = () => {
      const a = +q('[name=amt]').value || 0; if (!(a > 0)) return toast('Informe a quantidade.');
      const note = q('[name=note]').value.trim(), date = q('[name=date]').value || today();
      guard(() => {
        S.ledger.push({ id: uid(), rid: r.id, date, ts: Date.now(), amount: sign * a, kind: spend ? 'spend' : 'adjust', note: (spend ? 'Uso lançado à mão' : 'Correção manual') + (note ? ' · ' + note : '') });
        save(); closeSheet(); checkAch(); render();
      }, 'Corrigir saldo');
    };
  });
}

// ---------- backup ----------
function exportBackup() {
  S.settings.lastBackup = Date.now(); save();
  const blob = new Blob([JSON.stringify({ app: 'merecido', exported: new Date().toISOString(), data: S }, null, 2)], { type: 'application/json' });
  const name = `merecido-backup-${today()}.json`;
  const file = new File([blob], name, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] }) && /iphone|ipad|android/i.test(navigator.userAgent)) {
    navigator.share({ files: [file], title: 'Backup do Merecido' }).catch(() => {});
  } else {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  checkAch(); render();
}
function bindImport() {
  const inp = $('#imp'); if (!inp) return;
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    f.text().then(t => {
      const j = JSON.parse(t), d = j.data || j;
      if (!Array.isArray(d.goals) || !Array.isArray(d.rewards) || !Array.isArray(d.entries)) throw new Error('Arquivo não é um backup do Merecido.');
      const apply = () => { S = Object.assign(blank(), d); S.settings = Object.assign(blank().settings, d.settings); S.profile.onboarded = true; save(); toast('Backup restaurado ✓'); go('hoje'); render(); };
      if (S.entries.length || S.goals.length) confirmSheet('Substituir dados?', `O backup tem ${d.goals.length} objetivo(s) e ${d.entries.length} registro(s). Os dados atuais deste aparelho serão substituídos.`, 'Substituir', apply);
      else apply();
    }).catch(e => toast('Erro: ' + e.message)).finally(() => inp.value = '');
  };
}
function importCorreJoga() {
  let o; try { o = JSON.parse(localStorage.getItem('correjoga.v1')); } catch { o = null; }
  if (!o || !Array.isArray(o.runs)) return toast('Não achei dados do Corre & Joga neste aparelho.');
  const doIt = () => {
    const { g, r } = fromTemplate(TEMPLATES[0]);
    g.gain = (o.ratio || 1) * 60; g.weekly = { on: !!o.weeklyGoal, target: o.weeklyGoal || 0, bonus: (o.weeklyBonus || 0) * 60 };
    const firstRun = o.runs.map(x => x.date).sort()[0];
    if (firstRun) g.created = parseD(firstRun).getTime();
    S.rewards.push(r); S.goals.push(g);
    for (const x of o.runs) S.entries.push({ id: uid(), goalId: g.id, date: x.date, amount: x.km, note: x.note || '', ts: x.created || parseD(x.date).getTime() });
    for (const s of o.sessions || []) S.ledger.push({ id: uid(), rid: r.id, date: s.date, ts: s.start || s.created || parseD(s.date).getTime(), amount: -(s.ms / 60000), kind: 'spend', note: `Jogatina: ${fmtMin(s.ms / 60000)}` });
    if (o.adjustHours) S.ledger.push({ id: uid(), rid: r.id, date: today(), ts: Date.now(), amount: o.adjustHours * 60, kind: 'adjust', note: 'Ajuste trazido do Corre & Joga' });
    if (o.timerStart) S.timers[r.id] = o.timerStart;
    S.profile.onboarded = true; save(); checkAch(true);
    toast(`🏃 ${o.runs.length} corridas e ${(o.sessions || []).length} jogatinas importadas!`, 'gold'); confetti(); go('hoje');
  };
  if (S.goals.some(g => g.name === 'Correr')) confirmSheet('Importar de novo?', 'Você já tem um objetivo "Correr". Importar cria outro separado.', 'Importar', doIt, false); else doIt();
}
function loadDemo() {
  const doIt = () => {
    S = blank(); S.profile.onboarded = true; S.profile.name = 'Vic';
    const a = fromTemplate(TEMPLATES[0]), b = fromTemplate(TEMPLATES[1]), c = fromTemplate(TEMPLATES[2]);
    b.r.expiry = 30; c.g.penalty = { on: true, amount: 30 };
    for (const x of [a, b, c]) { x.g.created = Date.now() - 70 * DAY; S.goals.push(x.g); S.rewards.push(x.r); }
    const t = today();
    for (let i = 63; i >= 1; i--) {
      const d = addDays(t, -i), wd = weekday(d);
      if ([1, 3, 6].includes(wd) || Math.random() < .15) S.entries.push({ id: uid(), goalId: a.g.id, date: d, amount: Math.round((3 + Math.random() * 5) * 10) / 10, note: '', ts: parseD(d).getTime() });
      if (i < 40 && Math.random() < .8) S.entries.push({ id: uid(), goalId: b.g.id, date: d, amount: 1, note: '', ts: parseD(d).getTime() });
      if (wd > 0 && wd < 6 && Math.random() < .7) S.entries.push({ id: uid(), goalId: c.g.id, date: d, amount: [25, 50, 75][Math.floor(Math.random() * 3)], note: '', ts: parseD(d).getTime() });
      if (i % 2 === 0 || wd === 6) S.ledger.push({ id: uid(), rid: a.r.id, date: d, ts: parseD(d).getTime() + 7e7, amount: -(150 + Math.round(Math.random() * 120)), kind: 'spend', note: 'Videogame' });
      if (i % 9 === 0 && i < 36) S.ledger.push({ id: uid(), rid: b.r.id, date: d, ts: parseD(d).getTime() + 7e7, amount: -1, kind: 'redeem', note: 'Resgate: 1 vale · hambúrguer' });
    }
    S.entries.push({ id: uid(), goalId: a.g.id, date: t, amount: 5, note: 'Parque', ts: Date.now() });
    invalidate(); const left = computeReward(a.r).bal; const want = 270;
    S.ledger.push({ id: uid(), rid: a.r.id, date: addDays(t, -1), ts: Date.now() - DAY, amount: want - left, kind: left > want ? 'spend' : 'adjust', note: left > want ? 'Maratona de fim de semana' : 'Correção manual' });
    save(); checkAch(true); toast('✨ Exemplo carregado'); go('hoje');
  };
  if (S.entries.length) confirmSheet('Carregar exemplo?', 'Isso substitui os dados atuais. Faça backup antes se quiser guardar.', 'Substituir', doIt); else doIt();
}

// ---------- ações ----------
const actions = {
  'timer': d => toggleTimer(reward(d.id)),
  'redeem': d => openRedeem(reward(d.id)),
  'quick': d => { const g = goal(d.id); addEntry(g, g.step); },
  'log': d => openLog(goal(d.id)),
  'check': d => {
    const g = goal(d.id), ex = S.entries.find(e => e.goalId === g.id && e.date === today());
    if (ex) { S.entries = S.entries.filter(e => e !== ex); save(); toast('Desmarcado'); render(); }
    else addEntry(g, 1);
  },
  'edit-entry': d => { const e = S.entries.find(x => x.id === d.id); guard(() => openLog(goal(e.goalId), e), 'Editar registro'); },
  'del-entry': d => { const e = S.entries.find(x => x.id === d.id), g = goal(e.goalId); guard(() => confirmSheet('Apagar registro?', `${fmtQty(g, e.amount)} em ${fmtDate(e.date).toLowerCase()}. O que ele rendeu sai do saldo.`, 'Apagar', () => { S.entries = S.entries.filter(x => x !== e); save(); render(); }), 'Apagar registro'); },
  'del-ledger': d => { const l = S.ledger.find(x => x.id === d.id); guard(() => confirmSheet('Apagar lançamento?', esc(l.note || ''), 'Apagar', () => { S.ledger = S.ledger.filter(x => x !== l); save(); render(); }), 'Apagar lançamento'); },
  'new-goal': () => openGoalEditor(),
  'edit-goal': d => openGoalEditor(goal(d.id)),
  'use-tpl': d => { const t = TEMPLATES.find(x => x.id === d.id); const { g, r } = fromTemplate(t); openGoalEditor(null, { g, r }); },
  'new-reward': () => openRewardEditor(),
  'edit-reward': d => openRewardEditor(reward(d.id)),
  'adjust': d => openAdjust(reward(d.id)),
  'manual-spend': d => openAdjust(reward(d.id), true),
  'theme': d => { S.profile.theme = d.id; save(); render(); },
  'export': exportBackup,
  'import-old': importCorreJoga,
  'demo': loadDemo,
  'reset': () => guard(() => confirmSheet('Apagar tudo?', 'Todos os objetivos, registros e saldos deste aparelho serão apagados. Não dá para desfazer.', 'Apagar tudo', () => { S = blank(); save(); obState = { step: 0 }; location.hash = ''; render(); }), 'Apagar tudo'),
  'pin': () => {
    if (S.settings.pin) return guard(() => confirmSheet('PIN do responsável', 'Quer remover o PIN? Resgates e correções voltam a ficar livres.', 'Remover PIN', () => { S.settings.pin = null; save(); render(); toast('PIN removido'); }), 'Remover PIN');
    pinPad('Criar PIN', p1 => { setTimeout(() => pinPad('Confirme o PIN', p2 => { if (p2 !== p1) { toast('Os PINs não batem.'); return false; } S.settings.pin = hashPin(p1); pinOkUntil = Date.now() + 60000; save(); closeSheet(); checkAch(); render(); toast('🔐 PIN ativado'); return true; }), 50); return true; }, 'Escolha 4 números');
  },
  'install': async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice.catch(() => {}); deferredPrompt = null; render(); },
  'share-app': () => { const url = location.href.split('#')[0]; if (navigator.share) navigator.share({ title: 'Merecido', text: 'Transforme hábitos em recompensas', url }).catch(() => {}); else navigator.clipboard?.writeText(url).then(() => toast('Link copiado')); },
  'share': () => {
    const got = ACH.filter(a => S.ach[a.id]); const best = Math.max(0, ...S.goals.map(g => streakOf(dayTotals(g)).best));
    const text = `Merecido 🏆 ${got.length} conquistas ${got.map(a => a.ic).join('')} · maior sequência: ${best} dias`;
    if (navigator.share) navigator.share({ text }).catch(() => {}); else navigator.clipboard?.writeText(text).then(() => toast('Copiado!'));
  },
  'ob-next': () => { S.profile.name = ($('#ob-name')?.value || '').trim(); save(); obState.step = 1; render(); },
  'ob-back': () => { obState.step = Math.max(0, obState.step - 1); render(); },
  'ob-tpl': d => {
    if (d.id === 'blank') { const g = goalDefaults(), r = rewardDefaults(); r.name = ''; obState.draft = { g, r }; }
    else obState.draft = fromTemplate(TEMPLATES.find(x => x.id === d.id));
    obState.step = 2; render(); window.scrollTo(0, 0);
  },
  'ob-finish': () => {
    const dr = obState.draft; if (!dr.read()) return;
    if (dr.createReward) S.rewards.push(dr.r);
    S.goals.push(dr.g); S.profile.onboarded = true; save();
    confetti(); toast(`Tudo pronto! Registre seu primeiro ${esc(dr.g.unit)} 🚀`, 'gold'); location.hash = 'hoje'; render();
  },
};
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  const fn = actions[a.dataset.act]; if (fn) { e.preventDefault(); fn(a.dataset, a); }
});
document.addEventListener('change', e => {
  if (e.target.id === 'nm') { S.profile.name = e.target.value.trim(); save(); }
});

// ---------- relógio ----------
function tick() {
  for (const [rid, start] of Object.entries(S.timers)) {
    const r = reward(rid); if (!r) continue;
    const c = computeReward(r);
    document.querySelectorAll(`[data-clock="${rid}"]`).forEach(el => el.textContent = fmtClock(c.bal * 60000));
    if (c.bal <= 0 && !S.settings.alerted[rid]) {
      S.settings.alerted[rid] = 1; save(); beep(); navigator.vibrate?.([200, 100, 200]);
      toast(`⏰ Acabou o tempo de ${esc(r.name.toLowerCase())}! Pausa quando puder.`, 'gold');
      if ('Notification' in window && Notification.permission === 'granted') navigator.serviceWorker?.getRegistration().then(reg => reg?.showNotification('Merecido', { body: `Acabou o tempo de ${r.name}.`, icon: 'icons/icon-192.png' }));
    }
  }
}
setInterval(() => { invalidate(); tick(); }, 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });

// ---------- start ----------
if (!location.hash && S.profile.onboarded) history.replaceState(null, '', '#hoje');
render();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
