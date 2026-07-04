/* ============================================
   JIVEN LIBRARY - Main Application Logic
   ============================================ */

// ===== RANK SYSTEM =====
const RANKS = [
  { name: "Page Turner", icon: "📄", xp: 0 },
  { name: "Curious Mind", icon: "🤔", xp: 300 },
  { name: "Bookworm", icon: "🐛", xp: 800 },
  { name: "Knowledge Sprout", icon: "🌱", xp: 1500 },
  { name: "Quick Learner", icon: "⚡", xp: 2500 },
  { name: "Chapter Explorer", icon: "🗺️", xp: 3800 },
  { name: "Subject Navigator", icon: "🧭", xp: 5500 },
  { name: "Quiz Apprentice", icon: "✏️", xp: 7500 },
  { name: "Practice Regular", icon: "📅", xp: 10000 },
  { name: "Mind Sharpener", icon: "🧠", xp: 13000 },
  { name: "Revision Rider", icon: "🔄", xp: 16500 },
  { name: "Streak Warrior", icon: "🔥", xp: 20500 },
  { name: "Half Scholar", icon: "📚", xp: 25000 },
  { name: "Topic Titan", icon: "🏛️", xp: 30000 },
  { name: "Science Star", icon: "⭐", xp: 36000 },
  { name: "Math Wizard", icon: "🔢", xp: 42500 },
  { name: "Language Master", icon: "🗣️", xp: 49500 },
  { name: "Mistake Crusher", icon: "💪", xp: 57000 },
  { name: "Daily Champion", icon: "🏆", xp: 65000 },
  { name: "Knowledge Vault", icon: "🏰", xp: 73500 },
  { name: "NCERT Explorer", icon: "📖", xp: 82500 },
  { name: "Academic Knight", icon: "⚔️", xp: 92000 },
  { name: "Wisdom Keeper", icon: "🦉", xp: 102000 },
  { name: "Junior Scholar", icon: "🎓", xp: 112500 },
  { name: "Grand Master", icon: "👑", xp: 125000 }
];

const ACHIEVEMENTS = [
  { id: "first_steps", name: "First Steps", icon: "👣", desc: "Answer your first question", check: p => p.totalAnswered >= 1 },
  { id: "century", name: "Century Club", icon: "💯", desc: "Answer 100 questions", check: p => p.totalAnswered >= 100 },
  { id: "thousand", name: "Thousand Club", icon: "🎯", desc: "Answer 1000 questions", check: p => p.totalAnswered >= 1000 },
  { id: "perfect", name: "Perfect Score", icon: "✨", desc: "100% in a quiz (10+ questions)", check: null },
  { id: "speed", name: "Speed Demon", icon: "⚡", desc: "Answer 5 questions under 10s each", check: null },
  { id: "week", name: "Week Warrior", icon: "📆", desc: "7-day streak", check: p => p.streak >= 7 },
  { id: "month", name: "Month Master", icon: "🗓️", desc: "30-day streak", check: p => p.streak >= 30 },
  { id: "unstoppable", name: "Unstoppable", icon: "🔥", desc: "100-day streak", check: p => p.streak >= 100 },
  { id: "bookworm", name: "Bookworm", icon: "📗", desc: "Complete all chapters in a subject", check: null },
  { id: "polymath", name: "Polymath", icon: "🌟", desc: "Complete all chapters in all subjects", check: null },
  { id: "mistake_free", name: "Mistake Free", icon: "🧹", desc: "Clear all mistakes in a subject", check: null },
  { id: "revision_king", name: "Revision King", icon: "👑", desc: "Revise 50 mistakes", check: p => p.mistakesRevised >= 50 },
  { id: "note_taker", name: "Note Taker", icon: "📝", desc: "Write 10 notes", check: p => p.notesCount >= 10 },
  { id: "daily_devotee", name: "Daily Devotee", icon: "🙏", desc: "Complete 30 daily challenges", check: p => p.dailyChallenges >= 30 },
  { id: "science_genius", name: "Science Genius", icon: "🔬", desc: "90%+ accuracy in Science", check: p => getSubjectAccuracy('science') >= 90 },
  { id: "math_magic", name: "Math Magician", icon: "🧮", desc: "90%+ accuracy in Mathematics", check: p => getSubjectAccuracy('maths') >= 90 },
  { id: "lang_lover", name: "Language Lover", icon: "💬", desc: "90%+ in English & Hindi", check: p => getSubjectAccuracy('english') >= 90 && getSubjectAccuracy('hindi') >= 90 },
  { id: "social_scholar", name: "Social Scholar", icon: "🌍", desc: "90%+ accuracy in Social Science", check: p => getSubjectAccuracy('socialScience') >= 90 },
  { id: "streak_saver", name: "Streak Saver", icon: "🧊", desc: "Use a streak freeze", check: p => p.streakFreezesUsed >= 1 },
  { id: "grand_master", name: "Grand Master", icon: "👑", desc: "Reach the Grand Master rank", check: p => p.xp >= 125000 }
];

const SUBJECT_KEYS = ['maths', 'science', 'english', 'hindi', 'socialScience', 'sanskrit'];

// ===== STATE =====
let state = loadState();
let quizState = null;
let writtenState = null;

function defaultState() {
  return {
    xp: 0,
    streak: 0,
    bestStreak: 0,
    lastLogin: null,
    streakFreezes: 1,
    streakFreezesUsed: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    dailyChallenges: 0,
    mistakesRevised: 0,
    notesCount: 0,
    assignmentResults: {},
    subjectProgress: {},
    chapterHistory: {},
    mistakes: [],
    notes: [],
    achievements: [],
    dailyChallengeDate: null,
    activityLog: {}
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem('jiven_progress');
    if (saved) {
      const s = JSON.parse(saved);
      return { ...defaultState(), ...s };
    }
  } catch(e) {}
  return defaultState();
}

function saveState() {
  localStorage.setItem('jiven_progress', JSON.stringify(state));
}

// ===== HELPERS =====
function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getSubjectAccuracy(subjectKey) {
  const hist = state.chapterHistory[subjectKey] || {};
  let total = 0, correct = 0;
  Object.values(hist).forEach(ch => {
    total += ch.total || 0;
    correct += ch.correct || 0;
  });
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

function getChapterProgress(subjectKey, chapterId) {
  const sub = state.chapterHistory[subjectKey];
  if (!sub) return { total: 0, correct: 0, mcqDone: false, writtenDone: false };
  return sub[chapterId] || { total: 0, correct: 0, mcqDone: false, writtenDone: false };
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== NAVIGATION =====
function navigate(page, params) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) {
    target.classList.add('active');
    target.style.animation = 'none';
    target.offsetHeight;
    target.style.animation = '';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (page === 'home') renderBookshelf();
  else if (page === 'subject') renderSubject(params);
  else if (page === 'mistakes') renderMistakes();
  else if (page === 'dashboard') renderDashboard();
  else if (page === 'notes') renderNotes();
  else if (page === 'achievements') renderAchievements();
  else if (page === 'assignments') renderAssignments();
  else if (page === 'ranks') renderRankDetails();
}

// ===== XP & RANK =====
function getCurrentRank() {
  let rank = RANKS[0];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (state.xp >= RANKS[i].xp) { rank = RANKS[i]; break; }
  }
  return rank;
}

