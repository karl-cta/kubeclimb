const PHASES = [
  { name: 'Fondations', modules: [1, 2, 3] },
  { name: 'Workloads', modules: [4, 5, 6, 7] },
  { name: 'Avancé', modules: [8, 9, 10, 11] },
  { name: 'Projet', modules: [12] }
];

const LEVELS = [
  { min: 0, name: 'Débutant', altitude: 0 },
  { min: 100, name: 'Randonneur', altitude: 1200 },
  { min: 300, name: 'Grimpeur', altitude: 2800 },
  { min: 600, name: 'Alpiniste', altitude: 4500 },
  { min: 1000, name: 'Guide', altitude: 6200 },
  { min: 1500, name: 'Sherpa', altitude: 7500 },
  { min: 2000, name: 'Légende', altitude: 8848 }
];

const BADGE_DEFS = {
  progression: [
    { id: 'premiere-marche', name: 'Première Marche', desc: 'Terminer un module', icon: 'step', check: s => s.completed.length >= 1 },
    { id: 'base-camp', name: 'Base Camp', desc: 'Modules 1 à 3', icon: 'tent', check: s => [1,2,3].every(m => s.completed.includes(m)) },
    { id: 'sommet-workloads', name: 'Sommet Workloads', desc: 'Modules 4 et 5', icon: 'peak', check: s => [4,5].every(m => s.completed.includes(m)) },
    { id: 'sherpa-reseau', name: 'Sherpa Réseau', desc: 'Modules 6 et 9', icon: 'compass', check: s => [6,9].every(m => s.completed.includes(m)) },
    { id: 'gardien', name: 'Gardien du Cluster', desc: 'Module 10', icon: 'shield', check: s => s.completed.includes(10) },
    { id: 'helm-master', name: 'Helm Master', desc: 'Module 11', icon: 'wheel', check: s => s.completed.includes(11) },
    { id: 'alpiniste', name: 'Alpiniste', desc: 'Module 12', icon: 'axe', check: s => s.completed.includes(12) },
    { id: 'au-sommet', name: 'Au Sommet', desc: 'Tous les modules', icon: 'flag', check: s => s.completed.length >= 12 }
  ],
  quiz: [
    { id: 'premier-quiz', name: 'Premier Quiz', desc: 'Réussir un quiz', icon: 'check', check: s => Object.values(s.quizScores).some(q => q.score / q.total >= 0.7) },
    { id: 'score-parfait', name: 'Score Parfait', desc: '100% sur un quiz', icon: 'star', check: s => Object.values(s.quizScores).some(q => q.score === q.total) },
    { id: 'serie-3', name: 'Série de 3', desc: '3 quiz réussis de suite', icon: 'streak3', check: s => quizStreak(s) >= 3 },
    { id: 'serie-5', name: 'Série de 5', desc: '5 quiz réussis de suite', icon: 'streak5', check: s => quizStreak(s) >= 5 },
    { id: 'cerveau-k8s', name: 'Cerveau K8s', desc: '100% partout', icon: 'brain', check: s => { const v = Object.values(s.quizScores); return v.length >= 12 && v.every(q => q.score === q.total); } }
  ],
  secret: [
    { id: 'noctambule', name: 'Noctambule', desc: 'Entre minuit et 5h', icon: 'moon', check: () => { const h = new Date().getHours(); return h >= 0 && h < 5; } },
    { id: 'marathonien', name: 'Marathonien', desc: '3 modules en une session', icon: 'bolt', check: s => (s._sessionCompleted || 0) >= 3 },
    { id: 'comeback', name: 'Comeback', desc: '7+ jours d\'absence', icon: 'return', check: s => { if (!s.sessions.length) return false; const last = new Date(s.sessions[s.sessions.length - 1].end); return (Date.now() - last.getTime()) > 7 * 86400000; } },
    { id: 'speed-runner', name: 'Speed Runner', desc: 'Module en moins de 15min', icon: 'clock', check: s => s._fastComplete || false },
    { id: 'collectionneur', name: 'Collectionneur', desc: '10 badges', icon: 'diamond', check: s => s.badges.length >= 10 },
    { id: 'legende', name: 'Légende', desc: 'Tous les badges', icon: 'crown', check: s => s.badges.length >= 18 }
  ]
};

