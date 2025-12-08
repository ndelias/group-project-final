/**
 * Quiz page JavaScript
 */

let quizData = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;

document.addEventListener('DOMContentLoaded', async function() {
  const bestScoreContainer = document.getElementById('best-score-container');
  const bestScoreElement = document.getElementById('best-score');
  
  // Load best score from localStorage
  const bestScore = localStorage.getItem('misunderstood-best-score');
  if (bestScore !== null && bestScoreContainer && bestScoreElement) {
    bestScoreContainer.style.display = 'block';
    bestScoreElement.textContent = bestScore;
  }
  
  try {
    quizData = await Misunderstood.fetchQuiz();
    
    if (quizData.length === 0) {
      showError('No quiz questions available.');
      return;
    }
    
    // Shuffle questions
    quizData = [...quizData].sort(() => 0.5 - Math.random());
    
    // Initialize quiz
    resetQuiz();
    renderQuestion();
    
  } catch (error) {
    console.error('Error loading quiz:', error);
    showError('Failed to load quiz. Please try again later.');
  }
});

function resetQuiz() {
  currentQuestionIndex = 0;
  userAnswers = [];
  score = 0;
  const resultsElement = document.getElementById('quiz-results');
  const questionsElement = document.getElementById('quiz-questions');
  
  if (resultsElement) resultsElement.classList.add('hidden');
  if (questionsElement) questionsElement.classList.remove('hidden');
  
  updateProgress();
}

function renderQuestion() {
  const questionsElement = document.getElementById('quiz-questions');
  if (!questionsElement || currentQuestionIndex >= quizData.length) {
    showResults();
    return;
  }

  const question = quizData[currentQuestionIndex];
  const questionNumber = currentQuestionIndex + 1;

  // Render a swipeable card. Swipe right = fact, swipe left = myth.
  questionsElement.innerHTML = `
    <div class="swipe-instructions">Swipe right for <strong>Fact</strong>, swipe left for <strong>Myth</strong>. Use ← / → keys to answer.</div>
    <div class="swipe-stack">
      <div class="swipe-card-wrapper">
        <div class="swipe-overlay swipe-overlay--myth" id="overlay-myth">Myth</div>
        <div class="swipe-card" id="swipe-card" role="article" aria-labelledby="question-${questionNumber}" tabindex="0">
          <div class="swipe-card__image" aria-hidden="true">
            <!-- image placeholder - add <img> here later -->
          </div>
          <div class="swipe-card__content">
            <h2 id="question-${questionNumber}" class="swipe-card__text">
              ${question.question}
            </h2>
          </div>
        </div>
        <div class="swipe-overlay swipe-overlay--fact" id="overlay-fact">Fact</div>
      </div>
    </div>

    <!-- Action buttons: Myth (left) and Fact (right) placed under the card -->
    <div class="quiz-actions" role="group" aria-label="Answer options">
      <button class="quiz-option" data-answer="myth" aria-label="Select Myth">Myth</button>
      <button class="quiz-option" data-answer="fact" aria-label="Select Fact">Fact</button>
    </div>

    <div class="quiz-feedback" id="feedback-${questionNumber}" role="status" aria-live="polite">
      <p></p>
    </div>
  `;

  updateProgress();

  // Gesture handling
  const card = document.getElementById('swipe-card');
  const overlayMyth = document.getElementById('overlay-myth');
  const overlayFact = document.getElementById('overlay-fact');
  const hiddenOptions = document.querySelectorAll('.quiz-option');
  // Clean up listeners when question advances: remove listeners after answering
  function cleanupListeners() {
    card.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('keydown', onKey);
  }

  // Attach click handlers to hidden options for screen reader users
  hiddenOptions.forEach(opt => {
    opt.addEventListener('click', function() {
      cleanupListeners();
      handleAnswer(this.dataset.answer, question);
    });
  });

  let startX = 0;
  let currentX = 0;
  let offsetX = 0;
  let isDragging = false;
  const threshold = 120; // pixels to consider a swipe

  function setTransform(x, rotation) {
    card.style.transform = `translateX(${x}px) rotate(${rotation}deg)`;
  }

  function resetCard(animated = true) {
    if (animated) {
      card.style.transition = 'transform 200ms ease-out';
    } else {
      card.style.transition = '';
    }
    setTransform(0, 0);
    overlayMyth.style.opacity = 0;
    overlayFact.style.opacity = 0;
    setTimeout(() => { card.style.transition = ''; }, 250);
  }

  function acceptSwipe(direction) {
    // animate offscreen
    const sign = direction === 'fact' ? 1 : -1;
    card.style.transition = 'transform 300ms ease-out';
    setTransform(sign * (window.innerWidth || 1000), sign * 30);
    // cleanup listeners, then call the existing answer handler
    cleanupListeners();
    handleAnswer(direction, question);
  }

  function onPointerDown(e) {
    isDragging = true;
    startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    card.setPointerCapture && card.setPointerCapture(e.pointerId);
    card.style.transition = '';
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    offsetX = currentX - startX;
    const rotation = offsetX / 20;
    setTransform(offsetX, rotation);

    const opacity = Math.min(Math.abs(offsetX) / threshold, 1);
    if (offsetX > 0) {
      overlayFact.style.opacity = opacity;
      overlayMyth.style.opacity = 0;
    } else {
      overlayMyth.style.opacity = opacity;
      overlayFact.style.opacity = 0;
    }
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    if (Math.abs(offsetX) > threshold) {
      const direction = offsetX > 0 ? 'fact' : 'myth';
      acceptSwipe(direction);
    } else {
      resetCard(true);
    }
    try { card.releasePointerCapture && card.releasePointerCapture(e.pointerId); } catch (err) {}
  }

  // Pointer events for mouse/touch
  card.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  // Keyboard support: left/right arrows
  function onKey(e) {
    if (e.key === 'ArrowLeft') {
      // Myth
      acceptSwipe('myth');
    } else if (e.key === 'ArrowRight') {
      acceptSwipe('fact');
    }
  }

  document.addEventListener('keydown', onKey, { once: false });

  // (cleanupListeners defined above) No further wrapping required.
}

