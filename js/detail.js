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
    
    // Create ecological benefits
    const benefitsHTML = animal.ecologicalBenefits
      .map(benefit => `<li class="impact-list__item">${benefit}</li>`)
      .join('');
    
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
    
    contentElement.innerHTML = `
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
      <section class="mb-3xl" aria-labelledby="facts-heading">
        <h2 id="facts-heading" class="mb-lg">Quick Facts</h2>
        <div class="detail-facts">
          ${factsHTML}
        </div>
      </section>
      
      <section class="impact-section mb-3xl" aria-labelledby="benefits-heading">
        <h2 id="benefits-heading" class="mb-lg">Ecological Benefits</h2>
        <ul class="impact-list">
          ${benefitsHTML}
        </ul>
      </section>
      
      <section class="mb-3xl" aria-labelledby="myths-heading">
        <h2 id="myths-heading" class="mb-lg">Myths vs Facts</h2>
        <p class="mb-lg" style="color: var(--color-text-light);">
          Click on each myth to reveal the scientific fact that debunks it.
        </p>
        ${mythsHTML}
      </section>
      
      <section class="sources-section" id="sources" aria-labelledby="sources-heading">
        <h2 id="sources-heading" class="mb-lg">Sources</h2>
        <p class="mb-md" style="color: var(--color-text-light);">
          All information on this page is backed by credible scientific sources.
        </p>
        <ul class="sources-list">
          ${sourcesHTML}
        </ul>
      </section>
      
      <div class="text-center mt-3xl">
        <a href="browse.html" class="btn btn--outline btn--lg">Browse All Animals</a>
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
