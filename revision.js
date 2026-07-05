// ===== REVISION SYSTEM & PDF EXPORT =====
// API for future D1 connection
const API_BASE = '';
const USE_SERVER = false;

let revisionState = null;

function startRevisionSession() {
  var mistakes = state.mistakes;
  if (!mistakes.length) { alert('No mistakes to revise yet! Complete some quizzes first.'); return; }

  var sorted = mistakes.slice().sort(function(a, b) { return (a.reviewCount || 0) - (b.reviewCount || 0); });
  var questions = sorted.slice(0, 20).map(function(m) {
    var opts = m._options || [];
    if (!opts.length) {
      var wrong = m.yourAnswer, correct = m.correctAnswer;
      var extras = ['None of these', 'Both A and B', 'All of the above', 'Cannot be determined'];
      opts = [wrong, correct].concat(extras.sort(function() { return Math.random() - 0.5; }).slice(0, 2)).sort(function() { return Math.random() - 0.5; });
    }
    return {
      q: m.question,
      options: opts,
      answer: opts.indexOf(m.correctAnswer) >= 0 ? opts.indexOf(m.correctAnswer) : 0,
      explanation: m.explanation,
      subject: m.subject,
      chapter: m.chapter,
      chapterName: m.chapterName,
      _mistakeId: m.id
    };
  });

  revisionState = { questions: questions, current: 0, answers: [], correct: 0, startTime: Date.now() };
  navigate('revision');
  renderRevisionQuestion();
}

function renderRevisionQuestion() {
  if (!revisionState) return;
  var q = revisionState.questions[revisionState.current];
  var progress = ((revisionState.current + 1) / revisionState.questions.length * 100).toFixed(0);
  var container = document.getElementById('revisionContainer');

  var html = '<div class="revision-header"><div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">';
  html += '<button class="mode-btn mcq-btn" onclick="confirmQuitRevision()" style="padding:8px 14px">\u2190 Quit</button>';
  html += '<div style="flex:1"><div style="font-size:14px;color:var(--text-muted)">Revision Session</div>';
  html += '<div class="xp-bar-track" style="height:8px;margin-top:6px"><div class="xp-bar-fill" style="width:' + progress + '%"></div></div></div>';
  html += '<div style="font-size:14px;color:var(--gold)">' + (revisionState.current+1) + ' / ' + revisionState.questions.length + '</div></div></div>';
  html += '<div class="quiz-card" style="animation:fadeSlideIn 0.4s ease">';
  html += '<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">' + (q.chapterName || 'Mistake Review') + '</div>';
  html += '<div style="font-size:18px;font-weight:600;margin-bottom:20px;line-height:1.5">' + q.q + '</div>';
  html += '<div id="revisionOptions" style="display:flex;flex-direction:column;gap:10px"></div></div>';
  container.innerHTML = html;

  var optContainer = document.getElementById('revisionOptions');
  q.options.forEach(function(opt, i) {
    var btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = function() { selectRevisionOption(i, q.answer, optContainer); };
    optContainer.appendChild(btn);
  });
}

function selectRevisionOption(selected, correct, container) {
  var btns = container.querySelectorAll('.option-btn');
  btns.forEach(function(b) { b.onclick = null; });
  var isCorrect = selected === correct;
  btns[selected].classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) btns[correct].classList.add('correct');

  var q = revisionState.questions[revisionState.current];
  var mistake = state.mistakes.find(function(m) { return m.id === q._mistakeId; });
  if (mistake) {
    mistake.reviewCount = (mistake.reviewCount || 0) + 1;
    if (isCorrect) { mistake.timesCorrect = (mistake.timesCorrect || 0) + 1; revisionState.correct++; }
  }
  revisionState.answers.push({ mistakeId: q._mistakeId, isCorrect: isCorrect });

  setTimeout(function() {
    revisionState.current++;
    if (revisionState.current < revisionState.questions.length) { renderRevisionQuestion(); }
    else { finishRevisionSession(); }
  }, isCorrect ? 1000 : 2000);
}

