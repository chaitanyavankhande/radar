/* radar board: reads docs/data/*.json and renders filterable, sortable lists.
   No build step, no libraries. State lives in the URL hash so any view can be shared. */
'use strict';

const TZ = 'Australia/Sydney';
const PAY_FLOOR = 33.05;
const DAY = 864e5;

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = u => (typeof u === 'string' && /^https?:\/\//i.test(u.trim())) ? u.trim() : null;
const arr = v => Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]);
const isDateOnly = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const num = v => (v === null || v === undefined || v === '' || isNaN(Number(v))) ? null : Number(v);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
};

function parseWhen(s, edge = 'end') {
  if (!s) return null;
  if (isDateOnly(s)) {
    const [, m, d] = s.split('-').map(Number);
    const off = (m >= 10 || m <= 3 || (m === 4 && d <= 5)) ? '+11:00' : '+10:00';
    return new Date(`${s}T${edge === 'end' ? '23:59:00' : '00:00:00'}${off}`);
  }
  const t = new Date(s);
  return isNaN(t) ? null : t;
}
const fmtDay = new Intl.DateTimeFormat('en-AU', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' });
const fmtDayY = new Intl.DateTimeFormat('en-AU', { timeZone: TZ, day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = new Intl.DateTimeFormat('en-AU', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true });
const fmtKey = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const sydKey = d => fmtKey.format(d);
const sydYear = d => sydKey(d).slice(0, 4);

function showWhen(s, edge = 'end') {
  const d = parseWhen(s, edge);
  if (!d) return '';
  const day = sydYear(d) === sydYear(new Date()) ? fmtDay.format(d) : fmtDayY.format(d);
  return isDateOnly(s) ? day : `${day}, ${fmtTime.format(d)}`;
}
function dayDiff(d) {
  const a = Date.parse(sydKey(d) + 'T00:00:00Z');
  const b = Date.parse(sydKey(new Date()) + 'T00:00:00Z');
  return Math.round((a - b) / DAY);
}
function countdown(s) {
  const d = parseWhen(s);
  if (!d) return null;
  const ms = d - Date.now();
  if (ms < 0) return { text: 'passed', level: 'past' };
  const m = Math.floor(ms / 6e4), h = Math.floor(m / 60), dd = Math.floor(h / 24);
  const text = dd >= 2 ? `${dd} days` : dd === 1 ? `1 day ${h % 24} h` : h >= 1 ? `${h} h ${m % 60} min` : `${Math.max(m, 1)} min`;
  const level = ms < DAY ? 'crit' : ms < 3 * DAY ? 'warn' : ms < 7 * DAY ? 'soon' : 'calm';
  return { text: `in ${text}`, level };
}
const money = v => v == null ? null : '$' + (Number.isInteger(v) ? v : v.toFixed(2));
const isClosed = it => it.closed === true || (it.deadline && (parseWhen(it.deadline) || Infinity) < Date.now());
function isNew(it, data) {
  const f = parseWhen(it.found_at, 'start');
  if (!f) return false;
  const prev = parseWhen(data.previous_run_at, 'start');
  if (prev) return f > prev;
  const upd = parseWhen(data.updated_at, 'start') || new Date();
  return (upd - f) < 1.5 * DAY;
}
const titleCase = s => { const t = String(s || ''); return t.charAt(0).toUpperCase() + t.slice(1); };

/* ---------- shared filter + sort pieces ---------- */
const STATUS_CHIP = {
  'new': 'info', 'interested': 'info', 'to do': 'info', 'in progress': 'warn',
  'applied': 'good', 'enquired': 'good', 'inspected': 'good', 'interview': 'good', 'offer': 'good', 'signed': 'good', 'done': 'good',
  'rejected': 'crit', 'not for me': ''
};
const commonFilters = () => [
  { type: 'multi', key: 'status', label: 'Status', get: it => it.status || 'new' },
  { type: 'multi', key: 'source', label: 'Source', get: it => it.source },
  { type: 'multi', key: 'verified', label: 'Checked', get: it => it.verified || '⚠️' }
];
const cmpVal = (a, b) => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'string' || typeof b === 'string') return String(a).localeCompare(String(b));
  return a - b;
};
const deadlineMs = it => { const d = parseWhen(it.deadline); return d ? +d : null; };
const foundMs = it => { const d = parseWhen(it.found_at, 'start'); return d ? +d : null; };

/* country order for internships */
const COUNTRY_ORDER = ['australia', 'hong kong', 'singapore', 'united states', 'usa', 'us', 'united kingdom', 'uk', 'europe', 'remote'];
const countryRank = it => {
  const c = String(it.country || '').toLowerCase();
  const i = COUNTRY_ORDER.indexOf(c);
  if (i >= 0) return [0, 1, 2, 3, 3, 3, 4, 4, 5, 6][i];
  if (/remote/.test(c)) return 6;
  return 5;
};
const casualPayTop = it => num(it.pay_max) ?? num(it.pay_min);
const casualTier = it => {
  const p = casualPayTop(it);
  if (!it.pay_listed || p == null) return 1;
  return p < PAY_FLOOR ? 2 : 0;
};
const hackRegion = it => {
  const city = String(it.city || '').toLowerCase();
  const mode = String(it.mode || '').toLowerCase();
  if (/sydney/.test(city) && mode !== 'online') return 0;
  if (mode !== 'online' && /(melbourne|brisbane|perth|adelaide|canberra|hobart|darwin|gold coast|newcastle|wollongong|australia|nsw|vic|qld)/.test(city)) return 1;
  if (mode === 'online') return 2;
  return 3;
};
const roomTotal = it => { const r = num(it.rent_pw); return r == null ? null : r + (num(it.bills_estimate_pw) || 0); };
const BILLS = ['electricity', 'gas', 'water', 'internet'];
const billsCount = it => it.bills_included_count ?? BILLS.filter(b => (it.bills || {})[b] === 'included').length;

