/**
 * Home page JavaScript
 */

document.addEventListener('DOMContentLoaded', async function() {
  const featuredContainer = document.getElementById('featured-animals');
  
  if (!featuredContainer) return;
  
  try {
    const animals = await Misunderstood.fetchAnimals();
    
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
  } catch (error) {
    featuredContainer.innerHTML = `
      <div class="empty-state">
        <p class="empty-state__text">Failed to load featured animals. Please try again later.</p>
      </div>
    `;
  }
});
