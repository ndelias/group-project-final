/**
 * Home page JavaScript
 */

document.addEventListener('DOMContentLoaded', async function() {
  const featuredContainer = document.getElementById('featured-animals');
  const mapContainer = document.querySelector('.map-container');
  const heroSlideshow = document.getElementById('hero-slideshow');
  const progressContainer = document.getElementById('progress-container');

  try {
    const animals = await Misunderstood.fetchAnimals();

    // Render progress tracker
    if (progressContainer && typeof ProgressTracker !== 'undefined') {
      progressContainer.innerHTML = ProgressTracker.renderProgressBar(animals.length);
    }

    // Render card collection gallery
    const cardCollectionContainer = document.getElementById('card-collection-container');
    if (cardCollectionContainer && typeof CardCollection !== 'undefined') {
      cardCollectionContainer.innerHTML = CardCollection.renderCollectionGallery(animals);
    }

    // Render hero slideshow with one image per animal
    if (heroSlideshow && animals.length > 0) {
      // Create slideshow images
      const slideshowHTML = animals.map((animal, index) => `
        <img
          src="${animal.image}"
          alt="${animal.name}"
          class="hero-slideshow__image ${index === 0 ? 'active' : ''}"
          data-name="${animal.name}"
          loading="${index === 0 ? 'eager' : 'lazy'}"
        >
      `).join('');

      heroSlideshow.innerHTML = slideshowHTML + `
        <div class="hero-slideshow__caption" id="hero-caption">${animals[0].name}</div>
      `;

      // Auto-advance slideshow
      const images = heroSlideshow.querySelectorAll('.hero-slideshow__image');
      const caption = document.getElementById('hero-caption');
      let currentIndex = 0;

      setInterval(() => {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('active');
        if (caption) {
          caption.textContent = images[currentIndex].dataset.name;
        }
      }, 3000); // Change every 3 seconds
    }
    
    // Render featured animals
    if (featuredContainer) {
      // Show 6 random featured animals
      const shuffled = [...animals].sort(() => 0.5 - Math.random());
      const featured = shuffled.slice(0, 6);
      
      featuredContainer.innerHTML = featured
        .map(animal => Misunderstood.createAnimalCard(animal))
        .join('');
      
      // Add click animations and setup slideshows
      const cards = featuredContainer.querySelectorAll('.card');
      cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
        Misunderstood.setupCardSlideshow(card);
      });
    }
    
    // Render map pins
    if (mapContainer) {
      // Clear any hardcoded sample pins
      const existingPins = mapContainer.querySelectorAll('.map-pin');
      existingPins.forEach(pin => pin.remove());
      
      // Loop through animals and create pins for those with location data
      animals.forEach(animal => {
        // Check if animal has location property
        if (animal.location && animal.location.top && animal.location.left) {
          const pin = document.createElement('button');
          pin.className = 'map-pin';
          pin.style.top = animal.location.top;
          pin.style.left = animal.location.left;
          pin.style.backgroundImage = `url(${animal.image})`;
          pin.setAttribute('data-name', animal.name);
          pin.setAttribute('data-tooltip', animal.name);
          pin.setAttribute('aria-label', `${animal.name} habitat`);
          pin.setAttribute('title', animal.name);
          
          // Add click handler to navigate to detail page
          pin.addEventListener('click', function() {
            window.location.href = `detail.html?id=${animal.id}`;
          });
          
          mapContainer.appendChild(pin);
        }
        // Optional: For testing, if no location exists, assign random position
        // else {
        //   const randomTop = Math.random() * 60 + 20; // 20% to 80%
        //   const randomLeft = Math.random() * 60 + 20; // 20% to 80%
        //   // Create pin with random position for testing
        // }
      });
    }
  } catch (error) {
    console.error('Error loading animals:', error);
    if (featuredContainer) {
      featuredContainer.innerHTML = `
        <div class="empty-state">
          <p class="empty-state__text">Failed to load featured animals. Please try again later.</p>
        </div>
      `;
    }
  }
});