/* ---------- tab definitions ---------- */
const TABS = [
  {
    id: 'uni', file: 'uni', label: 'Uni deadlines', icon: '🎓', noun: 'deadline',
    heading: 'Uni deadlines',
    lede: 'Every assessment and admin date for COMP9020, COMP9021 and COMP9024, from the daily brief. Times are Sydney time.',
    schedule: 'The uni brief refreshes this every day at 7:45 am.',
    search: it => [it.title, it.course_code, it.course_name, it.kind, it.notes, it.org],
    filters: () => [
      { type: 'multi', key: 'course', label: 'Course', get: it => it.course_code ? `${it.course_code} ${it.course_name || ''}`.trim() : (it.org || 'Other') },
      { type: 'multi', key: 'kind', label: 'Type', get: it => titleCase(it.kind) },
      { type: 'select', key: 'within', label: 'Due within', options: [['', 'Any time'], ['1', 'Today'], ['3', '3 days'], ['7', '7 days'], ['14', '14 days'], ['30', '30 days']],
        test: (it, v) => { const d = parseWhen(it.deadline); return d && dayDiff(d) <= Number(v); } },
      ...commonFilters()
    ],
    keys: {
      deadline: { label: 'Due date', get: deadlineMs },
      weight: { label: 'Weight', get: it => num(String(it.weight || '').replace('%', '')) },
      course: { label: 'Course', get: it => it.course_code || '' },
      found: { label: 'First seen', get: foundMs }
    },
    presets: [
      { id: 'default', label: 'By due date (grouped)', keys: [['deadline', 'asc'], ['weight', 'desc']], group: true },
      { id: 'weight', label: 'Biggest weight first', keys: [['weight', 'desc'], ['deadline', 'asc']] },
      { id: 'course', label: 'By course, then date', keys: [['course', 'asc'], ['deadline', 'asc']] }
    ],
    when: it => it.deadline,
    facts: it => [
      ['Type', esc(titleCase(it.kind || ''))],
      ['Weight', it.weight ? `<span class="num">${esc(it.weight)}</span>` : '<span class="muted">not set</span>'],
      ['Where', safeUrl(it.where) ? `<a href="${esc(it.where)}" target="_blank" rel="noopener">${esc(hostOf(it.where))} ↗</a>` : esc(it.where || '')]
    ],
    chips: () => [],
    more: it => noteBlock(it)
  },
  {
    id: 'casual', file: 'casual', label: 'Casual & part-time', icon: '💼', noun: 'job',
    heading: 'Casual and part-time jobs',
    lede: `Jobs in Kensington, Kingsford, Randwick, Maroubra, Coogee and on campus. The legal floor for an award-free adult casual is $${PAY_FLOOR}/h; ads without pay are kept and ranked lower.`,
    schedule: 'The scout refreshes this every day at 4:22 am.',
    search: it => [it.title, it.org, it.suburb, it.job_type, it.employment_type, it.notes],
    filters: () => [
      { type: 'multi', key: 'job_type', label: 'Job type', get: it => it.job_type },
      { type: 'multi', key: 'employment', label: 'Employment', get: it => titleCase(it.employment_type) },
      { type: 'multi', key: 'suburb', label: 'Suburb', get: it => it.suburb },
      { type: 'min', key: 'min_pay', label: 'Pay at least ($/h)', get: casualPayTop, step: 0.5, placeholder: String(PAY_FLOOR) },
      { type: 'max', key: 'max_km', label: 'Within (km)', get: it => num(it.distance_km), step: 0.5 },
      { type: 'toggle', key: 'pay_listed', label: 'Pay listed only', test: it => !!it.pay_listed },
      { type: 'toggle', key: 'floor', label: 'Hide below the floor', test: it => casualTier(it) !== 2 },
      ...commonFilters()
    ],
    keys: {
      tier: { label: 'Pay listed, above floor first', get: casualTier },
      pay: { label: 'Pay', get: casualPayTop },
      distance: { label: 'Distance', get: it => num(it.distance_km) },
      transit: { label: 'Travel time', get: it => num(it.transit_min) },
      deadline: { label: 'Closing date', get: deadlineMs },
      found: { label: 'First seen', get: foundMs },
      org: { label: 'Employer A to Z', get: it => it.org || '' }
    },
    presets: [
      { id: 'default', label: 'Best pay, then closest', keys: [['tier', 'asc'], ['pay', 'desc'], ['distance', 'asc']] },
      { id: 'closest', label: 'Closest, then best pay', keys: [['distance', 'asc'], ['tier', 'asc'], ['pay', 'desc']] },
      { id: 'pay', label: 'Highest pay', keys: [['pay', 'desc'], ['distance', 'asc']] },
      { id: 'newest', label: 'Newest first', keys: [['found', 'desc'], ['tier', 'asc']] },
      { id: 'closing', label: 'Closing soonest', keys: [['deadline', 'asc'], ['tier', 'asc']] }
    ],
    when: it => it.deadline,
    facts: it => {
      const lo = num(it.pay_min), hi = num(it.pay_max);
      const pay = !it.pay_listed || (lo == null && hi == null)
        ? '<span class="muted">Pay not listed</span>'
        : `<span class="num">${lo != null && hi != null && lo !== hi ? `${money(lo)} to ${money(hi)}` : money(hi ?? lo)}/h</span>`;
      return [
        ['Pay', pay],
        ['Distance', distanceText(it)],
        ['Type', esc([it.job_type, titleCase(it.employment_type)].filter(Boolean).join(' · '))],
        ['Hours', esc(it.hours_per_week || '') || '<span class="muted">not stated</span>']
      ];
    },
    chips: it => {
      const c = [];
      if (casualTier(it) === 2) c.push(['Below floor', 'crit']);
      if (casualTier(it) === 1) c.push(['Pay not listed', 'warn']);
      return c;
    },
    actions: it => safeUrl(it.resume_doc) ? `<a class="btn small ghost" href="${esc(it.resume_doc)}" target="_blank" rel="noopener">Tailored resume ↗</a>` : '',
    more: it => noteBlock(it)
  },
  {
    id: 'internships', file: 'internships', label: 'Internships', icon: '🚀', noun: 'internship',
    heading: 'Internships',
    lede: 'Software internships, Australia first, then Hong Kong, Singapore, the US, the UK, Europe and remote. UNSW breaks: 11 Dec 2026 to 14 Feb 2027, 14 to 30 May 2027, 27 Aug to 12 Sep 2027, from 10 Dec 2027.',
    schedule: 'The scout refreshes this every day at 4:38 am.',
    search: it => [it.title, it.org, it.location, it.country, it.role_type, it.notes, it.work_rights],
    filters: () => [
      { type: 'multi', key: 'country', label: 'Country', get: it => it.country },
      { type: 'multi', key: 'role', label: 'Role', get: it => it.role_type },
      { type: 'multi', key: 'paid', label: 'Pay', get: it => titleCase(it.paid || 'unknown') },
      { type: 'multi', key: 'intl', label: 'Accepts international students', get: it => titleCase(it.accepts_international || 'unknown') },
      { type: 'toggle', key: 'fits', label: 'Fits a UNSW break', test: it => it.fits_break === true },
      { type: 'select', key: 'within', label: 'Closes within', options: [['', 'Any time'], ['7', '7 days'], ['14', '14 days'], ['30', '30 days'], ['60', '60 days']],
        test: (it, v) => { const d = parseWhen(it.deadline); return d && dayDiff(d) <= Number(v); } },
      ...commonFilters()
    ],
    keys: {
      country: { label: 'Australia first', get: countryRank },
      deadline: { label: 'Closing date', get: deadlineMs },
      fits: { label: 'Fits a break first', get: it => it.fits_break ? 0 : 1 },
      paid: { label: 'Paid first', get: it => it.paid === 'paid' ? 0 : it.paid === 'unknown' ? 1 : 2 },
      found: { label: 'First seen', get: foundMs },
      org: { label: 'Company A to Z', get: it => it.org || '' }
    },
    presets: [
      { id: 'default', label: 'Australia first, closing soonest', keys: [['country', 'asc'], ['deadline', 'asc'], ['fits', 'asc'], ['paid', 'asc']] },
      { id: 'closing', label: 'Closing soonest', keys: [['deadline', 'asc'], ['country', 'asc']] },
      { id: 'fits', label: 'Fits a break, then closing', keys: [['fits', 'asc'], ['deadline', 'asc']] },
      { id: 'newest', label: 'Newest first', keys: [['found', 'desc'], ['country', 'asc']] },
      { id: 'org', label: 'Company A to Z', keys: [['org', 'asc']] }
    ],
    when: it => it.deadline,
    facts: it => [
      ['Where', esc([it.location, it.country].filter(Boolean).join(', '))],
      ['Pay', esc(titleCase(it.paid || 'unknown'))],
      ['When', esc(it.start_window || '') || '<span class="muted">not stated</span>'],
      ['Work rights', esc(it.work_rights || '') || '<span class="muted">not stated</span>']
    ],
    chips: it => {
      const c = [];
      if (it.fits_break === true) c.push(['Fits a break', 'good']);
      else c.push(['Outside breaks or dates unknown', 'warn']);
      if (it.accepts_international === 'yes') c.push(['Accepts international', 'good']);
      if (it.accepts_international === 'no') c.push(['No international', 'crit']);
      if (it.role_type) c.push([it.role_type, '']);
      return c;
    },
    more: it => noteBlock(it)
  },
  {
    id: 'hackathons', file: 'hackathons', label: 'Hackathons', icon: '🏆', noun: 'event',
    heading: 'Hackathons and CTFs',
    lede: 'Sydney in person first, then the rest of Australia, then online. Themes: AI/ML, fintech and quant, security and CTF, web and apps, data.',
    schedule: 'The scout refreshes this on Monday, Wednesday and Friday at 5:12 am.',
    search: it => [it.title, it.org, it.city, it.mode, arr(it.themes).join(' '), it.notes, it.prize],
    filters: () => [
      { type: 'multi', key: 'mode', label: 'Format', get: it => titleCase(it.mode) },
      { type: 'multi', key: 'city', label: 'City', get: it => it.city || (it.mode === 'online' ? 'Online' : null) },
      { type: 'multi', key: 'themes', label: 'Themes', get: it => arr(it.themes) },
      { type: 'multi', key: 'team', label: 'Team', get: it => titleCase(it.team || 'unknown') },
      { type: 'toggle', key: 'free', label: 'Free only', test: it => /^free$/i.test(String(it.cost || '').trim()) },
      { type: 'select', key: 'within', label: 'Registration closes within', options: [['', 'Any time'], ['7', '7 days'], ['14', '14 days'], ['30', '30 days'], ['90', '90 days']],
        test: (it, v) => { const d = parseWhen(it.deadline); return d && dayDiff(d) <= Number(v); } },
      ...commonFilters()
    ],
    keys: {
      region: { label: 'Sydney first', get: hackRegion },
      deadline: { label: 'Registration closes', get: deadlineMs },
      starts: { label: 'Start date', get: it => { const d = parseWhen(it.starts_at, 'start'); return d ? +d : null; } },
      found: { label: 'First seen', get: foundMs },
      title: { label: 'Name A to Z', get: it => it.title || '' }
    },
    presets: [
      { id: 'default', label: 'Sydney first, closing soonest', keys: [['region', 'asc'], ['deadline', 'asc']] },
      { id: 'closing', label: 'Registration closing soonest', keys: [['deadline', 'asc']] },
      { id: 'starts', label: 'Starts soonest', keys: [['starts', 'asc']] },
      { id: 'newest', label: 'Newest first', keys: [['found', 'desc']] }
    ],
    when: it => it.deadline,
    whenLabel: 'Registration',
    facts: it => [
      ['Dates', `<span class="num">${esc(rangeText(it.starts_at, it.ends_at))}</span>`],
      ['Where', esc([titleCase(it.mode), it.city].filter(Boolean).join(' · '))],
      ['Team', esc(titleCase(it.team || 'unknown'))],
      ['Cost and prize', esc([it.cost, it.prize].filter(Boolean).join(' · ')) || '<span class="muted">not stated</span>']
    ],
    chips: it => arr(it.themes).map(t => [t, 'info']),
    more: it => noteBlock(it)
  },
  {
    id: 'accommodation', file: 'accommodation', label: 'Accommodation', icon: '🏠', noun: 'room',
    heading: 'Rooms near UNSW Village',
    lede: 'Up to $350 a week in Kensington, Kingsford, Randwick, Maroubra and Coogee, moving in late Dec 2026 to early Feb 2027. Rooms with more bills included rank higher. Open each listing for photos.',
    schedule: 'The scout refreshes this every day at 4:54 am until a lease is signed.',
    search: it => [it.title, it.org, it.suburb, it.room_type, it.household, it.notes, it.lease],
    filters: () => [
      { type: 'max', key: 'max_rent', label: 'Rent at most ($/wk)', get: it => num(it.rent_pw), step: 10, placeholder: '350' },
      { type: 'select', key: 'bills', label: 'Bills included', options: [['', 'Any'], ['4', 'All four'], ['3', '3 or more'], ['2', '2 or more'], ['1', 'At least 1']],
        test: (it, v) => billsCount(it) >= Number(v) },
      { type: 'multi', key: 'suburb', label: 'Suburb', get: it => it.suburb },
      { type: 'multi', key: 'room', label: 'Room type', get: it => it.room_type },
      { type: 'daterange', key: 'avail', label: 'Available from', get: it => it.available_from },
      { type: 'multi', key: 'lease', label: 'Lease', get: it => it.lease },
      { type: 'multi', key: 'furnished', label: 'Furnished', get: it => titleCase(it.furnished || 'unknown') },
      { type: 'multi', key: 'bath', label: 'Own bathroom', get: it => titleCase(it.own_bathroom || 'unknown') },
      { type: 'toggle', key: 'walk', label: 'Walkable to UNSW', test: it => it.walkable === true },
      { type: 'select', key: 'scam', label: 'Scam flags', options: [['', 'Show all'], ['none', 'No flags only'], ['some', 'Flagged only']],
        test: (it, v) => v === 'none' ? arr(it.scam_flags).length === 0 : arr(it.scam_flags).length > 0 },
      ...commonFilters()
    ],
    keys: {
      bills: { label: 'Most bills included', get: it => -billsCount(it) },
      rent: { label: 'Rent', get: it => num(it.rent_pw) },
      total: { label: 'Rent plus estimated bills', get: roomTotal },
      walk: { label: 'Walkable first', get: it => it.walkable ? 0 : 1 },
      distance: { label: 'Distance', get: it => num(it.distance_km) },
      transit: { label: 'Travel time', get: it => num(it.transit_min) },
      avail: { label: 'Available from', get: it => { const d = parseWhen(it.available_from, 'start'); return d ? +d : null; } },
      scam: { label: 'Fewest scam flags', get: it => arr(it.scam_flags).length },
      found: { label: 'First seen', get: foundMs }
    },
    presets: [
      { id: 'default', label: 'Bills included, then cheapest', keys: [['bills', 'asc'], ['walk', 'asc'], ['total', 'asc'], ['avail', 'asc']] },
      { id: 'cheapest', label: 'Cheapest', keys: [['total', 'asc'], ['bills', 'asc']] },
      { id: 'closest', label: 'Closest, then cheapest', keys: [['distance', 'asc'], ['total', 'asc']] },
      { id: 'movein', label: 'Earliest move-in', keys: [['avail', 'asc'], ['total', 'asc']] },
      { id: 'safe', label: 'Fewest scam flags', keys: [['scam', 'asc'], ['bills', 'asc'], ['total', 'asc']] },
      { id: 'newest', label: 'Newest first', keys: [['found', 'desc']] }
    ],
    when: it => it.available_from,
    whenLabel: 'Available',
    whenEdge: 'start',
    facts: it => {
      const r = num(it.rent_pw), t = roomTotal(it);
      return [
        ['Rent', r == null ? '<span class="muted">not stated</span>' : `<span class="num">${money(r)}/wk</span>`],
        ['With bills', t == null ? '' : `<span class="num">≈ ${money(t)}/wk</span>${num(it.bills_estimate_pw) ? ' <span class="muted">⚠️ est.</span>' : ''}`],
        ['Bills', `<span class="num">${billsCount(it)} of 4</span> included`],
        ['Distance', distanceText(it) + (it.walkable ? ' · walkable' : '')],
        ['Room', esc(it.room_type || '')],
        ['Lease', esc(it.lease || '') || '<span class="muted">not stated</span>'],
        ['Furnished', esc(titleCase(it.furnished || 'unknown'))],
        ['Own bathroom', esc(titleCase(it.own_bathroom || 'unknown'))]
      ];
    },
    chips: it => {
      const c = [];
      const n = billsCount(it);
      if (n === 4) c.push(['All bills included', 'good']);
      if (arr(it.scam_flags).length) c.push([`${arr(it.scam_flags).length} scam flag${arr(it.scam_flags).length > 1 ? 's' : ''}`, 'crit']);
      if (it.walkable) c.push(['Walkable', 'good']);
      return c;
    },
    more: it => {
      const bills = BILLS.map(b => {
        const v = (it.bills || {})[b] || 'not mentioned';
        const cls = v === 'included' ? 'included' : v === 'excluded' ? 'excluded' : 'unknown';
        return `<div class="bill ${cls}"><span>${titleCase(b)}</span><b>${esc(v)}</b></div>`;
      }).join('');
      let h = `<div><h4>Bills</h4><div class="bills">${bills}</div>${num(it.bills_estimate_pw) ? `<p class="muted">⚠️ Estimated extra for bills not included: ${money(num(it.bills_estimate_pw))}/wk</p>` : ''}</div>`;
      if (arr(it.scam_flags).length) h += `<div class="flagbox"><h4>Scam flags</h4><ul>${arr(it.scam_flags).map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>`;
      if (it.household) h += `<div><h4>Household</h4><p>${esc(it.household)}</p></div>`;
      if (arr(it.inspection_questions).length) h += `<div><h4>Ask at the inspection</h4><ul>${arr(it.inspection_questions).map(q => `<li>${esc(q)}</li>`).join('')}</ul></div>`;
      if (it.enquiry_draft) h += `<div><h4>Enquiry draft (you send it)</h4><div class="draft" id="d-${esc(cssId(it.id))}">${esc(it.enquiry_draft)}</div><button type="button" class="btn small ghost" data-copy="d-${esc(cssId(it.id))}">Copy message</button></div>`;
      return h + noteBlock(it);
    }
  }
];
const TAB = Object.fromEntries(TABS.map(t => [t.id, t]));

