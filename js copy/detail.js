/**
 * Detail page JavaScript
 */

document.addEventListener('DOMContentLoaded', async function() {
  const animalId = Misunderstood.getURLParameter('id');
  const loadingElement = document.querySelector('.loading');
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
    if (loadingElement) loadingElement.classList.add('hidden');
    if (contentElement) contentElement.classList.add('hidden');
    if (notFoundElement) notFoundElement.classList.remove('hidden');
  }
  
  function renderAnimalDetail(animal) {
    if (loadingElement) loadingElement.classList.add('hidden');
    if (notFoundElement) notFoundElement.classList.add('hidden');
    if (contentElement) contentElement.classList.remove('hidden');
    
    const badgeClass = Misunderstood.getCategoryBadgeClass(animal.category);
    
    // Create myths accordions
    const mythsHTML = animal.myths
      .map((myth, index) => Misunderstood.createAccordion(myth, index))
      .join('');
    
    // Create quick facts
    const factsHTML = animal.quickFacts
      .map(fact => `
        <div class="fact-card">
          <div class="fact-card__title">Quick Fact</div>
          <div class="fact-card__content">${fact}</div>
        </div>
      `)
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
    const slideshowHTML = Misunderstood.createSlideshowHTML(images, animal.name);
    
    contentElement.innerHTML = `
      <div class="detail-header fade-in">
        <div class="detail-image-container">
          ${slideshowHTML}
        </div>
        <h1>${animal.name}</h1>
        <p class="text-center" style="color: var(--color-text-light); font-size: var(--font-size-lg);">
          <em>${animal.scientificName}</em>
        </p>
        <div class="text-center mt-md">
          <span class="badge ${badgeClass}">${Misunderstood.formatCategory(animal.category)}</span>
        </div>
      </div>
      
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
    `;
    
    // Setup accordions
    const accordions = contentElement.querySelectorAll('.accordion');
    accordions.forEach(accordion => {
      Misunderstood.setupAccordion(accordion);
    });
    
    // Setup slideshow
    const slideshow = contentElement.querySelector('.slideshow');
    if (slideshow) {
      Misunderstood.setupDetailSlideshow(slideshow);
      // Make slideshow focusable for keyboard navigation
      slideshow.setAttribute('tabindex', '0');
    }
    
    // Update page title
    document.title = `${animal.name} — Misunderstood`;
    
    // Add fade-in animation
    contentElement.classList.add('fade-in');
  }
});