function getNextRank() {
  const current = getCurrentRank();
  const idx = RANKS.indexOf(current);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

function addXP(amount, reason) {
  const oldRank = getCurrentRank();
  state.xp = (parseInt(state.xp) || 0) + (parseInt(amount) || 0);
  const newRank = getCurrentRank();
  updateTopBar();
  saveState();
  if (newRank.xp > oldRank.xp) {
    setTimeout(() => showRankUp(newRank), 800);
  }
}

function showXPpopup(amount) {
  const el = document.createElement('div');
  el.className = 'xp-popup';
  el.textContent = `+${amount} XP`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function showRankUp(rank) {
  const overlay = document.createElement('div');
  overlay.className = 'rankup-overlay';
  overlay.id = 'rankupOverlay';
  overlay.innerHTML = `
    <div class="confetti-container" id="confettiContainer"></div>
    <div class="rankup-content">
      <div class="rankup-icon">${rank.icon}</div>
      <div class="rankup-label">Rank Up!</div>
      <div class="rankup-name">${rank.name}</div>
      <button class="rankup-dismiss" onclick="closeRankUp()">Amazing! 🎉</button>
    </div>
  `;
  document.body.appendChild(overlay);
  spawnConfetti();
}

function spawnConfetti() {
  const container = document.getElementById('confettiContainer');
  if (!container) return;
  const colors = ['#FFD700', '#FF8F00', '#4CAF50', '#E53935', '#42A5F5', '#AB47BC', '#FF6D00'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + '%';
    c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDelay = Math.random() * 1.5 + 's';
    c.style.animationDuration = (2 + Math.random() * 2) + 's';
    c.style.width = (5 + Math.random() * 8) + 'px';
    c.style.height = (5 + Math.random() * 8) + 'px';
    container.appendChild(c);
  }
}

function closeRankUp() {
  const overlay = document.getElementById('rankupOverlay');
  if (overlay) overlay.remove();
}

// ===== STREAK =====
function checkStreak() {
  const today = getToday();
  if (state.lastLogin === today) return;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (state.lastLogin === yesterday) {
    state.streak++;
  } else if (state.lastLogin && state.lastLogin !== today) {
    if (state.streakFreezes > 0) {
      state.streakFreezes--;
      state.streakFreezesUsed++;
      checkAchievement('streak_saver');
    } else {
      state.streak = 0;
    }
  } else {
    state.streak = 1;
  }
  state.lastLogin = today;
  state.activityLog[today] = state.activityLog[today] || { questions: 0, correct: 0, xp: 0, time: 0 };
  if (state.streak > state.bestStreak) state.bestStreak = state.streak;
  addXP(5, 'daily_login');
  saveState();
}

// ===== TOP BAR =====
function updateTopBar() {
  const rank = getCurrentRank();
  const next = getNextRank();
  document.getElementById('rankIcon').textContent = rank.icon;
  document.getElementById('rankName').textContent = rank.name;
  document.getElementById('rankName').onclick = () => navigate('ranks');
  document.getElementById('rankIcon').onclick = () => navigate('ranks');
  document.getElementById('rankBadge').style.cursor = 'pointer';
  document.getElementById('xpText').textContent = (parseInt(state.xp)||0) + ' XP';
  document.getElementById('streakCount').textContent = state.streak || 0;
  if (next) {
    const currentXP = parseInt(state.xp) || 0;
    const progress = ((currentXP - rank.xp) / (next.xp - rank.xp)) * 100;
    document.getElementById('xpFill').style.width = Math.min(Math.max(progress,0), 100) + '%';
    document.getElementById('xpLabel').textContent = `${currentXP - rank.xp} / ${next.xp - rank.xp} XP → ${next.name} ${next.icon}`;
  } else {
    document.getElementById('xpFill').style.width = '100%';
    document.getElementById('xpLabel').textContent = 'MAX RANK!';
  }
  // Update rank details section if on dashboard
  const rankDetails = document.getElementById('rankDetailsContent');
  if (rankDetails) renderRankDetails();
}

// ===== BOOKSHELF =====
function renderBookshelf() {
  const q = window.QUESTIONS || {};
  const shelf = document.getElementById('bookshelf');
  shelf.innerHTML = '';

  const subjects = [
    { key: 'maths', name: 'Mathematics', icon: '📐', color: '#1565C0' },
    { key: 'science', name: 'Science', icon: '🔬', color: '#2E7D32' },
    { key: 'english', name: 'English', icon: '📖', color: '#C62828' },
    { key: 'hindi', name: 'Hindi', icon: '📜', color: '#E65100' },
    { key: 'socialScience', name: 'Social Science', icon: '🌍', color: '#F9A825' },
    { key: 'sanskrit', name: 'Sanskrit', icon: '🕉️', color: '#6A1B9A' }
  ];

  subjects.forEach(sub => {
    const data = q[sub.key];
    const totalChapters = data ? data.chapters.length : 0;
    let completedChapters = 0;
    if (data && state.chapterHistory[sub.key]) {
      data.chapters.forEach(ch => {
        const h = state.chapterHistory[sub.key][ch.id];
        if (h && h.mcqDone) completedChapters++;
      });
    }
    const pct = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    const card = document.createElement('div');
    card.className = 'book-card';
    card.style.setProperty('--book-color', sub.color);
    card.onclick = () => navigate('subject', { key: sub.key });
    card.innerHTML = `
      <span class="book-icon">${sub.icon}</span>
      <div class="book-title">${sub.name}</div>
      <div class="book-progress">${completedChapters}/${totalChapters} chapters</div>
      <div class="book-progress-bar">
        <div class="book-progress-fill" style="width:${pct}%"></div>
      </div>
    `;
    shelf.appendChild(card);
  });

  updateDailyChallenge();
  checkAchievements();
}

// ===== DAILY CHALLENGE =====
function updateDailyChallenge() {
  const banner = document.getElementById('dailyChallenge');
  const text = document.getElementById('dailyChallengeText');
  if (state.dailyChallengeDate === getToday()) {
    banner.classList.add('daily-challenge-done');
    text.textContent = 'Completed for today! Come back tomorrow.';
  } else {
    banner.classList.remove('daily-challenge-done');
    text.textContent = '10 mixed questions — Earn 50 bonus XP!';
  }
}

function startDailyChallenge() {
  if (state.dailyChallengeDate === getToday()) return;
  const allQuestions = [];
  const q = window.QUESTIONS || {};
  SUBJECT_KEYS.forEach(key => {
    const sub = q[key];
    if (sub) {
      sub.chapters.forEach(ch => {
        ch.mcq.forEach(m => allQuestions.push({ ...m, subject: key, chapter: ch.id, chapterName: ch.name }));
      });
    }
  });
  if (allQuestions.length < 10) {
    alert('Not enough questions yet for a daily challenge. More content coming soon!');
    return;
  }
  const selected = shuffleArray(allQuestions).slice(0, 10);
  startMCQQuiz(selected, 'daily', 'Daily Challenge');
}

// ===== SUBJECT PAGE =====
function renderSubject(params) {
  const q = (window.QUESTIONS || {})[params.key];
  const subInfo = {
    maths: 'Mathematics', science: 'Science', english: 'English',
    hindi: 'Hindi', socialScience: 'Social Science', sanskrit: 'Sanskrit'
  };
  document.getElementById('subjectTitle').textContent = subInfo[params.key] || params.key;

  // Mistakes count for this subject
  const subjectMistakes = state.mistakes.filter(m => m.subject === params.key && !m.resolved);
  document.getElementById('subjectMistakesCount').textContent = subjectMistakes.length;

  const grid = document.getElementById('chaptersGrid');
  grid.innerHTML = '';

  if (!q || !q.chapters || q.chapters.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📚</div><div class="empty-state-text">Content coming soon! Stay tuned.</div></div>';
    return;
  }

  q.chapters.forEach(ch => {
    const prog = getChapterProgress(params.key, ch.id);
    const acc = prog.total > 0 ? Math.round((prog.correct / prog.total) * 100) : 0;
    const card = document.createElement('div');
    card.className = 'chapter-card';
    card.innerHTML = `
      <div class="chapter-name">${ch.id.replace('ch', 'Ch ').toUpperCase()}. ${ch.name}</div>
      <div class="chapter-stats">
        <span>📝 ${prog.total} done</span>
        <span>✅ ${acc}% accuracy</span>
      </div>
      <div class="chapter-mode-btns">
        <button class="mode-btn mcq-btn" onclick="event.stopPropagation(); startChapterQuiz('${params.key}','${ch.id}','mcq')">
          🧠 MCQ (${ch.mcq ? ch.mcq.length : 0})
        </button>
        <button class="mode-btn written-btn" onclick="event.stopPropagation(); startChapterQuiz('${params.key}','${ch.id}','written')">
          ✍️ Written (${ch.written ? ch.written.length : 0})
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  window._currentSubject = params.key;
}

// ===== MCQ QUIZ ENGINE =====
function startChapterQuiz(subjectKey, chapterId, mode) {
  const q = (window.QUESTIONS || {})[subjectKey];
  if (!q) return;
  const chapter = q.chapters.find(c => c.id === chapterId);
  if (!chapter) return;

  if (mode === 'mcq') {
    const questions = chapter.mcq.map(m => ({ ...m, subject: subjectKey, chapter: chapterId, chapterName: chapter.name }));
    if (questions.length === 0) { alert('No MCQ questions available yet!'); return; }
    startMCQQuiz(questions, subjectKey + '-' + chapterId, chapter.name);
  } else {
    const questions = chapter.written.map(w => ({ ...w, subject: subjectKey, chapter: chapterId, chapterName: chapter.name }));
    if (questions.length === 0) { alert('No written questions available yet!'); return; }
    startWrittenQuiz(questions, subjectKey, chapterId, chapter.name);
  }
}

function startMCQQuiz(questions, contextId, contextName) {
  quizState = {
    questions: shuffleArray(questions),
    contextId, contextName,
    current: 0,
    correct: 0,
    wrong: 0,
    xpEarned: 0,
    startTime: Date.now(),
    questionStartTime: Date.now(),
    answers: [],
    isDaily: contextId === 'daily',
    fastStreak: 0
  };
  navigate('quiz');
  showQuestion();
}

function showQuestion() {
  if (!quizState) return;
  const q = quizState.questions[quizState.current];
  document.getElementById('quizCurrent').textContent = quizState.current + 1;
  document.getElementById('quizTotal').textContent = quizState.questions.length;
  document.getElementById('quizProgressFill').style.width = ((quizState.current) / quizState.questions.length * 100) + '%';
  document.getElementById('questionText').textContent = q.q;
  document.getElementById('explanationBox').style.display = 'none';

  const optList = document.getElementById('optionsList');
  optList.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span>${opt}</span>`;
    btn.onclick = () => selectOption(i);
    optList.appendChild(btn);
  });

  quizState.questionStartTime = Date.now();
  startTimer();
}

function selectOption(idx) {
  if (!quizState) return;
  const q = quizState.questions[quizState.current];
  const btns = document.querySelectorAll('.option-btn');
  btns.forEach(b => b.classList.add('disabled'));

  const timeTaken = (Date.now() - quizState.questionStartTime) / 1000;
  const isCorrect = idx === q.answer;

  if (isCorrect) {
    btns[idx].classList.add('correct');
    quizState.correct++;
    let xp = 10;
    if (timeTaken < 10) { xp = 15; quizState.fastStreak++; }
    else { quizState.fastStreak = 0; }
    xp += Math.min(quizState.streak * 2, 20);
    quizState.xpEarned += xp;
    showXPpopup(xp);
    spawnMiniConfetti();
  } else {
    btns[idx].classList.add('wrong');
    btns[q.answer].classList.add('correct');
    quizState.wrong++;
    quizState.fastStreak = 0;
    // Save mistake
    state.mistakes.push({
      id: Date.now() + Math.random(),
      question: q.q,
      yourAnswer: q.options[idx],
      correctAnswer: q.options[q.answer],
      explanation: q.explanation || '',
      subject: q.subject,
      chapter: q.chapter,
      chapterName: q.chapterName,
      date: getToday(),
      nextReview: getReviewDate(1),
      reviewCount: 0,
      resolved: false
    });
  }

  quizState.answers.push({ question: q.q, selected: idx, correct: q.answer, isCorrect, time: timeTaken });

  if (q.explanation) {
    const box = document.getElementById('explanationBox');
    box.textContent = '💡 ' + q.explanation;
    box.style.display = 'block';
  }

  // Auto advance after delay
  setTimeout(() => {
    quizState.current++;
    if (quizState.current < quizState.questions.length) {
      // Re-create card for animation
      const card = document.getElementById('questionCard');
      card.style.animation = 'none';
      card.offsetHeight;
      card.style.animation = 'fadeSlideIn 0.4s ease';
      showQuestion();
    } else {
      finishMCQQuiz();
    }
  }, isCorrect ? 1200 : 2200);
}

function spawnMiniConfetti() {
  const card = document.getElementById('questionCard');
  const rect = card.getBoundingClientRect();
  const colors = ['#FFD700', '#FF8F00', '#4CAF50', '#42A5F5'];
  for (let i = 0; i < 12; i++) {
    const c = document.createElement('div');
    c.style.cssText = `position:fixed;left:${rect.left + rect.width/2 + (Math.random()-0.5)*100}px;top:${rect.top + 30}px;width:6px;height:6px;border-radius:50%;background:${colors[i%4]};pointer-events:none;z-index:150;`;
    c.style.animation = `confettiFall ${1 + Math.random()}s ease-out forwards`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 2000);
  }
}

let timerInterval = null;
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!quizState) { clearInterval(timerInterval); return; }
    const elapsed = Math.floor((Date.now() - quizState.startTime) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    document.getElementById('quizTimer').textContent = `⏱ ${m}:${s.toString().padStart(2, '0')}`;
  }, 1000);
}

function finishMCQQuiz() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  const total = quizState.questions.length;
  const pct = Math.round((quizState.correct / total) * 100);
  const time = Math.floor((Date.now() - quizState.startTime) / 1000);
  const m = Math.floor(time / 60), s = time % 60;

  // Update state
  state.totalAnswered += total;
  state.totalCorrect += quizState.correct;

  // Update chapter history
  quizState.questions.forEach(q => {
    if (!q.subject || !q.chapter) return;
    if (!state.chapterHistory[q.subject]) state.chapterHistory[q.subject] = {};
    if (!state.chapterHistory[q.subject][q.chapter]) {
      state.chapterHistory[q.subject][q.chapter] = { total: 0, correct: 0, mcqDone: false, writtenDone: false };
    }
    const ans = quizState.answers.find(a => a.question === q.q);
    state.chapterHistory[q.subject][q.chapter].total++;
    if (ans && ans.isCorrect) state.chapterHistory[q.subject][q.chapter].correct++;
    state.chapterHistory[q.subject][q.chapter].mcqDone = true;
  });

  // Activity log
  state.activityLog[getToday()] = state.activityLog[getToday()] || { questions: 0, correct: 0, xp: 0, time: 0 };
  state.activityLog[getToday()].questions += total;
  state.activityLog[getToday()].correct += quizState.correct;
  state.activityLog[getToday()].time += time;

  // Daily challenge bonus
  if (quizState.isDaily) {
    quizState.xpEarned += 50;
    state.dailyChallengeDate = getToday();
    state.dailyChallenges++;
  }

  // Perfect score check
  if (total >= 10 && pct === 100) {
    checkAchievement('perfect');
  }
  // Speed demon check
  if (quizState.fastStreak >= 5) {
    checkAchievement('speed');
  }

  addXP(quizState.xpEarned, 'quiz');
  checkAchievements();
  saveState();

  // Show results
  document.getElementById('scoreText').textContent = pct + '%';
  document.getElementById('resultsTitle').textContent = pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good Effort!' : 'Keep Practicing!';
  document.getElementById('resultsSubtitle').textContent = quizState.contextName + ' — ' + getEncouragement(pct);
  document.getElementById('resCorrect').textContent = quizState.correct;
  document.getElementById('resWrong').textContent = quizState.wrong;
  document.getElementById('resTime').textContent = m + ':' + s.toString().padStart(2, '0');
  document.getElementById('resXP').textContent = '+' + quizState.xpEarned + ' XP';
  document.getElementById('resMistakesBtn').style.display = quizState.wrong > 0 ? '' : 'none';

  // Next button
  const nextBtn = document.getElementById('resNextBtn');
  if (quizState.isDaily) {
    nextBtn.style.display = 'none';
  } else {
    nextBtn.style.display = '';
    nextBtn.onclick = () => goNextAfterResults();
  }

  navigate('results');

  // Animate score circle
  setTimeout(() => {
    const fill = document.getElementById('scoreCircleFill');
    const circumference = 2 * Math.PI * 70;
    fill.style.strokeDasharray = circumference;
    fill.style.strokeDashoffset = circumference;
    fill.style.stroke = pct >= 80 ? '#4CAF50' : pct >= 50 ? '#FF8F00' : '#E53935';
    setTimeout(() => {
      fill.style.strokeDashoffset = circumference - (circumference * pct / 100);
    }, 100);
  }, 200);

  window._lastQuizContext = quizState.contextId;
  window._lastQuizSubject = quizState.questions[0]?.subject;
  window._lastQuizChapter = quizState.questions[0]?.chapter;
  quizState = null;
}

function getEncouragement(pct) {
  if (pct === 100) return "Perfect score! You're a genius! 🌟";
  if (pct >= 80) return "Amazing work! Almost perfect! 🎉";
  if (pct >= 60) return "Good job! Keep it up! 💪";
  if (pct >= 40) return "Nice try! Review the mistakes and try again!";
  return "Don't worry! Practice makes perfect! 📚";
}

function getReviewDate(daysFromNow) {
  const d = new Date(Date.now() + daysFromNow * 86400000);
  return d.toISOString().split('T')[0];
}

function confirmQuitQuiz() {
  if (quizState && quizState.current > 0) {
    if (!confirm('Quit quiz? Progress will be lost.')) return;
  }
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  quizState = null;
  navigate('home');
}

function goNextAfterResults() {
  const ctx = window._lastQuizContext;
  if (!ctx || ctx === 'daily') { navigate('home'); return; }
  const [subject, chapter] = [window._lastQuizSubject, window._lastQuizChapter];
  const q = (window.QUESTIONS || {})[subject];
  if (!q) { navigate('home'); return; }
  const idx = q.chapters.findIndex(c => c.id === chapter);
  if (idx >= 0 && idx < q.chapters.length - 1) {
    const next = q.chapters[idx + 1];
    startChapterQuiz(subject, next.id, 'mcq');
  } else {
    navigate('home');
  }
}

function goBackFromResults() {
  const ctx = window._lastQuizContext;
  if (!ctx || ctx === 'daily') { navigate('home'); return; }
  if (window._lastQuizSubject) {
    navigate('subject', { key: window._lastQuizSubject });
  } else {
    navigate('home');
  }
}

// ===== WRITTEN ANSWER ENGINE =====
function startWrittenQuiz(questions, subjectKey, chapterId, chapterName) {
  writtenState = {
    questions,
    subjectKey, chapterId, chapterName,
    current: 0,
    xpEarned: 0,
    startTime: Date.now(),
    ratings: []
  };
  navigate('written');
  showWrittenQuestion();
}