function handleAnswer(userAnswer, question) {
  // Support both original button-based UI and the new swipe-card UI.
  const cardElement = document.querySelector('#swipe-card') || document.querySelector('.quiz-question');
  const options = document.querySelectorAll('.quiz-option');
  const feedbackElement = document.getElementById(`feedback-${currentQuestionIndex + 1}`);

  // Disable options (hidden fallbacks) if present
  options.forEach(opt => {
    try { opt.disabled = true; } catch (e) {}
    opt.setAttribute && opt.setAttribute('aria-disabled', 'true');
  });

  // Find the selected option if the original option buttons exist
  const selectedOption = Array.from(options).find(opt => opt.dataset.answer === userAnswer);

  // Check correctness
  const isCorrect = userAnswer === question.answer;

  if (isCorrect) {
    score++;
    if (selectedOption) selectedOption.classList.add('quiz-option--correct');
    if (cardElement) {
      cardElement.classList.add('quiz-question--answered', 'quiz-card--correct');
    }
  } else {
    if (selectedOption) selectedOption.classList.add('quiz-option--incorrect');
    // Highlight correct if hidden options available
    const correctOption = Array.from(options).find(opt => opt.dataset.answer === question.answer);
    if (correctOption) correctOption.classList.add('quiz-option--correct');
    if (cardElement) cardElement.classList.add('quiz-card--incorrect');
  }

  // Show feedback text (explanation)
  if (feedbackElement) {
    feedbackElement.classList.add('quiz-feedback--show');
    feedbackElement.classList.add(isCorrect ? 'quiz-feedback--correct' : 'quiz-feedback--incorrect');
    const p = feedbackElement.querySelector('p');
    if (p) p.textContent = question.explanation;
  }

  // Store answer
  userAnswers.push({
    question: question.question,
    userAnswer,
    correctAnswer: question.answer,
    isCorrect
  });
  
  // Move to next question after delay
  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
      renderQuestion();
    } else {
      showResults();
    }
  }, 2000);
}

function updateProgress() {
  const progressBar = document.getElementById('progress-bar');
  const currentQuestionElement = document.getElementById('current-question');
  const totalQuestionsElement = document.getElementById('total-questions');
  const progressbar = document.querySelector('[role="progressbar"]');
  
  if (progressBar) {
    const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;
    progressBar.style.width = `${progress}%`;
  }
  
  if (currentQuestionElement) {
    currentQuestionElement.textContent = currentQuestionIndex + 1;
  }
  
  if (totalQuestionsElement) {
    totalQuestionsElement.textContent = quizData.length;
  }
  
  if (progressbar) {
    progressbar.setAttribute('aria-valuenow', currentQuestionIndex + 1);
    progressbar.setAttribute('aria-valuemax', quizData.length);
  }
}

function showResults() {
  const questionsElement = document.getElementById('quiz-questions');
  const resultsElement = document.getElementById('quiz-results');
  const finalScoreElement = document.getElementById('final-score');
  const scoreMessageElement = document.getElementById('score-message');
  const restartButton = document.getElementById('restart-quiz');
  
  if (questionsElement) questionsElement.classList.add('hidden');
  if (resultsElement) resultsElement.classList.remove('hidden');
  
  const percentage = (score / quizData.length) * 100;
  
  if (finalScoreElement) {
    finalScoreElement.textContent = `${score}/${quizData.length}`;
  }
  
  if (scoreMessageElement) {
    let message = '';
    if (percentage === 100) {
      message = 'Perfect! You\'re a wildlife myth-busting expert! 🎉';
    } else if (percentage >= 80) {
      message = 'Excellent! You know your facts! 🌟';
    } else if (percentage >= 60) {
      message = 'Good job! You\'re learning! 👍';
    } else {
      message = 'Keep learning! Explore our animal profiles to discover more facts! 📚';
    }
    scoreMessageElement.textContent = message;
  }
  
  // Update best score
  const bestScore = localStorage.getItem('misunderstood-best-score');
  const bestScoreElement = document.getElementById('best-score');
  const bestScoreContainer = document.getElementById('best-score-container');
  
  if (bestScore === null || score > parseInt(bestScore)) {
    localStorage.setItem('misunderstood-best-score', score.toString());
    if (bestScoreElement) bestScoreElement.textContent = score;
    if (bestScoreContainer) bestScoreContainer.style.display = 'block';
  }
  
  // Restart button
  if (restartButton) {
    restartButton.addEventListener('click', function() {
      resetQuiz();
      renderQuestion();
    });
  }
  
  // Scroll to results
  if (resultsElement) {
    resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function showError(message) {
  const questionsElement = document.getElementById('quiz-questions');
  if (questionsElement) {
    questionsElement.innerHTML = `
      <div class="empty-state">
        <p class="empty-state__text">${message}</p>
      </div>
    `;
  }
}
