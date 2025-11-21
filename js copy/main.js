/**
 * Main JavaScript - Shared functionality
 */

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
      <div class="card__image-container">
        <div class="card__image-slideshow" data-images='${JSON.stringify(images)}'>
          ${imagesHTML}
        </div>
      </div>
      <div class="card__body">
        <h3 class="card__title">
          <a href="detail.html?id=${animal.id}" style="color: inherit; text-decoration: none;">
            ${animal.name}
          </a>
        </h3>
        <p class="card__text">${animal.scientificName}</p>
        <p class="card__text">${animal.quickFacts[0]}</p>
      </div>
      <div class="card__footer">
        <span class="badge ${badgeClass}">${formatCategory(animal.category)}</span>
        <a href="detail.html?id=${animal.id}" class="btn btn--primary">
          Learn More
        </a>
      </div>
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