const ICONS = {
  step:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18h4v-4H4zM10 14h4v-4h-4zM16 10h4V6h-4z"/></svg>',
  tent:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L3 20h18L12 3zM12 3v17M8 14l4-11 4 11"/></svg>',
  peak:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20l6-14 4 8 5-10 4 16H3z"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M16 8l-5.3 2.7L8 16l5.3-2.7z"/></svg>',
  shield:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 9-8 11-4.5-2-8-6-8-11V7l8-4z"/></svg>',
  wheel:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 4v6M12 14v6M4 12h6M14 12h6M6.3 6.3l4.2 4.2M13.5 13.5l4.2 4.2M6.3 17.7l4.2-4.2M13.5 10.5l4.2-4.2"/></svg>',
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
  diamond: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 3L3 12l9 9 9-9-9-9z"/></svg>',
  crown:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h18V8l-4 4-5-6-5 6-4-4v10z"/></svg>',
  question:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 015 1c0 2-3 2-3 4"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>'
};

let state = { current: 0, completed: [], quizScores: {}, badges: [], sessions: [] };
let sessionStart = Date.now();
let sessionCompleted = 0;
let moduleViewStart = 0;
let saveTimer = null;
let previousLevel = -1;
let tocObserver = null;

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
  let xp = 0;
  xp += state.completed.length * 100;
  for (const q of Object.values(state.quizScores)) {
    if (q.score / q.total >= 0.7) xp += 50;
    if (q.score === q.total) xp += 25;
  }
  xp += state.badges.length * 30;
  return xp;
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
  for (const s of state.sessions) {
    days.add(new Date(s.start).toDateString());
  }
  const sorted = [...days].map(d => new Date(d)).sort((a, b) => b - a);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (sorted[0].toDateString() !== today && sorted[0].toDateString() !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i - 1] - sorted[i];
    if (diff <= 86400000 * 1.5) streak++;
    else break;
  }
  return streak;
}

function getTotalStudyTime() {
  let total = 0;
  for (const s of state.sessions) {
    total += new Date(s.end).getTime() - new Date(s.start).getTime();
  }
  return Math.max(0, total);
}

function formatDuration(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return hours + 'h' + String(minutes).padStart(2, '0');
  return minutes + 'min';
}

function checkBadges() {
  const extended = { ...state, _sessionCompleted: sessionCompleted, _fastComplete: state._fastComplete };
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
  el.innerHTML = `<div class="badge-icon">${ICONS[badge.icon]}</div><div class="toast-text"><strong>${badge.name}</strong>Badge débloqué</div>`;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => { el.classList.add('leaving'); setTimeout(() => el.remove(), 200); }, 4000);
}

function checkLevelUp() {
  const xp = calculateXP();
  const level = getLevel(xp);
  if (level.idx > previousLevel && previousLevel >= 0) {
    const el = document.createElement('div');
    el.className = 'toast level-up';
    el.innerHTML = `<div class="badge-icon">${ICONS.peak}</div><div class="toast-text"><strong>${level.name}</strong>Nouveau rang — ${level.altitude.toLocaleString('fr-FR')}m</div>`;
    document.getElementById('toasts').appendChild(el);
    setTimeout(() => { el.classList.add('leaving'); setTimeout(() => el.remove(), 200); }, 5000);
  }
  previousLevel = level.idx;
}

function estimateReadingTime(mod) {
  let text = mod.sections.map(s => s.content).join(' ');
  text = text.replace(/<[^>]+>/g, '');
  const words = text.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  if (mod.exercises && mod.exercises.length) return minutes + mod.exercises.length * 5;
  return minutes;
}