function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } }
function cssId(s) { return String(s || '').replace(/[^a-zA-Z0-9_-]/g, '_'); }
function distanceText(it) {
  const km = num(it.distance_km), mins = num(it.transit_min);
  if (km == null && mins == null) return '<span class="muted">not stated</span>';
  return `<span class="num">${[km != null ? `${km} km` : null, mins != null ? `${mins} min` : null].filter(Boolean).join(' · ')}</span>`;
}
function rangeText(a, b) {
  if (!a) return 'not stated';
  const sa = showWhen(a, 'start');
  if (!b || b === a) return sa;
  return `${sa} to ${showWhen(b, 'end')}`;
}
function noteBlock(it) {
  let h = '';
  if (it.notes) h += `<div><h4>Notes</h4><p>${esc(it.notes)}</p></div>`;
  h += `<p class="muted">Source: ${esc(it.source || 'unknown')}${it.source_rank ? ` (rank ${esc(it.source_rank)})` : ''} · first seen ${esc(showWhen(it.found_at, 'start') || 'unknown')} · last seen ${esc(showWhen(it.last_seen_at, 'start') || 'unknown')}</p>`;
  return h;
}

/* ---------- state ---------- */
const DATA = {};
const defaults = () => ({ q: '', sort: 'default', cs: [], hc: true, nw: false, f: {} });
const state = { tab: 'uni', per: Object.fromEntries(TABS.map(t => [t.id, defaults()])) };
const cur = () => state.per[state.tab];

