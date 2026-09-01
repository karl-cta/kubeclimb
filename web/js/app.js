const TOTAL = MODULES.length;

const VIEW = { DASHBOARD: 0, CHEATSHEET: -1, REVISION: -2, EXAM: -3 };

const EXAM_SIZE = 20;
const EXAM_MINUTES = 30;
const EXAM_PASS = 0.66;

// Pondérations officielles du CKA. Chaque module alimente un domaine.
const CKA_DOMAINS = [
  { id: 'troubleshooting', name: 'Troubleshooting', weight: 0.30, modules: [14] },
  { id: 'architecture', name: 'Architecture du cluster', weight: 0.25, modules: [1, 2, 10, 12, 13] },
  { id: 'networking', name: 'Services et réseau', weight: 0.20, modules: [6, 9] },
  { id: 'workloads', name: 'Workloads et scheduling', weight: 0.15, modules: [3, 4, 5, 8, 11, 15] },
  { id: 'storage', name: 'Stockage', weight: 0.10, modules: [7] }
];

const PHASES = [
  { name: 'Fondations', modules: [1, 2, 3] },
  { name: 'Workloads', modules: [4, 5, 6, 7, 8] },
  { name: 'Production', modules: [9, 10, 11, 12] },
  { name: 'Maîtrise', modules: [13, 14] },
  { name: 'Projet', modules: [15] }
];

const LEVELS = [
  { min: 0, name: 'Débutant', altitude: 0 },
  { min: 150, name: 'Randonneur', altitude: 1200 },
  { min: 450, name: 'Grimpeur', altitude: 2800 },
  { min: 900, name: 'Alpiniste', altitude: 4500 },
  { min: 1500, name: 'Guide', altitude: 6200 },
  { min: 2200, name: 'Sherpa', altitude: 7500 },
  { min: 3000, name: 'Légende', altitude: 8848 }
];

const BADGE_DEFS = {
  progression: [
    { id: 'premiere-marche', name: 'Première Marche', desc: 'Terminer un module', icon: 'step', check: s => s.completed.length >= 1 },
    { id: 'base-camp', name: 'Base Camp', desc: 'Modules 1 à 3', icon: 'tent', check: s => [1, 2, 3].every(m => s.completed.includes(m)) },
    { id: 'sommet-workloads', name: 'Sommet Workloads', desc: 'Modules 4 à 8', icon: 'peak', check: s => [4, 5, 6, 7, 8].every(m => s.completed.includes(m)) },
    { id: 'sherpa-reseau', name: 'Sherpa Réseau', desc: 'Modules 6 et 9', icon: 'compass', check: s => [6, 9].every(m => s.completed.includes(m)) },
    { id: 'gardien', name: 'Gardien du Cluster', desc: 'Module 10', icon: 'shield', check: s => s.completed.includes(10) },
    { id: 'topographe', name: 'Topographe', desc: 'Modules 11 et 12', icon: 'map', check: s => [11, 12].every(m => s.completed.includes(m)) },
    { id: 'helm-master', name: 'Helm Master', desc: 'Module 13', icon: 'wheel', check: s => s.completed.includes(13) },
    { id: 'secouriste', name: 'Secouriste', desc: 'Module 14', icon: 'wrench', check: s => s.completed.includes(14) },
    { id: 'alpiniste', name: 'Alpiniste', desc: 'Module 15', icon: 'axe', check: s => s.completed.includes(15) },
    { id: 'au-sommet', name: 'Au Sommet', desc: 'Tous les modules', icon: 'flag', check: s => s.completed.length >= TOTAL }
  ],
  quiz: [
    { id: 'premier-quiz', name: 'Premier Quiz', desc: 'Réussir un quiz', icon: 'check', check: s => Object.values(s.quizScores).some(q => q.score / q.total >= 0.7) },
    { id: 'score-parfait', name: 'Score Parfait', desc: '100% sur un quiz', icon: 'star', check: s => Object.values(s.quizScores).some(q => q.score === q.total) },
    { id: 'serie-3', name: 'Série de 3', desc: '3 quiz réussis de suite', icon: 'streak3', check: s => quizStreak(s) >= 3 },
    { id: 'serie-5', name: 'Série de 5', desc: '5 quiz réussis de suite', icon: 'streak5', check: s => quizStreak(s) >= 5 },
    { id: 'cerveau-k8s', name: 'Cerveau K8s', desc: '100% partout', icon: 'brain', check: s => { const v = Object.values(s.quizScores); return v.length >= TOTAL && v.every(q => q.score === q.total); } }
  ],
  secret: [
    { id: 'noctambule', name: 'Noctambule', desc: 'Entre minuit et 5h', icon: 'moon', check: () => { const h = new Date().getHours(); return h >= 0 && h < 5; } },
    { id: 'marathonien', name: 'Marathonien', desc: '3 modules en une session', icon: 'bolt', check: s => (s._sessionCompleted || 0) >= 3 },
    { id: 'comeback', name: 'Comeback', desc: '7+ jours d\'absence', icon: 'return', check: s => s._comeback || false },
    { id: 'speed-runner', name: 'Speed Runner', desc: 'Module en moins de 15min', icon: 'clock', check: s => s._fastComplete || false },
    { id: 'reviseur', name: 'Réviseur', desc: 'Terminer une session de révision', icon: 'cards', check: s => (s.revision.runs || 0) >= 1 },
    { id: 'collectionneur', name: 'Collectionneur', desc: '12 badges', icon: 'diamond', check: s => s.badges.length >= 12 },
    { id: 'legende', name: 'Légende', desc: 'Tous les badges', icon: 'crown', check: s => s.badges.length >= badgeCount() - 1 }
  ]
};

const ICONS = {
  step:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18h4v-4H4zM10 14h4v-4h-4zM16 10h4V6h-4z"/></svg>',
  tent:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L3 20h18L12 3zM12 3v17M8 14l4-11 4 11"/></svg>',
  peak:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20l6-14 4 8 5-10 4 16H3z"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M16 8l-5.3 2.7L8 16l5.3-2.7z"/></svg>',
  shield:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 9-8 11-4.5-2-8-6-8-11V7l8-4z"/></svg>',
  map:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>',
  wheel:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 4v6M12 14v6M4 12h6M14 12h6M6.3 6.3l4.2 4.2M13.5 13.5l4.2 4.2M6.3 17.7l4.2-4.2M13.5 10.5l4.2-4.2"/></svg>',
  wrench:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3a5 5 0 00-4.5 7.1L3 17.6 6.4 21l7.5-7.5A5 5 0 1015 3z"/><circle cx="16" cy="8" r="1.6"/></svg>',
  axe:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20L18 4M14 4c2 0 4 2 4 4-2 0-4-2-4-4z"/></svg>',
  flag:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V3M4 3l6 3 6-3 4 3v10l-4-3-6 3-6-3"/></svg>',
  check:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/></svg>',
  star:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 3l2.5 6.5H21l-5 4 2 6.5L12 16l-6 4 2-6.5-5-4h6.5z"/></svg>',
  streak3: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 16l4-8 4 8M14 16l4-8 4 8M-2 16l4-8 4 8"/></svg>',
  streak5: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 16l2-8 2 8M7 16l2-8 2 8M12 16l2-8 2 8M17 16l2-8 2 8M-3 16l2-8 2 8"/></svg>',
  brain:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a4 4 0 00-4 4c-2.2 0-4 1.8-4 4a4 4 0 003 3.9V20h10v-5.1A4 4 0 0020 11c0-2.2-1.8-4-4-4a4 4 0 00-4-4z"/><path d="M12 3v17"/></svg>',
  moon:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14c-1.5 1.2-3.4 2-5.5 2-4.7 0-8.5-3.8-8.5-8.5 0-2.1.8-4 2-5.5C4.3 3.5 2 7.4 2 12c0 5.5 4.5 10 10 10 4.6 0 8.5-2.8 10-6z"/></svg>',
  bolt:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z"/></svg>',
  'return':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 109-9"/><path d="M12 3L8 7l4 4"/></svg>',
  clock:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg>',
  cards:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="12" height="14" rx="1.5"/><path d="M7 4h11a1.5 1.5 0 011.5 1.5V17"/></svg>',
  diamond: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 3L3 12l9 9 9-9-9-9z"/></svg>',
  crown:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h18V8l-4 4-5-6-5 6-4-4v10z"/></svg>',
  question:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 015 1c0 2-3 2-3 4"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>',
  book:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6a3 3 0 013 3v13a2.5 2.5 0 00-2.5-2.5H4z"/><path d="M20 4h-6a3 3 0 00-3 3v13a2.5 2.5 0 012.5-2.5H20z"/></svg>',
  grid:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'
};

