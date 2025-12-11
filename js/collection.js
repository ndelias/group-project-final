/**
 * Collection page JavaScript
 */

document.addEventListener('DOMContentLoaded', async function() {
  const cardCollectionContainer = document.getElementById('card-collection-container');
  const badgeCollectionContainer = document.getElementById('badge-collection-container');
  const progressContainer = document.getElementById('progress-container');

  try {
    const animals = await Misunderstood.fetchAnimals();

    // Store animals data for the card viewer
    if (typeof CardCollection !== 'undefined') {
      CardCollection.setAnimalsData(animals);
    }

    // Render overall progress
    if (progressContainer && typeof ProgressTracker !== 'undefined') {
      progressContainer.innerHTML = ProgressTracker.renderProgressBar(animals.length);
    }

    // Render card collection with interactive mode enabled
    if (cardCollectionContainer && typeof CardCollection !== 'undefined') {
      cardCollectionContainer.innerHTML = CardCollection.renderCollectionGallery(animals, true);
    }

    // Render badge collection
    if (badgeCollectionContainer && typeof ProgressTracker !== 'undefined') {
      badgeCollectionContainer.innerHTML = ProgressTracker.renderBadgeGallery();
    }

  } catch (error) {
    console.error('Error loading collection:', error);
    if (cardCollectionContainer) {
      cardCollectionContainer.innerHTML = `
        <div class="empty-state">
          <p class="empty-state__text">Failed to load your collection. Please try again later.</p>
        </div>
      `;
    }
    if (badgeCollectionContainer) {
      badgeCollectionContainer.innerHTML = `
        <div class="empty-state">
          <p class="empty-state__text">Failed to load your badges. Please try again later.</p>
        </div>
      `;
    }
  }
});