function renderSidebar() {
  const list = document.getElementById('module-list');
  list.innerHTML = '';
  for (const phase of PHASES) {
    const g = document.createElement('div');
    g.className = 'phase-group';
    g.innerHTML = `<div class="phase-title">${phase.name}</div>`;
    for (const mid of phase.modules) {
      const mod = MODULES.find(m => m.id === mid);
      if (!mod) continue;
      const item = document.createElement('div');
      const cls = ['module-item'];
      if (state.completed.includes(mid)) cls.push('completed');
      if (state.current === mid) cls.push('active');
      item.className = cls.join(' ');
      item.innerHTML = `<span class="module-dot"></span>${mod.title}`;
      item.onclick = () => navigate(mid);
      g.appendChild(item);
    }
    list.appendChild(g);
  }

  const pct = Math.round((state.completed.length / 12) * 100);
  document.getElementById('global-progress').style.width = pct + '%';
  document.getElementById('progress-text').textContent = `${state.completed.length} / 12 modules`;

  const xp = calculateXP();
  const level = getLevel(xp);
  const xpEl = document.getElementById('sidebar-xp');
  xpEl.innerHTML = `<div class="xp-level">${level.name}</div>
    <div class="xp-bar"><div class="xp-fill" style="width:${Math.round(level.progress * 100)}%"></div></div>
    <div class="xp-text">${xp} XP${level.next ? ' / ' + level.next.min + ' XP' : ''}</div>`;
}