let state = emptyState();
let sessionCompleted = 0;
let moduleViewStart = 0;
let saveTimer = null;
let previousLevel = -1;
let tocObserver = null;
let readObserver = null;
let quizAnswers = {};
let deck = null;
let exam = null;
let examTimer = null;
let searchIndex = null;
let cluster = { kubectl: false, context: '' };
let applyingHash = false;

function emptyState() {
  return { current: 0, completed: [], quizScores: {}, badges: [], sessions: [], sectionsRead: {}, revision: { missed: [], runs: 0, best: 0 }, checks: {}, exams: [] };
}

function badgeCount() {
  return Object.values(BADGE_DEFS).reduce((n, c) => n + c.length, 0);
}

function quizStreak(s) {
  const ids = Object.keys(s.quizScores).map(Number).sort((a, b) => a - b);
  let streak = 0, max = 0;
  for (const id of ids) {
    const q = s.quizScores[id];
    if (q.score / q.total >= 0.7) { streak++; max = Math.max(max, streak); }
    else streak = 0;
  }
  return max;
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => Progress.save(state), 300);
}

function calculateXP() {
  let xp = state.completed.length * 100;
  for (const q of Object.values(state.quizScores)) {
    if (q.score / q.total >= 0.7) xp += 50;
    if (q.score === q.total) xp += 25;
  }
  xp += state.badges.length * 30;
  xp += (state.revision.runs || 0) * 20;
  xp += Object.values(state.checks).filter(Boolean).length * 15;
  xp += bestExam() ? Math.round(bestExam().score / bestExam().total * 100) : 0;
  return xp;
}

function bestExam() {
  let best = null;
  for (const e of state.exams) {
    if (!best || e.score / e.total > best.score / best.total) best = e;
  }
  return best;
}

function getLevel(xp) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.min) level = l;
  }
  const idx = LEVELS.indexOf(level);
  const next = LEVELS[idx + 1];
  return { ...level, idx, next, progress: next ? (xp - level.min) / (next.min - level.min) : 1 };
}

function getStreak() {
  if (!state.sessions.length) return 0;
  const days = new Set();
  for (const s of state.sessions) days.add(new Date(s.start).toDateString());
  const sorted = [...days].map(d => new Date(d)).sort((a, b) => b - a);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (sorted[0].toDateString() !== today && sorted[0].toDateString() !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1] - sorted[i] <= 86400000 * 1.5) streak++;
    else break;
  }
  return streak;
}

function getTotalStudyTime() {
  let total = 0;
  for (const s of state.sessions) total += new Date(s.end).getTime() - new Date(s.start).getTime();
  return Math.max(0, total);
}

function formatDuration(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return hours + 'h' + String(minutes).padStart(2, '0');
  return minutes + 'min';
}

function readSections(id) {
  return state.sectionsRead[id] || [];
}

function markSectionRead(modId, idx) {
  const key = String(modId);
  const list = state.sectionsRead[key] || (state.sectionsRead[key] = []);
  if (list.includes(idx)) return;
  list.push(idx);
  scheduleSave();
  updateSectionUI(modId);
}

function updateSectionUI(modId) {
  const mod = MODULES.find(m => m.id === modId);
  if (!mod) return;
  const read = readSections(modId);
  const bar = document.getElementById('section-progress-fill');
  const label = document.getElementById('section-progress-label');
  if (bar) bar.style.width = Math.round((read.length / mod.sections.length) * 100) + '%';
  if (label) label.textContent = `${read.length} / ${mod.sections.length} sections lues`;
  document.querySelectorAll('.toc-link[data-section]').forEach(link => {
    link.classList.toggle('read', read.includes(parseInt(link.dataset.section)));
  });
}

function checkBadges() {
  const extended = { ...state, _sessionCompleted: sessionCompleted };
  const newBadges = [];
  for (const cat of Object.values(BADGE_DEFS)) {
    for (const b of cat) {
      if (!state.badges.includes(b.id) && b.check(extended)) {
        state.badges.push(b.id);
        newBadges.push(b);
      }
    }
  }
  if (newBadges.length) {
    scheduleSave();
    for (const b of newBadges) showToast(b);
    renderSidebar();
  }
}

function showToast(badge) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.innerHTML = `<div class="badge-icon">${ICONS[badge.icon]}</div><div class="toast-text"><strong>${badge.name}</strong>Badge débloqué</div>`;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => { el.classList.add('leaving'); setTimeout(() => el.remove(), 200); }, 4000);
}

function checkLevelUp() {
  const level = getLevel(calculateXP());
  if (level.idx > previousLevel && previousLevel >= 0) {
    const el = document.createElement('div');
    el.className = 'toast level-up';
    el.setAttribute('role', 'status');
    el.innerHTML = `<div class="badge-icon">${ICONS.peak}</div><div class="toast-text"><strong>${level.name}</strong>Nouveau rang — ${level.altitude.toLocaleString('fr-FR')}m</div>`;
    document.getElementById('toasts').appendChild(el);
    setTimeout(() => { el.classList.add('leaving'); setTimeout(() => el.remove(), 200); }, 5000);
  }
  previousLevel = level.idx;
}

function estimateReadingTime(mod) {
  const text = mod.sections.map(s => s.content).join(' ').replace(/<[^>]+>/g, '');
  const minutes = Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
  return minutes + (mod.exercises ? mod.exercises.length * 5 : 0);
}

function renderSidebar() {
  document.querySelectorAll('.sidebar-link').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.view) === state.current);
  });

  const list = document.getElementById('module-list');
  list.innerHTML = '';
  for (const phase of PHASES) {
    const g = document.createElement('div');
    g.className = 'phase-group';
    g.innerHTML = `<div class="phase-title">${phase.name}</div>`;
    for (const mid of phase.modules) {
      const mod = MODULES.find(m => m.id === mid);
      if (!mod) continue;
      const item = document.createElement('button');
      const cls = ['module-item'];
      if (state.completed.includes(mid)) cls.push('completed');
      if (state.current === mid) cls.push('active');
      item.className = cls.join(' ');
      item.type = 'button';
      item.innerHTML = `<span class="module-dot"></span><span class="module-name">${mod.title}</span>`;
      item.onclick = () => navigate(mid);
      g.appendChild(item);
    }
    list.appendChild(g);
  }

  const pct = Math.round((state.completed.length / TOTAL) * 100);
  document.getElementById('global-progress').style.width = pct + '%';
  document.getElementById('progress-text').textContent = `${state.completed.length} / ${TOTAL} modules`;

  const xp = calculateXP();
  const level = getLevel(xp);
  document.getElementById('sidebar-xp').innerHTML = `<div class="xp-level">${level.name}</div>
    <div class="xp-bar"><div class="xp-fill" style="width:${Math.round(level.progress * 100)}%"></div></div>
    <div class="xp-text">${xp} XP${level.next ? ' / ' + level.next.min + ' XP' : ''}</div>`;
}

const ROUTES = [
  { id: VIEW.DASHBOARD, hash: '#/', label: 'Tableau de bord' },
  { id: VIEW.CHEATSHEET, hash: '#/aide-memoire', label: 'Aide-mémoire kubectl' },
  { id: VIEW.REVISION, hash: '#/revision', label: 'Révision' },
  { id: VIEW.EXAM, hash: '#/examen', label: 'Examen blanc CKA' }
];

function viewHash(id, sectionIdx) {
  const named = ROUTES.find(r => r.id === id);
  if (named) return named.hash;
  return '#/module/' + id + (sectionIdx != null ? '/' + sectionIdx : '');
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const named = ROUTES.find(r => r.hash === '#/' + raw);
  if (named) return { id: named.id, section: null };
  const parts = raw.split('/');
  if (parts[0] === 'module') {
    const id = parseInt(parts[1]);
    if (MODULES.some(m => m.id === id)) {
      const sec = parseInt(parts[2]);
      return { id, section: Number.isInteger(sec) ? sec : null };
    }
  }
  return null;
}

function syncHash(id, sectionIdx) {
  const target = viewHash(id, sectionIdx);
  if (location.hash === target) return;
  applyingHash = true;
  location.hash = target;
  requestAnimationFrame(() => { applyingHash = false; });
}

function renderClusterStatus() {
  const el = document.getElementById('cluster-status');
  if (!cluster.kubectl) {
    el.className = 'cluster-status off';
    el.textContent = 'kubectl absent';
    el.title = 'Installe kubectl pour valider les exercices sur ton cluster (module 2)';
    return;
  }
  el.className = 'cluster-status' + (cluster.context ? ' on' : ' off');
  el.textContent = cluster.context || 'aucun contexte';
  el.title = cluster.context ? 'Contexte kubectl courant' : 'kubectl est installé mais aucun contexte n\'est actif';
}

