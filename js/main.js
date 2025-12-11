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
  },

  getAllBadges() {
    return [
      { id: 'first_discovery', name: 'First Discovery!', emoji: '🔍', description: 'Met your first animal', requirement: 'Visit 1 animal page' },
      { id: 'curious_explorer', name: 'Curious Explorer', emoji: '🧭', description: 'Met 5 animals', requirement: 'Visit 5 animal pages' },
      { id: 'animal_expert', name: 'Animal Expert', emoji: '🏆', description: 'Met all 9 animals', requirement: 'Visit all 9 animal pages' },
      { id: 'quiz_taker', name: 'Quiz Champion', emoji: '🎯', description: 'Completed the quiz', requirement: 'Finish the quiz' },
      { id: 'myth_buster', name: 'Myth Buster Master', emoji: '💥', description: 'Perfect quiz score', requirement: 'Get 100% on the quiz' }
    ];
  },

  renderBadgeGallery() {
    const progress = this.getProgress();
    const allBadges = this.getAllBadges();
    const earnedCount = progress.badges.length;
    const totalBadges = allBadges.length;

    const badgesHTML = allBadges.map(badge => {
      const isEarned = progress.badges.includes(badge.id);
      return `
        <div class="badge-card ${isEarned ? 'earned' : 'locked'}">
          <div class="badge-card__icon">
            <span class="badge-card__emoji">${badge.emoji}</span>
            ${!isEarned ? '<span class="badge-card__lock">🔒</span>' : ''}
          </div>
          <div class="badge-card__info">
            <h4 class="badge-card__name">${badge.name}</h4>
            <p class="badge-card__description">${badge.description}</p>
            ${!isEarned ? `<p class="badge-card__requirement">${badge.requirement}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="badge-gallery">
        <div class="badge-gallery__header">
          <h3 class="badge-gallery__title">🏅 My Badges</h3>
          <span class="badge-gallery__count">${earnedCount} / ${totalBadges} Badges</span>
        </div>
        <div class="badge-gallery__progress">
          <div class="badge-gallery__progress-bar" style="width: ${(earnedCount / totalBadges) * 100}%"></div>
        </div>
        <div class="badge-gallery__grid">
          ${badgesHTML}
        </div>
        ${earnedCount < totalBadges ? `
          <p class="badge-gallery__hint">Keep exploring to earn more badges!</p>
        ` : `
          <p class="badge-gallery__complete">🎉 You're a true animal expert! All badges earned! 🎉</p>
        `}
      </div>
    `;
  }
};

// ========================================
// Collectible Card System
// ========================================
const CardCollection = {
  STORAGE_KEY: 'misunderstood_cards',
  CARD_BACK: 'images/Collectible Card/backofcard.png',

  getCollectedCards() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveCollectedCards(cards) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cards));
  },

  hasCard(animalId) {
    return this.getCollectedCards().includes(animalId);
  },

  collectCard(animal) {
    const collected = this.getCollectedCards();
    if (!collected.includes(animal.id)) {
      collected.push(animal.id);
      this.saveCollectedCards(collected);
      this.showCardUnlock(animal);
      return true;
    }
    return false;
  },

  showCardUnlock(animal) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'card-unlock-modal';
    modal.innerHTML = `
      <div class="card-unlock-modal__backdrop"></div>
      <div class="card-unlock-modal__content">
        <div class="card-unlock-modal__header">
          <span class="card-unlock-modal__stars">✨</span>
          <h2>NEW CARD UNLOCKED!</h2>
          <span class="card-unlock-modal__stars">✨</span>
        </div>
        <div class="collectible-card" id="unlock-card">
          <div class="collectible-card__inner">
            <div class="collectible-card__front">
              <img src="${animal.cardImage}" alt="${animal.name} Card">
            </div>
            <div class="collectible-card__back">
              <img src="${this.CARD_BACK}" alt="Card Back">
            </div>
          </div>
        </div>
        <p class="card-unlock-modal__name">${animal.name}</p>
        <p class="card-unlock-modal__message">Added to your collection!</p>
        <button class="btn btn--primary card-unlock-modal__close">Awesome! 🎉</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Launch confetti
    this.launchCardConfetti();

    // Start the flip animation sequence
    setTimeout(() => {
      modal.classList.add('show');
    }, 50);

    // Card starts showing back, then flips to reveal front
    const card = document.getElementById('unlock-card');
    setTimeout(() => {
      card.classList.add('flipped');
    }, 600);

    // After flip completes, do a celebration wiggle (keep flipped class)
    setTimeout(() => {
      card.classList.add('celebrating');
    }, 1400);

    // Remove celebrating class after animation but keep flipped
    setTimeout(() => {
      card.classList.remove('celebrating');
    }, 2400);

    // Close button
    const closeBtn = modal.querySelector('.card-unlock-modal__close');
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });

    // Also close on backdrop click
    modal.querySelector('.card-unlock-modal__backdrop').addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });
  },

  launchCardConfetti() {
    const colors = ['#f2c14e', '#6b8c42', '#15802b', '#f2ebd3', '#96CEB4', '#d4c9b0', '#2d5a3d', '#f5f0e6'];
    const confettiCount = 150;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'card-confetti';
      const isCircle = Math.random() > 0.5;
      const size = Math.random() * 12 + 6;
      confetti.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}vw;
        top: -20px;
        border-radius: ${isCircle ? '50%' : '2px'};
        z-index: 100001;
        pointer-events: none;
        animation: card-confetti-fall ${Math.random() * 2 + 2.5}s linear forwards;
        animation-delay: ${Math.random() * 0.8}s;
        transform: rotate(${Math.random() * 360}deg);
      `;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 5000);
    }
  },

  renderCollectionGallery(animals, interactive = false) {
    const collected = this.getCollectedCards();
    const totalCards = animals.length;
    const collectedCount = collected.length;

    let cardsHTML = animals.map(animal => {
      const isCollected = collected.includes(animal.id);
      const clickHandler = isCollected
        ? (interactive
          ? `onclick="CardCollection.showCardViewer('${animal.id}')"`
          : `onclick="window.location.href='detail.html?id=${animal.id}'"`)
        : '';
      return `
        <div class="collection-card ${isCollected ? 'collected' : 'locked'}"
             data-animal-id="${animal.id}"
             data-card-image="${animal.cardImage || ''}"
             data-animal-name="${animal.name}"
             ${clickHandler}>
          <div class="collection-card__inner">
            ${isCollected ? `
              <img src="${animal.cardImage}" alt="${animal.name}" class="collection-card__image">
            ` : `
              <img src="${this.CARD_BACK}" alt="Locked Card" class="collection-card__image collection-card__image--locked">
              <div class="collection-card__lock">🔒</div>
            `}
          </div>
          <p class="collection-card__name">${isCollected ? animal.name : '???'}</p>
        </div>
      `;
    }).join('');

    return `
      <div class="card-collection">
        <div class="card-collection__header">
          <h3 class="card-collection__title">🃏 My Card Collection</h3>
          <span class="card-collection__count">${collectedCount} / ${totalCards} Cards</span>
        </div>
        <div class="card-collection__progress">
          <div class="card-collection__progress-bar" style="width: ${(collectedCount / totalCards) * 100}%"></div>
        </div>
        <div class="card-collection__grid">
          ${cardsHTML}
        </div>
        ${collectedCount < totalCards ? `
          <p class="card-collection__hint">Visit animal pages to collect their cards!</p>
        ` : `
          <p class="card-collection__complete">🎉 Amazing! You collected them all! 🎉</p>
        `}
      </div>
    `;
  },

  // Store animals data for card viewer
  animalsData: [],
  setAnimalsData(animals) {
    this.animalsData = animals;
  },

  showCardViewer(animalId) {
    const animal = this.animalsData.find(a => a.id === animalId);
    if (!animal || !animal.cardImage) return;

    // Create viewer modal
    const modal = document.createElement('div');
    modal.className = 'card-viewer-modal';
    modal.innerHTML = `
      <div class="card-viewer-modal__backdrop"></div>
      <div class="card-viewer-modal__content">
        <button class="card-viewer-modal__close-btn" aria-label="Close">&times;</button>
        <div class="card-viewer">
          <div class="card-viewer__card" id="viewer-card">
            <div class="card-viewer__inner">
              <div class="card-viewer__front">
                <img src="${animal.cardImage}" alt="${animal.name} Card">
              </div>
              <div class="card-viewer__back">
                <img src="${this.CARD_BACK}" alt="Card Back">
              </div>
            </div>
          </div>
          <p class="card-viewer__name">${animal.name}</p>
          <p class="card-viewer__hint">Click the card to flip it!</p>
          <div class="card-viewer__actions">
            <button class="btn btn--outline" onclick="window.location.href='detail.html?id=${animal.id}'">Learn More</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Show modal
    setTimeout(() => modal.classList.add('show'), 50);

    // Card flip on click
    const card = document.getElementById('viewer-card');
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });

    // Close handlers
    const closeModal = () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    };

    modal.querySelector('.card-viewer-modal__close-btn').addEventListener('click', closeModal);
    modal.querySelector('.card-viewer-modal__backdrop').addEventListener('click', closeModal);

    // ESC key to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }
};