function finishRevisionSession() {
  var total = revisionState.questions.length;
  var correct = revisionState.correct;
  var pct = Math.round(correct / total * 100);
  var timeTaken = Math.round((Date.now() - revisionState.startTime) / 1000);

  if (!state.revisionHistory) state.revisionHistory = [];
  state.revisionHistory.push({ date: getToday(), score: correct, total: total, percentage: pct, time: timeTaken });
  state.mistakesRevised += total;
  addXP(total * 3, 'revision');
  checkAchievements();
  saveState();

  var emoji = pct >= 80 ? '\uD83C\uDFC6' : pct >= 50 ? '\uD83D\uDC4D' : '\uD83D\uDCAA';
  var msg = pct >= 80 ? 'Outstanding revision!' : pct >= 50 ? 'Good progress! Keep revising.' : 'Keep practicing! These mistakes need more attention.';

  var container = document.getElementById('revisionContainer');
  var html = '<div class="results-container" style="animation:fadeSlideIn 0.5s ease">';
  html += '<div style="text-align:center;margin-bottom:24px"><div style="font-size:64px;margin-bottom:8px">' + emoji + '</div>';
  html += '<div style="font-family:Playfair Display,serif;font-size:28px;color:var(--gold-bright)">' + pct + '%</div>';
  html += '<div style="font-size:14px;color:var(--text-muted);margin-top:4px">' + correct + ' / ' + total + ' correct in ' + timeTaken + 's</div></div>';
  html += '<div style="font-size:16px;text-align:center;margin-bottom:24px;color:var(--parchment)">' + msg + '</div>';
  html += '<div style="display:flex;gap:12px;justify-content:center">';
  html += '<button class="mode-btn mcq-btn" onclick="startRevisionSession()">Revise Again \uD83D\uDD04</button>';
  html += '<button class="mode-btn" onclick="navigate(\'home\')">Back to Library \uD83D\uDCDA</button></div></div>';
  container.innerHTML = html;

  if (pct >= 70) spawnMiniConfetti();
  revisionState = null;
}

function confirmQuitRevision() {
  if (revisionState && revisionState.current > 0) { if (!confirm('Quit revision? Progress will be lost.')) return; }
  revisionState = null;
  navigate('home');
}

function generateMistakesPDF() {
  var mistakes = state.mistakes;
  if (!mistakes.length) { alert('No mistakes to download!'); return; }

  var bySubject = {};
  mistakes.forEach(function(m) {
    var sub = m.subject || 'Other';
    if (!bySubject[sub]) bySubject[sub] = [];
    bySubject[sub].push(m);
  });

  var subNames = { maths:'Mathematics', science:'Science', english:'English', hindi:'Hindi', socialScience:'Social Science', sanskrit:'Sanskrit', assignment:'Assignment' };
  var lines = [];
  lines.push('JIVEN LIBRARY - MISTAKE JOURNAL');
  lines.push('Generated: ' + new Date().toLocaleDateString('en-IN'));
  lines.push('Total Mistakes: ' + mistakes.length);
  lines.push('============================================================');

  Object.keys(bySubject).forEach(function(sub) {
    var ms = bySubject[sub];
    lines.push('');
    lines.push((subNames[sub] || sub).toUpperCase() + ' (' + ms.length + ' mistakes)');
    lines.push('------------------------------------------------------------');
    ms.forEach(function(m, i) {
      lines.push('');
      lines.push('Q' + (i+1) + '. ' + m.question);
      lines.push('   Your answer: ' + m.yourAnswer);
      lines.push('   Correct answer: ' + m.correctAnswer);
      if (m.explanation) lines.push('   Explanation: ' + m.explanation);
      if (m.chapterName) lines.push('   Topic: ' + m.chapterName);
      var reviewed = m.reviewCount || 0;
      var correct = m.timesCorrect || 0;
      lines.push('   Revision: ' + correct + '/' + reviewed + ' correct');
    });
    lines.push('============================================================');
  });

  // Download as plain text (can be printed to PDF from browser)
  var text = lines.join('\n');
  var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'Jiven-Mistakes-' + new Date().toISOString().split('T')[0] + '.txt';
  a.click();
  URL.revokeObjectURL(url);
  addXP(10, 'pdf');
}