function navigate(id, sectionIdx) {
  if (id !== VIEW.EXAM) {
    stopExamTimer();
    if (exam && !exam.done) exam = null;
  }
  state.current = id;
  moduleViewStart = id > 0 ? Date.now() : 0;
  quizAnswers = {};
  syncHash(id, sectionIdx);
  scheduleSave();
  render();
  closeMobile();
  if (sectionIdx != null) {
    const target = document.querySelector(`.content-section[data-section="${sectionIdx}"]`);
    if (target) { target.scrollIntoView({ behavior: 'instant', block: 'start' }); return; }
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function render() {
  renderSidebar();
  destroyFloatingTOC();
  if (readObserver) { readObserver.disconnect(); readObserver = null; }

  const el = document.getElementById('content');
  el.classList.remove('fade-in');
  void el.offsetWidth;
  el.classList.add('fade-in');

  if (state.current === VIEW.CHEATSHEET) { renderCheatsheet(el); return; }
  if (state.current === VIEW.REVISION) { renderRevision(el); return; }
  if (state.current === VIEW.EXAM) { renderExam(el); return; }

  const mod = MODULES.find(m => m.id === state.current);
  if (!mod) { state.current = VIEW.DASHBOARD; renderDashboard(el); return; }
  renderModule(el, mod);
  requestAnimationFrame(() => { buildFloatingTOC(mod); observeSections(mod); });
}

function renderDashboard(el) {
  const completed = state.completed.length;
  const pct = Math.round((completed / TOTAL) * 100);
  const quizPassed = Object.values(state.quizScores).filter(q => q.score / q.total >= 0.7).length;
  const xp = calculateXP();
  const level = getLevel(xp);
  const streak = getStreak();
  const studyTime = getTotalStudyTime();

  const motivations = [[0, 'Prêt pour l\'ascension ?'], [1, 'L\'ascension commence'], [26, 'Bonne progression'], [51, 'Le sommet se rapproche'], [76, 'Dernière ligne droite'], [100, 'Au sommet !']];
  const motivation = motivations.filter(m => pct >= m[0]).pop()[1];

  let html = `<div class="dashboard-header"><h1>Tableau de bord</h1><p class="dashboard-subtitle">${motivation}</p></div>`;

  const resume = findResumePoint();
  if (resume) {
    html += `<button class="next-step" data-module="${resume.mod.id}" data-section="${resume.section == null ? '' : resume.section}">
      <span class="next-step-label">${resume.label}</span>
      <span class="next-step-title">Module ${resume.mod.id} — ${resume.mod.title}</span>
      <span class="next-step-meta">${resume.meta}</span>
    </button>`;
  } else {
    html += `<div class="next-step completed-all">
      <span class="next-step-label">Formation terminée</span>
      <span class="next-step-title">Les ${TOTAL} modules sont complétés</span>
    </div>`;
  }

  html += `<div class="stats">
    <div>
      <div class="stat-main"><span class="stat-value">${pct}</span><span class="stat-unit">%</span></div>
      <div class="stat-label">progression globale</div>
    </div>
    <div class="stat-group">
      <div class="stat-item"><span class="stat-num">${completed}</span><span class="stat-desc">modules terminés</span></div>
      <div class="stat-item"><span class="stat-num">${quizPassed}</span><span class="stat-desc">quiz réussis</span></div>
      <div class="stat-item"><span class="stat-num">${state.badges.length}</span><span class="stat-desc">badges débloqués</span></div>
    </div>
  </div>`;

  const validated = Object.values(state.checks).filter(Boolean).length;
  const best = bestExam();

  html += '<div class="dashboard-metrics">';
  if (streak > 0) html += `<div class="metric"><span class="metric-value">${streak}</span><span class="metric-label">jour${streak > 1 ? 's' : ''} de suite</span></div>`;
  html += `<div class="metric"><span class="metric-value">${xp}</span><span class="metric-label">XP — ${level.name}</span></div>`;
  if (studyTime > 60000) html += `<div class="metric"><span class="metric-value">${formatDuration(studyTime)}</span><span class="metric-label">de formation</span></div>`;
  if (validated) html += `<div class="metric"><span class="metric-value">${validated}</span><span class="metric-label">exercice${validated > 1 ? 's' : ''} validé${validated > 1 ? 's' : ''} sur le cluster</span></div>`;
  if (best) html += `<div class="metric"><span class="metric-value">${Math.round(best.score / best.total * 100)}%</span><span class="metric-label">meilleur examen blanc</span></div>`;
  if (state.revision.missed.length) html += `<div class="metric"><span class="metric-value">${state.revision.missed.length}</span><span class="metric-label">questions à revoir</span></div>`;
  html += '</div>';

  html += '<div class="badges-section"><h2>Badges</h2>';
  for (const [cat, label] of [['progression', 'Progression'], ['quiz', 'Quiz'], ['secret', 'Secrets']]) {
    html += `<div class="badge-category"><h3>${label}</h3><div class="badge-grid">`;
    for (const b of BADGE_DEFS[cat]) {
      const unlocked = state.badges.includes(b.id);
      const hidden = cat === 'secret' && !unlocked;
      html += `<div class="badge-card ${unlocked ? 'unlocked' : 'locked'}${cat === 'secret' ? ' secret' : ''}">
        <div class="badge-icon">${hidden ? ICONS.question : ICONS[b.icon]}</div>
        <div class="badge-name">${hidden ? '???' : b.name}</div>
        <div class="badge-desc">${hidden ? '???' : b.desc}</div>
      </div>`;
    }
    html += '</div></div>';
  }
  html += '</div>';
  el.innerHTML = html;

  const btn = el.querySelector('.next-step[data-module]');
  if (btn) btn.addEventListener('click', () => {
    const sec = btn.dataset.section;
    navigate(parseInt(btn.dataset.module), sec === '' ? null : parseInt(sec));
  });

  document.getElementById('reading-progress').style.setProperty('--read-pct', '0%');
}

function findResumePoint() {
  const started = MODULES.find(m => !state.completed.includes(m.id) && readSections(m.id).length > 0);
  if (started) {
    const read = readSections(started.id);
    const next = started.sections.findIndex((_, i) => !read.includes(i));
    return {
      mod: started,
      section: next === -1 ? null : next,
      label: 'Reprendre la lecture',
      meta: next === -1 ? 'Sections terminées — passe aux exercices' : `Section ${next + 1} sur ${started.sections.length}`
    };
  }
  const next = MODULES.find(m => !state.completed.includes(m.id));
  if (!next) return null;
  return { mod: next, section: null, label: 'Prochaine étape', meta: `${estimateReadingTime(next)} min de lecture` };
}

function renderModule(el, mod) {
  const isCompleted = state.completed.includes(mod.id);
  const read = readSections(mod.id);
  const prev = MODULES[MODULES.indexOf(mod) - 1];
  const next = MODULES[MODULES.indexOf(mod) + 1];

  let html = `<div class="module-header">
    <div class="module-meta">
      <span class="module-num">Module ${mod.id} / ${TOTAL}</span>
      <span class="module-reading-time">${estimateReadingTime(mod)} min</span>
    </div>
    <h1>${mod.title}</h1>
    <p class="module-desc">${mod.desc}</p>
    <div class="section-progress">
      <div class="section-progress-bar"><div id="section-progress-fill" style="width:${Math.round((read.length / mod.sections.length) * 100)}%"></div></div>
      <span id="section-progress-label">${read.length} / ${mod.sections.length} sections lues</span>
    </div>`;
  if (mod.objectives) {
    html += `<div class="module-objectives"><h3>Objectifs</h3><ul>${mod.objectives.map(o => `<li>${o}</li>`).join('')}</ul></div>`;
  }
  html += '</div><div class="module-body">';

  mod.sections.forEach((sec, i) => {
    html += `<section class="content-section" data-section="${i}"><h2>${sec.title}</h2><div class="section-content">${sec.content}</div></section>`;
  });

  if (mod.exercises && mod.exercises.length) {
    html += '<div class="exercises-section"><h2>Exercices pratiques</h2>';
    mod.exercises.forEach((ex, i) => {
      const done = state.checks[`${mod.id}-${i}`];
      html += `<div class="exercise${done ? ' validated' : ''}">
        <h3>${ex.title}${done ? '<span class="ex-tag">Validé sur le cluster</span>' : ''}</h3><p>${ex.desc}</p>`;
      if (ex.steps) html += `<ol class="steps">${ex.steps.map(s => `<li>${s}</li>`).join('')}</ol>`;
      if (ex.validation) html += `<div class="validation">${ex.validation}</div>`;
      if (ex.hint) html += `<details class="hint"><summary>Indice</summary><p>${ex.hint}</p></details>`;
      if (ex.check) html += `<div class="ex-check">
        <button class="btn-check" data-ex="${i}" type="button">Vérifier sur le cluster</button>
        <span class="check-hint">Lance la vérification avant l'étape de nettoyage</span>
        <div class="check-output" id="check-out-${i}" role="status"></div>
      </div>`;
      html += '</div>';
    });
    html += '</div>';
  }

  if (mod.commands && mod.commands.length) {
    html += '<div class="commands-section"><h2>Commandes à pratiquer</h2>';
    mod.commands.forEach((cmd, i) => {
      html += `<div class="command-exercise">
        <p class="cmd-prompt">${cmd.prompt}</p>
        <div class="cmd-input-row">
          <input type="text" class="cmd-input" data-cmd="${i}" placeholder="Saisir la commande..." aria-label="${cmd.prompt.replace(/"/g, '&quot;')}" autocomplete="off" spellcheck="false">
          <button class="cmd-check" data-cmd="${i}" type="button">Vérifier</button>
        </div>
        <div class="cmd-feedback" id="cmd-fb-${i}" role="status"></div>
      </div>`;
    });
    html += '</div>';
  }

  if (mod.quiz && mod.quiz.length) {
    html += `<div class="quiz-section"><h2>Quiz</h2><div id="quiz-body">${quizMarkup(mod)}</div></div>`;
  }

  html += '</div>';
  html += `<div class="module-footer">
    <button class="btn-complete ${isCompleted ? 'completed' : ''}" id="btn-mark-complete" type="button">${isCompleted ? 'Terminé' : 'Marquer comme terminé'}</button>
    <div class="module-nav">
      <button class="btn-nav" id="btn-prev" type="button" ${prev ? '' : 'disabled'}><kbd>&larr;</kbd> ${prev ? 'Module ' + prev.id : 'Précédent'}</button>
      <button class="btn-nav" id="btn-next" type="button" ${next ? '' : 'disabled'}>${next ? 'Module ' + next.id : 'Suivant'} <kbd>&rarr;</kbd></button>
    </div>
  </div>`;

  el.innerHTML = html;
  bindModuleEvents(mod);
}

function quizMarkup(mod) {
  const best = state.quizScores[mod.id];
  let html = '';
  if (best) {
    const pass = best.score / best.total >= 0.7;
    html += `<div class="quiz-best ${pass ? 'pass' : 'fail'}">Meilleur score : ${best.score}/${best.total}</div>`;
  }
  mod.quiz.forEach((q, i) => {
    html += `<div class="quiz-question" data-q="${i}">
      <div class="q-number">Question ${i + 1} / ${mod.quiz.length}</div>
      <p class="q-text">${q.question}</p>
      <div class="q-options" role="group">${q.options.map((o, j) => `<button class="q-option" type="button" data-q="${i}" data-opt="${j}">${o}</button>`).join('')}</div>
      <div class="q-explanation hidden" id="q-exp-${i}">${q.explanation}</div>
    </div>`;
  });
  html += '<div id="quiz-result" class="hidden"></div>';
  html += '<div class="quiz-actions"><button class="btn-quiz" id="btn-submit-quiz" type="button">Valider le quiz</button></div>';
  return html;
}

function observeSections(mod) {
  const sections = document.querySelectorAll('.content-section');
  if (!sections.length) return;
  readObserver = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting && e.boundingClientRect.top < 0) {
        markSectionRead(mod.id, parseInt(e.target.dataset.section));
      }
    }
  }, { rootMargin: '0px 0px -35% 0px' });
  sections.forEach(s => readObserver.observe(s));
}

