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
  state.xp += amount;
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
  document.getElementById('xpText').textContent = state.xp + ' XP';
  document.getElementById('streakCount').textContent = state.streak;
  if (next) {
    const progress = ((state.xp - rank.xp) / (next.xp - rank.xp)) * 100;
    document.getElementById('xpFill').style.width = Math.min(progress, 100) + '%';
    document.getElementById('xpLabel').textContent = `${state.xp - rank.xp} / ${next.xp - rank.xp} XP`;
  } else {
    document.getElementById('xpFill').style.width = '100%';
    document.getElementById('xpLabel').textContent = 'MAX RANK!';
  }
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