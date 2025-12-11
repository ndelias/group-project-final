/**
 * Quiz page JavaScript
 */

let quizData = [];
let animalsData = [];
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
    // Load both quiz and animals data
    quizData = await Misunderstood.fetchQuiz();
    animalsData = await Misunderstood.fetchAnimals();
    
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

  // Reset any previous card flip state
  const previousCardInner = document.getElementById('swipe-card-inner');
  if (previousCardInner) {
    previousCardInner.classList.remove('is-flipped');
  }

  const question = quizData[currentQuestionIndex];
  const questionNumber = currentQuestionIndex + 1;

  // Find the animal for this question
  const animal = animalsData.find(a => a.id === question.animal);
  const animalImage = animal ? animal.image : '';
  const animalName = animal ? animal.name : '';

  // Render a swipeable card. Swipe right = true (fact), swipe left = false (myth).
  questionsElement.innerHTML = `
    <div class="swipe-instructions">Swipe right for <strong>True</strong>, left for <strong>False</strong></div>
    <div class="swipe-stack">
      <div class="swipe-card-wrapper">
        <button class="swipe-action-btn swipe-action-btn--false" id="btn-false" aria-label="False">✕</button>
        <div class="swipe-card" id="swipe-card" role="article" aria-labelledby="question-${questionNumber}" tabindex="0">
          <div class="swipe-card__inner" id="swipe-card-inner">
            <div class="swipe-card__front" id="swipe-card-front">
              <div class="swipe-stamp swipe-stamp--myth" id="stamp-myth">FALSE</div>
              <div class="swipe-stamp swipe-stamp--fact" id="stamp-fact">TRUE</div>
              ${animalImage ? `
              <div class="swipe-card__image" aria-hidden="true">
                <img src="${animalImage}" alt="${animalName}" class="swipe-card__animal-img" draggable="false" ondragstart="return false;">
                <span class="swipe-card__animal-name">${animalName}</span>
              </div>
              ` : '<div class="swipe-card__image" aria-hidden="true"></div>'}
              <div class="swipe-card__content">
                <h2 id="question-${questionNumber}" class="swipe-card__text">
                  ${question.question}
                </h2>
              </div>
            </div>
            <div class="swipe-card__back">
              <div class="swipe-card__back-content">
                <h2 class="swipe-card__result-title" id="result-title"></h2>
                <p class="swipe-card__result-text" id="result-text"></p>
                <button class="btn btn--primary btn--lg swipe-card__next" id="next-question-btn" style="display: none;">Next Question</button>
              </div>
            </div>
          </div>
        </div>
        <button class="swipe-action-btn swipe-action-btn--true" id="btn-true" aria-label="True">✓</button>
      </div>
    </div>

    <!-- Hidden fallback buttons -->
    <div class="quiz-options" role="group" aria-label="Answer options">
      <button class="quiz-option" data-answer="myth" aria-label="Select False">False</button>
      <button class="quiz-option" data-answer="fact" aria-label="Select True">True</button>
    </div>

    <div class="quiz-feedback" id="feedback-${questionNumber}" role="status" aria-live="polite">
      <p></p>
    </div>
  `;

  updateProgress();

  // Gesture handling - Swipe-to-Reveal logic
  const card = document.getElementById('swipe-card');
  const cardFront = document.getElementById('swipe-card-front');
  const cardInner = document.getElementById('swipe-card-inner');
  const stampMyth = document.getElementById('stamp-myth');
  const stampFact = document.getElementById('stamp-fact');
  const hiddenOptions = document.querySelectorAll('.quiz-option');
  
  let startX = 0;
  let currentX = 0;
  let offsetX = 0;
  let isDragging = false;
  let hasAnswered = false;
  const threshold = 120; // pixels to consider a swipe
  const maxDragDistance = window.innerWidth * 0.5; // 50% of screen width

  // Clean up listeners when question advances
  function cleanupListeners() {
    card.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('keydown', onKey);
  }

  // Attach click handlers to button options
  hiddenOptions.forEach(opt => {
    opt.addEventListener('click', function() {
      if (hasAnswered) return;
      cleanupListeners();
      hasAnswered = true;
      const answer = this.dataset.answer;
      processAnswer(answer, question);
    });
  });

  // Attach click handlers to side circle buttons
  const btnFalse = document.getElementById('btn-false');
  const btnTrue = document.getElementById('btn-true');

  if (btnFalse) {
    btnFalse.addEventListener('click', function() {
      if (hasAnswered) return;
      cleanupListeners();
      hasAnswered = true;
      processAnswer('myth', question);
    });
  }

  if (btnTrue) {
    btnTrue.addEventListener('click', function() {
      if (hasAnswered) return;
      cleanupListeners();
      hasAnswered = true;
      processAnswer('fact', question);
    });
  }

  function setTransform(x, rotation) {
    card.style.transform = `translateX(${x}px) rotate(${rotation}deg)`;
  }

  function resetCard(animated = true) {
    if (animated) {
      card.style.transition = 'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)'; // Spring back (40% slower)
    } else {
      card.style.transition = '';
    }
    setTransform(0, 0);
    updateVisualFeedback(0);
    setTimeout(() => { 
      card.style.transition = '';
      if (!hasAnswered) {
        cardFront.classList.remove('swipe-myth', 'swipe-fact');
      }
    }, animated ? 420 : 0);
  }

  function updateVisualFeedback(offset) {
    const clampedOffset = Math.max(-maxDragDistance, Math.min(maxDragDistance, offset));
    const progress = Math.abs(clampedOffset) / threshold;
    const opacity = Math.min(progress, 1);

    if (clampedOffset > 0) {
      // Dragging right (FACT)
      stampFact.classList.toggle('visible', opacity > 0.3);
      stampMyth.classList.remove('visible');
      cardFront.classList.toggle('swipe-fact', opacity > 0.3);
      cardFront.classList.remove('swipe-myth');
    } else if (clampedOffset < 0) {
      // Dragging left (MYTH)
      stampMyth.classList.toggle('visible', opacity > 0.3);
      stampFact.classList.remove('visible');
      cardFront.classList.toggle('swipe-myth', opacity > 0.3);
      cardFront.classList.remove('swipe-fact');
    } else {
      // Reset
      stampMyth.classList.remove('visible');
      stampFact.classList.remove('visible');
      cardFront.classList.remove('swipe-myth', 'swipe-fact');
    }
  }

  function processAnswer(direction, questionData) {
    // Snap back to center immediately
    resetCard(true);
    
    // Wait for snap-back animation, then check answer and flip (40% slower)
    setTimeout(() => {
      // Check correctness
      const isCorrect = direction === questionData.answer;
      
      // Populate back face with answer tracking
      populateBackFace(direction, isCorrect, questionData.explanation);
      
      // Flip the card
      setTimeout(() => {
        cardInner.classList.add('is-flipped');
      }, 140);
    }, 420);
  }

  function populateBackFace(userAnswer, isCorrect, explanation) {
    const resultTitle = document.getElementById('result-title');
    const resultText = document.getElementById('result-text');
    const nextButton = document.getElementById('next-question-btn');

    if (resultTitle) {
      resultTitle.textContent = isCorrect ? 'Correct!' : 'Incorrect';
      resultTitle.style.color = isCorrect ? 'var(--color-success)' : 'var(--color-dangerous)';
    }
    
    if (resultText) {
      resultText.textContent = explanation;
    }
    
    if (nextButton) {
      nextButton.style.display = 'block';
      // Remove old listeners and add new one
      const newNextButton = nextButton.cloneNode(true);
      nextButton.parentNode.replaceChild(newNextButton, nextButton);
      newNextButton.addEventListener('click', function() {
        goToNextQuestion();
      });
    }
    
    // Store answer for results
    userAnswers.push({
      question: question.question,
      userAnswer: userAnswer,
      correctAnswer: question.answer,
      isCorrect
    });
    
    // Update score
    if (isCorrect) {
      score++;
    }
    
    // Update button states
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => {
      opt.disabled = true;
      opt.setAttribute('aria-disabled', 'true');
      if (opt.dataset.answer === question.answer) {
        opt.classList.add('quiz-option--correct');
      } else if (opt.dataset.answer === userAnswer && !isCorrect) {
        opt.classList.add('quiz-option--incorrect');
      }
    });
  }

  function goToNextQuestion() {
    // Remove flip class and wait for transition
    cardInner.classList.remove('is-flipped');
    
    // Wait for flip-back transition, then load new question (40% slower)
    setTimeout(() => {
      currentQuestionIndex++;
      if (currentQuestionIndex < quizData.length) {
        renderQuestion();
      } else {
        showResults();
      }
    }, 840);
  }

  function onPointerDown(e) {
    if (hasAnswered) return;
    isDragging = true;
    startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    card.setPointerCapture && card.setPointerCapture(e.pointerId);
    card.style.transition = '';
  }

  function onPointerMove(e) {
    if (!isDragging || hasAnswered) return;
    currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    offsetX = currentX - startX;
    
    // Clamp to 50% of screen width
    offsetX = Math.max(-maxDragDistance, Math.min(maxDragDistance, offsetX));
    
    const rotation = offsetX / 20;
    setTransform(offsetX, rotation);
    updateVisualFeedback(offsetX);
  }

  function onPointerUp(e) {
    if (!isDragging || hasAnswered) return;
    isDragging = false;
    
    if (Math.abs(offsetX) > threshold) {
      // Threshold met - process answer
      hasAnswered = true;
      cleanupListeners();
      const direction = offsetX > 0 ? 'fact' : 'myth';
      processAnswer(direction, question);
    } else {
      // Threshold not met - spring back
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
    if (hasAnswered) return;
    if (e.key === 'ArrowLeft') {
      hasAnswered = true;
      cleanupListeners();
      processAnswer('myth', question);
    } else if (e.key === 'ArrowRight') {
      hasAnswered = true;
      cleanupListeners();
      processAnswer('fact', question);
    }
  }

  document.addEventListener('keydown', onKey, { once: false });

  // (cleanupListeners defined above) No further wrapping required.
}