function destroyFloatingTOC() {
  document.getElementById('floating-toc')?.remove();
  if (tocObserver) { tocObserver.disconnect(); tocObserver = null; }
}

function buildFloatingTOC(mod) {
  destroyFloatingTOC();
  const sections = document.querySelectorAll('.content-section');
  if (sections.length < 2) return;

  const toc = document.createElement('nav');
  toc.id = 'floating-toc';
  toc.setAttribute('aria-label', 'Sommaire du module');
  toc.innerHTML = '<div class="toc-title">Sommaire</div>';
  const targets = [...sections];
  const read = readSections(mod.id);

  sections.forEach(sec => {
    const h2 = sec.querySelector('h2');
    if (!h2) return;
    const link = document.createElement('a');
    link.className = 'toc-link' + (read.includes(parseInt(sec.dataset.section)) ? ' read' : '');
    link.dataset.section = sec.dataset.section;
    link.innerHTML = `<span class="toc-tick"></span><span>${h2.textContent}</span>`;
    link.href = '#';
    link.addEventListener('click', e => { e.preventDefault(); sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    toc.appendChild(link);
  });

  for (const [sel, label] of [['.exercises-section', 'Exercices'], ['.commands-section', 'Commandes'], ['.quiz-section', 'Quiz']]) {
    const target = document.querySelector(sel);
    if (!target) continue;
    targets.push(target);
    const link = document.createElement('a');
    link.className = 'toc-link toc-special';
    link.innerHTML = `<span class="toc-tick"></span><span>${label}</span>`;
    link.href = '#';
    link.addEventListener('click', e => { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    toc.appendChild(link);
  }

  document.body.appendChild(toc);
  const allLinks = toc.querySelectorAll('.toc-link');

  tocObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const idx = targets.indexOf(entry.target);
        allLinks.forEach((l, i) => l.classList.toggle('active', i === idx));
      }
    }
  }, { rootMargin: '-15% 0px -75% 0px' });

  targets.forEach(t => tocObserver.observe(t));
}

function celebrate(originEl) {
  const rect = originEl.getBoundingClientRect();
  const container = document.createElement('div');
  container.className = 'celebration';
  container.style.left = (rect.left + rect.width / 2) + 'px';
  container.style.top = (rect.top + rect.height / 2) + 'px';
  document.body.appendChild(container);

  const colors = ['var(--gold)', 'var(--accent)', 'var(--success-text)', '#e2e8f0'];
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const angle = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.3;
    const dist = 50 + Math.random() * 80;
    p.style.setProperty('--px', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--py', Math.sin(angle) * dist + 'px');
    p.style.setProperty('--delay', (Math.random() * 150) + 'ms');
    p.style.background = colors[i % 4];
    container.appendChild(p);
  }
  setTimeout(() => container.remove(), 900);
}

function bindCopyButtons(root) {
  root.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const block = btn.closest('.code-block') || btn.closest('.cheat-item');
      const code = block.querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copié';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copier'; btn.classList.remove('copied'); }, 1500);
      });
    });
  });
}

function bindModuleEvents(mod) {
  const prev = MODULES[MODULES.indexOf(mod) - 1];
  const next = MODULES[MODULES.indexOf(mod) + 1];

  document.getElementById('btn-mark-complete')?.addEventListener('click', () => markComplete(mod.id));
  document.getElementById('btn-prev')?.addEventListener('click', () => prev && navigate(prev.id));
  document.getElementById('btn-next')?.addEventListener('click', () => next && navigate(next.id));

  document.querySelectorAll('.cmd-check').forEach(btn => {
    btn.addEventListener('click', () => checkCommand(mod, parseInt(btn.dataset.cmd)));
  });
  document.querySelectorAll('.cmd-input').forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') checkCommand(mod, parseInt(input.dataset.cmd));
    });
  });
  document.querySelectorAll('.btn-check').forEach(btn => {
    btn.addEventListener('click', () => runClusterCheck(mod, parseInt(btn.dataset.ex)));
  });

  bindQuizEvents(mod);
  bindCopyButtons(document.getElementById('content'));
}

function bindQuizEvents(mod) {
  document.querySelectorAll('.q-option').forEach(btn => {
    btn.addEventListener('click', () => selectOption(parseInt(btn.dataset.q), parseInt(btn.dataset.opt)));
  });
  document.getElementById('btn-submit-quiz')?.addEventListener('click', () => submitQuiz(mod));
}

function checkCommand(mod, idx) {
  const cmd = mod.commands[idx];
  const input = document.querySelector(`.cmd-input[data-cmd="${idx}"]`);
  const fb = document.getElementById(`cmd-fb-${idx}`);
  const val = input.value.trim().toLowerCase().replace(/\s+/g, ' ');
  const ok = cmd.answers.some(a => a.toLowerCase().replace(/\s+/g, ' ') === val);
  fb.textContent = ok ? 'Correct' : 'Essaie encore';
  fb.className = 'cmd-feedback ' + (ok ? 'correct' : 'wrong');
  input.classList.toggle('valid', ok);
}