function navigate(id) {
  state.current = id;
  moduleViewStart = Date.now();
  scheduleSave();
  render();
  closeMobile();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function render() {
  renderSidebar();
  destroyFloatingTOC();
  const el = document.getElementById('content');
  el.classList.remove('fade-in');
  void el.offsetWidth;
  el.classList.add('fade-in');
  if (state.current === 0) { renderDashboard(el); return; }
  const mod = MODULES.find(m => m.id === state.current);
  if (!mod) { renderDashboard(el); return; }
  renderModule(el, mod);
  requestAnimationFrame(() => buildFloatingTOC());
}

function renderDashboard(el) {
  const completed = state.completed.length;
  const pct = Math.round((completed / 12) * 100);
  const quizPassed = Object.values(state.quizScores).filter(q => q.score / q.total >= 0.7).length;
  const xp = calculateXP();
  const level = getLevel(xp);
  const streak = getStreak();
  const studyTime = getTotalStudyTime();

  const motivations = [[0, 'Prêt pour l\'ascension ?'], [1, 'L\'ascension commence'], [26, 'Bonne progression'], [51, 'Le sommet se rapproche'], [76, 'Dernière ligne droite'], [100, 'Au sommet !']];
  const motivation = motivations.filter(m => pct >= m[0]).pop()[1];

  let html = `<div class="dashboard-header"><h1>Tableau de bord</h1><p class="dashboard-subtitle">${motivation}</p></div>`;

  const nextModule = MODULES.find(m => !state.completed.includes(m.id));
  if (nextModule) {
    const nextTime = estimateReadingTime(nextModule);
    html += `<div class="next-step" data-module="${nextModule.id}">
      <div class="next-step-label">Prochaine étape</div>
      <div class="next-step-title">Module ${nextModule.id} — ${nextModule.title}</div>
      <div class="next-step-meta">${nextTime} min de lecture</div>
    </div>`;
  } else {
    html += `<div class="next-step completed-all">
      <div class="next-step-label">Formation terminée</div>
      <div class="next-step-title">Tous les modules sont complétés</div>
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

  html += '<div class="dashboard-metrics">';
  if (streak > 0) {
    html += `<div class="metric"><span class="metric-value">${streak}</span><span class="metric-label">jour${streak > 1 ? 's' : ''} de suite</span></div>`;
  }
  html += `<div class="metric"><span class="metric-value">${xp}</span><span class="metric-label">XP — ${level.name}</span></div>`;
  if (studyTime > 60000) {
    html += `<div class="metric"><span class="metric-value">${formatDuration(studyTime)}</span><span class="metric-label">de formation</span></div>`;
  }
  html += '</div>';

  html += '<div class="badges-section"><h2>Badges</h2>';
  for (const [cat, label] of [['progression', 'Progression'], ['quiz', 'Quiz'], ['secret', 'Secrets']]) {
    html += `<div class="badge-category"><h3>${label}</h3><div class="badge-grid">`;
    for (const b of BADGE_DEFS[cat]) {
      const unlocked = state.badges.includes(b.id);
      const isSecret = cat === 'secret';
      const cls = ['badge-card'];
      if (unlocked) cls.push('unlocked');
      else cls.push('locked');
      if (isSecret) cls.push('secret');
      html += `<div class="${cls.join(' ')}">
        <div class="badge-icon">${unlocked || !isSecret ? ICONS[b.icon] : ICONS.question}</div>
        <div class="badge-name">${unlocked || !isSecret ? b.name : '???'}</div>
        <div class="badge-desc">${unlocked || !isSecret ? b.desc : '???'}</div>
      </div>`;
    }
    html += '</div></div>';
  }
  html += '</div>';
  el.innerHTML = html;

  const nextBtn = el.querySelector('.next-step[data-module]');
  if (nextBtn) nextBtn.addEventListener('click', () => navigate(parseInt(nextBtn.dataset.module)));

  document.getElementById('reading-progress').style.setProperty('--read-pct', '0%');
}

function renderModule(el, mod) {
  const isCompleted = state.completed.includes(mod.id);
  const readTime = estimateReadingTime(mod);
  let html = `<div class="module-header">
    <div class="module-meta">
      <span class="module-num">Module ${mod.id}</span>
      <span class="module-reading-time">${readTime} min de lecture</span>
    </div>
    <h1>${mod.title}</h1>
    <p class="module-desc">${mod.desc}</p>`;
  if (mod.objectives) {
    html += `<div class="module-objectives"><h3>Objectifs</h3><ul>${mod.objectives.map(o => `<li>${o}</li>`).join('')}</ul></div>`;
  }
  html += '</div><div class="module-body">';

  for (const sec of mod.sections) {
    html += `<section class="content-section"><h2>${sec.title}</h2><div class="section-content">${sec.content}</div></section>`;
  }

  if (mod.exercises && mod.exercises.length) {
    html += '<div class="exercises-section"><h2>Exercices pratiques</h2>';
    for (const ex of mod.exercises) {
      html += `<div class="exercise"><h3>${ex.title}</h3><p>${ex.desc}</p>`;
      if (ex.steps) html += `<ol class="steps">${ex.steps.map(s => `<li>${s}</li>`).join('')}</ol>`;
      if (ex.validation) html += `<div class="validation">${ex.validation}</div>`;
      if (ex.hint) html += `<details class="hint"><summary>Indice</summary><p>${ex.hint}</p></details>`;
      html += '</div>';
    }
    html += '</div>';
  }

  if (mod.commands && mod.commands.length) {
    html += '<div class="commands-section"><h2>Commandes à pratiquer</h2>';
    for (let i = 0; i < mod.commands.length; i++) {
      const cmd = mod.commands[i];
      html += `<div class="command-exercise">
        <p class="cmd-prompt">${cmd.prompt}</p>
        <div class="cmd-input-row">
          <input type="text" class="cmd-input" data-cmd="${i}" placeholder="Saisir la commande...">
          <button class="cmd-check" data-cmd="${i}">Vérifier</button>
        </div>
        <div class="cmd-feedback" id="cmd-fb-${i}"></div>
      </div>`;
    }
    html += '</div>';
  }

  if (mod.quiz && mod.quiz.length) {
    html += '<div class="quiz-section"><h2>Quiz</h2>';
    for (let i = 0; i < mod.quiz.length; i++) {
      const q = mod.quiz[i];
      html += `<div class="quiz-question" data-q="${i}">
        <div class="q-number">Question ${i + 1}/${mod.quiz.length}</div>
        <p class="q-text">${q.question}</p>
        <div class="q-options">${q.options.map((o, j) => `<button class="q-option" data-q="${i}" data-opt="${j}">${o}</button>`).join('')}</div>
        <div class="q-explanation hidden" id="q-exp-${i}">${q.explanation}</div>
      </div>`;
    }
    html += '<div id="quiz-result" class="hidden"></div>';
    html += '<button class="btn-quiz" id="btn-submit-quiz">Valider le quiz</button>';
    html += '</div>';
  }

  html += '</div>';
  html += `<div class="module-footer">
    <button class="btn-complete ${isCompleted ? 'completed' : ''}" id="btn-mark-complete">${isCompleted ? 'Terminé' : 'Marquer comme terminé'}</button>
    <div class="module-nav">
      <button class="btn-nav" id="btn-prev" ${mod.id <= 1 ? 'disabled' : ''}>Précédent <kbd>&larr;</kbd></button>
      <button class="btn-nav" id="btn-next" ${mod.id >= 12 ? 'disabled' : ''}>Suivant <kbd>&rarr;</kbd></button>
    </div>
  </div>`;

  el.innerHTML = html;
  bindModuleEvents(mod);
}

function destroyFloatingTOC() {
  const el = document.getElementById('floating-toc');
  if (el) el.remove();
  if (tocObserver) { tocObserver.disconnect(); tocObserver = null; }
}

function buildFloatingTOC() {
  destroyFloatingTOC();
  const sections = document.querySelectorAll('.content-section');
  if (sections.length < 2) return;

  const toc = document.createElement('nav');
  toc.id = 'floating-toc';
  toc.innerHTML = '<div class="toc-title">Sommaire</div>';
  const targets = [...sections];

  sections.forEach(sec => {
    const h2 = sec.querySelector('h2');
    if (!h2) return;
    const link = document.createElement('a');
    link.className = 'toc-link';
    link.textContent = h2.textContent;
    link.href = '#';
    link.addEventListener('click', e => {
      e.preventDefault();
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    toc.appendChild(link);
  });

  for (const [sel, label] of [['.exercises-section', 'Exercices'], ['.commands-section', 'Commandes'], ['.quiz-section', 'Quiz']]) {
    const target = document.querySelector(sel);
    if (target) {
      targets.push(target);
      const link = document.createElement('a');
      link.className = 'toc-link toc-special';
      link.textContent = label;
      link.href = '#';
      link.addEventListener('click', e => {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      toc.appendChild(link);
    }
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
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const container = document.createElement('div');
  container.className = 'celebration';
  container.style.left = cx + 'px';
  container.style.top = cy + 'px';
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

function bindModuleEvents(mod) {
  document.getElementById('btn-mark-complete')?.addEventListener('click', () => markComplete(mod.id));
  document.getElementById('btn-prev')?.addEventListener('click', () => { if (mod.id > 1) navigate(mod.id - 1); });
  document.getElementById('btn-next')?.addEventListener('click', () => { if (mod.id < 12) navigate(mod.id + 1); });

  document.querySelectorAll('.cmd-check').forEach(btn => {
    const i = parseInt(btn.dataset.cmd);
    btn.addEventListener('click', () => checkCommand(mod, i));
  });

  document.querySelectorAll('.cmd-input').forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') checkCommand(mod, parseInt(input.dataset.cmd));
    });
  });

  document.querySelectorAll('.q-option').forEach(btn => {
    btn.addEventListener('click', () => selectOption(parseInt(btn.dataset.q), parseInt(btn.dataset.opt)));
  });

  document.getElementById('btn-submit-quiz')?.addEventListener('click', () => submitQuiz(mod));

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.closest('.code-block').querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copié';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copier'; btn.classList.remove('copied'); }, 1500);
      });
    });
  });
}

function checkCommand(mod, idx) {
  const cmd = mod.commands[idx];
  const input = document.querySelector(`.cmd-input[data-cmd="${idx}"]`);
  const fb = document.getElementById(`cmd-fb-${idx}`);
  const val = input.value.trim().toLowerCase();
  const ok = cmd.answers.some(a => a.toLowerCase() === val);
  fb.textContent = ok ? 'Correct !' : 'Essaie encore...';
  fb.className = 'cmd-feedback ' + (ok ? 'correct' : 'wrong');
  if (ok) {
    input.style.borderColor = 'var(--success)';
    setTimeout(() => { input.style.borderColor = ''; }, 1500);
  }
}

let quizAnswers = {};

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
    const options = document.querySelectorAll(`.q-option[data-q="${i}"]`);

    options.forEach(btn => {
      const opt = parseInt(btn.dataset.opt);
      btn.disabled = true;
      if (opt === q.correct) btn.classList.add('correct');
      if (opt === selected && opt !== q.correct) btn.classList.add('wrong');
    });

    document.getElementById(`q-exp-${i}`).classList.remove('hidden');
    if (selected === q.correct) score++;
  }

  const pass = score / total >= 0.7;
  const result = document.getElementById('quiz-result');
  result.className = `quiz-result ${pass ? 'pass' : 'fail'}`;
  result.innerHTML = `<span class="quiz-score">${score}/${total}</span><span class="quiz-status">${pass ? 'Réussi !' : 'À retravailler'}</span>`;

  state.quizScores[mod.id] = { score, total };
  scheduleSave();
  checkBadges();
  checkLevelUp();

  document.getElementById('btn-submit-quiz').disabled = true;
  quizAnswers = {};
}

function markComplete(id) {
  if (state.completed.includes(id)) return;
  const btn = document.getElementById('btn-mark-complete');
  if (btn) celebrate(btn);
  state.completed.push(id);
  sessionCompleted++;

  if (moduleViewStart && (Date.now() - moduleViewStart) < 15 * 60 * 1000) {
    state._fastComplete = true;
  }

  scheduleSave();
  checkBadges();
  checkLevelUp();
  render();
}

function closeMobile() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

function updateReadingProgress() {
  const el = document.getElementById('reading-progress');
  if (state.current === 0) {
    el.style.setProperty('--read-pct', '0%');
    return;
  }
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) {
    el.style.setProperty('--read-pct', '100%');
    return;
  }
  const pct = Math.min(100, Math.round((scrollTop / docHeight) * 100));
  el.style.setProperty('--read-pct', pct + '%');
}

function updateBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (window.scrollY > 400) btn.classList.add('visible');
  else btn.classList.remove('visible');
}

async function init() {
  state = await Progress.load();
  if (!state.completed) state.completed = [];
  if (!state.quizScores) state.quizScores = {};
  if (!state.badges) state.badges = [];
  if (!state.sessions) state.sessions = [];

  const now = new Date().toISOString();
  if (state.sessions.length) {
    const last = state.sessions[state.sessions.length - 1];
    const gap = Date.now() - new Date(last.end).getTime();
    if (gap > 7 * 86400000) checkBadges();
  }
  state.sessions.push({ start: now, end: now });
  scheduleSave();

  checkBadges();
  previousLevel = getLevel(calculateXP()).idx;
  render();

  document.getElementById('btn-export').addEventListener('click', () => Progress.exportData());
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Réinitialiser toute la progression ?')) {
      state = { current: 0, completed: [], quizScores: {}, badges: [], sessions: [] };
      sessionCompleted = 0;
      scheduleSave();
      render();
    }
  });

  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('open');
  });
  document.getElementById('sidebar-overlay').addEventListener('click', closeMobile);

  document.querySelector('.sidebar-header').addEventListener('click', () => {
    state.current = 0;
    scheduleSave();
    render();
    closeMobile();
  });

  document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight' && state.current > 0 && state.current < 12) {
      navigate(state.current + 1);
    } else if (e.key === 'ArrowLeft' && state.current > 1) {
      navigate(state.current - 1);
    } else if (e.key === 'Escape' && state.current !== 0) {
      state.current = 0;
      scheduleSave();
      render();
    }
  });

  let scrollTick = false;
  window.addEventListener('scroll', () => {
    if (!scrollTick) {
      requestAnimationFrame(() => {
        updateReadingProgress();
        updateBackToTop();
        scrollTick = false;
      });
      scrollTick = true;
    }
  }, { passive: true });

  setInterval(() => {
    if (state.sessions.length) {
      state.sessions[state.sessions.length - 1].end = new Date().toISOString();
      scheduleSave();
    }
  }, 60000);
}

init();
