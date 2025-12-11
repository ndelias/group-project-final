/**
 * Main JavaScript - Shared functionality
 */

// ========================================
// Progress & Badge Tracking System
// ========================================
const ProgressTracker = {
  STORAGE_KEY: 'misunderstood_progress',

  getProgress() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      visitedAnimals: [],
      quizCompleted: false,
      quizScore: 0,
      totalQuizQuestions: 0,
      badges: []
    };
  },

  saveProgress(progress) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
  },

  visitAnimal(animalId) {
    const progress = this.getProgress();
    if (!progress.visitedAnimals.includes(animalId)) {
      progress.visitedAnimals.push(animalId);
      this.saveProgress(progress);
      this.checkBadges(progress);
    }
    return progress;
  },

  completeQuiz(score, total) {
    const progress = this.getProgress();
    progress.quizCompleted = true;
    progress.quizScore = Math.max(progress.quizScore, score);
    progress.totalQuizQuestions = total;
    this.saveProgress(progress);
    this.checkBadges(progress);
    return progress;
  },

  checkBadges(progress) {
    const newBadges = [];

    // Explorer badges
    if (progress.visitedAnimals.length >= 1 && !progress.badges.includes('first_discovery')) {
      progress.badges.push('first_discovery');
      newBadges.push({ id: 'first_discovery', name: 'First Discovery!', emoji: '🔍', description: 'You met your first animal!' });
    }
    if (progress.visitedAnimals.length >= 5 && !progress.badges.includes('curious_explorer')) {
      progress.badges.push('curious_explorer');
      newBadges.push({ id: 'curious_explorer', name: 'Curious Explorer', emoji: '🧭', description: 'You\'ve met 5 animals!' });
    }
    if (progress.visitedAnimals.length >= 9 && !progress.badges.includes('animal_expert')) {
      progress.badges.push('animal_expert');
      newBadges.push({ id: 'animal_expert', name: 'Animal Expert', emoji: '🏆', description: 'You\'ve met ALL the animals!' });
    }

    // Quiz badges
    if (progress.quizCompleted && !progress.badges.includes('quiz_taker')) {
      progress.badges.push('quiz_taker');
      newBadges.push({ id: 'quiz_taker', name: 'Quiz Champion', emoji: '🎯', description: 'You completed the quiz!' });
    }
    if (progress.quizScore === progress.totalQuizQuestions && progress.totalQuizQuestions > 0 && !progress.badges.includes('myth_buster')) {
      progress.badges.push('myth_buster');
      newBadges.push({ id: 'myth_buster', name: 'Myth Buster Master', emoji: '💥', description: 'Perfect quiz score!' });
    }

    if (newBadges.length > 0) {
      this.saveProgress(progress);
      this.showBadgeNotification(newBadges[0]);
    }

    return newBadges;
  },

  showBadgeNotification(badge) {
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
      <div class="badge-notification__content">
        <span class="badge-notification__emoji">${badge.emoji}</span>
        <div class="badge-notification__text">
          <strong>New Badge Unlocked!</strong>
          <span>${badge.name}</span>
        </div>
      </div>
    `;
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove after 4 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  },

  getBadgeInfo(badgeId) {
    const badges = {
      'first_discovery': { name: 'First Discovery!', emoji: '🔍', description: 'Met your first animal' },
      'curious_explorer': { name: 'Curious Explorer', emoji: '🧭', description: 'Met 5 animals' },
      'animal_expert': { name: 'Animal Expert', emoji: '🏆', description: 'Met all 9 animals' },
      'quiz_taker': { name: 'Quiz Champion', emoji: '🎯', description: 'Completed the quiz' },
      'myth_buster': { name: 'Myth Buster Master', emoji: '💥', description: 'Perfect quiz score' }
    };
    return badges[badgeId] || null;
  },

  renderProgressBar(totalAnimals = 9) {
    const progress = this.getProgress();
    const visited = progress.visitedAnimals.length;
    const percentage = Math.round((visited / totalAnimals) * 100);

    return `
      <div class="progress-tracker">
        <div class="progress-tracker__header">
          <span class="progress-tracker__label">Your Progress</span>
          <span class="progress-tracker__count">${visited} of ${totalAnimals} animals</span>
        </div>
        <div class="progress-tracker__bar">
          <div class="progress-tracker__fill" style="width: ${percentage}%"></div>
        </div>
        ${progress.badges.length > 0 ? `
          <div class="progress-tracker__badges">
            ${progress.badges.map(b => {
              const info = this.getBadgeInfo(b);
              return info ? `<span class="progress-tracker__badge" title="${info.description}">${info.emoji}</span>` : '';
            }).join('')}
          </div>
        ` : '<p class="progress-tracker__hint">Visit animals to earn badges! 🏅</p>'}
      </div>
    `;
  }
};

// Add CSS for progress tracker and badge notifications
(function() {
  const style = document.createElement('style');
  style.textContent = `
    .progress-tracker {
      background: var(--color-bg-alt);
      border-radius: var(--border-radius-xl);
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
      box-shadow: var(--shadow-sm);
    }

    .progress-tracker__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-sm);
    }

    .progress-tracker__label {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-lg);
    }

    .progress-tracker__count {
      color: var(--color-text-light);
      font-size: var(--font-size-sm);
    }

    .progress-tracker__bar {
      height: 12px;
      background: var(--color-border);
      border-radius: var(--border-radius-full);
      overflow: hidden;
    }

    .progress-tracker__fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981 0%, #059669 100%);
      border-radius: var(--border-radius-full);
      transition: width 0.5s ease;
    }

    .progress-tracker__badges {
      display: flex;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-md);
      flex-wrap: wrap;
    }

    .progress-tracker__badge {
      font-size: 1.5rem;
      cursor: help;
    }

    .progress-tracker__hint {
      color: var(--color-text-light);
      font-size: var(--font-size-sm);
      margin: var(--spacing-sm) 0 0 0;
    }

    .badge-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: #78350f;
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--border-radius-xl);
      box-shadow: var(--shadow-lg);
      z-index: 10000;
      transform: translateX(120%);
      transition: transform 0.3s ease;
    }

    .badge-notification.show {
      transform: translateX(0);
    }

    .badge-notification__content {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .badge-notification__emoji {
      font-size: 2rem;
    }

    .badge-notification__text {
      display: flex;
      flex-direction: column;
    }

    .badge-notification__text strong {
      font-size: var(--font-size-sm);
    }

    .badge-notification__text span {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
    }
  `;
  document.head.appendChild(style);
})();

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function() {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      mainNav.classList.toggle('main-nav--open');
    });
  }
});

// Fetch JSON data
async function fetchAnimals() {
  try {
    const response = await fetch('data/animals.json');
    if (!response.ok) {
      throw new Error('Failed to fetch animals data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching animals:', error);
    return [];
  }
}

async function fetchQuiz() {
  try {
    const response = await fetch('data/quiz.json');
    if (!response.ok) {
      throw new Error('Failed to fetch quiz data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return [];
  }
}

// Get URL parameter
function getURLParameter(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Format category name for display
function formatCategory(category) {
  const categoryMap = {
    'dangerous': 'Dangerous',
    'dirty-diseased': 'Dirty/Diseased',
    'useless-nuisance': 'Useless/Nuisance'
  };
  return categoryMap[category] || category;
}

// Get category badge class
function getCategoryBadgeClass(category) {
  const badgeMap = {
    'dangerous': 'badge--dangerous',
    'dirty-diseased': 'badge--dirty',
    'useless-nuisance': 'badge--nuisance'
  };
  return badgeMap[category] || '';
}

// Create animal card
function createAnimalCard(animal) {
  const badgeClass = getCategoryBadgeClass(animal.category);
  const images = animal.images || [animal.image];
  const imagesHTML = images.map((img, index) => 
    `<img src="${img}" alt="${animal.name}" class="card__image" loading="lazy" ${index === 0 ? 'data-active="true"' : ''}>`
  ).join('');
  
  return `
    <article class="card fade-in" data-animal-id="${animal.id}">
      <a href="detail.html?id=${animal.id}" style="text-decoration: none; display: block; color: inherit;">
        <div class="card__image-container">
          <div class="card__image-slideshow" data-images='${JSON.stringify(images)}'>
            ${imagesHTML}
          </div>
          <span class="badge ${badgeClass} card__badge-overlay">${formatCategory(animal.category)}</span>
        </div>
        <div class="card__info">
          <h3 class="card__title">${animal.name}</h3>
          <p class="card__scientific-name">${animal.scientificName}</p>
        </div>
      </a>
    </article>
  `;
}

// Setup card hover slideshow
function setupCardSlideshow(cardElement) {
  const slideshow = cardElement.querySelector('.card__image-slideshow');
  if (!slideshow) return;
  
  const images = slideshow.querySelectorAll('img');
  if (images.length <= 1) return;
  
  let currentIndex = 0;
  let intervalId = null;
  let hoverTimeout = null;
  
  const showImage = (index) => {
    images.forEach((img, i) => {
      if (i === index) {
        img.style.opacity = '1';
        img.style.zIndex = '1';
      } else {
        img.style.opacity = '0';
        img.style.zIndex = '0';
      }
    });
  };
  
  const nextImage = () => {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
  };
  
  const startSlideshow = () => {
    if (intervalId) return;
    intervalId = setInterval(nextImage, 2000); // Change image every 2 seconds
  };
  
  const stopSlideshow = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    showImage(0); // Reset to first image
    currentIndex = 0;
  };
  
  cardElement.addEventListener('mouseenter', () => {
    hoverTimeout = setTimeout(() => {
      startSlideshow();
    }, 300); // Small delay before starting
  });
  
  cardElement.addEventListener('mouseleave', () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
    stopSlideshow();
  });
  
  // Touch support for mobile
  let touchStartX = 0;
  cardElement.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  });
  
  cardElement.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        currentIndex = (currentIndex + 1) % images.length;
      } else {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
      }
      showImage(currentIndex);
    }
  });
}

// Debounce function for search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Smooth scroll to element
function scrollToElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Handle accordion toggle
function setupAccordion(accordionElement) {
  const header = accordionElement.querySelector('.accordion__header');
  if (!header) return;
  
  header.addEventListener('click', function() {
    const isExpanded = accordionElement.getAttribute('aria-expanded') === 'true';
    accordionElement.setAttribute('aria-expanded', !isExpanded);
  });
  
  // Keyboard support
  header.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      header.click();
    }
  });
}

// Create accordion element
function createAccordion(myth, index) {
  const accordionId = `accordion-${index}`;
  const contentId = `content-${index}`;
  
  return `
    <div class="accordion" aria-expanded="false" role="region">
      <button 
        class="accordion__header" 
        aria-controls="${contentId}"
        id="${accordionId}"
      >
        <span>
          <strong>Myth:</strong> ${myth.myth}
        </span>
        <span class="accordion__icon" aria-hidden="true">▼</span>
      </button>
      <div 
        class="accordion__content" 
        id="${contentId}"
        role="region"
        aria-labelledby="${accordionId}"
      >
        <p class="accordion__fact">
          <strong>Fact:</strong> ${myth.fact}
        </p>
      </div>
    </div>
  `;
}

// Create slideshow HTML for detail page
function createSlideshowHTML(images, animalName) {
  if (!images || images.length === 0) return '';
  if (images.length === 1) {
    return `
      <div class="slideshow">
        <div class="slideshow__container">
          <img src="${images[0]}" alt="${animalName}" class="slideshow__image active" loading="eager">
        </div>
      </div>
    `;
  }
  
  const buttonsHTML = images.map((_, index) => 
    `<button class="slideshow__button ${index === 0 ? 'active' : ''}" data-slide="${index}" aria-label="Go to slide ${index + 1}"></button>`
  ).join('');
  
  return `
    <div class="slideshow">
      <div class="slideshow__container">
        ${images.map((img, index) => 
          `<img src="${img}" alt="${animalName}" class="slideshow__image ${index === 0 ? 'active' : ''}" loading="${index === 0 ? 'eager' : 'lazy'}">`
        ).join('')}
      </div>
      <button class="slideshow__nav slideshow__nav--prev" aria-label="Previous image">‹</button>
      <button class="slideshow__nav slideshow__nav--next" aria-label="Next image">›</button>
      <div class="slideshow__controls">
        ${buttonsHTML}
      </div>
      <div class="slideshow__counter">
        <span class="slideshow__current">1</span> / <span class="slideshow__total">${images.length}</span>
      </div>
    </div>
  `;
}

// Setup detail page slideshow
function setupDetailSlideshow(slideshowElement) {
  if (!slideshowElement) return;
  
  const images = slideshowElement.querySelectorAll('.slideshow__image');
  const buttons = slideshowElement.querySelectorAll('.slideshow__button');
  const prevButton = slideshowElement.querySelector('.slideshow__nav--prev');
  const nextButton = slideshowElement.querySelector('.slideshow__nav--next');
  const currentCounter = slideshowElement.querySelector('.slideshow__current');
  const container = slideshowElement.querySelector('.slideshow__container');
  
  if (images.length <= 1) {
    if (prevButton) prevButton.style.display = 'none';
    if (nextButton) nextButton.style.display = 'none';
    if (buttons.length > 0 && buttons[0].parentElement) {
      buttons[0].parentElement.style.display = 'none';
    }
    return;
  }
  
  let currentIndex = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  
  const showSlide = (index) => {
    // Update images
    images.forEach((img, i) => {
      if (i === index) {
        img.classList.add('active');
      } else {
        img.classList.remove('active');
      }
    });
    
    // Update buttons
    buttons.forEach((btn, i) => {
      if (i === index) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
    
    // Update counter
    if (currentCounter) {
      currentCounter.textContent = index + 1;
    }
    
    currentIndex = index;
  };
  
  const nextSlide = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    showSlide(nextIndex);
  };
  
  const prevSlide = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    showSlide(prevIndex);
  };
  
  // Button clicks
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => showSlide(index));
  });
  
  // Navigation arrows
  if (nextButton) {
    nextButton.addEventListener('click', nextSlide);
  }
  
  if (prevButton) {
    prevButton.addEventListener('click', prevSlide);
  }
  
  // Keyboard navigation
  slideshowElement.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  });
  
  // Touch swipe support for mobile
  if (container) {
    container.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
      if (!touchStartX || !touchStartY) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;
      
      // Only trigger if horizontal swipe is greater than vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swipe left - next slide
          nextSlide();
        } else {
          // Swipe right - previous slide
          prevSlide();
        }
      }
      
      touchStartX = 0;
      touchStartY = 0;
    }, { passive: true });
  }
}

// Export functions for use in other scripts
window.Misunderstood = {
  fetchAnimals,
  fetchQuiz,
  getURLParameter,
  formatCategory,
  getCategoryBadgeClass,
  createAnimalCard,
  setupCardSlideshow,
  createSlideshowHTML,
  setupDetailSlideshow,
  debounce,
  scrollToElement,
  setupAccordion,
  createAccordion
};

// Animal emoji cursor trail effect
(function() {
  const animalEmojis = ['🦈', '🦇', '🐺', '🦅', '🐀', '🕷️', '🦛', '🐍', '🦎', '🦂', '🐊', '🦔'];
  let lastTrailTime = 0;
  const trailDelay = 50; // Minimum ms between trail elements

  function createTrailEmoji(x, y) {
    const emoji = document.createElement('span');
    emoji.className = 'cursor-trail-emoji';
    emoji.textContent = animalEmojis[Math.floor(Math.random() * animalEmojis.length)];
    emoji.style.left = x + 'px';
    emoji.style.top = y + 'px';
    document.body.appendChild(emoji);

    // Remove after animation completes
    setTimeout(() => {
      emoji.remove();
    }, 1000);
  }

  document.addEventListener('mousemove', function(e) {
    const now = Date.now();
    if (now - lastTrailTime < trailDelay) return;
    lastTrailTime = now;

    createTrailEmoji(e.pageX, e.pageY);
  });

  // Add CSS for the trail effect
  const style = document.createElement('style');
  style.textContent = `
    .cursor-trail-emoji {
      position: absolute;
      pointer-events: none;
      font-size: 1.5rem;
      z-index: 9999;
      animation: cursorTrailFade 1s ease-out forwards;
      transform: translate(-50%, -50%);
      user-select: none;
    }

    @keyframes cursorTrailFade {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1) rotate(0deg);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -100%) scale(0.5) rotate(45deg);
      }
    }
  `;
  document.head.appendChild(style);
})();