// Résout un chemin pointé dans un objet JSON. Le segment `*` parcourt un
// tableau : le chemin renvoie alors plusieurs valeurs candidates.
function resolvePath(obj, path) {
  let values = [obj];
  for (const key of path.split('.')) {
    const next = [];
    for (const v of values) {
      if (v == null) continue;
      if (key === '*') { if (Array.isArray(v)) next.push(...v); continue; }
      next.push(v[key]);
    }
    values = next;
  }
  return values.filter(v => v !== undefined);
}

function ruleHolds(rule, values) {
  return values.some(v => {
    if (rule.equals !== undefined) return String(v) === String(rule.equals);
    if (rule.contains !== undefined) return String(v).includes(rule.contains);
    if (rule.atLeast !== undefined) return Number(v) >= rule.atLeast;
    return true;
  });
}

function observed(values) {
  if (!values.length) return 'absent';
  const v = values[0];
  return typeof v === 'object' ? 'présent' : String(v);
}

// kubectl préfixe ses erreurs de plusieurs lignes de log klog (E0901 ...).
// Le message utile est la dernière ligne qui n'en est pas une.
function kubeError(stderr) {
  const lines = (stderr || '').split('\n').map(l => l.trim()).filter(l => l && !/^[EWIF]\d{4} /.test(l));
  return lines[lines.length - 1] || 'commande en échec';
}

function escapeHTML(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function runClusterCheck(mod, exIdx) {
  const ex = mod.exercises[exIdx];
  const btn = document.querySelector(`.btn-check[data-ex="${exIdx}"]`);
  const out = document.getElementById(`check-out-${exIdx}`);
  btn.disabled = true;
  out.className = 'check-output running';
  out.textContent = 'Interrogation du cluster...';

  const lines = [];
  let ok = true;

  for (const step of ex.check) {
    const res = await Progress.check(step.args);
    if (res.kubectl === false) {
      btn.disabled = false;
      out.className = 'check-output error';
      out.innerHTML = 'kubectl est introuvable sur cette machine. L\'installation est guidée au <a href="#/module/2">module 2</a>.';
      return;
    }
    if (res.code !== 0) {
      const err = kubeError(res.stderr);
      if (/connection to the server|refused|no configuration has been provided/i.test(err)) {
        btn.disabled = false;
        out.className = 'check-output error';
        out.textContent = 'Cluster injoignable : ' + err;
        return;
      }
      ok = false;
      lines.push({ ok: false, label: step.label || 'kubectl ' + step.args.join(' '), detail: err });
      continue;
    }
    let data = null;
    try { data = JSON.parse(res.stdout); } catch { /* sortie non JSON */ }
    for (const rule of step.rules) {
      const values = data === null ? [] : resolvePath(data, rule.path);
      const pass = data !== null && ruleHolds(rule, values);
      if (!pass) ok = false;
      lines.push({ ok: pass, label: rule.label, detail: pass ? '' : 'trouvé : ' + observed(values) });
    }
  }

  btn.disabled = false;
  out.className = 'check-output ' + (ok ? 'pass' : 'fail');
  out.innerHTML = lines.map(l => `<div class="check-line ${l.ok ? 'ok' : 'ko'}">
    <span class="check-mark"></span><span>${escapeHTML(l.label)}${l.detail ? ` <em>${escapeHTML(l.detail)}</em>` : ''}</span>
  </div>`).join('') +
    `<div class="check-verdict">${ok ? 'Exercice validé sur ton cluster.' : 'Le cluster ne correspond pas encore à l\'état attendu.'}</div>`;

  const key = `${mod.id}-${exIdx}`;
  if (ok && !state.checks[key]) {
    state.checks[key] = true;
    celebrate(btn);
    scheduleSave();
    checkLevelUp();
    renderSidebar();
    const card = btn.closest('.exercise');
    card.classList.add('validated');
    if (!card.querySelector('.ex-tag')) {
      card.querySelector('h3').insertAdjacentHTML('beforeend', '<span class="ex-tag">Validé sur le cluster</span>');
    }
  }
}

function selectOption(qIdx, optIdx) {
  quizAnswers[qIdx] = optIdx;
  document.querySelectorAll(`.q-option[data-q="${qIdx}"]`).forEach(btn => {
    btn.classList.toggle('selected', parseInt(btn.dataset.opt) === optIdx);
  });
}

function submitQuiz(mod) {
  const total = mod.quiz.length;
  let score = 0;

  for (let i = 0; i < total; i++) {
    const q = mod.quiz[i];
    const selected = quizAnswers[i];
    document.querySelectorAll(`.q-option[data-q="${i}"]`).forEach(btn => {
      const opt = parseInt(btn.dataset.opt);
      btn.disabled = true;
      if (opt === q.correct) btn.classList.add('correct');
      if (opt === selected && opt !== q.correct) btn.classList.add('wrong');
    });
    document.getElementById(`q-exp-${i}`).classList.remove('hidden');

    const key = `${mod.id}-${i}`;
    if (selected === q.correct) {
      score++;
      state.revision.missed = state.revision.missed.filter(k => k !== key);
    } else if (!state.revision.missed.includes(key)) {
      state.revision.missed.push(key);
    }
  }

  const pass = score / total >= 0.7;
  const result = document.getElementById('quiz-result');
  result.className = `quiz-result ${pass ? 'pass' : 'fail'}`;
  result.innerHTML = `<span class="quiz-score">${score}/${total}</span><span class="quiz-status">${pass ? 'Réussi' : 'À retravailler'}</span>`;

  const best = state.quizScores[mod.id];
  if (!best || score > best.score) state.quizScores[mod.id] = { score, total };

  scheduleSave();
  checkBadges();
  checkLevelUp();

  const actions = document.querySelector('.quiz-actions');
  actions.innerHTML = '<button class="btn-quiz secondary" id="btn-retry-quiz" type="button">Refaire le quiz</button>';
  document.getElementById('btn-retry-quiz').addEventListener('click', () => {
    quizAnswers = {};
    document.getElementById('quiz-body').innerHTML = quizMarkup(mod);
    bindQuizEvents(mod);
    document.querySelector('.quiz-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function markComplete(id) {
  if (state.completed.includes(id)) return;
  const btn = document.getElementById('btn-mark-complete');
  if (btn) celebrate(btn);
  state.completed.push(id);
  sessionCompleted++;
  if (moduleViewStart && (Date.now() - moduleViewStart) < 15 * 60 * 1000) state._fastComplete = true;
  scheduleSave();
  checkBadges();
  checkLevelUp();
  render();
}

function renderCheatsheet(el) {
  let html = `<div class="dashboard-header"><h1>Aide-mémoire kubectl</h1><p class="dashboard-subtitle">Les commandes du quotidien, regroupées par usage</p></div>
    <div class="cheat-search"><input type="search" id="cheat-filter" placeholder="Filtrer les commandes..." aria-label="Filtrer les commandes" autocomplete="off" spellcheck="false"><span id="cheat-count"></span></div>
    <div id="cheat-list">`;
  for (const group of CHEATSHEET) {
    html += `<section class="cheat-group"><h2>${group.title}</h2>`;
    for (const item of group.items) {
      const safe = item.cmd.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      html += `<div class="cheat-item">
        <code>${safe}</code>
        <span class="cheat-desc">${item.desc}</span>
        <button class="copy-btn" type="button">Copier</button>
      </div>`;
    }
    html += '</section>';
  }
  html += '</div>';
  el.innerHTML = html;

  bindCopyButtons(el);
  const filter = document.getElementById('cheat-filter');
  const count = document.getElementById('cheat-count');
  const apply = () => {
    const q = filter.value.trim().toLowerCase();
    let shown = 0;
    el.querySelectorAll('.cheat-group').forEach(group => {
      let visible = 0;
      group.querySelectorAll('.cheat-item').forEach(item => {
        const match = !q || item.textContent.toLowerCase().includes(q);
        item.hidden = !match;
        if (match) visible++;
      });
      group.hidden = visible === 0;
      shown += visible;
    });
    count.textContent = q ? `${shown} commande${shown > 1 ? 's' : ''}` : '';
  };
  filter.addEventListener('input', apply);
  filter.focus();
  document.getElementById('reading-progress').style.setProperty('--read-pct', '0%');
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function buildDeck(mode) {
  const cards = [];
  for (const mod of MODULES) {
    if (!mod.quiz) continue;
    mod.quiz.forEach((q, i) => {
      const key = `${mod.id}-${i}`;
      if (mode === 'missed' && !state.revision.missed.includes(key)) return;
      cards.push({ key, modId: mod.id, modTitle: mod.title, ...q });
    });
  }
  return shuffle(cards);
}

function renderRevision(el) {
  if (!deck) {
    const missed = state.revision.missed.length;
    const answered = Object.keys(state.quizScores).length;
    el.innerHTML = `<div class="dashboard-header"><h1>Révision</h1><p class="dashboard-subtitle">Rejoue les questions de tous les modules, dans le désordre</p></div>
      <div class="revision-intro">
        <button class="revision-mode" data-mode="all" type="button">
          <span class="revision-mode-title">Toutes les questions</span>
          <span class="revision-mode-meta">${buildDeck('all').length} questions, les ${TOTAL} modules</span>
        </button>
        <button class="revision-mode ${missed ? '' : 'disabled'}" data-mode="missed" type="button" ${missed ? '' : 'disabled'}>
          <span class="revision-mode-title">Mes erreurs</span>
          <span class="revision-mode-meta">${missed ? missed + ' question' + (missed > 1 ? 's' : '') + ' à revoir' : 'Aucune erreur enregistrée'}</span>
        </button>
      </div>
      <div class="revision-stats">
        <div class="metric"><span class="metric-value">${state.revision.runs || 0}</span><span class="metric-label">session${(state.revision.runs || 0) > 1 ? 's' : ''} de révision</span></div>
        <div class="metric"><span class="metric-value">${state.revision.best || 0}%</span><span class="metric-label">meilleur score</span></div>
        <div class="metric"><span class="metric-value">${answered}</span><span class="metric-label">quiz de module passés</span></div>
      </div>`;
    el.querySelectorAll('.revision-mode:not(.disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        const cards = buildDeck(btn.dataset.mode);
        if (!cards.length) return;
        deck = { cards, idx: 0, score: 0, answered: false };
        render();
      });
    });
    document.getElementById('reading-progress').style.setProperty('--read-pct', '0%');
    return;
  }

  if (deck.idx >= deck.cards.length) { renderRevisionResult(el); return; }

  const card = deck.cards[deck.idx];
  el.innerHTML = `<div class="revision-run">
      <div class="revision-head">
        <button class="revision-quit" id="revision-quit" type="button">Quitter</button>
        <span class="revision-counter">${deck.idx + 1} / ${deck.cards.length}</span>
        <span class="revision-score">${deck.score} bonnes réponses</span>
      </div>
      <div class="revision-bar"><div style="width:${Math.round((deck.idx / deck.cards.length) * 100)}%"></div></div>
      <div class="revision-card">
        <div class="revision-origin">Module ${card.modId} — ${card.modTitle}</div>
        <p class="q-text">${card.question}</p>
        <div class="q-options" id="revision-options">${card.options.map((o, j) => `<button class="q-option" type="button" data-opt="${j}">${o}</button>`).join('')}</div>
        <div class="q-explanation hidden" id="revision-exp">${card.explanation}</div>
        <div class="quiz-actions hidden" id="revision-next-wrap"><button class="btn-quiz" id="revision-next" type="button">Suivant</button></div>
      </div>
    </div>`;

  document.getElementById('revision-quit').addEventListener('click', () => { deck = null; render(); });

  el.querySelectorAll('#revision-options .q-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (deck.answered) return;
      deck.answered = true;
      const opt = parseInt(btn.dataset.opt);
      el.querySelectorAll('#revision-options .q-option').forEach(b => {
        b.disabled = true;
        if (parseInt(b.dataset.opt) === card.correct) b.classList.add('correct');
      });
      if (opt === card.correct) {
        deck.score++;
        state.revision.missed = state.revision.missed.filter(k => k !== card.key);
      } else {
        btn.classList.add('wrong');
        if (!state.revision.missed.includes(card.key)) state.revision.missed.push(card.key);
      }
      document.getElementById('revision-exp').classList.remove('hidden');
      document.getElementById('revision-next-wrap').classList.remove('hidden');
      document.getElementById('revision-next').focus();
    });
  });

  document.getElementById('revision-next').addEventListener('click', () => {
    deck.idx++;
    deck.answered = false;
    render();
  });

  window.scrollTo({ top: 0, behavior: 'instant' });
}