function readHash() {
  const raw = location.hash.replace(/^#/, '');
  if (!raw) return false;
  if (TAB[raw]) { state.tab = raw; return true; }
  const p = new URLSearchParams(raw);
  const tab = p.get('tab');
  if (!TAB[tab]) return false;
  state.tab = tab;
  const s = defaults();
  s.q = p.get('q') || '';
  s.sort = p.get('sort') || 'default';
  s.hc = p.get('hc') !== '0';
  s.nw = p.get('new') === '1';
  s.cs = (p.get('cs') || '').split(',').filter(Boolean).map(x => x.split(':'));
  for (const [k, v] of p) {
    if (!k.startsWith('f_')) continue;
    const key = k.slice(2);
    const def = TAB[tab].filters().find(f => f.key === key);
    if (!def) continue;
    s.f[key] = def.type === 'multi' ? v.split('|').filter(Boolean) : def.type === 'toggle' ? v === '1' : v;
  }
  state.per[tab] = s;
  return true;
}
function writeHash() {
  const s = cur();
  const p = new URLSearchParams();
  p.set('tab', state.tab);
  if (s.q) p.set('q', s.q);
  if (s.sort !== 'default') p.set('sort', s.sort);
  if (s.sort === 'custom' && s.cs.length) p.set('cs', s.cs.map(x => x.join(':')).join(','));
  if (!s.hc) p.set('hc', '0');
  if (s.nw) p.set('new', '1');
  for (const [k, v] of Object.entries(s.f)) {
    if (Array.isArray(v) ? v.length : (v !== '' && v !== false && v != null)) p.set('f_' + k, Array.isArray(v) ? v.join('|') : v === true ? '1' : v);
  }
  const h = '#' + p.toString();
  try { history.replaceState(null, '', h); } catch (e) { /* sandboxed frame */ }
  store.set('radar.tab', state.tab);
}

/* ---------- data loading ---------- */
async function load(tab) {
  try {
    const res = await fetch(`data/${tab.file}.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = await res.json();
    d.items = Array.isArray(d.items) ? d.items : [];
    d.sources = Array.isArray(d.sources) ? d.sources : [];
    DATA[tab.id] = d;
  } catch (e) {
    DATA[tab.id] = { error: String(e.message || e), items: [], sources: [] };
  }
}

/* ---------- filtering and sorting ---------- */
function applyFilters(tab, items, s, skipKey) {
  const data = DATA[tab.id];
  const q = s.q.trim().toLowerCase();
  const words = q ? q.split(/\s+/) : [];
  const defs = tab.filters();
  return items.filter(it => {
    if (s.hc && isClosed(it)) return false;
    if (s.nw && !isNew(it, data)) return false;
    if (words.length) {
      const hay = tab.search(it).filter(Boolean).join(' ').toLowerCase();
      if (!words.every(w => hay.includes(w))) return false;
    }
    for (const def of defs) {
      if (def.key === skipKey) continue;
      const v = s.f[def.key];
      if (v == null || v === '' || v === false || (Array.isArray(v) && !v.length)) continue;
      if (def.type === 'multi') {
        const vals = arr(def.get(it)).map(String);
        if (!vals.some(x => v.includes(x))) return false;
      } else if (def.type === 'toggle') {
        if (!def.test(it)) return false;
      } else if (def.type === 'select') {
        if (!def.test(it, v)) return false;
      } else if (def.type === 'max' || def.type === 'min') {
        const n = Number(v), x = def.get(it);
        if (isNaN(n)) continue;
        if (x == null) return false;
        if (def.type === 'max' ? x > n : x < n) return false;
      } else if (def.type === 'daterange') {
        const [from, to] = String(v).split('..');
        const d = parseWhen(def.get(it), 'start');
        if (!d) return false;
        if (from && d < parseWhen(from, 'start')) return false;
        if (to && d > parseWhen(to, 'end')) return false;
      }
    }
    return true;
  });
}
function sortKeys(tab, s) {
  if (s.sort === 'custom' && s.cs.length) return s.cs.filter(([k]) => tab.keys[k]);
  const p = tab.presets.find(x => x.id === s.sort) || tab.presets[0];
  return p.keys;
}
function applySort(tab, items, s) {
  const keys = sortKeys(tab, s);
  return items.slice().sort((a, b) => {
    for (const [k, dir] of keys) {
      const get = tab.keys[k].get;
      const va = get(a), vb = get(b);
      if (va == null || vb == null) { const c = cmpVal(va, vb); if (c) return c; continue; }
      const c = cmpVal(va, vb);
      if (c) return dir === 'desc' ? -c : c;
    }
    return String(a.title || '').localeCompare(String(b.title || ''));
  });
}

/* ---------- rendering ---------- */
function renderTabs() {
  $('#tabs').innerHTML = TABS.map(t => {
    const d = DATA[t.id];
    const open = d ? d.items.filter(it => !isClosed(it)).length : '…';
    const fresh = d ? d.items.filter(it => !isClosed(it) && isNew(it, d)).length : 0;
    return `<button class="tab" role="tab" type="button" id="tab-${t.id}" data-tab="${t.id}" aria-selected="${t.id === state.tab}">
      <span aria-hidden="true">${t.icon}</span>${esc(t.label)}
      <span class="n${fresh ? ' has-new' : ''}" title="${fresh ? `${fresh} new` : 'open items'}">${fresh ? `${fresh} new` : open}</span></button>`;
  }).join('');
}

function renderSummary() {
  const tab = TAB[state.tab], d = DATA[tab.id];
  if (!d) { $('#summary').innerHTML = `<h1>${esc(tab.heading)}</h1><p class="lede">Loading…</p>`; return; }
  const open = d.items.filter(it => !isClosed(it));
  const fresh = open.filter(it => isNew(it, d)).length;
  const soon = open.filter(it => { const w = tab.when(it); const c = tab.whenEdge === 'start' ? null : countdown(w); return c && (c.level === 'crit' || c.level === 'warn' || c.level === 'soon'); }).length;
  const checked = d.sources.filter(x => x.result === 'checked').length;
  const notChecked = d.sources.filter(x => x.result !== 'checked');
  const upd = d.updated_at ? showWhen(d.updated_at) : 'not run yet';
  const srcRows = d.sources.map(x => `<tr><td class="num">${esc(x.rank ?? '')}</td><td>${esc(x.name)}</td><td>${x.result === 'checked' ? '✅ checked' : x.result === 'failed' ? '🚫 failed' : '⏸️ not checked'}</td><td class="num">${esc(x.found ?? '')}</td><td>${esc(x.note || '')}</td></tr>`).join('');
  $('#summary').innerHTML = `
    <h1>${esc(tab.heading)}</h1>
    <p class="lede">${esc(tab.lede)}</p>
    <div class="stats">
      <span><b>${open.length}</b> open</span>
      <span><b>${fresh}</b> new since last run</span>
      ${tab.whenEdge === 'start' ? '' : `<span><b>${soon}</b> due within 7 days</span>`}
      <span>Updated <b>${esc(upd)}</b></span>
    </div>
    ${d.error ? `<p class="flagbox">Could not load this section's data (${esc(d.error)}). ${esc(tab.schedule)}</p>` : ''}
    ${d.sources.length ? `<details class="sources"><summary>${checked} of ${d.sources.length} sources checked${notChecked.length ? ` · ${notChecked.length} not checked` : ''}</summary>
      <div class="src-table-wrap"><table class="src-table"><thead><tr><th>Rank</th><th>Source</th><th>Result</th><th>Found</th><th>Note</th></tr></thead><tbody>${srcRows}</tbody></table></div></details>` : ''}`;
}

function renderSortSelect() {
  const tab = TAB[state.tab], s = cur();
  $('#sort').innerHTML = tab.presets.map(p => `<option value="${p.id}">${esc(p.label)}</option>`).join('') + '<option value="custom">Custom sort…</option>';
  $('#sort').value = s.sort === 'custom' || tab.presets.some(p => p.id === s.sort) ? s.sort : 'default';
  $('#q').value = s.q;
  renderCustomSort();
}
function renderCustomSort() {
  const tab = TAB[state.tab], s = cur(), box = $('#custom-sort');
  if (s.sort !== 'custom') { box.hidden = true; return; }
  if (!s.cs.length) s.cs = (tab.presets[0].keys).map(k => k.slice());
  const opts = sel => '<option value="">(none)</option>' + Object.entries(tab.keys).map(([k, v]) => `<option value="${k}"${k === sel ? ' selected' : ''}>${esc(v.label)}</option>`).join('');
  box.innerHTML = [0, 1, 2].map(i => {
    const [k = '', dir = 'asc'] = s.cs[i] || [];
    return `<div class="row"><span>${i + 1}</span>
      <select id="cs-k-${i}" data-cs="${i}" data-part="k" aria-label="Sort key ${i + 1}">${opts(k)}</select>
      <select id="cs-d-${i}" data-cs="${i}" data-part="d" aria-label="Direction ${i + 1}"><option value="asc"${dir === 'asc' ? ' selected' : ''}>Low to high</option><option value="desc"${dir === 'desc' ? ' selected' : ''}>High to low</option></select></div>`;
  }).join('');
  box.hidden = false;
}

function renderFilters() {
  const tab = TAB[state.tab], s = cur(), d = DATA[tab.id];
  const items = d ? d.items : [];
  const parts = [`<div class="fhead"><h2>Filters</h2><button type="button" class="linkbtn" data-clear>Clear all</button></div>`,
    `<div class="fgroup"><label class="switch"><input type="checkbox" id="f-hc" data-g="hc"${s.hc ? ' checked' : ''}> Hide closed</label>
     <label class="switch"><input type="checkbox" id="f-nw" data-g="nw"${s.nw ? ' checked' : ''}> New since last run only</label></div>`];
  for (const def of tab.filters()) {
    const id = `f-${tab.id}-${def.key}`;
    const v = s.f[def.key];
    if (def.type === 'multi') {
      const pool = applyFilters(tab, items, s, def.key);
      const counts = new Map();
      for (const it of items) for (const x of arr(def.get(it))) if (x != null && x !== '') counts.set(String(x), 0);
      for (const it of pool) for (const x of arr(def.get(it))) if (x != null && x !== '') counts.set(String(x), (counts.get(String(x)) || 0) + 1);
      if (!counts.size) continue;
      const vals = [...counts.keys()].sort((a, b) => a.localeCompare(b));
      parts.push(`<fieldset class="fgroup" style="border:0;margin:0;padding:0"><legend class="ft">${esc(def.label)}</legend><div class="opts">${vals.map((x, i) =>
        `<label class="opt"><input type="checkbox" id="${id}-${i}" data-f="${def.key}" value="${esc(x)}"${arr(v).includes(x) ? ' checked' : ''}><span>${esc(x)} <i>${counts.get(x)}</i></span></label>`).join('')}</div></fieldset>`);
    } else if (def.type === 'toggle') {
      parts.push(`<div class="fgroup"><label class="switch"><input type="checkbox" id="${id}" data-f="${def.key}"${v ? ' checked' : ''}> ${esc(def.label)}</label></div>`);
    } else if (def.type === 'select') {
      parts.push(`<div class="fgroup"><label class="ft" for="${id}">${esc(def.label)}</label><select id="${id}" data-f="${def.key}">${def.options.map(([ov, ol]) => `<option value="${esc(ov)}"${String(v || '') === ov ? ' selected' : ''}>${esc(ol)}</option>`).join('')}</select></div>`);
    } else if (def.type === 'max' || def.type === 'min') {
      parts.push(`<div class="fgroup"><label class="ft" for="${id}">${esc(def.label)}</label><input type="number" inputmode="decimal" id="${id}" data-f="${def.key}" step="${def.step || 1}" min="0" value="${esc(v || '')}" placeholder="${esc(def.placeholder || '')}"></div>`);
    } else if (def.type === 'daterange') {
      const [from = '', to = ''] = String(v || '').split('..');
      parts.push(`<div class="fgroup"><span class="ft">${esc(def.label)}</span><div class="two">
        <label>From<input type="date" id="${id}-from" data-f="${def.key}" data-range="from" value="${esc(from)}"></label>
        <label>To<input type="date" id="${id}-to" data-f="${def.key}" data-range="to" value="${esc(to)}"></label></div></div>`);
    }
  }
  $('#filters').innerHTML = parts.join('');
  const n = activeCount();
  $('#fcount').hidden = !n;
  $('#fcount').textContent = n;
}
function activeCount() {
  const s = cur();
  return Object.values(s.f).filter(v => Array.isArray(v) ? v.length : (v !== '' && v !== false && v != null)).length + (s.nw ? 1 : 0) + (s.hc ? 0 : 1);
}

function cardHtml(tab, it, data) {
  const closed = isClosed(it);
  const link = safeUrl(it.link);
  const w = tab.when(it);
  const cd = tab.whenEdge === 'start' ? null : countdown(w);
  const whenTxt = w ? showWhen(w, tab.whenEdge || 'end') : '';
  const label = tab.whenLabel || (tab.id === 'uni' ? 'Due' : 'Closes');
  const st = it.status || (tab.id === 'uni' ? 'to do' : 'new');
  const chips = [];
  if (isNew(it, data) && !closed) chips.push('<span class="chip new">New</span>');
  if (closed) chips.push('<span class="chip closed">Closed</span>');
  chips.push(`<span class="chip ${STATUS_CHIP[st] ?? ''}">${esc(titleCase(st))}</span>`);
  for (const [t, c] of tab.chips(it)) chips.push(`<span class="chip ${c}">${esc(t)}</span>`);
  chips.push(`<span class="chip" title="${it.verified === '✅' ? 'Official page read' : it.verified === '🚫' ? 'Could not access' : 'Unverified or estimated'}">${esc(it.verified || '⚠️')}</span>`);
  const facts = tab.facts(it).filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => `<div class="fact"><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('');
  const extra = tab.actions ? tab.actions(it) : '';
  return `<article class="card${closed ? ' is-closed' : ''}">
    <div class="card-top">
      <div class="card-title">
        <h3>${link ? `<a href="${esc(link)}" target="_blank" rel="noopener">${esc(it.title)}</a>` : esc(it.title)}</h3>
        <div class="org">${esc(it.org || '')}</div>
      </div>
      <div class="when">
        ${whenTxt ? `<span class="date">${esc(label)} ${esc(whenTxt)}</span>` : `<span class="date muted">${tab.id === 'uni' ? 'Date not set' : tab.whenEdge === 'start' ? 'Date not stated' : 'No closing date'}</span>`}
        ${cd ? `<span class="cd ${cd.level}" data-when="${esc(w)}">${esc(cd.text)}</span>` : ''}
      </div>
    </div>
    <dl class="facts">${facts}</dl>
    <div class="chips">${chips.join('')}</div>
    <div class="actions">
      ${link ? `<a class="btn small" href="${esc(link)}" target="_blank" rel="noopener">Open official page ↗</a>` : ''}
      ${extra}
    </div>
    <details class="more"><summary>More details</summary><div class="more-body">${tab.more(it)}</div></details>
  </article>`;
}

function uniGroup(it) {
  if (isClosed(it)) return 'Closed';
  const d = parseWhen(it.deadline);
  if (!d) return 'Date not set';
  const n = dayDiff(d);
  if (n <= 0) return 'Today';
  if (n <= 3) return 'Next 3 days';
  if (n <= 7) return 'This week';
  if (n <= 30) return 'Next 30 days';
  return 'Later';
}

function renderResults() {
  const tab = TAB[state.tab], s = cur(), d = DATA[tab.id];
  const box = $('#results');
  if (!d) { box.innerHTML = '<div class="empty"><h3>Loading…</h3></div>'; return; }
  if (!d.items.length) {
    box.innerHTML = `<div class="empty"><h3>No ${esc(tab.noun)}s yet</h3><p>${esc(tab.schedule)} You can also run it by hand in Claude.</p></div>`;
    return;
  }
  const list = applySort(tab, applyFilters(tab, d.items, s), s);
  const total = d.items.length;
  const hiddenClosed = s.hc ? d.items.filter(isClosed).length : 0;
  let html = `<div class="rhead"><span>${list.length} of ${total} shown${hiddenClosed ? ` · ${hiddenClosed} closed hidden` : ''}</span></div>`;
  if (!list.length) {
    html += `<div class="empty"><h3>Nothing matches these filters</h3><p>Try fewer filters or a shorter search.</p><button type="button" class="btn ghost" data-clear>Clear filters</button></div>`;
    box.innerHTML = html;
    return;
  }
  const preset = tab.presets.find(p => p.id === s.sort);
  if (preset && preset.group) {
    const order = ['Today', 'Next 3 days', 'This week', 'Next 30 days', 'Later', 'Date not set', 'Closed'];
    const groups = new Map(order.map(g => [g, []]));
    for (const it of list) groups.get(uniGroup(it)).push(it);
    for (const [g, items] of groups) {
      if (!items.length) continue;
      html += `<h2 class="group-h">${esc(g)} <span class="muted">${items.length}</span></h2>` + items.map(it => cardHtml(tab, it, d)).join('');
    }
  } else {
    html += list.map(it => cardHtml(tab, it, d)).join('');
  }
  box.innerHTML = html;
}

function renderAll() {
  renderTabs();
  renderSummary();
  renderSortSelect();
  renderFilters();
  renderResults();
  writeHash();
}
function refresh() {
  const activeId = document.activeElement && document.activeElement.id;
  renderFilters(); renderResults(); renderTabs(); writeHash();
  if (activeId) { const el = document.getElementById(activeId); if (el) el.focus(); }
}

/* ---------- events ---------- */
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, 2200);
}
async function copyText(text, fallbackEl) {
  try { await navigator.clipboard.writeText(text); toast('Copied'); }
  catch (e) {
    if (fallbackEl) { const r = document.createRange(); r.selectNodeContents(fallbackEl); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); }
    toast('Press Cmd+C or Ctrl+C to copy the selected text');
  }
}