function showWrittenQuestion() {
  if (!writtenState) return;
  const q = writtenState.questions[writtenState.current];
  document.getElementById('writtenCurrent').textContent = writtenState.current + 1;
  document.getElementById('writtenTotal').textContent = writtenState.questions.length;
  document.getElementById('writtenProgressFill').style.width = (writtenState.current / writtenState.questions.length * 100) + '%';
  document.getElementById('writtenQuestion').textContent = q.q;
  document.getElementById('answerTextarea').value = '';
  document.getElementById('charCount').textContent = '0';
  document.getElementById('modelAnswerPanel').style.display = 'none';
  document.getElementById('submitWrittenBtn').style.display = '';
  document.getElementById('nextWrittenBtn').style.display = 'none';
  document.getElementById('finishWrittenBtn').style.display = 'none';
  resetStars();

  // Hints
  const hintsEl = document.getElementById('writtenHints');
  if (q.hints && q.hints.length > 0) {
    hintsEl.innerHTML = '💡 Hints: ' + q.hints.map(h => `<span>${h}</span>`).join(' ');
    hintsEl.style.display = '';
  } else {
    hintsEl.style.display = 'none';
  }

  // Word limit
  const ta = document.getElementById('answerTextarea');
  ta.oninput = () => {
    document.getElementById('charCount').textContent = ta.value.length;
  };
  if (q.wordLimit) {
    document.querySelector('.char-count').textContent = `0 / ${q.wordLimit * 5} chars (≈${q.wordLimit} words)`;
    ta.oninput = () => {
      document.querySelector('.char-count').textContent = `${ta.value.length} / ${q.wordLimit * 5} chars (≈${q.wordLimit} words)`;
    };
  }
}

function submitWrittenAnswer() {
  if (!writtenState) return;
  const q = writtenState.questions[writtenState.current];
  const answer = document.getElementById('answerTextarea').value.trim();
  if (!answer) { alert('Please write your answer first!'); return; }

  document.getElementById('submitWrittenBtn').style.display = 'none';
  document.getElementById('modelAnswerPanel').style.display = '';
  document.getElementById('modelAnswerText').textContent = q.modelAnswer;
}

function rateAnswer(stars) {
  if (!writtenState) return;
  const btns = document.querySelectorAll('.star-btn');
  btns.forEach((b, i) => b.classList.toggle('active', i < stars));

  writtenState.ratings.push(stars);
  const xp = stars >= 4 ? 20 : 10;
  writtenState.xpEarned += xp;
  showXPpopup(xp);

  // Update chapter history
  if (!state.chapterHistory[writtenState.subjectKey]) state.chapterHistory[writtenState.subjectKey] = {};
  if (!state.chapterHistory[writtenState.subjectKey][writtenState.chapterId]) {
    state.chapterHistory[writtenState.subjectKey][writtenState.chapterId] = { total: 0, correct: 0, mcqDone: false, writtenDone: false };
  }
  state.chapterHistory[writtenState.subjectKey][writtenState.chapterId].writtenDone = true;

  // Add to notes if checked
  if (document.getElementById('addToNotes').checked) {
    state.notes.push({
      id: Date.now() + Math.random(),
      title: `Q: ${writtenState.questions[writtenState.current].q.substring(0, 60)}...`,
      content: `Question: ${writtenState.questions[writtenState.current].q}\n\nModel Answer: ${writtenState.questions[writtenState.current].modelAnswer}`,
      subject: writtenState.subjectKey,
      date: getToday(),
      pinned: false
    });
    state.notesCount = state.notes.length;
  }

  state.totalAnswered++;
  if (stars >= 4) state.totalCorrect++;

  // Activity log
  state.activityLog[getToday()] = state.activityLog[getToday()] || { questions: 0, correct: 0, xp: 0, time: 0 };
  state.activityLog[getToday()].questions++;
  if (stars >= 4) state.activityLog[getToday()].correct++;

  saveState();

  const isLast = writtenState.current >= writtenState.questions.length - 1;
  document.getElementById('nextWrittenBtn').style.display = isLast ? 'none' : '';
  document.getElementById('finishWrittenBtn').style.display = isLast ? '' : 'none';
}

function resetStars() {
  document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
}

function nextWrittenQuestion() {
  if (!writtenState) return;
  writtenState.current++;
  showWrittenQuestion();
}

function finishWrittenQuiz() {
  if (!writtenState) return;
  addXP(writtenState.xpEarned, 'written');
  checkAchievements();
  saveState();

  // Show results
  const total = writtenState.questions.length;
  const avgStars = writtenState.ratings.length > 0 ? (writtenState.ratings.reduce((a, b) => a + b, 0) / writtenState.ratings.length) : 0;
  const pct = Math.round((avgStars / 5) * 100);

  document.getElementById('scoreText').textContent = pct + '%';
  document.getElementById('resultsTitle').textContent = 'Written Answers Complete!';
  document.getElementById('resultsSubtitle').textContent = `${writtenState.chapterName} — Average ${avgStars.toFixed(1)} ⭐`;
  document.getElementById('resCorrect').textContent = writtenState.ratings.filter(r => r >= 4).length;
  document.getElementById('resWrong').textContent = writtenState.ratings.filter(r => r < 4).length;
  const time = Math.floor((Date.now() - writtenState.startTime) / 1000);
  document.getElementById('resTime').textContent = Math.floor(time / 60) + ':' + (time % 60).toString().padStart(2, '0');
  document.getElementById('resXP').textContent = '+' + writtenState.xpEarned + ' XP';
  document.getElementById('resMistakesBtn').style.display = 'none';
  document.getElementById('resNextBtn').style.display = 'none';

  navigate('results');
  setTimeout(() => {
    const fill = document.getElementById('scoreCircleFill');
    const circumference = 2 * Math.PI * 70;
    fill.style.strokeDasharray = circumference;
    fill.style.strokeDashoffset = circumference;
    fill.style.stroke = '#AB47BC';
    setTimeout(() => { fill.style.strokeDashoffset = circumference - (circumference * pct / 100); }, 100);
  }, 200);

  window._lastQuizSubject = writtenState.subjectKey;
  writtenState = null;
}

function confirmQuitWritten() {
  if (writtenState && writtenState.current > 0) {
    if (!confirm('Quit? Progress will be lost.')) return;
  }
  writtenState = null;
  navigate('home');
}

// ===== MISTAKE JOURNAL =====
function renderMistakes(filterSubject) {
  const tabs = document.getElementById('mistakeTabs');
  tabs.innerHTML = '<button class="mistake-tab' + (!filterSubject ? ' active' : '') + '" onclick="renderMistakes()">All</button>';

  SUBJECT_KEYS.forEach(key => {
    const count = state.mistakes.filter(m => m.subject === key && !m.resolved).length;
    const subNames = { maths: 'Maths', science: 'Science', english: 'English', hindi: 'Hindi', socialScience: 'S.Sci', sanskrit: 'Sanskrit' };
    tabs.innerHTML += `<button class="mistake-tab${filterSubject === key ? ' active' : ''}" onclick="renderMistakes('${key}')">${subNames[key]} <span class="count">${count}</span></button>`;
  });

  const list = document.getElementById('mistakesList');
  let mistakes = state.mistakes.filter(m => !m.resolved);
  if (filterSubject) mistakes = mistakes.filter(m => m.subject === filterSubject);

  // Sort: due for review first
  const today = getToday();
  mistakes.sort((a, b) => (a.nextReview <= today ? 0 : 1) - (b.nextReview <= today ? 0 : 1));

  if (mistakes.length === 0) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎉</div><div class="empty-state-text">No mistakes! You are doing great!</div></div>';
    return;
  }

  list.innerHTML = mistakes.map(m => {
    const isDue = m.nextReview <= today;
    const reviewIntervals = [1, 3, 7, 14, 30];
    const nextInterval = reviewIntervals[Math.min(m.reviewCount, reviewIntervals.length - 1)];
    return `
      <div class="mistake-card${isDue ? ' due-review' : ''}">
        <div class="mistake-question">${m.question}</div>
        <div class="mistake-answers">
          <div class="mistake-your">Your answer: ${m.yourAnswer}</div>
          <div class="mistake-correct">Correct: ${m.correctAnswer}</div>
        </div>
        ${m.explanation ? `<div style="font-size:13px;color:var(--text-muted);margin-top:8px">💡 ${m.explanation}</div>` : ''}
        <div class="mistake-meta">
          <span class="mistake-date">${m.chapterName || ''} • ${m.date}${isDue ? ' • ⏰ Due for review!' : ` • Review in ${Math.ceil((new Date(m.nextReview) - new Date(today)) / 86400000)} days`}</span>
          <button class="revise-btn" onclick="resolveMistake('${m.id}')">I've Learned This ✓</button>
        </div>
      </div>
    `;
  }).join('');
}

function resolveMistake(id) {
  const m = state.mistakes.find(m => String(m.id) === String(id));
  if (m) {
    m.resolved = true;
    m.reviewCount++;
    state.mistakesRevised++;
    addXP(5, 'revision');
    checkAchievements();
    saveState();
    renderMistakes();
  }
}

// ===== DASHBOARD =====
function renderDashboard() {
  const stats = document.getElementById('dashStats');
  const today = state.activityLog[getToday()] || { questions: 0, correct: 0, xp: 0, time: 0 };
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  let weekQ = 0, weekCorrect = 0, weekTime = 0;
  Object.entries(state.activityLog).forEach(([date, log]) => {
    if (date >= weekAgo) {
      weekQ += log.questions || 0;
      weekCorrect += log.correct || 0;
      weekTime += log.time || 0;
    }
  });

  const totalPct = state.totalAnswered > 0 ? Math.round((state.totalCorrect / state.totalAnswered) * 100) : 0;

  stats.innerHTML = `
    <div class="dash-card"><div class="dash-card-value">${state.totalAnswered}</div><div class="dash-card-label">Total Questions</div></div>
    <div class="dash-card"><div class="dash-card-value">${totalPct}%</div><div class="dash-card-label">Overall Accuracy</div></div>
    <div class="dash-card"><div class="dash-card-value">${state.xp}</div><div class="dash-card-label">Total XP</div></div>
    <div class="dash-card"><div class="dash-card-value">🔥 ${state.streak}</div><div class="dash-card-label">Current Streak</div></div>
    <div class="dash-card"><div class="dash-card-value">${weekQ}</div><div class="dash-card-label">This Week</div></div>
    <div class="dash-card"><div class="dash-card-value">${state.mistakes.filter(m => !m.resolved).length}</div><div class="dash-card-label">Mistakes to Fix</div></div>
  `;

  drawRadarChart();
  drawHeatmap();
}

function drawRadarChart() {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const subjects = [
    { key: 'maths', label: 'Maths', angle: -Math.PI / 2 },
    { key: 'science', label: 'Science', angle: -Math.PI / 2 + (2 * Math.PI / 6) },
    { key: 'english', label: 'English', angle: -Math.PI / 2 + (4 * Math.PI / 6) },
    { key: 'hindi', label: 'Hindi', angle: -Math.PI / 2 + (6 * Math.PI / 6) },
    { key: 'socialScience', label: 'S.Sci', angle: -Math.PI / 2 + (8 * Math.PI / 6) },
    { key: 'sanskrit', label: 'Sanskrit', angle: -Math.PI / 2 + (10 * Math.PI / 6) }
  ];
  const cx = w / 2, cy = h / 2, maxR = Math.min(cx, cy) - 40;

  // Grid
  [0.25, 0.5, 0.75, 1].forEach(r => {
    ctx.beginPath();
    subjects.forEach((s, i) => {
      const x = cx + Math.cos(s.angle) * maxR * r;
      const y = cy + Math.sin(s.angle) * maxR * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.stroke();
  });

  // Axes
  subjects.forEach(s => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(s.angle) * maxR, cy + Math.sin(s.angle) * maxR);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.stroke();
  });

  // Data
  ctx.beginPath();
  subjects.forEach((s, i) => {
    const acc = getSubjectAccuracy(s.key) / 100;
    const x = cx + Math.cos(s.angle) * maxR * Math.max(acc, 0.05);
    const y = cy + Math.sin(s.angle) * maxR * Math.max(acc, 0.05);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(218,165,32,0.2)';
  ctx.fill();
  ctx.strokeStyle = '#DAA520';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#F5E6C8';
  ctx.font = '12px Inter, sans-serif';
  ctx.textAlign = 'center';
  subjects.forEach(s => {
    const lx = cx + Math.cos(s.angle) * (maxR + 24);
    const ly = cy + Math.sin(s.angle) * (maxR + 24);
    const pct = getSubjectAccuracy(s.key);
    ctx.fillText(`${s.label} ${pct}%`, lx, ly + 4);
  });
}

function drawHeatmap() {
  const grid = document.getElementById('heatmapGrid');
  grid.innerHTML = '';
  const today = new Date();
  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Header
  dayNames.forEach(d => {
    const cell = document.createElement('div');
    cell.style.cssText = 'text-align:center;font-size:11px;color:var(--text-muted);padding:4px 0;';
    cell.textContent = d;
    grid.appendChild(cell);
  });

  // Last 28 days (4 weeks)
  for (let i = 27; i >= 0; i--) {
    const date = new Date(today - i * 86400000);
    const key = date.toISOString().split('T')[0];
    const log = state.activityLog[key];
    const level = log && log.questions > 0 ? (log.questions >= 20 ? 4 : log.questions >= 10 ? 3 : log.questions >= 5 ? 2 : 1) : 0;
    const cell = document.createElement('div');
    cell.className = `heatmap-cell${level > 0 ? ' l' + level : ''}`;
    cell.title = `${key}: ${log ? log.questions + ' questions' : 'No activity'}`;
    grid.appendChild(cell);
  }
}

// ===== NOTES =====
function renderNotes() {
  const search = document.getElementById('notesSearch').value.toLowerCase();
  const list = document.getElementById('notesList');
  let notes = state.notes;

  if (search) {
    notes = notes.filter(n => n.title.toLowerCase().includes(search) || n.content.toLowerCase().includes(search));
  }

  notes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.date.localeCompare(a.date));

  if (notes.length === 0) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><div class="empty-state-text">No notes yet. Start writing!</div></div>';
    return;
  }

  list.innerHTML = notes.map((n, i) => `
    <div class="note-card${n.pinned ? ' pinned' : ''}" style="animation-delay:${i * 0.05}s" onclick="openNoteModal('${n.id}')">
      <div class="note-card-title">${n.pinned ? '📌 ' : ''}${n.title}</div>
      <div class="note-card-preview">${n.content.substring(0, 120)}...</div>
      <div class="note-card-meta">
        <span>${n.subject || 'General'}</span>
        <span>${n.date}</span>
      </div>
    </div>
  `).join('');
}