function renderRevisionResult(el) {
  const pct = Math.round((deck.score / deck.cards.length) * 100);
  state.revision.runs = (state.revision.runs || 0) + 1;
  if (pct > (state.revision.best || 0)) state.revision.best = pct;
  scheduleSave();
  checkBadges();
  checkLevelUp();

  const remaining = state.revision.missed.length;
  el.innerHTML = `<div class="revision-run">
      <div class="revision-result ${pct >= 70 ? 'pass' : 'fail'}">
        <span class="quiz-score">${deck.score}/${deck.cards.length}</span>
        <span class="quiz-status">${pct}% — ${pct >= 70 ? 'Bien joué' : 'À retravailler'}</span>
      </div>
      <p class="revision-remaining">${remaining ? remaining + ' question' + (remaining > 1 ? 's' : '') + ' reste' + (remaining > 1 ? 'nt' : '') + ' dans ta liste d\'erreurs.' : 'Ta liste d\'erreurs est vide.'}</p>
      <div class="quiz-actions"><button class="btn-quiz" id="revision-again" type="button">Nouvelle session</button></div>
    </div>`;
  document.getElementById('revision-again').addEventListener('click', () => { deck = null; render(); });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function domainOf(modId) {
  return CKA_DOMAINS.find(d => d.modules.includes(modId));
}

function questionPools() {
  const pools = {};
  for (const d of CKA_DOMAINS) pools[d.id] = [];
  for (const mod of MODULES) {
    if (!mod.quiz) continue;
    const domain = domainOf(mod.id);
    if (!domain) continue;
    mod.quiz.forEach((q, i) => {
      pools[domain.id].push({ key: `${mod.id}-${i}`, modId: mod.id, modTitle: mod.title, domain: domain.id, ...q });
    });
  }
  return pools;
}

// Tirage pondéré selon les domaines du CKA. Si un domaine n'a pas assez de
// questions, le reste est complété dans le pool global pour garder EXAM_SIZE.
function buildExam() {
  const pools = questionPools();
  const picked = [];
  const taken = new Set();
  for (const d of CKA_DOMAINS) {
    const want = Math.round(EXAM_SIZE * d.weight);
    for (const q of shuffle(pools[d.id].slice()).slice(0, want)) {
      picked.push(q);
      taken.add(q.key);
    }
  }
  const rest = shuffle(Object.values(pools).flat().filter(q => !taken.has(q.key)));
  while (picked.length < EXAM_SIZE && rest.length) picked.push(rest.pop());
  return shuffle(picked).slice(0, EXAM_SIZE);
}

function stopExamTimer() {
  clearInterval(examTimer);
  examTimer = null;
}

function startExamTimer() {
  stopExamTimer();
  examTimer = setInterval(() => {
    const left = exam.endsAt - Date.now();
    const el = document.getElementById('exam-timer');
    if (left <= 0) { finishExam(); return; }
    if (el) {
      el.textContent = formatClock(left);
      el.classList.toggle('urgent', left < 5 * 60000);
    }
  }, 1000);
}

function formatClock(ms) {
  const total = Math.max(0, Math.round(ms / 1000));
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}

function finishExam() {
  stopExamTimer();
  const domains = {};
  let score = 0;
  for (let i = 0; i < exam.cards.length; i++) {
    const card = exam.cards[i];
    const d = domains[card.domain] || (domains[card.domain] = { score: 0, total: 0 });
    d.total++;
    if (exam.answers[i] === card.correct) {
      score++;
      d.score++;
      state.revision.missed = state.revision.missed.filter(k => k !== card.key);
    } else if (!state.revision.missed.includes(card.key)) {
      state.revision.missed.push(card.key);
    }
  }

  exam.done = true;
  exam.score = score;
  exam.domains = domains;

  state.exams.push({
    date: new Date().toISOString(),
    score,
    total: exam.cards.length,
    duration: Math.round((Date.now() - exam.startedAt) / 1000),
    domains
  });
  if (state.exams.length > 10) state.exams = state.exams.slice(-10);

  scheduleSave();
  checkBadges();
  checkLevelUp();
  render();
}

function renderExam(el) {
  if (!exam) { renderExamIntro(el); return; }
  if (exam.done) { renderExamResult(el); return; }

  const card = exam.cards[exam.idx];
  const answered = Object.keys(exam.answers).length;

  el.innerHTML = `<div class="exam-run">
      <div class="exam-head">
        <button class="revision-quit" id="exam-quit" type="button">Abandonner</button>
        <span class="exam-clock" id="exam-timer">${formatClock(exam.endsAt - Date.now())}</span>
        <span class="revision-score">${answered} / ${exam.cards.length} répondues</span>
      </div>
      <div class="revision-bar"><div style="width:${Math.round((answered / exam.cards.length) * 100)}%"></div></div>
      <div class="exam-map">${exam.cards.map((_, i) => `<button class="exam-dot${i === exam.idx ? ' current' : ''}${exam.answers[i] != null ? ' done' : ''}" data-goto="${i}" type="button" aria-label="Question ${i + 1}">${i + 1}</button>`).join('')}</div>
      <div class="revision-card">
        <div class="revision-origin">Question ${exam.idx + 1} — ${CKA_DOMAINS.find(d => d.id === card.domain).name}</div>
        <p class="q-text">${card.question}</p>
        <div class="q-options" id="exam-options">${card.options.map((o, j) => `<button class="q-option${exam.answers[exam.idx] === j ? ' selected' : ''}" type="button" data-opt="${j}">${o}</button>`).join('')}</div>
      </div>
      <div class="exam-nav">
        <button class="btn-nav" id="exam-prev" type="button" ${exam.idx === 0 ? 'disabled' : ''}>Précédente</button>
        <button class="btn-quiz" id="exam-finish" type="button">Terminer l'examen</button>
        <button class="btn-nav" id="exam-next" type="button" ${exam.idx === exam.cards.length - 1 ? 'disabled' : ''}>Suivante</button>
      </div>
    </div>`;

  el.querySelectorAll('#exam-options .q-option').forEach(btn => {
    btn.addEventListener('click', () => {
      exam.answers[exam.idx] = parseInt(btn.dataset.opt);
      if (exam.idx < exam.cards.length - 1) exam.idx++;
      render();
    });
  });
  el.querySelectorAll('.exam-dot').forEach(btn => {
    btn.addEventListener('click', () => { exam.idx = parseInt(btn.dataset.goto); render(); });
  });
  document.getElementById('exam-prev').addEventListener('click', () => { exam.idx--; render(); });
  document.getElementById('exam-next').addEventListener('click', () => { exam.idx++; render(); });
  document.getElementById('exam-quit').addEventListener('click', () => {
    if (!confirm('Abandonner l\'examen en cours ?')) return;
    stopExamTimer();
    exam = null;
    render();
  });
  document.getElementById('exam-finish').addEventListener('click', () => {
    const missing = exam.cards.length - Object.keys(exam.answers).length;
    if (missing && !confirm(`${missing} question${missing > 1 ? 's' : ''} sans réponse. Terminer quand même ?`)) return;
    finishExam();
  });

  window.scrollTo({ top: 0, behavior: 'instant' });
}

function renderExamIntro(el) {
  const best = bestExam();
  const pools = questionPools();

  let html = `<div class="dashboard-header"><h1>Examen blanc CKA</h1>
    <p class="dashboard-subtitle">${EXAM_SIZE} questions tirées selon les pondérations officielles, ${EXAM_MINUTES} minutes, seuil de réussite 66%</p></div>
    <div class="exam-domains">`;
  for (const d of CKA_DOMAINS) {
    html += `<div class="exam-domain">
      <div class="exam-domain-head"><span>${d.name}</span><span class="exam-domain-weight">${Math.round(d.weight * 100)}%</span></div>
      <div class="exam-domain-bar"><div style="width:${Math.round(d.weight * 100)}%"></div></div>
      <div class="exam-domain-meta">${pools[d.id].length} questions disponibles &middot; modules ${d.modules.join(', ')}</div>
    </div>`;
  }
  html += '</div>';

  html += `<div class="revision-intro">
      <button class="revision-mode" id="exam-start" type="button">
        <span class="revision-mode-title">Démarrer l'examen</span>
        <span class="revision-mode-meta">${EXAM_SIZE} questions &middot; ${EXAM_MINUTES} min &middot; pas de correction avant la fin</span>
      </button>
    </div>`;

  if (state.exams.length) {
    html += '<div class="revision-stats">';
    html += `<div class="metric"><span class="metric-value">${state.exams.length}</span><span class="metric-label">examen${state.exams.length > 1 ? 's' : ''} passé${state.exams.length > 1 ? 's' : ''}</span></div>`;
    html += `<div class="metric"><span class="metric-value">${Math.round(best.score / best.total * 100)}%</span><span class="metric-label">meilleur score</span></div>`;
    const last = state.exams[state.exams.length - 1];
    html += `<div class="metric"><span class="metric-value">${last.score}/${last.total}</span><span class="metric-label">dernier essai</span></div>`;
    html += '</div>';
  }

  el.innerHTML = html;
  document.getElementById('exam-start').addEventListener('click', () => {
    exam = { cards: buildExam(), idx: 0, answers: {}, startedAt: Date.now(), endsAt: Date.now() + EXAM_MINUTES * 60000, done: false };
    render();
    startExamTimer();
  });
  document.getElementById('reading-progress').style.setProperty('--read-pct', '0%');
}

function renderExamResult(el) {
  const total = exam.cards.length;
  const pct = Math.round((exam.score / total) * 100);
  const pass = exam.score / total >= EXAM_PASS;

  let html = `<div class="exam-run">
    <div class="revision-result ${pass ? 'pass' : 'fail'}">
      <span class="quiz-score">${exam.score}/${total}</span>
      <span class="quiz-status">${pct}% — ${pass ? 'Réussi' : 'Sous le seuil des 66%'}</span>
    </div>
    <div class="exam-domains">`;

  for (const d of CKA_DOMAINS) {
    const r = exam.domains[d.id];
    if (!r) continue;
    const dp = Math.round((r.score / r.total) * 100);
    html += `<div class="exam-domain">
      <div class="exam-domain-head"><span>${d.name}</span><span class="exam-domain-weight">${r.score}/${r.total}</span></div>
      <div class="exam-domain-bar"><div class="${dp >= 66 ? 'ok' : 'ko'}" style="width:${dp}%"></div></div>
    </div>`;
  }
  html += '</div>';

  const wrong = exam.cards.map((c, i) => ({ c, i })).filter(({ c, i }) => exam.answers[i] !== c.correct);
  if (wrong.length) {
    html += `<div class="exam-review"><h2>À revoir (${wrong.length})</h2>`;
    for (const { c, i } of wrong) {
      const given = exam.answers[i];
      html += `<div class="exam-review-item">
        <p class="q-text">${c.question}</p>
        <div class="exam-review-answers">
          <div class="exam-answer ko">Ta réponse : ${given == null ? 'aucune' : c.options[given]}</div>
          <div class="exam-answer ok">Bonne réponse : ${c.options[c.correct]}</div>
        </div>
        <div class="q-explanation">${c.explanation}</div>
        <a class="exam-review-link" href="${viewHash(c.modId)}">Revoir le module ${c.modId} — ${c.modTitle}</a>
      </div>`;
    }
    html += '</div>';
    html += '<p class="revision-remaining">Ces questions ont été ajoutées à ta liste de révision.</p>';
  }

  html += '<div class="quiz-actions"><button class="btn-quiz" id="exam-again" type="button">Nouvel examen</button></div></div>';
  el.innerHTML = html;
  document.getElementById('exam-again').addEventListener('click', () => { exam = null; render(); });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function normalize(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildSearchIndex() {
  const items = [];
  for (const r of ROUTES) items.push({ kind: 'Vue', label: r.label, view: r.id });
  for (const mod of MODULES) {
    items.push({ kind: 'Module', label: `Module ${mod.id} — ${mod.title}`, sub: mod.desc, view: mod.id });
    mod.sections.forEach((sec, i) => {
      items.push({ kind: 'Section', label: sec.title, sub: `Module ${mod.id} — ${mod.title}`, view: mod.id, section: i, text: stripTags(sec.content) });
    });
  }
  for (const group of CHEATSHEET) {
    for (const item of group.items) items.push({ kind: 'Commande', label: item.cmd, sub: item.desc, copy: item.cmd });
  }
  for (const item of items) {
    item.nLabel = normalize(item.label);
    item.nSub = normalize(item.sub || '');
    item.nText = normalize(item.text || '');
  }
  return items;
}

function searchItems(query) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return searchIndex.filter(i => i.kind !== 'Section' && i.kind !== 'Commande').slice(0, 10);

  const results = [];
  for (const item of searchIndex) {
    let score = 0;
    let snippet = '';
    for (const term of terms) {
      const inLabel = item.nLabel.indexOf(term);
      const inSub = item.nSub.indexOf(term);
      const inText = item.nText.indexOf(term);
      if (inLabel === 0) score += 100;
      else if (inLabel > 0) score += 60;
      else if (inSub >= 0) score += 35;
      else if (inText >= 0) { score += 15; if (!snippet) snippet = excerpt(item.text, inText); }
      else { score = -1; break; }
    }
    if (score > 0) results.push({ item, score, snippet });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 12).map(r => ({ ...r.item, snippet: r.snippet }));
}

function excerpt(text, at) {
  const start = Math.max(0, at - 40);
  return (start ? '…' : '') + text.slice(start, at + 80).trim() + '…';
}

function openPalette() {
  if (document.getElementById('palette')) return;
  if (!searchIndex) searchIndex = buildSearchIndex();

  const box = document.createElement('div');
  box.id = 'palette';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Recherche');
  box.innerHTML = `<div class="palette-box">
      <input id="palette-input" type="search" placeholder="Rechercher un module, une section, une commande..." aria-label="Rechercher" autocomplete="off" spellcheck="false">
      <div id="palette-results" role="listbox"></div>
      <div class="palette-foot"><kbd>&uarr;</kbd><kbd>&darr;</kbd> naviguer &middot; <kbd>&crarr;</kbd> ouvrir &middot; <kbd>Esc</kbd> fermer</div>
    </div>`;
  document.body.appendChild(box);

  const input = document.getElementById('palette-input');
  const list = document.getElementById('palette-results');
  let results = [];
  let cursor = 0;

  const draw = () => {
    results = searchItems(input.value);
    if (!results.length) {
      list.innerHTML = '<div class="palette-empty">Aucun résultat</div>';
      return;
    }
    cursor = Math.min(cursor, results.length - 1);
    list.innerHTML = results.map((r, i) => `<button class="palette-item${i === cursor ? ' active' : ''}" data-idx="${i}" type="button" role="option" aria-selected="${i === cursor}">
        <span class="palette-kind">${r.kind}</span>
        <span class="palette-label">${escapeHTML(r.label)}</span>
        ${r.snippet ? `<span class="palette-snippet">${escapeHTML(r.snippet)}</span>` : r.sub ? `<span class="palette-sub">${escapeHTML(r.sub)}</span>` : ''}
      </button>`).join('');
    list.querySelectorAll('.palette-item').forEach(btn => {
      btn.addEventListener('click', () => activate(results[parseInt(btn.dataset.idx)]));
    });
  };

  const move = delta => {
    if (!results.length) return;
    cursor = (cursor + delta + results.length) % results.length;
    draw();
    list.querySelector('.palette-item.active')?.scrollIntoView({ block: 'nearest' });
  };

  input.addEventListener('input', () => { cursor = 0; draw(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[cursor]) activate(results[cursor]); }
    else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
  });
  box.addEventListener('click', e => { if (e.target === box) closePalette(); });

  draw();
  input.focus();
}

function activate(item) {
  closePalette();
  if (item.copy) {
    navigator.clipboard.writeText(item.copy);
    showNote('Commande copiée', item.copy);
    return;
  }
  deck = null;
  navigate(item.view, item.section);
}

function closePalette() {
  document.getElementById('palette')?.remove();
}

function showNote(title, sub) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.innerHTML = `<div class="badge-icon">${ICONS.book}</div><div class="toast-text"><strong>${escapeHTML(title)}</strong>${escapeHTML(sub)}</div>`;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => { el.classList.add('leaving'); setTimeout(() => el.remove(), 200); }, 3000);
}