document.addEventListener('click', e => {
  const tabBtn = e.target.closest('[data-tab]');
  if (tabBtn) { state.tab = tabBtn.dataset.tab; renderAll(); return; }
  if (e.target.closest('[data-clear]')) {
    const s = cur(); s.f = {}; s.q = ''; s.nw = false; s.hc = true;
    $('#q').value = ''; refresh(); return;
  }
  const cp = e.target.closest('[data-copy]');
  if (cp) { const el = document.getElementById(cp.dataset.copy); if (el) copyText(el.textContent, el); return; }
});
$('#tabs').addEventListener('keydown', e => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const i = TABS.findIndex(t => t.id === state.tab);
  const n = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
  state.tab = n.id; renderAll(); document.getElementById('tab-' + n.id).focus();
});
$('#q').addEventListener('input', e => { cur().q = e.target.value; renderResults(); renderFilters(); writeHash(); });
$('#sort').addEventListener('change', e => { cur().sort = e.target.value; renderCustomSort(); renderResults(); writeHash(); });
$('#custom-sort').addEventListener('change', e => {
  const el = e.target.closest('[data-cs]'); if (!el) return;
  const s = cur(), i = Number(el.dataset.cs);
  while (s.cs.length <= i) s.cs.push(['', 'asc']);
  if (el.dataset.part === 'k') s.cs[i][0] = el.value; else s.cs[i][1] = el.value;
  s.cs = s.cs.map(x => x.slice());
  const clean = s.cs.filter(([k]) => k);
  renderResults(); writeHash();
  if (!clean.length) toast('Pick at least one sort key');
});
$('#filters').addEventListener('change', e => {
  const el = e.target, s = cur();
  if (el.dataset.g) { s[el.dataset.g] = el.checked; refresh(); return; }
  const key = el.dataset.f; if (!key) return;
  const def = TAB[state.tab].filters().find(f => f.key === key);
  if (def.type === 'multi') {
    const set = new Set(arr(s.f[key]));
    el.checked ? set.add(el.value) : set.delete(el.value);
    s.f[key] = [...set];
  } else if (def.type === 'toggle') s.f[key] = el.checked;
  else if (def.type === 'daterange') {
    const [from = '', to = ''] = String(s.f[key] || '').split('..');
    const next = el.dataset.range === 'from' ? [el.value, to] : [from, el.value];
    s.f[key] = next[0] || next[1] ? next.join('..') : '';
  } else s.f[key] = el.value;
  refresh();
});
$('#filters-btn').addEventListener('click', () => {
  const f = $('#filters'), open = f.hasAttribute('data-open');
  open ? f.removeAttribute('data-open') : f.setAttribute('data-open', '');
  $('#filters-btn').setAttribute('aria-expanded', String(!open));
});
$('#share-btn').addEventListener('click', () => { writeHash(); copyText(location.href); });
window.addEventListener('hashchange', () => { if (readHash()) renderAll(); });

/* theme: Auto follows the device; the choice is remembered on this device only */
const THEMES = ['auto', 'light', 'dark'];
function applyTheme(t) {
  const root = document.documentElement;
  if (t === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t);
  $('#theme-label').textContent = t === 'auto' ? 'Auto' : t === 'light' ? 'Light' : 'Dark';
}
let theme = store.get('radar.theme') || 'auto';
if (!THEMES.includes(theme)) theme = 'auto';
if (theme !== 'auto' || !document.documentElement.hasAttribute('data-theme')) applyTheme(theme);
$('#theme-btn').addEventListener('click', () => {
  theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
  store.set('radar.theme', theme); applyTheme(theme);
});

/* ---------- start ---------- */
(async function start() {
  if (!readHash()) { const t = store.get('radar.tab'); if (TAB[t]) state.tab = t; }
  renderAll();
  await Promise.all(TABS.map(load));
  renderAll();
  setInterval(() => {
    document.querySelectorAll('.cd[data-when]').forEach(el => {
      const c = countdown(el.dataset.when);
      if (!c) return;
      el.textContent = c.text;
      el.className = `cd ${c.level}`;
    });
  }, 60000);
})();
