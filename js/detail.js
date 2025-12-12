/**
 * Detail page JavaScript
 */

document.addEventListener('DOMContentLoaded', async function() {
  const animalId = Misunderstood.getURLParameter('id');
  const contentElement = document.getElementById('animal-content');
  const notFoundElement = document.getElementById('not-found');
  
  if (!animalId) {
    showNotFound();
    return;
  }
  
  try {
    const animals = await Misunderstood.fetchAnimals();
    const animal = animals.find(a => a.id === animalId);
    
    if (!animal) {
      showNotFound();
      return;
    }
    
    renderAnimalDetail(animal);

    // Track this animal visit for progress
    if (typeof ProgressTracker !== 'undefined') {
      ProgressTracker.visitAnimal(animal.id);
    }

    // Collect the card when user scrolls to bottom (only triggers if not already collected)
    if (typeof CardCollection !== 'undefined' && animal.cardImage && !CardCollection.hasCard(animal.id)) {
      let cardAwarded = false;

      const checkScrollPosition = () => {
        if (cardAwarded) return;

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;

        // Check if user has scrolled to within 100px of the bottom
        if (scrollTop + clientHeight >= scrollHeight - 100) {
          cardAwarded = true;
          window.removeEventListener('scroll', checkScrollPosition);
          // Small delay for dramatic effect
          setTimeout(() => {
            CardCollection.collectCard(animal);
          }, 500);
        }
      };

      window.addEventListener('scroll', checkScrollPosition);
      // Also check immediately in case page is short
      setTimeout(checkScrollPosition, 1000);
    }

  } catch (error) {
    console.error('Error loading animal:', error);
    showNotFound();
  }
  
  function showNotFound() {
    if (contentElement) contentElement.classList.add('hidden');
    if (notFoundElement) notFoundElement.classList.remove('hidden');
  }
  
  function renderAnimalDetail(animal) {
    if (notFoundElement) notFoundElement.classList.add('hidden');
    if (contentElement) contentElement.classList.remove('hidden');
    
    const badgeClass = Misunderstood.getCategoryBadgeClass(animal.category);
    
    // Create myths accordions
    const mythsHTML = animal.myths
      .map((myth, index) => Misunderstood.createAccordion(myth, index))
      .join('');
    
    // Function to generate a one-word category for each fact
    function generateFactCategory(fact) {
      const lowerFact = fact.toLowerCase();
      
      if (lowerFact.includes('diet') || lowerFact.includes('eat') || lowerFact.includes('food') || lowerFact.includes('prey')) {
        return 'Diet';
      } else if (lowerFact.includes('help') || lowerFact.includes('balance') || lowerFact.includes('control') || lowerFact.includes('maintain')) {
        return 'Role';
      } else if (lowerFact.includes('threat') || lowerFact.includes('danger') || lowerFact.includes('risk') || lowerFact.includes('bite') || lowerFact.includes('attack')) {
        return 'Safety';
      } else if (lowerFact.includes('size') || lowerFact.includes('length') || lowerFact.includes('weight') || lowerFact.includes('measure')) {
        return 'Size';
      } else if (lowerFact.includes('habitat') || lowerFact.includes('live') || lowerFact.includes('found') || lowerFact.includes('location')) {
        return 'Habitat';
      } else if (lowerFact.includes('pollinate') || lowerFact.includes('seed') || lowerFact.includes('plant')) {
        return 'Ecology';
      } else if (lowerFact.includes('disease') || lowerFact.includes('rabies') || lowerFact.includes('carry') || lowerFact.includes('spread')) {
        return 'Health';
      } else if (lowerFact.includes('behavior') || lowerFact.includes('play') || lowerFact.includes('avoid') || lowerFact.includes('threaten')) {
        return 'Behavior';
      } else {
        return 'Fact';
      }
    }
    
    // Create quick facts with icons for Bento Grid
    const factIcons = ['📏', '🥩', '🏠', '💡', '🌍', '⚡', '👁️', '🦶', '💨', '🌡️', '🎯', '🔬'];
    const factsHTML = animal.quickFacts
      .map((fact, index) => {
        const icon = factIcons[index % factIcons.length];
        const category = generateFactCategory(fact);
        return `
          <div class="fact-card">
            <div class="fact-card__header">
              <div class="fact-card__icon">${icon}</div>
              <div class="fact-card__title">${category}</div>
            </div>
            <div class="fact-card__text">
              <div class="fact-card__content">${fact}</div>
            </div>
          </div>
        `;
      })
      .join('');
    
    // Create how they help section (was ecologicalBenefits)
    const helpItems = animal.howTheyHelp || animal.ecologicalBenefits || [];
    const benefitsHTML = helpItems
      .map(benefit => `<li class="impact-list__item">${benefit}</li>`)
      .join('');

    // Create fun fact callout
    const funFactHTML = animal.funFact ? `
      <div class="fun-fact-callout">
        <span class="fun-fact-callout__emoji">🤯</span>
        <div class="fun-fact-callout__content">
          <strong>Mind-Blowing Fact!</strong>
          <p>${animal.funFact}</p>
        </div>
      </div>
    ` : '';
    
    // Create sources
    const sourcesHTML = animal.sources
      .map(source => `
        <li class="sources-list__item">
          <a href="${source.url}" target="_blank" rel="noopener noreferrer">
            ${source.title}
          </a>
        </li>
      `)
      .join('');
    
    const images = animal.images || [animal.image];
    const heroImage = images[0] || animal.image;

    // Create photo gallery HTML (uses images 1-4, skipping hero image)
    const galleryImages = images.slice(1, 5);
    const photoGalleryHTML = galleryImages.length > 0 ? `
      <section class="photo-gallery mb-3xl" aria-labelledby="gallery-heading">
        <h2 id="gallery-heading" class="mb-lg">📸 Photo Gallery</h2>
        <div class="photo-gallery__grid">
          ${galleryImages.map((img, index) => `
            <div class="photo-gallery__item photo-gallery__item--${index + 1}">
              <img src="${img}" alt="${animal.name} photo ${index + 2}" class="photo-gallery__image" loading="lazy">
            </div>
          `).join('')}
        </div>
      </section>
    ` : '';

    // Create feature images row - all images with captions in one row
    const featureImages = images.slice(1, 4); // Get up to 3 additional images
    const captions = [
      `Look at this amazing ${animal.name.split(' ').pop()}! 🤩`,
      `Nature is pretty cool, right? 🌿`,
      `What a beautiful creature! 💚`
    ];

    const featureImagesRowHTML = featureImages.length > 0 ? `
      <div class="feature-images-row mb-3xl">
        ${featureImages.map((img, index) => `
          <div class="feature-image">
            <img src="${img}" alt="${animal.name}" class="feature-image__img" loading="lazy">
            <div class="feature-image__caption">${captions[index] || captions[0]}</div>
          </div>
        `).join('')}
      </div>
    ` : '';

    contentElement.innerHTML = `
      <style>
        /* Photo Gallery Styles */
        .photo-gallery__grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
        }

        .photo-gallery__item {
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: var(--border-thick) solid var(--pine);
          box-shadow: var(--shadow-1);
          transition: transform 0.3s ease;
        }

        .photo-gallery__item:hover {
          transform: scale(1.02);
        }

        .photo-gallery__item--1 {
          grid-column: span 1;
          grid-row: span 1;
        }

        .photo-gallery__item--2 {
          grid-column: span 1;
          grid-row: span 1;
        }

        .photo-gallery__item--3 {
          grid-column: span 1;
        }

        .photo-gallery__item--4 {
          grid-column: span 1;
        }

        .photo-gallery__image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }

        /* Feature Images Row */
        .feature-images-row {
          display: flex;
          gap: var(--spacing-lg);
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Feature Image Styles */
        .feature-image {
          background: var(--parchment);
          border: var(--border-thick) solid var(--pine);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-1);
          flex: 1;
          min-width: 280px;
          max-width: 350px;
        }

        .feature-image__img {
          width: 100%;
          height: 280px;
          object-fit: cover;
          display: block;
        }

        .feature-image__caption {
          padding: var(--spacing-md);
          text-align: center;
          font-weight: var(--font-weight-bold);
          color: var(--pine);
          background: var(--sand);
          border-top: var(--border-thick) solid var(--pine);
        }

        /* Compact fact cards for detail page */
        .detail-facts .fact-card {
          aspect-ratio: auto;
          padding: var(--spacing-md);
        }

        .detail-facts .fact-card__content {
          font-size: var(--font-size-base);
        }

        /* Fun section dividers */
        .section-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
          margin: var(--spacing-2xl) 0;
          font-size: 2rem;
        }

        .section-divider__line {
          flex: 1;
          height: 4px;
          background: linear-gradient(90deg, transparent, var(--pine), transparent);
          border-radius: 2px;
        }

        @media (max-width: 768px) {
          .photo-gallery__grid {
            grid-template-columns: 1fr;
          }

          .photo-gallery__item--1,
          .photo-gallery__item--2 {
            grid-column: span 1;
          }

          .feature-images-row {
            flex-direction: column;
            align-items: center;
          }

          .feature-image {
            max-width: 100%;
            min-width: auto;
          }

          .feature-image__img {
            height: 200px;
          }
        }
      </style>

      <div class="detail-hero">
        <div class="detail-image-container">
          <img src="${heroImage}" alt="${animal.name}" class="detail-hero__image">
        </div>
        <div class="detail-hero__overlay"></div>
        <div class="detail-hero__content">
          <h1 class="detail-hero__title">${animal.name}</h1>
          <p class="detail-hero__scientific-name">
            <em>${animal.scientificName}</em>
          </p>
          <span class="badge ${badgeClass} detail-hero__badge">${Misunderstood.formatCategory(animal.category)}</span>
        </div>
      </div>

      <div class="container">
      ${funFactHTML}

      ${photoGalleryHTML}

      <div class="section-divider" aria-hidden="true">
        <span class="section-divider__line"></span>
        <span>🎓</span>
        <span class="section-divider__line"></span>
      </div>

      <section class="mb-3xl" aria-labelledby="facts-heading">
        <h2 id="facts-heading" class="mb-lg">Cool Facts! 📚</h2>
        <div class="detail-facts">
          ${factsHTML}
        </div>
      </section>

      ${featureImagesRowHTML}

      <section class="impact-section mb-3xl" aria-labelledby="benefits-heading">
        <h2 id="benefits-heading" class="mb-lg">How They Help Us 🌍</h2>
        <ul class="impact-list">
          ${benefitsHTML}
        </ul>
      </section>

      <div class="section-divider" aria-hidden="true">
        <span class="section-divider__line"></span>
        <span>💡</span>
        <span class="section-divider__line"></span>
      </div>

      <section class="mb-3xl" aria-labelledby="myths-heading">
        <h2 id="myths-heading" class="mb-lg">Myth Busters! 💥</h2>
        <p class="mb-lg" style="color: var(--color-text-light);">
          Think you know the truth? Tap each myth to reveal what's really going on!
        </p>
        ${mythsHTML}
      </section>

      <section class="sources-section" id="sources" aria-labelledby="sources-heading">
        <h2 id="sources-heading" class="mb-lg">Want to Learn More? 🔍</h2>
        <p class="mb-md" style="color: var(--color-text-light);">
          Check out these awesome resources to become an even bigger expert!
        </p>
        <ul class="sources-list">
          ${sourcesHTML}
        </ul>
      </section>

      <div class="text-center mt-3xl">
        <a href="browse.html" class="btn btn--outline btn--lg">← Back to All Animals</a>
      </div>
      </div>
    `;
    
    // Setup accordions
    const accordions = contentElement.querySelectorAll('.accordion');
    accordions.forEach(accordion => {
      Misunderstood.setupAccordion(accordion);
    });
    
    // Update page title
    document.title = `${animal.name} — Misunderstood`;
    
    // Add fade-in animation
    contentElement.classList.add('fade-in');
  }
});