async function importProgress(file) {
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch {
    alert('Fichier illisible : ce n\'est pas un export kubeclimb valide.');
    return;
  }
  if (typeof data !== 'object' || data === null || !Array.isArray(data.completed)) {
    alert('Fichier invalide : aucune progression trouvée.');
    return;
  }
  if (!confirm('Remplacer la progression actuelle par ce fichier ?')) return;

  state = { ...emptyState(), ...data };
  normalizeState();
  await Progress.save(state);
  deck = null;
  exam = null;
  previousLevel = getLevel(calculateXP()).idx;
  render();
  showNote('Progression importée', `${state.completed.length} module${state.completed.length > 1 ? 's' : ''} terminé${state.completed.length > 1 ? 's' : ''}`);
}

function normalizeState() {
  state.completed = (state.completed || []).filter(id => MODULES.some(m => m.id === id));
  state.quizScores = state.quizScores || {};
  state.badges = state.badges || [];
  state.sessions = state.sessions || [];
  state.sectionsRead = state.sectionsRead || {};
  state.checks = state.checks || {};
  state.exams = state.exams || [];
  state.revision = { missed: [], runs: 0, best: 0, ...(state.revision || {}) };
}

function closeMobile() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

function updateReadingProgress() {
  const el = document.getElementById('reading-progress');
  if (state.current <= 0) { el.style.setProperty('--read-pct', '0%'); return; }
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) { el.style.setProperty('--read-pct', '100%'); return; }
  el.style.setProperty('--read-pct', Math.min(100, Math.round((window.scrollY / docHeight) * 100)) + '%');
}