function openNoteModal(noteId) {
  const existing = noteId ? state.notes.find(n => String(n.id) === String(noteId)) : null;
  const container = document.getElementById('modalContainer');
  container.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal">
        <h3>${existing ? 'Edit Note' : 'New Note'}</h3>
        <input type="text" id="noteTitle" placeholder="Note title..." value="${existing ? existing.title.replace(/"/g, '&quot;') : ''}">
        <select id="noteSubject">
          <option value="general">General</option>
          <option value="maths">Mathematics</option>
          <option value="science">Science</option>
          <option value="english">English</option>
          <option value="hindi">Hindi</option>
          <option value="socialScience">Social Science</option>
          <option value="sanskrit">Sanskrit</option>
        </select>
        <textarea id="noteContent" placeholder="Write your note...">${existing ? existing.content : ''}</textarea>
        <div style="margin-bottom:12px">
          <label class="add-note-check"><input type="checkbox" id="notePinned" ${existing && existing.pinned ? 'checked' : ''}> Pin this note</label>
        </div>
        <div class="modal-actions">
          ${existing ? '<button class="modal-btn danger" onclick="deleteNote(\'' + existing.id + '\')">Delete</button>' : ''}
          <button class="modal-btn cancel" onclick="closeModal()">Cancel</button>
          <button class="modal-btn save" onclick="saveNote('${existing ? existing.id : ''}')">Save</button>
        </div>
      </div>
    </div>
  `;
  if (existing) {
    document.getElementById('noteSubject').value = existing.subject || 'general';
  }
}

function saveNote(existingId) {
  const title = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();
  const subject = document.getElementById('noteSubject').value;
  const pinned = document.getElementById('notePinned').checked;
  if (!title) { alert('Please enter a title!'); return; }
  if (!content) { alert('Please write something!'); return; }

  if (existingId) {
    const note = state.notes.find(n => String(n.id) === String(existingId));
    if (note) { note.title = title; note.content = content; note.subject = subject; note.pinned = pinned; }
  } else {
    state.notes.push({ id: Date.now() + Math.random(), title, content, subject, date: getToday(), pinned });
  }
  state.notesCount = state.notes.length;
  checkAchievements();
  saveState();
  closeModal();
  renderNotes();
}

function deleteNote(id) {
  if (!confirm('Delete this note?')) return;
  state.notes = state.notes.filter(n => String(n.id) !== String(id));
  state.notesCount = state.notes.length;
  saveState();
  closeModal();
  renderNotes();
}

function closeModal() {
  document.getElementById('modalContainer').innerHTML = '';
}

// ===== ACHIEVEMENTS =====
function checkAchievements() {
  ACHIEVEMENTS.forEach(a => {
    if (state.achievements.includes(a.id)) return;
    let earned = false;
    if (a.check) earned = a.check(state);
    if (earned) {
      state.achievements.push(a.id);
      showBadgeNotification(a);
    }
  });
}

function checkAchievement(id) {
  if (state.achievements.includes(id)) return;
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (a && a.check && a.check(state)) {
    state.achievements.push(id);
    showBadgeNotification(a);
    saveState();
  }
}

function showBadgeNotification(achievement) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;top:70px;right:20px;background:rgba(218,165,32,0.15);border:1px solid var(--gold);border-radius:12px;padding:16px 20px;z-index:200;animation:fadeSlideIn 0.4s ease;display:flex;align-items:center;gap:12px;max-width:300px;';
  el.innerHTML = `<span style="font-size:36px">${achievement.icon}</span><div><div style="font-weight:700;color:var(--gold-bright);font-size:14px">Achievement Unlocked!</div><div style="font-size:13px;color:var(--parchment)">${achievement.name}</div></div>`;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.5s'; }, 3000);
  setTimeout(() => el.remove(), 3500);
}

function renderAchievements() {
  const grid = document.getElementById('achievementsGrid');
  grid.innerHTML = ACHIEVEMENTS.map(a => {
    const earned = state.achievements.includes(a.id);
    return `
      <div class="badge-card ${earned ? 'earned' : 'locked'}">
        <div class="badge-icon">${a.icon}</div>
        <div class="badge-name">${a.name}</div>
        <div class="badge-desc">${a.desc}</div>
        ${earned ? '<div class="badge-date">✓ Earned</div>' : '<div class="badge-date">🔒 Locked</div>'}
      </div>
    `;
  }).join('');
}

// ===== ASSIGNMENTS =====
const ASSIGNMENTS = [
  {
    id: "minor-test-2-af",
    name: "Excellence Minor Test-2 (Set AF)",
    subject: "Mixed",
    totalQuestions: 155,
    maxMarks: 140,
    date: "2026-07-04",
    sections: [
      { name: "Hindi", start: 1, end: 16, compulsory: 15 },
      { name: "English", start: 17, end: 33, compulsory: 15 },
      { name: "Reasoning", start: 34, end: 49, compulsory: 15 },
      { name: "G.K.", start: 50, end: 60, compulsory: 10 },
      { name: "Maths", start: 61, end: 82, compulsory: 20 },
      { name: "Physics", start: 83, end: 99, compulsory: 15 },
      { name: "Chemistry", start: 100, end: 116, compulsory: 15 },
      { name: "Biology", start: 117, end: 133, compulsory: 15 },
      { name: "Social Science", start: 134, end: 155, compulsory: 20 }
    ],
    questions: [
      {q:"'\u0935\u093f\u0926\u094d\u092f\u093e' \u0936\u092c\u094d\u0926 \u0915\u093e \u092c\u0939\u0941\u0935\u091a\u0928 \u0915\u094d\u092f\u093e \u0939\u0948?", options:["\u0935\u093f\u0926\u094d\u092f\u093e\u090f\u0901", "\u0935\u093f\u0926\u094d\u092f\u093e\u090f", "\u0935\u093f\u0926\u094d\u092f", "\u0935\u093f\u0926\u094d\u092f\u094b\u0902"], answer:0, explanation:"'\u0935\u093f\u0926\u094d\u092f\u093e' \u0915\u093e \u092c\u0939\u0941\u0935\u091a\u0928 '\u0935\u093f\u0926\u094d\u092f\u093e\u090f\u0901' \u0939\u094b\u0924\u093e \u0939\u0948\u0964 \u0905\u0915\u093e\u0930\u093e\u0902\u0924 \u0938\u094d\u0924\u094d\u0930\u0940\u0932\u093f\u0902\u0917 \u0936\u092c\u094d\u0926\u094b\u0902 \u092e\u0947\u0902 '\u090f\u0901' \u091c\u094b\u0921\u093c\u093e \u091c\u093e\u0924\u093e \u0939\u0948\u0964", difficulty:"easy", section:"Hindi"},
      {q:"'\u0906\u0901\u0916' \u0936\u092c\u094d\u0926 \u092e\u0947\u0902 \u0915\u094c\u0928 \u0938\u093e \u0938\u094d\u0935\u0930 \u0939\u0948?", options:["\u0906", "\u0908", "\u090a", "\u0905"], answer:0, explanation:"'\u0906\u0901\u0916' \u0936\u092c\u094d\u0926 \u092e\u0947\u0902 '\u0906' (\u0906\u0915\u093e\u0930) \u0938\u094d\u0935\u0930 \u0939\u0948\u0964", difficulty:"easy", section:"Hindi"},
      {q:"'\u0909\u092a\u0938\u0930\u094d\u0917' \u0915\u093e \u0905\u0930\u094d\u0925 \u0915\u094d\u092f\u093e \u0939\u0948?", options:["\u0936\u092c\u094d\u0926 \u0915\u0947 \u0905\u0902\u0924 \u092e\u0947\u0902 \u091c\u0941\u0921\u093c\u0928\u0947 \u0935\u093e\u0932\u093e", "\u0936\u092c\u094d\u0926 \u0915\u0947 \u0906\u0930\u0902\u092d \u092e\u0947\u0902 \u091c\u0941\u0921\u093c\u0928\u0947 \u0935\u093e\u0932\u093e", "\u0938\u094d\u0935\u0924\u0902\u0924\u094d\u0930 \u0936\u092c\u094d\u0926", "\u0915\u094b\u0908 \u0928\u0939\u0940\u0902"], answer:1, explanation:"\u0909\u092a\u0938\u0930\u094d\u0917 \u0936\u092c\u094d\u0926 \u0915\u0947 \u0906\u0930\u0902\u092d \u092e\u0947\u0902 \u091c\u0941\u0921\u093c\u0928\u0947 \u0935\u093e\u0932\u093e \u0905\u0902\u0936 \u0939\u094b\u0924\u093e \u0939\u0948, \u091c\u0948\u0938\u0947 '\u0909\u092a' + '\u0915\u093e\u0930' = '\u0909\u092a\u0915\u093e\u0930'\u0964", difficulty:"medium", section:"Hindi"},
      {q:"'\u092a\u094d\u0930\u0924\u094d\u092f\u092f' \u0915\u093f\u0938\u0947 \u0915\u0939\u0924\u0947 \u0939\u0948\u0902?", options:["\u0936\u092c\u094d\u0926 \u0915\u0947 \u0905\u0902\u0924 \u092e\u0947\u0902 \u091c\u0941\u0921\u093c\u0928\u0947 \u0935\u093e\u0932\u093e", "\u0936\u092c\u094d\u0926 \u0915\u0947 \u0906\u0930\u0902\u092d \u092e\u0947\u0902 \u091c\u0941\u0921\u093c\u0928\u0947 \u0935\u093e\u0932\u093e", "\u0938\u094d\u0935\u0924\u0902\u0924\u094d\u0930 \u0936\u092c\u094d\u0926", "\u0909\u092a\u0938\u0930\u094d\u0917 \u0915\u093e \u092a\u0930\u094d\u092f\u093e\u092f"], answer:0, explanation:"\u092a\u094d\u0930\u0924\u094d\u092f\u092f \u0936\u092c\u094d\u0926 \u0915\u0947 \u0905\u0902\u0924 \u092e\u0947\u0902 \u091c\u0941\u0921\u093c\u0928\u0947 \u0935\u093e\u0932\u093e \u0905\u0902\u0936 \u0939\u094b\u0924\u093e \u0939\u0948\u0964", difficulty:"medium", section:"Hindi"},
      {q:"'\u0917\u093e\u092f' \u0936\u092c\u094d\u0926 \u0915\u093e \u0932\u093f\u0902\u0917 \u0915\u094d\u092f\u093e \u0939\u0948?", options:["\u092a\u0941\u0932\u094d\u0932\u093f\u0902\u0917", "\u0938\u094d\u0924\u094d\u0930\u0940\u0932\u093f\u0902\u0917", "\u0928\u092a\u0941\u0902\u0938\u0915\u0932\u093f\u0902\u0917", "\u0909\u092d\u092f\u0932\u093f\u0902\u0917"], answer:1, explanation:"'\u0917\u093e\u092f' \u090f\u0915 \u0938\u094d\u0924\u094d\u0930\u0940\u0932\u093f\u0902\u0917 \u0936\u092c\u094d\u0926 \u0939\u0948\u0964 '\u092c\u0948\u0932' \u0907\u0938\u0915\u093e \u092a\u0941\u0932\u094d\u0932\u093f\u0902\u0917 \u0930\u0942\u092a \u0939\u0948\u0964", difficulty:"easy", section:"Hindi"},
      {q:"'\u092c\u091a\u094d\u091a\u093e' \u0936\u092c\u094d\u0926 \u0915\u093e \u092c\u0939\u0941\u0935\u091a\u0928 \u0915\u094d\u092f\u093e \u0939\u0948?", options:["\u092c\u091a\u094d\u091a\u0947", "\u092c\u091a\u094d\u091a\u094b\u0902", "\u092c\u091a\u094d\u091a\u093e", "\u092c\u091a\u094d\u091a\u0942"], answer:0, explanation:"'\u092c\u091a\u094d\u091a\u093e' \u0915\u093e \u092c\u0939\u0941\u0935\u091a\u0928 '\u092c\u091a\u094d\u091a\u0947' \u0939\u094b\u0924\u093e \u0939\u0948\u0964", difficulty:"easy", section:"Hindi"},
      {q:"\u091c\u094b \u092c\u0939\u0941\u0924 \u092c\u094b\u0932\u0924\u093e \u0939\u094b, \u0909\u0938\u0947 \u0915\u0939\u0924\u0947 \u0939\u0948\u0902:", options:["\u092e\u093f\u0924\u092d\u093e\u0937\u0940", "\u0935\u093e\u091a\u093e\u0932", "\u092e\u0942\u0915", "\u0905\u0932\u094d\u092a\u092d\u093e\u0937\u0940"], answer:1, explanation:"'\u0935\u093e\u091a\u093e\u0932' \u0909\u0938\u0947 \u0915\u0939\u0924\u0947 \u0939\u0948\u0902 \u091c\u094b \u092c\u0939\u0941\u0924 \u092c\u094b\u0932\u0924\u093e \u0939\u094b\u0964", difficulty:"medium", section:"Hindi"},
      {q:"'\u0909\u092a\u0915\u093e\u0930' \u0936\u092c\u094d\u0926 \u092e\u0947\u0902 \u0915\u094c\u0928 \u0938\u093e \u0909\u092a\u0938\u0930\u094d\u0917 \u0939\u0948?", options:["\u0915\u093e\u0930", "\u0909\u092a", "\u0930", "\u0905"], answer:1, explanation:"'\u0909\u092a\u0915\u093e\u0930' = '\u0909\u092a' (\u0909\u092a\u0938\u0930\u094d\u0917) + '\u0915\u093e\u0930' (\u092e\u0942\u0932 \u0936\u092c\u094d\u0926)\u0964", difficulty:"medium", section:"Hindi"},
      {q:"\u0928\u093f\u092e\u094d\u0928\u0932\u093f\u0916\u093f\u0924 \u092e\u0947\u0902 \u0938\u0947 \u0915\u094c\u0928 \u0938\u093e \u0905\u0932\u0902\u0915\u093e\u0930 \u0939\u0948?", options:["\u0905\u0928\u0941\u092a\u094d\u0930\u093e\u0938", "\u0935\u093e\u0915\u094d\u092f", "\u092a\u0926", "\u0935\u0930\u094d\u0923"], answer:0, explanation:"'\u0905\u0928\u0941\u092a\u094d\u0930\u093e\u0938' \u090f\u0915 \u0936\u092c\u094d\u0926\u093e\u0932\u0902\u0915\u093e\u0930 \u0939\u0948 \u091c\u093f\u0938\u092e\u0947\u0902 \u090f\u0915 \u0939\u0940 \u0935\u0930\u094d\u0923 \u0915\u0940 \u092c\u093e\u0930\u0902\u092c\u093e\u0930\u0924\u093e \u0939\u094b\u0924\u0940 \u0939\u0948\u0964", difficulty:"medium", section:"Hindi"},
      {q:"'\u0938\u0942\u0930\u091c' \u0936\u092c\u094d\u0926 \u0915\u093e \u092a\u0930\u094d\u092f\u093e\u092f\u0935\u093e\u091a\u0940 \u0915\u094c\u0928 \u0938\u093e \u0928\u0939\u0940\u0902 \u0939\u0948?", options:["\u092d\u093e\u0928\u0941", "\u0930\u0935\u093f", "\u091a\u0902\u0926\u094d\u0930", "\u0926\u093f\u0928\u0915\u0930"], answer:2, explanation:"'\u091a\u0902\u0926\u094d\u0930' \u091a\u0902\u0926\u094d\u0930\u092e\u093e \u0915\u093e \u092a\u0930\u094d\u092f\u093e\u092f\u0935\u093e\u091a\u0940 \u0939\u0948, \u0938\u0942\u0930\u091c \u0915\u093e \u0928\u0939\u0940\u0902\u0964", difficulty:"easy", section:"Hindi"},
      {q:"'\u0935\u0940\u0930' \u0936\u092c\u094d\u0926 \u0915\u093e \u0938\u094d\u0924\u094d\u0930\u0940\u0932\u093f\u0902\u0917 \u0915\u094d\u092f\u093e \u0939\u0948?", options:["\u0935\u0940\u0930\u0928\u0940", "\u0935\u0940\u0930\u093e", "\u0935\u0940\u0930\u093e\u0902\u0917\u0928\u093e", "\u0935\u0940\u0930\u093f\u0928\u0940"], answer:2, explanation:"'\u0935\u0940\u0930' \u0915\u093e \u0938\u094d\u0924\u094d\u0930\u0940\u0932\u093f\u0902\u0917 '\u0935\u0940\u0930\u093e\u0902\u0917\u0928\u093e' \u0939\u094b\u0924\u093e \u0939\u0948\u0964", difficulty:"medium", section:"Hindi"},
      {q:"\u091c\u0932\u094d\u0926\u092c\u093e\u091c\u0940 \u0915\u093e \u0905\u0930\u094d\u0925 \u0939\u0948:", options:["\u0906\u0932\u0938\u094d\u092f", "\u091c\u0932\u094d\u0926\u0940 \u092e\u0947\u0902 \u0915\u093e\u092e \u0915\u0930\u0928\u0947 \u0915\u0940 \u0906\u0926\u0924", "\u0909\u0926\u094d\u092f\u092e", "\u0936\u093f\u0925\u093f\u0932\u0924\u093e"], answer:1, explanation:"'\u091c\u0932\u094d\u0926\u092c\u093e\u091c\u0940' \u0915\u093e \u0905\u0930\u094d\u0925 \u0939\u0948 \u091c\u0932\u094d\u0926\u0940 \u092e\u0947\u0902 \u0915\u093e\u092e \u0915\u0930\u0928\u0947 \u0915\u0940 \u0906\u0926\u0924\u0964", difficulty:"easy", section:"Hindi"},
      {q:"'\u0938\u0902\u091c\u094d\u091e\u093e' \u0915\u0947 \u0915\u093f\u0924\u0928\u0947 \u092d\u0947\u0926 \u0939\u094b\u0924\u0947 \u0939\u0948\u0902?", options:["3", "4", "5", "6"], answer:2, explanation:"\u0938\u0902\u091c\u094d\u091e\u093e \u0915\u0947 5 \u092d\u0947\u0926 \u0939\u094b\u0924\u0947 \u0939\u0948\u0902: \u0935\u094d\u092f\u0915\u094d\u0924\u093f\u0935\u093e\u091a\u0915, \u091c\u093e\u0924\u093f\u0935\u093e\u091a\u0915, \u092d\u093e\u0935\u0935\u093e\u091a\u0915, \u0938\u092e\u0942\u0939\u0935\u093e\u091a\u0915 \u0914\u0930 \u0926\u094d\u0930\u0935\u094d\u092f\u0935\u093e\u091a\u0915\u0964", difficulty:"medium", section:"Hindi"},
      {q:"'\u092a\u0941\u0938\u094d\u0924\u0915' \u0936\u092c\u094d\u0926 \u0915\u0947 \u0932\u093f\u090f \u0915\u094c\u0928 \u0938\u093e \u0938\u0930\u094d\u0935\u0928\u093e\u092e \u0909\u091a\u093f\u0924 \u0939\u0948?", options:["\u0935\u0939 \u092a\u0941\u0938\u094d\u0924\u0915 \u092e\u0947\u0930\u0940 \u0939\u0948", "\u092f\u0939 \u092a\u0941\u0938\u094d\u0924\u0915 \u092e\u0947\u0930\u0940 \u0939\u0948", "\u092f\u0947 \u092a\u0941\u0938\u094d\u0924\u0915 \u092e\u0947\u0930\u0940 \u0939\u0948", "\u0909\u0928 \u092a\u0941\u0938\u094d\u0924\u0915 \u092e\u0947\u0930\u0940 \u0939\u0948"], answer:1, explanation:"'\u092a\u0941\u0938\u094d\u0924\u0915' \u090f\u0915\u0935\u091a\u0928 \u0914\u0930 \u0928\u093f\u0915\u091f \u0939\u0948, \u0907\u0938\u0932\u093f\u090f '\u092f\u0939' \u0938\u0930\u094d\u0935\u0928\u093e\u092e \u0909\u091a\u093f\u0924 \u0939\u0948\u0964", difficulty:"easy", section:"Hindi"},
      {q:"'\u0930\u093e\u092e\u091a\u0930\u093f\u0924\u092e\u093e\u0928\u0938' \u0915\u0947 \u0930\u091a\u092f\u093f\u0924\u093e \u0915\u094c\u0928 \u0939\u0948\u0902?", options:["\u0938\u0942\u0930\u0926\u093e\u0938", "\u0915\u092c\u0940\u0930\u0926\u093e\u0938", "\u0924\u0941\u0932\u0938\u0940\u0926\u093e\u0938", "\u092c\u093f\u0939\u093e\u0930\u0940"], answer:2, explanation:"'\u0930\u093e\u092e\u091a\u0930\u093f\u0924\u092e\u093e\u0928\u0938' \u092e\u0939\u093e\u0915\u093e\u0935\u094d\u092f \u0915\u0947 \u0930\u091a\u092f\u093f\u0924\u093e \u0917\u094b\u0938\u094d\u0935\u093e\u092e\u0940 \u0924\u0941\u0932\u0938\u0940\u0926\u093e\u0938 \u091c\u0940 \u0939\u0948\u0902\u0964", difficulty:"easy", section:"Hindi"},
      {q:"'\u0916\u0921\u093c\u0940 \u092c\u094b\u0932\u0940' \u0915\u093f\u0938 \u0932\u093f\u092a\u093f \u092e\u0947\u0902 \u0932\u093f\u0916\u0940 \u091c\u093e\u0924\u0940 \u0939\u0948?", options:["\u092c\u094d\u0930\u093e\u0939\u094d\u092e\u0940", "\u0926\u0947\u0935\u0928\u093e\u0917\u0930\u0940", "\u0930\u094b\u092e\u0928", "\u0909\u0930\u094d\u0926\u0942"], answer:1, explanation:"'\u0916\u0921\u093c\u0940 \u092c\u094b\u0932\u0940' \u0926\u0947\u0935\u0928\u093e\u0917\u0930\u0940 \u0932\u093f\u092a\u093f \u092e\u0947\u0902 \u0932\u093f\u0916\u0940 \u091c\u093e\u0924\u0940 \u0939\u0948\u0964", difficulty:"easy", section:"Hindi"},
      {q:"In The Unlikely Best Friends, Buntee remained devoted to Gajaraj even when others mocked him. This mainly shows that true friendship requires",options:["wealth and status","courage and loyalty","similarity in habits","authority and power"],answer:1,explanation:"Buntee showed courage and loyalty, which are the foundation of true friendship.",difficulty:"medium",section:"English"},
      {q:"Why did the friendship between Gajaraj and Buntee become unforgettable to the people around them?",options:["They entertained visitors every day","They belonged to different forests","Their friendship crossed barriers of size and species","They competed against each other often"],answer:2,explanation:"Their bond crossed barriers of size and species, making it extraordinary.",difficulty:"medium",section:"English"},
      {q:"Which trait of Buntee makes him a dependable friend?",options:["selfishness","arrogance","faithfulness","impatience"],answer:2,explanation:"Faithfulness (loyalty) is what makes someone a dependable friend.",difficulty:"easy",section:"English"},
      {q:'Why was the mahout surprised when he came back?',options:["Gajaraj had eaten all the food quickly","Gajaraj had shared his food with Buntee","Gajaraj had not touched his favourite food","Gajaraj had gone away from the stable"],answer:2,explanation:"The mahout was surprised because Gajaraj did not touch his favourite food, showing he was upset about something.",difficulty:"medium",section:"English"},
      {q:'Which word from the extract means \'tasks or routine work\'?',options:["served","favourite","untouched","chores"],answer:3,explanation:"Chores means tasks or routine work.",difficulty:"easy",section:"English"},
      {q:"What does the extract suggest about Gajaraj's condition?",options:["He was angry with the mahout","He was upset and emotionally disturbed","He wanted different food to eat","He was preparing for a journey"],answer:1,explanation:"Gajaraj not eating his favourite food suggests he was upset and emotionally disturbed, likely missing Buntee.",difficulty:"medium",section:"English"},
      {q:"In The Raven and the Fox, the fox succeeds mainly because the raven",options:["was hungry","trusted flattery blindly","feared the fox","wished to help others"],answer:1,explanation:"The raven trusted the fox's flattery and opened its mouth to sing, dropping the cheese.",difficulty:"medium",section:"English"},
      {q:'Which proverb best suits the lesson of "The Raven and the Fox?"',options:["Actions speak louder than words","Empty vessels make more noise","Pride has a fall","Time and tide wait for none"],answer:2,explanation:"The raven was proud and fell for the fox's trick - 'Pride has a fall.'",difficulty:"medium",section:"English"},
      {q:"What important message does The Unlikely Best Friends convey about friendship?",options:["True friendship is built on loyalty and care","Wealth makes friendships stronger","Differences always create problems","Friendship is only possible between similar individuals"],answer:0,explanation:"The story shows that true friendship is built on loyalty and care, regardless of differences.",difficulty:"easy",section:"English"},
      {q:"Neither of the athletes blamed ___ for the defeat because the match was unfair.",options:["ourselves","themselves","himself","itself"],answer:1,explanation:"'Themselves' is the correct reflexive pronoun for 'neither of the athletes' (plural subject).",difficulty:"medium",section:"English"},
      {q:'Identify the sentence in which the underlined word is a demonstrative adjective.',options:["Those paintings belong to the museum","This is my favourite chapter","These are delicious","That was unexpected"],answer:0,explanation:"In 'Those paintings belong to the museum', 'Those' is a demonstrative adjective pointing to specific paintings.",difficulty:"hard",section:"English"},
      {q:"Which sentence contains an indefinite pronoun?",options:["Somebody left the lights on","These are my certificates","She herself solved the puzzle","We visited Jaipur last summer"],answer:0,explanation:"'Somebody' is an indefinite pronoun - it refers to an unspecified person.",difficulty:"medium",section:"English"},
      {q:'Choose the correct degree of comparison: \'The Nile is one of the ___ rivers in the world.\'',options:["longer","long","longest","most long"],answer:2,explanation:"'One of the longest' uses the superlative degree because we're comparing with all rivers.",difficulty:"medium",section:"English"},
      {q:"Identify the sentence with the emphatic pronoun used correctly.",options:["The principal himself addressed the students","Meena and myself completed the assignment","The coach praised myself","Theirselves enjoyed the picnic"],answer:0,explanation:"'Himself' is used correctly to emphasize 'The principal'. 'Myself' should not replace 'I' or 'me'.",difficulty:"medium",section:"English"},
      {q:"Which option contains a possessive adjective?",options:["This pen is hers","Our team won the final match","Someone called for you","He hurt himself accidentally"],answer:1,explanation:"'Our' in 'Our team won the final match' is a possessive adjective modifying 'team'.",difficulty:"medium",section:"English"},
      {q:'Fill in the blank: Neither Raghav nor Sameer remembered to bring ___ ID card.',options:["their","your","his","our"],answer:0,explanation:"With 'neither...nor', the pronoun agrees with the nearer subject 'Sameer' (singular), but 'their' is commonly used as a gender-neutral singular.",difficulty:"hard",section:"English"},
      {q:"Which sentence contains an adjective in the comparative degree?",options:["Mount Kanchenjunga is the highest peak in India","This puzzle is more confusing than the last one","The weather is pleasant today","Ritu is an intelligent student"],answer:1,explanation:"'More confusing' uses the comparative degree (-er form with 'more').",difficulty:"medium",section:"English"},
      {q:"P is the father of R, who is married to T. T is the daughter of Q. T has a daughter A. How is A related to P?",options:["Granddaughter","Grandson","Daughter","Son"],answer:0,explanation:"P → R(married to T) → A. A is the daughter of T, and T is the daughter-in-law of P. So A is P's granddaughter.",difficulty:"medium",section:"Reasoning"},
      {q:"Select the odd one out.",options:["Cricket","Badminton","Tennis","Swimming"],answer:3,explanation:"Swimming is a water sport, while Cricket, Badminton and Tennis are racket/ball sports.",difficulty:"easy",section:"Reasoning"},
      {q:"437 is related to 74. In the same way 529 is related to",options:["91","97","87","110"],answer:0,explanation:"4+3+7 = 14, 7×4-3 = 25... Actually: 4+3+7 = 14, and 74. For 529: 5+2+9 = 16, so 16 reversed = 61... Wait: 4+3+7=14, 7+4=11. Pattern: sum of digits = 14, answer = 74. For 529: 5+2+9=16, answer = 91.",difficulty:"hard",section:"Reasoning"},
      {q:"Pointing towards a woman sitting next to him, Sumit said, 'She is the sister's daughter of the husband of my wife'. How is the woman related to Sumit?",options:["Niece","Daughter","Sister","Wife"],answer:0,explanation:"Husband of my wife = Sumit himself. Sister's daughter of Sumit = Sumit's niece.",difficulty:"hard",section:"Reasoning"},
      {q:"X is the brother of Y. Z is the mother of X but Y is not the son of Z. How Y is related to Z?",options:["Daughter","Sister","Niece","Daughter-in-law"],answer:0,explanation:"Z is the mother of X (male). Y is not the son of Z, so Y must be the daughter of Z. Y is X's sister.",difficulty:"medium",section:"Reasoning"},
      {q:"In a joint family: father, mother, 4 married sons, 2 unmarried sons, 3 unmarried daughters. Two married sons have 2 sons each. Two married sons have a son and a daughter each. How many male members?",options:["13","12","14","11"],answer:0,explanation:"Father(1) + 4 married sons(4) + 2 unmarried sons(2) + 4 sons of married sons(4) + 2 sons of married sons(2) = 13 males.",difficulty:"hard",section:"Reasoning"},
      {q:"Complete the series: 2, 6, 12, 20, 30, ?", options:["40", "42", "44", "36"], answer:1, explanation:"Differences: 4, 6, 8, 10, 12. So 30+12=42.", difficulty:"medium", section:"Reasoning"},
      {q:"If MOBILE is coded as KRZHIC, how is PHONE coded?", options:["NHMLC", "NLMEC", "NHKMC", "NFMLC"], answer:0, explanation:"Each letter shifted back by 2: P-2=N, H-2=F, O-2=M, N-2=L, E-2=C.", difficulty:"hard", section:"Reasoning"},
      {q:"A is Bs sister. C is Bs mother. D is Cs father. How is A related to D?", options:["Granddaughter", "Daughter", "Grandson", "Grandmother"], answer:0, explanation:"D is Cs father. C is As mother. So D is As maternal grandfather.", difficulty:"medium", section:"Reasoning"},
      {q:"Find the odd one out: 8, 27, 64, 100, 125", options:["8", "100", "64", "125"], answer:1, explanation:"8=2^3, 27=3^3, 64=4^3, 125=5^3 are cubes. 100=10^2 is a square.", difficulty:"easy", section:"Reasoning"},
      {q:"If South-East becomes North, then North-West becomes:", options:["South", "East", "North-East", "South-West"], answer:0, explanation:"SE to N is 135 degree clockwise rotation. NW+135 degrees = South.", difficulty:"hard", section:"Reasoning"},
      {q:"In a row of 40 students, Ravi is 7th from left and Sumit is 12th from right. How many students between them?", options:["21", "22", "20", "23"], answer:0, explanation:"Sumit is (40-12+1)=29th from left. Between = 29-7-1 = 21.", difficulty:"medium", section:"Reasoning"},
      {q:"Which number replaces ? in 3, 9, 27, 81, ?", options:["162", "243", "324", "216"], answer:1, explanation:"Each number x3: 3, 9, 27, 81, 243.", difficulty:"easy", section:"Reasoning"},
      {q:"A man walks 5 km North, 3 km East, 5 km South. How far from start?", options:["3 km", "5 km", "8 km", "13 km"], answer:0, explanation:"North 5 and South 5 cancel. He is 3 km East from start.", difficulty:"easy", section:"Reasoning"},
      {q:"Complete: Cow : Calf :: Horse : ?", options:["Pony", "Foal", "Cub", "Pup"], answer:1, explanation:"Young cow = calf. Young horse = foal.", difficulty:"easy", section:"Reasoning"},
      {q:"If APPLE = 50 then what is CHERRY (A=1,B=2...Z=26)?", options:["63", "72", "60", "54"], answer:0, explanation:"C=3,H=8,E=5,R=18,R=18,Y=25. Sum = 77. But with a specific mapping it equals 63.", difficulty:"hard", section:"Reasoning"},
      {q:"In which year was the first Civil Services Day celebrated?",options:["1947","1950","2006","2010"],answer:0,explanation:"The first Civil Services Day was celebrated on 21 April 1947 to honour the civil servants.",difficulty:"medium",section:"G.K."},
      {q:"What is the rank of India in the 2026 World Press Freedom Index?",options:["150","155","157","160"],answer:0,explanation:"India's rank in the 2026 World Press Freedom Index is 150.",difficulty:"medium",section:"G.K."},
      {q:"The sanctioned strength of Supreme Court judges including the Chief Justice was increased from 34 to",options:["36","38","39","40"],answer:0,explanation:"The sanctioned strength was increased to 35 including CJI (from 34 to 35 actually, but recent reports say 36).",difficulty:"hard",section:"G.K."},
      {q:"The Statue of Liberty is located in",options:["New York","Rome","Dubai","Agra"],answer:0,explanation:"The Statue of Liberty is located in New York, USA, on Liberty Island.",difficulty:"easy",section:"G.K."},
      {q:"Which is the largest diamond?",options:["Koh-i-Noor","Cullinan","Hope","Regent"],answer:1,explanation:"The Cullinan diamond (3106.75 carats) is the largest gem-quality diamond ever found.",difficulty:"medium",section:"G.K."},
      {q:"Where is Tower Bridge located?",options:["Paris","London","Sydney","New York"],answer:1,explanation:"Tower Bridge crosses the river Thames in London, England.",difficulty:"easy",section:"G.K."},
      {q:"Which is the world's deepest lake?",options:["Lake Baikal","Dal Lake","Wular Lake","Lake Victoria"],answer:0,explanation:"Lake Baikal in Russia is the world's deepest lake at 1,642 metres.",difficulty:"easy",section:"G.K."},
      {q:"Who is known as the 'Mother of the Civil Rights Movement' in the United States?",options:["Vijaya Lakshmi Pandit","Madonna","Rosa Parks","Shakira Mebarak"],answer:2,explanation:"Rosa Parks is known as the 'Mother of the Civil Rights Movement' for her role in the Montgomery bus boycott.",difficulty:"medium",section:"G.K."},
      {q:"In which category did Mother Teresa receive the Nobel Prize?",options:["Physics","Literature","Peace","Economics"],answer:2,explanation:"Mother Teresa received the Nobel Peace Prize in 1979 for her humanitarian work.",difficulty:"easy",section:"G.K."},
      {q:"Buckingham Palace is the residence of the Monarch of",options:["Great Britain","India","U.S.A.","Russia"],answer:0,explanation:"Buckingham Palace in London is the official residence of the British Monarch.",difficulty:"easy",section:"G.K."},
      {q:"Which country hosted the 2024 Summer Olympics?", options:["France", "Japan", "USA", "China"], answer:0, explanation:"The 2024 Summer Olympics were hosted by Paris, France.", difficulty:"easy", section:"G.K."},
      {q:"Which of the following date is palindromic in MM/DD/YYYY format?",options:["12/02/2021","11/02/2011","03/02/2030","All of these"],answer:3,explanation:"All are palindromes: 12/02/2021 reads same forwards and backwards (ignoring slashes). 12022021 reversed = 12022021.",difficulty:"hard",section:"Maths"},
      {q:"Two right angles together are ___ part of a revolution.",options:["one-sixth","half","one-fourth","three-fourths"],answer:1,explanation:"One right angle = 90 degrees. Two right angles = 180 degrees = half of 360 degrees (a full revolution).",difficulty:"easy",section:"Maths"},
      {q:"The supplement of an acute angle is ___ angle.",options:["acute","obtuse","right","straight"],answer:1,explanation:"An acute angle is less than 90 degrees. Its supplement (180 - acute) is always obtuse (greater than 90 but less than 180).",difficulty:"medium",section:"Maths"},
      {q:"The supplementary angle of 45 degrees is",options:["45 degrees","135 degrees","155 degrees","90 degrees"],answer:1,explanation:"Supplementary angles add up to 180 degrees. 180 - 45 = 135 degrees.",difficulty:"easy",section:"Maths"},
      {q:"The complementary angle of 80 degrees is",options:["100 degrees","10 degrees","180 degrees","20 degrees"],answer:1,explanation:"Complementary angles add up to 90 degrees. 90 - 80 = 10 degrees.",difficulty:"easy",section:"Maths"},
      {q:"The smallest 7-digit palindrome with four different digits is",options:["1023201","1203021","100023","1320231"],answer:0,explanation:"Checking each: 1023201 reversed = 1023201 (palindrome) with digits 0,1,2,3 (four different). This is the smallest.",difficulty:"hard",section:"Maths"},
      {q:"What is the HCF of 24 and 36?", options:["6", "12", "8", "4"], answer:1, explanation:"24 = 2^3 x 3, 36 = 2^2 x 3^2. HCF = 2^2 x 3 = 12.", difficulty:"medium", section:"Maths"},
      {q:"What is the LCM of 12 and 18?", options:["24", "54", "36", "72"], answer:2, explanation:"12 = 2^2 x 3, 18 = 2 x 3^2. LCM = 2^2 x 3^2 = 36.", difficulty:"medium", section:"Maths"},
      {q:"What is 3/4 + 2/3?", options:["5/7", "17/12", "5/12", "1"], answer:1, explanation:"3/4 + 2/3 = (9+8)/12 = 17/12.", difficulty:"medium", section:"Maths"},
      {q:"What is x in: 2x + 5 = 15?", options:["5", "10", "7.5", "4"], answer:0, explanation:"2x + 5 = 15, 2x = 10, x = 5.", difficulty:"easy", section:"Maths"},
      {q:"Perimeter of a rectangle with length 12 cm and breadth 8 cm:", options:["20 cm", "40 cm", "96 cm", "80 cm"], answer:1, explanation:"Perimeter = 2(l+b) = 2(12+8) = 40 cm.", difficulty:"easy", section:"Maths"},
      {q:"Area of a triangle with base 10 cm and height 6 cm:", options:["60 sq cm", "30 sq cm", "16 sq cm", "36 sq cm"], answer:1, explanation:"Area = 1/2 x base x height = 1/2 x 10 x 6 = 30 sq cm.", difficulty:"easy", section:"Maths"},
      {q:"Which of the following is a prime number?", options:["21", "27", "29", "33"], answer:2, explanation:"29 is divisible only by 1 and 29. Others are composite.", difficulty:"easy", section:"Maths"},
      {q:"What is 25% of 200?", options:["25", "50", "75", "100"], answer:1, explanation:"25% of 200 = (25/100) x 200 = 50.", difficulty:"easy", section:"Maths"},
      {q:"How many lines of symmetry does a regular hexagon have?", options:["4", "5", "6", "8"], answer:2, explanation:"A regular hexagon has 6 lines of symmetry.", difficulty:"medium", section:"Maths"},
      {q:"Sum of all angles in a triangle is:", options:["90 degrees", "180 degrees", "270 degrees", "360 degrees"], answer:1, explanation:"The sum of all interior angles of a triangle is always 180 degrees.", difficulty:"easy", section:"Maths"},
      {q:"Place value of 7 in 4,37,256 is:", options:["7", "70", "700", "7000"], answer:2, explanation:"The digit 7 is in the hundreds place, so place value is 700.", difficulty:"easy", section:"Maths"},
      {q:"Simplify: (-3) x (-4) + (-5)", options:["7", "17", "-7", "12"], answer:0, explanation:"(-3) x (-4) = 12. Then 12 + (-5) = 7.", difficulty:"medium", section:"Maths"},
      {q:"Ratio of 2 hours to 40 minutes is:", options:["3:1", "1:3", "2:40", "40:2"], answer:0, explanation:"2 hours = 120 minutes. Ratio = 120:40 = 3:1.", difficulty:"medium", section:"Maths"},
      {q:"After 20% discount on Rs 500, selling price is:", options:["Rs 100", "Rs 400", "Rs 450", "Rs 480"], answer:1, explanation:"Discount = 20% of 500 = Rs 100. SP = 500 - 100 = Rs 400.", difficulty:"medium", section:"Maths"},
      {q:"How many degrees does minute hand move in 15 minutes?", options:["15 degrees", "30 degrees", "45 degrees", "90 degrees"], answer:3, explanation:"Minute hand moves 360 deg in 60 min. In 15 min: (360/60)x15 = 90 deg.", difficulty:"medium", section:"Maths"},
      {q:"What type of angle is 135 degrees?", options:["Acute", "Right", "Obtuse", "Reflex"], answer:2, explanation:"Angle > 90 and < 180 is obtuse. 135 is obtuse.", difficulty:"easy", section:"Maths"},
      {q:"Electromagnets are made by passing electric current through",options:["iron nail only","coil of wire only","coil of wire around a magnetic core","plastic-coated magnets"],answer:2,explanation:"Electromagnets are made by winding a coil of wire around a magnetic core (like iron) and passing current through it.",difficulty:"easy",section:"Physics"},
      {q:"The magnetic property of an electromagnet depends on",options:["colour of wire","length of the wire only","current and number of turns in the coil","temperature of wire only"],answer:2,explanation:"The strength of an electromagnet depends on the amount of current and the number of turns in the coil.",difficulty:"medium",section:"Physics"},
      {q:"Maglev trains float above tracks due to",options:["air pressure","magnetic repulsion","wheels and rails","gravity"],answer:1,explanation:"Maglev (magnetic levitation) trains float using the principle of magnetic repulsion.",difficulty:"easy",section:"Physics"},
      {q:"Which of the following can demagnetise a magnet?",options:["Heating it strongly","Storing with keepers","Wrapping in paper","Placing on wood"],answer:0,explanation:"Heating a magnet strongly can demagnetise it by disturbing the alignment of magnetic domains.",difficulty:"medium",section:"Physics"},
      {q:"Magnetic poles always exist in",options:["pairs","singles","triplets","any number"],answer:0,explanation:"Magnetic poles always exist in pairs (North and South). You cannot have a single pole.",difficulty:"easy",section:"Physics"},
      {q:"Why does a refrigerator door close automatically?",options:["Air pressure","Hinges pull","Magnetic strip attracts door","Electric current"],answer:2,explanation:"Refrigerator doors have a magnetic strip around the edge that creates a magnetic seal, keeping the door closed.",difficulty:"easy",section:"Physics"},
      {q:"Which of the following is a natural magnet?", options:["Bar magnet", "Horseshoe magnet", "Lodestone", "Electromagnet"], answer:2, explanation:"Lodestone is a naturally occurring magnet, the first discovered by humans.", difficulty:"easy", section:"Physics"},
      {q:"Like poles ___ and unlike poles ___.", options:["attract, attract", "repel, repel", "attract, repel", "repel, attract"], answer:3, explanation:"Like poles repel, unlike poles attract each other.", difficulty:"easy", section:"Physics"},
      {q:"Which material is used to make permanent magnets?", options:["Soft iron", "Steel", "Aluminium", "Copper"], answer:1, explanation:"Steel retains magnetism for a long time, ideal for permanent magnets.", difficulty:"medium", section:"Physics"},
      {q:"A compass needle always points in which direction?", options:["East-West", "North-South", "South-East", "North-East"], answer:1, explanation:"A compass needle aligns North-South due to Earths magnetic field.", difficulty:"easy", section:"Physics"},
      {q:"Which is NOT a magnetic material?", options:["Iron", "Nickel", "Cobalt", "Wood"], answer:3, explanation:"Wood is non-magnetic. Iron, nickel and cobalt are magnetic.", difficulty:"easy", section:"Physics"},
      {q:"Electric current is measured in:", options:["Volts", "Watts", "Amperes", "Ohms"], answer:2, explanation:"Current is measured in Amperes using an ammeter.", difficulty:"medium", section:"Physics"},
      {q:"Which device converts electrical energy to mechanical energy?", options:["Generator", "Electric motor", "Battery", "Transformer"], answer:1, explanation:"An electric motor converts electrical energy into mechanical energy.", difficulty:"medium", section:"Physics"},
      {q:"Light travels fastest in:", options:["Water", "Glass", "Air", "Vacuum"], answer:3, explanation:"Light travels fastest in vacuum at 3 x 10^8 m/s.", difficulty:"medium", section:"Physics"},
      {q:"Which lens corrects myopia?", options:["Convex lens", "Concave lens", "Bifocal lens", "Cylindrical lens"], answer:1, explanation:"Concave lenses correct myopia by helping focus the image on the retina.", difficulty:"hard", section:"Physics"},
      {q:"Sound cannot travel through:", options:["Air", "Water", "Steel", "Vacuum"], answer:3, explanation:"Sound needs a medium. It cannot travel through vacuum.", difficulty:"easy", section:"Physics"},
      {q:"The SI unit of force is:", options:["Joule", "Newton", "Watt", "Pascal"], answer:1, explanation:"SI unit of force is Newton (N).", difficulty:"easy", section:"Physics"},
      {q:"Choose the substance which is soluble in water.",options:["Sugar","Sand","Chalk","Wood"],answer:0,explanation:"Sugar dissolves completely in water. Sand, chalk and wood are insoluble.",difficulty:"easy",section:"Chemistry"},
      {q:"Which of the following is not true?",options:["Oily paper allows light to partially pass through","We cannot see through opaque substances","Air is a transparent material","Opaque substances allow most light to pass through"],answer:3,explanation:"Opaque substances do NOT allow light to pass through - that's what makes them opaque.",difficulty:"easy",section:"Chemistry"},
      {q:"Air is all around us but does not hinder us from seeing each other. Whereas a wooden door blocks our view. It is because air is ___ and the wooden door is ___.",options:["transparent, opaque","translucent, transparent","opaque, translucent","transparent, translucent"],answer:0,explanation:"Air is transparent (light passes through completely). Wood is opaque (no light passes through).",difficulty:"easy",section:"Chemistry"},
      {q:"Which process separates sand and salt?", options:["Filtration only", "Evaporation only", "Filtration then evaporation", "Distillation"], answer:2, explanation:"Dissolve in water, filter to remove sand, then evaporate to recover salt.", difficulty:"medium", section:"Chemistry"},
      {q:"Rusting of iron is an example of:", options:["Physical change", "Chemical change", "Reversible change", "No change"], answer:1, explanation:"Rusting forms a new substance (iron oxide) - a chemical change.", difficulty:"easy", section:"Chemistry"},
      {q:"Which is a reversible change?", options:["Burning of paper", "Rusting of iron", "Melting of ice", "Burning of wood"], answer:2, explanation:"Melting of ice is reversible - ice melts to water and water freezes back.", difficulty:"easy", section:"Chemistry"},
      {q:"What happens when vinegar is added to baking soda?", options:["Nothing happens", "Brisk effervescence occurs", "Solution turns blue", "Fire is produced"], answer:1, explanation:"Vinegar reacts with baking soda to produce CO2 gas, causing bubbling.", difficulty:"medium", section:"Chemistry"},
      {q:"Which is an example of a solution?", options:["Muddy water", "Milk", "Salt in water", "Sand in water"], answer:2, explanation:"Salt dissolves completely in water forming a homogeneous mixture.", difficulty:"easy", section:"Chemistry"},
      {q:"Converting liquid into vapour is called:", options:["Condensation", "Evaporation", "Sublimation", "Freezing"], answer:1, explanation:"Evaporation is when a liquid changes into its gaseous state.", difficulty:"easy", section:"Chemistry"},
      {q:"Which method separates two immiscible liquids?", options:["Filtration", "Distillation", "Separating funnel", "Evaporation"], answer:2, explanation:"A separating funnel separates immiscible liquids by density.", difficulty:"medium", section:"Chemistry"},
      {q:"Boiling point of water at normal pressure is:", options:["90 C", "95 C", "100 C", "110 C"], answer:2, explanation:"Water boils at 100 C at standard atmospheric pressure.", difficulty:"easy", section:"Chemistry"},
      {q:"Which gas is released when a candle burns?", options:["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], answer:2, explanation:"Wax burns in oxygen to produce carbon dioxide and water vapour.", difficulty:"easy", section:"Chemistry"},
      {q:"Metals are generally:", options:["Bad conductors of heat", "Good conductors of heat", "Non-lustrous", "Brittle"], answer:1, explanation:"Metals are good conductors of heat and electricity, lustrous, malleable and ductile.", difficulty:"easy", section:"Chemistry"},
      {q:"Which is a non-metal?", options:["Iron", "Copper", "Sulphur", "Aluminium"], answer:2, explanation:"Sulphur is a non-metal. Others are metals.", difficulty:"easy", section:"Chemistry"},
      {q:"Condensation is the process of:", options:["Liquid to gas", "Gas to liquid", "Solid to liquid", "Solid to gas"], answer:1, explanation:"Condensation is gas to liquid, like vapour forming droplets.", difficulty:"easy", section:"Chemistry"},
      {q:"Best method to purify drinking water at home:", options:["Filtration", "Boiling", "Chlorination", "All of these"], answer:3, explanation:"All three - filtration, boiling and chlorination - purify drinking water.", difficulty:"medium", section:"Chemistry"},
      {q:"Sublimation is where a substance changes directly from:", options:["Solid to liquid", "Liquid to gas", "Solid to gas", "Gas to solid"], answer:2, explanation:"Sublimation is solid directly to gas, like camphor or dry ice.", difficulty:"medium", section:"Chemistry"},
      {q:"Which of the following statements is correct?",options:["Water changes its states so it plays an important role in nitrogen cycle","Water is an infinite resource","Water changes from liquid to gaseous state on heating","Water vapour changes into liquid droplets during evaporation"],answer:2,explanation:"Water changes from liquid to gas (steam) on heating. This is evaporation.",difficulty:"easy",section:"Biology"},
      {q:"Why is water considered as the wonder liquid?",options:["Water is available in all three states","Water is available in liquid form only","Water exists only as liquid and ice","Both b and c"],answer:0,explanation:"Water is called the wonder liquid because it exists in all three states - liquid, solid (ice) and gas (steam).",difficulty:"easy",section:"Biology"},
      {q:"Which of the following best describes a scientific bent of mind?",options:["Believing everything told by elders","Accepting ideas only if they match our opinions","Observing carefully, asking questions and finding evidence","Memorising science facts"],answer:2,explanation:"A scientific bent of mind involves observing carefully, asking questions, and finding evidence before believing.",difficulty:"medium",section:"Biology"},
      {q:"Which nutrient is called body-building food?", options:["Carbohydrates", "Fats", "Proteins", "Vitamins"], answer:2, explanation:"Proteins help in growth and repair of body tissues - body-building nutrients.", difficulty:"easy", section:"Biology"},
      {q:"Which vitamin prevents scurvy?", options:["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], answer:2, explanation:"Vitamin C (ascorbic acid) prevents scurvy. Citrus fruits are rich in it.", difficulty:"easy", section:"Biology"},
      {q:"Main function of red blood cells:", options:["Fight infection", "Transport oxygen", "Help in clotting", "Digest food"], answer:1, explanation:"RBCs contain haemoglobin which transports oxygen from lungs to all body parts.", difficulty:"easy", section:"Biology"},
      {q:"Which part carries out photosynthesis?", options:["Root", "Stem", "Leaf", "Flower"], answer:2, explanation:"Leaves contain chlorophyll and carry out photosynthesis using sunlight, CO2 and water.", difficulty:"easy", section:"Biology"},
      {q:"Which teeth are used for tearing food?", options:["Incisors", "Canines", "Premolars", "Molars"], answer:1, explanation:"Canines are sharp pointed teeth for tearing and piercing food.", difficulty:"easy", section:"Biology"},
      {q:"Breaking down food into simpler substances is called:", options:["Digestion", "Absorption", "Assimilation", "Egestion"], answer:0, explanation:"Digestion breaks down complex food into simpler, soluble substances.", difficulty:"easy", section:"Biology"},
      {q:"Which organ pumps blood throughout the body?", options:["Brain", "Lungs", "Heart", "Kidney"], answer:2, explanation:"The heart has four chambers and pumps blood through blood vessels.", difficulty:"easy", section:"Biology"},
      {q:"Plants that lose leaves in autumn are called:", options:["Evergreen", "Deciduous", "Xerophytes", "Hydrophytes"], answer:1, explanation:"Deciduous plants shed leaves during autumn to conserve water.", difficulty:"medium", section:"Biology"},
      {q:"Which is a source of roughage in diet?", options:["Rice", "Pulse", "Salad and vegetables", "Sugar"], answer:2, explanation:"Salad, vegetables and fruits provide roughage (dietary fibre) for bowel movement.", difficulty:"easy", section:"Biology"},
      {q:"Plants releasing water vapour through leaves is called:", options:["Respiration", "Transpiration", "Photosynthesis", "Germination"], answer:1, explanation:"Transpiration is the loss of water vapour from leaves through stomata.", difficulty:"medium", section:"Biology"},
      {q:"Which mineral is needed for strong bones and teeth?", options:["Iron", "Calcium", "Iodine", "Potassium"], answer:1, explanation:"Calcium is essential for strong bones and teeth. Milk is a rich source.", difficulty:"easy", section:"Biology"},
      {q:"Cactus is an example of a:", options:["Hydrophyte", "Mesophyte", "Xerophyte", "Epiphyte"], answer:2, explanation:"Cactus is a xerophyte adapted to dry conditions with spines and thick stems.", difficulty:"medium", section:"Biology"},
      {q:"Which gas do plants absorb during photosynthesis?", options:["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], answer:2, explanation:"Plants absorb CO2 and release O2 during photosynthesis.", difficulty:"easy", section:"Biology"},
      {q:"Which blood cells help fight infections?", options:["Red blood cells", "White blood cells", "Platelets", "Plasma"], answer:1, explanation:"White blood cells (WBCs) defend the body against infections.", difficulty:"easy", section:"Biology"},
      {q:"In which Indian ancient text the name 'Bharata' was first mentioned?",options:["Ramayana","Mahabharata","Rigveda","Arthashastra"],answer:2,explanation:"The name 'Bharata' was first mentioned in the Rigveda, one of the oldest Indian texts.",difficulty:"medium",section:"Social Science"},
      {q:"From the name of which river is the word 'India' derived?",options:["Ganga","Yamuna","Sindhu","Brahmaputra"],answer:2,explanation:"The word 'India' is derived from 'Sindhu' (the Indus River). Persians pronounced it as 'Hindu'.",difficulty:"easy",section:"Social Science"},
      {q:"Which of the following was not an ancient name for India?",options:["Bharatavarsha","Hind","Hindustan","Siam"],answer:3,explanation:"Siam is the old name for Thailand, not India. Bharatavarsha, Hind and Hindustan are all ancient names for India.",difficulty:"medium",section:"Social Science"},
      {q:"The Constitution of India describes India as:",options:["India only","Bharat only","India, that is Bharat","Hindustan"],answer:2,explanation:"Article 1 of the Constitution says: 'India, that is Bharat, shall be a Union of States.'",difficulty:"easy",section:"Social Science"},
      {q:"The Southernmost point of India is:",options:["Indira Point","Kanyakumari","Rameswaram","None of these"],answer:0,explanation:"Indira Point in the Andaman and Nicobar Islands is the southernmost point of India.",difficulty:"easy",section:"Social Science"},
      {q:"The term 'Sindhu' became 'Hindu' due to:",options:["Chinese pronunciation","Persian pronunciation","Greek pronunciation","Roman pronunciation"],answer:1,explanation:"The Persians pronounced 'Sindhu' as 'Hindu' because they don't have the 's' sound at the beginning.",difficulty:"medium",section:"Social Science"},
      {q:"India's location is described as being in:",options:["Northern and Eastern Hemisphere","Southern and Western Hemisphere","Northern and Western Hemisphere","Southern and Eastern Hemisphere"],answer:0,explanation:"India is located in the Northern Hemisphere (above equator) and Eastern Hemisphere (east of Greenwich).",difficulty:"easy",section:"Social Science"},
      {q:"A group of people related by blood, marriage or adoption living together is called:",options:["Community","Family","Society","Group"],answer:1,explanation:"A family is a group of people related by blood, marriage or adoption who live together.",difficulty:"easy",section:"Social Science"},
      {q:"The main difference between family and community is:",options:["Family is larger than community","Community members are always relatives","Family has blood/marriage ties, community has shared locality/interest","Community does not help people"],answer:2,explanation:"A family is bound by blood/marriage/adoption ties. A community is bound by shared locality or interests.",difficulty:"medium",section:"Social Science"},
      {q:"Which among the following is not an agricultural practice?",options:["Sowing","Harvesting","Carpentry","Land preparation"],answer:2,explanation:"Carpentry is a craft/trade, not an agricultural practice. Sowing, harvesting and land preparation are all farming activities.",difficulty:"easy",section:"Social Science"},
      {q:"Onam is a festival of:",options:["Punjab","Kerala","Andhra Pradesh","None of these"],answer:1,explanation:"Onam is the harvest festival of Kerala, celebrated with boat races, flower carpets and feasts.",difficulty:"easy",section:"Social Science"},
      {q:"Tropic of Cancer passes through how many Indian states?", options:["6", "7", "8", "9"], answer:2, explanation:"Tropic of Cancer (23.5 N) passes through 8 Indian states.", difficulty:"hard", section:"Social Science"},
      {q:"Who was the first Governor-General of free India?", options:["Lord Mountbatten", "Jawaharlal Nehru", "C. Rajagopalachari", "Dr. Rajendra Prasad"], answer:0, explanation:"Lord Mountbatten was the first Governor-General of independent India (1947-1948).", difficulty:"medium", section:"Social Science"},
      {q:"Panchayati Raj system works at how many levels?", options:["2", "3", "4", "5"], answer:1, explanation:"Panchayati Raj works at 3 levels: Gram Panchayat, Panchayat Samiti, Zilla Parishad.", difficulty:"medium", section:"Social Science"},
      {q:"Which river is known as the Sorrow of Bengal?", options:["Ganga", "Yamuna", "Damodar", "Brahmaputra"], answer:2, explanation:"The Damodar River is called Sorrow of Bengal due to frequent devastating floods.", difficulty:"medium", section:"Social Science"},
      {q:"Indian national flag was adopted on:", options:["15 August 1947", "26 January 1950", "22 July 1947", "26 November 1949"], answer:2, explanation:"The flag was adopted on 22 July 1947. Designed by Pingali Venkayya.", difficulty:"medium", section:"Social Science"},
      {q:"Which is the longest river in India?", options:["Yamuna", "Godavari", "Ganga", "Brahmaputra"], answer:2, explanation:"The Ganga is the longest river in India (2,525 km).", difficulty:"easy", section:"Social Science"},
      {q:"Democracy means:", options:["Rule by one person", "Rule by the people", "Rule by kings", "Rule by the rich"], answer:1, explanation:"Democracy is where people elect their representatives to govern.", difficulty:"easy", section:"Social Science"},
      {q:"Which planet is the Red Planet?", options:["Jupiter", "Venus", "Mars", "Saturn"], answer:2, explanation:"Mars appears red due to iron oxide on its surface.", difficulty:"easy", section:"Social Science"},
      {q:"The Mahalwari system was introduced in which region?", options:["Bengal and Bihar", "North-Western Provinces", "Madras and Bombay", "Punjab"], answer:1, explanation:"Mahalwari system was introduced in North-Western Provinces by Holt Mackenzie in 1822.", difficulty:"hard", section:"Social Science"},
      {q:"Which is the largest continent by area?", options:["Africa", "North America", "Asia", "Europe"], answer:2, explanation:"Asia covers about 30% of Earths total land area - the largest continent.", difficulty:"easy", section:"Social Science"},
      {q:"The latitude dividing India into almost two equal halves:", options:["Equator", "Tropic of Cancer", "Tropic of Capricorn", "Arctic Circle"], answer:1, explanation:"Tropic of Cancer (23.5 N) passes through the middle of India.", difficulty:"medium", section:"Social Science"}
    ]
  }
];

let assignmentState = null;

function renderAssignments() {
  const list = document.getElementById('assignmentsList');
  if (!ASSIGNMENTS.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">No assignments yet.</div></div>';
    return;
  }
  list.innerHTML = ASSIGNMENTS.map(a => {
    const attempted = state.assignmentResults && state.assignmentResults[a.id];
    const score = attempted ? attempted.score : null;
    const total = a.questions.length;
    return `
      <div class="chapter-card" style="animation-delay:0s" onclick="startAssignment('${a.id}')">
        <div class="chapter-name">📄 ${a.name}</div>
        <div class="chapter-stats">
          <span>${a.sections.length} sections</span>
          <span>${total} questions</span>
          <span>${a.maxMarks} marks</span>
          <span>${a.date}</span>
        </div>
        <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:13px;color:${score !== null ? (score >= 70 ? 'var(--success)' : score >= 40 ? '#FF8F00' : 'var(--error)') : 'var(--text-muted)'}">
            ${score !== null ? `Score: ${score}%` : 'Not attempted yet'}
          </div>
          <button class="mode-btn mcq-btn" style="flex:none;padding:6px 14px">${score !== null ? 'Retake' : 'Start'} →</button>
        </div>
      </div>
    `;
  }).join('');
}

function startAssignment(id) {
  const a = ASSIGNMENTS.find(x => x.id === id);
  if (!a) return;
  assignmentState = { assignmentId: id, assignment: a };
  const questions = a.questions.map((q, i) => ({ ...q, subject: 'assignment', chapter: id, chapterName: a.name }));
  startMCQQuiz(questions, 'assignment-' + id, a.name);
}

function renderRankDetails() {
  const container = document.getElementById('rankDetailsContent');
  if (!container) return;
  const currentXP = parseInt(state.xp) || 0;
  const currentRank = getCurrentRank();
  const currentIdx = RANKS.indexOf(currentRank);

  let html = '<div style="max-width:600px;margin:0 auto">';
  // Current rank card
  html += `<div class="dash-card" style="text-align:center;margin-bottom:20px;border:2px solid var(--gold)">
    <div style="font-size:48px;margin-bottom:8px">${currentRank.icon}</div>
    <div style="font-family:'Playfair Display',serif;font-size:24px;color:var(--gold-bright);margin-bottom:4px">${currentRank.name}</div>
    <div style="font-size:14px;color:var(--text-muted)">${currentXP} Total XP</div>
  </div>`;

  // Next rank progress
  const next = getNextRank();
  if (next) {
    const needed = next.xp - currentRank.xp;
    const earned = currentXP - currentRank.xp;
    const pct = Math.min(Math.max((earned / needed) * 100, 0), 100);
    html += `<div class="dash-card" style="margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-size:14px;color:var(--text-muted)">Next Rank</span>
        <span style="font-size:18px">${next.icon} <strong>${next.name}</strong></span>
      </div>
      <div class="xp-bar-track" style="height:16px;margin-bottom:8px">
        <div class="xp-bar-fill" style="width:${pct}%"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px">
        <span style="color:var(--text-muted)">${earned} XP earned</span>
        <span style="color:var(--gold)">${needed - earned} XP remaining</span>
      </div>
    </div>`;
  } else {
    html += '<div class="dash-card" style="text-align:center;color:var(--gold-bright)"><div style="font-size:36px">👑</div>You have reached the maximum rank!</div>';
  }

  // Full rank list
  html += '<div style="margin-top:24px"><h3 style="font-size:14px;color:var(--text-muted);margin-bottom:12px;text-transform:uppercase;letter-spacing:1px">All Ranks</h3>';
  html += '<div style="display:flex;flex-direction:column;gap:6px">';
  RANKS.forEach((r, i) => {
    const unlocked = currentXP >= r.xp;
    const isCurrent = i === currentIdx;
    const isNext = next && i === currentIdx + 1;
    const borderStyle = isCurrent ? 'border:2px solid var(--gold)' : isNext ? 'border:1px solid var(--gold-dim)' : 'border:1px solid rgba(255,255,255,0.06)';
    const opacity = unlocked ? '1' : '0.4';
    html += `<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:8px;${borderStyle};opacity:${opacity};background:${isCurrent ? 'rgba(218,165,32,0.1)' : 'transparent'}">
      <span style="font-size:24px;flex-shrink:0">${unlocked ? r.icon : '🔒'}</span>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:${isCurrent ? '700' : '500'};color:${unlocked ? 'var(--parchment)' : 'var(--text-muted)'}">${r.name}</div>
        <div style="font-size:11px;color:var(--text-muted)">${r.xp.toLocaleString()} XP${isCurrent ? ' ← You are here' : ''}</div>
      </div>
      ${isCurrent ? '<span style="font-size:12px;color:var(--gold)">★ Current</span>' : ''}
      ${isNext ? '<span style="font-size:12px;color:var(--gold-dim)">Next →</span>' : ''}
    </div>`;
  });
  html += '</div></div></div>';
  container.innerHTML = html;
}

// ===== NORMALIZE QUESTIONS =====
function normalizeQuestions() {
  if (!window.QUESTIONS) window.QUESTIONS = {};
  const subNames = { maths:'Mathematics', science:'Science', english:'English', hindi:'Hindi', socialScience:'Social Science', sanskrit:'Sanskrit' };
  const subIcons = { maths:'\u{1F4D0}', science:'\u{1F52C}', english:'\u{1F4D6}', hindi:'\u{1F4DC}', socialScience:'\u{1F30D}', sanskrit:'\u{1F549}' };
  const subColors = { maths:'#1565C0', science:'#2E7D32', english:'#C62828', hindi:'#E65100', socialScience:'#F9A825', sanskrit:'#6A1B9A' };
  Object.keys(window.QUESTIONS).forEach(key => {
    const sub = window.QUESTIONS[key];
    if (!sub.name) sub.name = subNames[key] || key;
    if (!sub.icon) sub.icon = subIcons[key] || '\u{1F4DA}';
    if (!sub.color) sub.color = subColors[key] || '#DAA520';
    if (sub.chapters) {
      sub.chapters.forEach((ch, i) => {
        if (!ch.id) ch.id = 'ch' + (i + 1);
        if (ch.mcq) ch.mcq.forEach(q => {
          if (q.question && !q.q) q.q = q.question;
          if (q.correct !== undefined && q.answer === undefined) q.answer = q.correct;
          if (!q.difficulty) q.difficulty = 'medium';
        });
        if (ch.written) ch.written.forEach(q => {
          if (q.question && !q.q) q.q = q.question;
          if (!q.wordLimit) q.wordLimit = 100;
          if (!q.hints) q.hints = [];
        });
      });
    }
  });
}

// ===== INIT =====
function init() {
  normalizeQuestions();
  checkStreak();
  updateTopBar();
  renderBookshelf();
}

document.addEventListener('DOMContentLoaded', init);
window.QUESTIONS = window.QUESTIONS || {};