function handleAnswer(userAnswer, question) {
  // Support both original button-based UI and the new swipe-card UI.
  const cardElement = document.querySelector('#swipe-card') || document.querySelector('.quiz-question');
  const cardInner = document.getElementById('swipe-card-inner');
  const options = document.querySelectorAll('.quiz-option');
  const feedbackElement = document.getElementById(`feedback-${currentQuestionIndex + 1}`);
  const resultTitle = document.getElementById('result-title');
  const resultText = document.getElementById('result-text');
  const nextButton = document.getElementById('next-question-btn');

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

  // Populate back face of card with result
  if (cardInner && resultTitle && resultText) {
    if (isCorrect) {
      resultTitle.textContent = 'Correct!';
      resultTitle.style.color = 'var(--color-success)';
    } else {
      resultTitle.textContent = 'Incorrect';
      resultTitle.style.color = 'var(--color-dangerous)';
    }
    resultText.textContent = question.explanation;
    
    // Show next button
    if (nextButton) {
      nextButton.style.display = 'block';
      nextButton.onclick = function() {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
          renderQuestion();
        } else {
          showResults();
        }
      };
    }
    
    // Flip the card after a short delay to show the result
    setTimeout(() => {
      cardInner.classList.add('is-flipped');
    }, 300);
  }

  // Show feedback text (explanation) - fallback for non-card UI
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
  
  // Move to next question after delay (only if card flip is not used)
  if (!cardInner) {
    setTimeout(() => {
      currentQuestionIndex++;
      if (currentQuestionIndex < quizData.length) {
        renderQuestion();
      } else {
        showResults();
      }
    }, 2000);
  }
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

  // Track quiz completion for badges
  if (typeof ProgressTracker !== 'undefined') {
    ProgressTracker.completeQuiz(score, quizData.length);
  }

  if (scoreMessageElement) {
    let message = '';
    let emoji = '';
    if (percentage === 100) {
      message = 'WOW! PERFECT SCORE! You\'re officially a Myth Buster Master!';
      emoji = '🏆🎉💥';
      launchConfetti();
    } else if (percentage >= 80) {
      message = 'AMAZING! You really know your animal facts! So close to perfect!';
      emoji = '🌟⭐✨';
      launchConfetti();
    } else if (percentage >= 60) {
      message = 'Great job! You\'re becoming an animal expert! Keep exploring!';
      emoji = '👏🎯💪';
    } else if (percentage >= 40) {
      message = 'Nice try! Check out more animals to level up your knowledge!';
      emoji = '📚🔍🧠';
    } else {
      message = 'No worries! Every expert was once a beginner. Explore our animals and try again!';
      emoji = '🚀💡🌈';
    }
    scoreMessageElement.innerHTML = `<span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">${emoji}</span>${message}`;
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

// Confetti celebration effect
function launchConfetti() {
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3'];
  const confettiCount = 100;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.cssText = `
      position: fixed;
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw;
      top: -20px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      z-index: 10000;
      pointer-events: none;
      animation: confetti-fall ${Math.random() * 2 + 2}s linear forwards;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    document.body.appendChild(confetti);

    // Remove after animation
    setTimeout(() => confetti.remove(), 4000);
  }
}

// Add confetti animation CSS
(function() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes confetti-fall {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
})();

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