function updateBackToTop() {
  document.getElementById('back-to-top').classList.toggle('visible', window.scrollY > 400);
}

async function init() {
  const loaded = await Progress.load();
  state = { ...emptyState(), ...loaded };
  normalizeState();
  if (!MODULES.some(m => m.id === state.current) && !ROUTES.some(r => r.id === state.current)) {
    state.current = VIEW.DASHBOARD;
  }

  // Une URL explicite prime sur la dernière position enregistrée : un lien
  // partagé ou un rafraîchissement doit rouvrir exactement la même vue. Sans
  // hash, on reprend là où l'apprenant s'était arrêté.
  const route = location.hash ? parseHash() : null;
  let initialSection = null;
  if (route) { state.current = route.id; initialSection = route.section; }

  const now = new Date().toISOString();
  if (state.sessions.length) {
    const last = state.sessions[state.sessions.length - 1];
    if (Date.now() - new Date(last.end).getTime() > 7 * 86400000) state._comeback = true;
  }
  state.sessions.push({ start: now, end: now });
  scheduleSave();

  checkBadges();
  previousLevel = getLevel(calculateXP()).idx;
  syncHash(state.current, initialSection);
  render();
  if (initialSection != null) {
    document.querySelector(`.content-section[data-section="${initialSection}"]`)?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }

  Progress.cluster().then(info => { cluster = info; renderClusterStatus(); });

  window.addEventListener('hashchange', () => {
    if (applyingHash) { applyingHash = false; return; }
    const target = parseHash();
    if (!target) { navigate(VIEW.DASHBOARD); return; }
    if (target.id !== state.current || target.section != null) { deck = null; navigate(target.id, target.section); }
  });

  document.querySelectorAll('.sidebar-link').forEach(el => {
    el.addEventListener('click', () => { deck = null; navigate(parseInt(el.dataset.view)); });
  });

  document.getElementById('btn-search').addEventListener('click', () => { closeMobile(); openPalette(); });

  document.getElementById('btn-export').addEventListener('click', () => Progress.exportData());
  document.getElementById('btn-import').addEventListener('click', () => document.getElementById('import-file').click());
  document.getElementById('import-file').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) importProgress(file);
    e.target.value = '';
  });
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('Réinitialiser toute la progression ?')) return;
    state = emptyState();
    sessionCompleted = 0;
    deck = null;
    exam = null;
    scheduleSave();
    render();
  });

  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('open');
  });
  document.getElementById('sidebar-overlay').addEventListener('click', closeMobile);

  document.getElementById('back-to-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      document.getElementById('palette') ? closePalette() : openPalette();
      return;
    }
    if (document.getElementById('palette')) {
      if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
      return;
    }
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.metaKey || e.ctrlKey) return;
    if (e.key === '/') { e.preventDefault(); openPalette(); return; }
    const idx = MODULES.findIndex(m => m.id === state.current);
    if (e.key === 'ArrowRight' && idx >= 0 && idx < MODULES.length - 1) navigate(MODULES[idx + 1].id);
    else if (e.key === 'ArrowLeft' && idx > 0) navigate(MODULES[idx - 1].id);
    else if (e.key === 'Escape' && state.current !== VIEW.DASHBOARD) { deck = null; navigate(VIEW.DASHBOARD); }
  });

  let scrollTick = false;
  window.addEventListener('scroll', () => {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      updateReadingProgress();
      updateBackToTop();
      scrollTick = false;
    });
  }, { passive: true });

  setInterval(() => {
    if (!state.sessions.length) return;
    state.sessions[state.sessions.length - 1].end = new Date().toISOString();
    scheduleSave();
  }, 60000);
}

init();