// Add CSS for collectible cards
(function() {
  const cardStyle = document.createElement('style');
  cardStyle.textContent = `
    /* Card Unlock Modal */
    .card-unlock-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .card-unlock-modal.show {
      opacity: 1;
      visibility: visible;
    }

    .card-unlock-modal__backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
    }

    .card-unlock-modal__content {
      position: relative;
      text-align: center;
      padding: 2rem;
      animation: modal-bounce 0.5s ease;
    }

    @keyframes modal-bounce {
      0% { transform: scale(0.5); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .card-unlock-modal__header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .card-unlock-modal__header h2 {
      color: #f2ebd3;
      font-size: 1.8rem;
      text-shadow: 0 0 20px rgba(21, 128, 43, 0.5);
      margin: 0;
    }

    .card-unlock-modal__stars {
      font-size: 2rem;
      animation: star-pulse 1s ease infinite;
    }

    @keyframes star-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.3); }
    }

    .card-unlock-modal__name {
      color: white;
      font-size: 1.5rem;
      font-weight: bold;
      margin: 1rem 0 0.5rem;
    }

    .card-unlock-modal__message {
      color: #6b8c42;
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
    }

    .card-unlock-modal__close {
      font-size: 1.2rem;
      padding: 0.8rem 2rem;
    }

    /* Collectible Card (in modal) */
    .collectible-card {
      width: 220px;
      height: 308px;
      margin: 0 auto;
      perspective: 1000px;
    }

    .collectible-card__inner {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .collectible-card.flipped .collectible-card__inner {
      transform: rotateY(180deg);
    }

    .collectible-card.celebrating .collectible-card__inner {
      animation: card-celebrate 1s ease forwards;
    }

    @keyframes card-celebrate {
      0% { transform: rotateY(180deg) scale(1); }
      25% { transform: rotateY(180deg) scale(1.15) rotate(-8deg); }
      50% { transform: rotateY(180deg) scale(1.15) rotate(8deg); }
      75% { transform: rotateY(180deg) scale(1.1) rotate(-4deg); }
      100% { transform: rotateY(180deg) scale(1); }
    }

    .collectible-card__front,
    .collectible-card__back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(21, 128, 43, 0.3);
    }

    .collectible-card__front {
      transform: rotateY(180deg);
    }

    .collectible-card__front img,
    .collectible-card__back img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Card Confetti */
    @keyframes card-confetti-fall {
      0% {
        transform: translateY(0) rotate(0deg) scale(1);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg) scale(0.5);
        opacity: 0;
      }
    }

    /* Collection Gallery */
    .card-collection {
      background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%);
      border-radius: var(--border-radius-xl);
      padding: var(--spacing-xl);
      margin: var(--spacing-xl) 0;
    }

    .card-collection__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
    }

    .card-collection__title {
      color: #f2ebd3;
      font-size: var(--font-size-xl);
      margin: 0;
    }

    .card-collection__count {
      color: #f2ebd3;
      font-weight: bold;
    }

    .card-collection__progress {
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--border-radius-full);
      margin-bottom: var(--spacing-lg);
      overflow: hidden;
    }

    .card-collection__progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #6b8c42 0%, #15802b 100%);
      border-radius: var(--border-radius-full);
      transition: width 0.5s ease;
    }

    .card-collection__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: var(--spacing-md);
    }

    .collection-card {
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .collection-card.collected:hover {
      transform: translateY(-5px) scale(1.05);
    }

    .collection-card.locked {
      cursor: default;
      opacity: 0.6;
    }

    .collection-card__inner {
      position: relative;
      aspect-ratio: 5/7;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }

    .collection-card__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .collection-card__image--locked {
      filter: grayscale(100%) brightness(0.5);
    }

    .collection-card__lock {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
    }

    .collection-card__name {
      color: white;
      text-align: center;
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-xs);
      font-weight: 500;
    }

    .card-collection__hint,
    .card-collection__complete {
      text-align: center;
      margin-top: var(--spacing-lg);
      color: rgba(255, 255, 255, 0.7);
    }

    .card-collection__complete {
      color: #6b8c42;
      font-weight: bold;
    }

    /* Interactive Card Viewer Modal */
    .card-viewer-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .card-viewer-modal.show {
      opacity: 1;
      visibility: visible;
    }

    .card-viewer-modal__backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
    }

    .card-viewer-modal__content {
      position: relative;
      text-align: center;
      padding: 2rem;
      animation: modal-bounce 0.5s ease;
    }

    .card-viewer-modal__close-btn {
      position: absolute;
      top: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      font-size: 2rem;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.3s ease, transform 0.3s ease;
      z-index: 10;
    }

    .card-viewer-modal__close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }

    .card-viewer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .card-viewer__card {
      width: 280px;
      height: 392px;
      perspective: 1000px;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .card-viewer__card:hover {
      transform: scale(1.02);
    }

    .card-viewer__inner {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .card-viewer__card.flipped .card-viewer__inner {
      transform: rotateY(180deg);
    }

    .card-viewer__front,
    .card-viewer__back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(21, 128, 43, 0.2);
    }

    .card-viewer__back {
      transform: rotateY(180deg);
    }

    .card-viewer__front img,
    .card-viewer__back img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .card-viewer__name {
      color: #f2ebd3;
      font-size: 1.8rem;
      font-weight: bold;
      margin: 0.5rem 0 0;
      text-shadow: 0 0 20px rgba(21, 128, 43, 0.5);
    }

    .card-viewer__hint {
      color: rgba(255, 255, 255, 0.6);
      font-size: 1rem;
      margin: 0;
    }

    .card-viewer__actions {
      margin-top: 1rem;
    }

    .card-viewer__actions .btn {
      border-color: rgba(255, 255, 255, 0.3);
      color: white;
    }

    .card-viewer__actions .btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }
  `;
  document.head.appendChild(cardStyle);
})();

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
      background: linear-gradient(90deg, #6b8c42 0%, #15802b 100%);
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

    /* Badge Gallery Styles */
    .badge-gallery {
      background: linear-gradient(135deg, #f5f0e6 0%, #f2ebd3 100%);
      border-radius: var(--border-radius-xl);
      padding: var(--spacing-xl);
      margin: var(--spacing-xl) 0;
      border: 2px solid #d4c9b0;
    }

    .badge-gallery__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
    }

    .badge-gallery__title {
      color: #15802b;
      font-size: var(--font-size-xl);
      margin: 0;
    }

    .badge-gallery__count {
      color: #6b8c42;
      font-weight: bold;
    }

    .badge-gallery__progress {
      height: 8px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: var(--border-radius-full);
      margin-bottom: var(--spacing-lg);
      overflow: hidden;
    }

    .badge-gallery__progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #6b8c42 0%, #15802b 100%);
      border-radius: var(--border-radius-full);
      transition: width 0.5s ease;
    }

    .badge-gallery__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--spacing-lg);
    }

    .badge-card {
      background: rgba(255, 255, 255, 0.7);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      transition: transform 0.3s ease, background 0.3s ease;
      border: 1px solid #d4c9b0;
    }

    .badge-card.earned {
      background: rgba(21, 128, 43, 0.1);
      border: 2px solid rgba(21, 128, 43, 0.4);
    }

    .badge-card.earned:hover {
      transform: translateY(-3px);
      background: rgba(21, 128, 43, 0.15);
    }

    .badge-card.locked {
      opacity: 0.6;
    }

    .badge-card__icon {
      position: relative;
      flex-shrink: 0;
    }

    .badge-card__emoji {
      font-size: 3rem;
    }

    .badge-card.locked .badge-card__emoji {
      filter: grayscale(100%);
    }

    .badge-card__lock {
      position: absolute;
      bottom: -5px;
      right: -5px;
      font-size: 1.2rem;
    }

    .badge-card__info {
      flex: 1;
    }

    .badge-card__name {
      color: #1f2937;
      font-size: var(--font-size-lg);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .badge-card.earned .badge-card__name {
      color: #15802b;
    }

    .badge-card__description {
      color: #6b7280;
      font-size: var(--font-size-sm);
      margin: 0;
    }

    .badge-card__requirement {
      color: #6b8c42;
      font-size: var(--font-size-xs);
      margin: var(--spacing-xs) 0 0 0;
      font-style: italic;
    }

    .badge-gallery__hint,
    .badge-gallery__complete {
      text-align: center;
      margin-top: var(--spacing-lg);
      color: #6b7280;
    }

    .badge-gallery__complete {
      color: #15802b;
      font-weight: bold;
    }

    /* Collection Page Hero */
    .collection-hero {
      background: linear-gradient(135deg, #15802b 0%, #1a472a 50%, #2d5a3d 100%);
      padding: var(--spacing-3xl) 0;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .collection-hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
        radial-gradient(circle at 20% 30%, rgba(242, 235, 211, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(107, 140, 66, 0.15) 0%, transparent 50%);
      pointer-events: none;
    }

    .collection-hero__title {
      color: #f2ebd3;
      font-size: 3rem;
      margin: 0 0 var(--spacing-md) 0;
      text-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
      position: relative;
      z-index: 1;
    }

    .collection-hero__subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: var(--font-size-lg);
      margin: 0;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      position: relative;
      z-index: 1;
    }

    @media (max-width: 768px) {
      .collection-hero__title {
        font-size: 2rem;
      }
      .collection-hero__subtitle {
        font-size: var(--font-size-base);
      }
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
