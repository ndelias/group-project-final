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
  
  questionsElement.innerHTML = `
    <div class="quiz-question fade-in" role="article" aria-labelledby="question-${questionNumber}">
      <h2 id="question-${questionNumber}" class="quiz-question__text">
        ${question.question}
      </h2>
      <div class="quiz-options" role="group" aria-label="Answer options">
        <button 
          class="quiz-option" 
          data-answer="myth"
          aria-label="Select: Myth"
        >
          Myth
        </button>
        <button 
          class="quiz-option" 
          data-answer="fact"
          aria-label="Select: Fact"
        >
          Fact
        </button>
      </div>
      <div 
        class="quiz-feedback" 
        id="feedback-${questionNumber}"
        role="status"
        aria-live="polite"
      >
        <p></p>
      </div>
    </div>
  `;
  
  // Add event listeners to options
  const options = questionsElement.querySelectorAll('.quiz-option');
  options.forEach(option => {
    option.addEventListener('click', function() {
      handleAnswer(this.dataset.answer, question);
    });
    
    // Keyboard support
    option.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });
  
  updateProgress();
}

function handleAnswer(userAnswer, question) {
  const questionElement = document.querySelector('.quiz-question');
  const options = document.querySelectorAll('.quiz-option');
  const feedbackElement = document.getElementById(`feedback-${currentQuestionIndex + 1}`);
  
  // Disable options
  options.forEach(opt => {
    opt.disabled = true;
    opt.setAttribute('aria-disabled', 'true');
  });
  
  // Mark selected answer
  const selectedOption = Array.from(options).find(opt => opt.dataset.answer === userAnswer);
  if (selectedOption) {
    selectedOption.classList.add('quiz-option--selected');
  }
  
  // Check if correct
  const isCorrect = userAnswer === question.answer;
  
  if (isCorrect) {
    score++;
    selectedOption.classList.add('quiz-option--correct');
    questionElement.classList.add('quiz-question--answered');
  } else {
    selectedOption.classList.add('quiz-option--incorrect');
    // Highlight correct answer
    const correctOption = Array.from(options).find(opt => opt.dataset.answer === question.answer);
    if (correctOption) {
      correctOption.classList.add('quiz-option--correct');
    }
  }
  
  // Show feedback
  if (feedbackElement) {
    feedbackElement.classList.add('quiz-feedback--show');
    feedbackElement.classList.add(isCorrect ? 'quiz-feedback--correct' : 'quiz-feedback--incorrect');
    feedbackElement.querySelector('p').textContent = question.explanation;
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
