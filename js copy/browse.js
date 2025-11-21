/**
 * Browse page JavaScript - Filtering and search
 */

let allAnimals = [];
let filteredAnimals = [];

document.addEventListener('DOMContentLoaded', async function() {
  const animalsGrid = document.getElementById('animals-grid');
  const searchInput = document.getElementById('search-input');
  const categoryChips = document.querySelectorAll('.chip[data-category]');
  const emptyState = document.getElementById('empty-state');
  
  if (!animalsGrid) return;
  
  try {
    // Load animals
    allAnimals = await Misunderstood.fetchAnimals();
    
    // Get category from URL
    const categoryParam = Misunderstood.getURLParameter('cat');
    if (categoryParam) {
      // Set active chip based on URL
      categoryChips.forEach(chip => {
        if (chip.dataset.category === categoryParam) {
          chip.classList.add('chip--active');
          chip.setAttribute('aria-pressed', 'true');
        } else {
          chip.classList.remove('chip--active');
          chip.setAttribute('aria-pressed', 'false');
        }
      });
      filterAnimals(categoryParam, '');
    } else {
      filterAnimals('all', '');
    }
    
    // Search functionality
    if (searchInput) {
      const debouncedSearch = Misunderstood.debounce(function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const activeCategory = document.querySelector('.chip--active')?.dataset.category || 'all';
        filterAnimals(activeCategory, searchTerm);
      }, 300);
      
      searchInput.addEventListener('input', debouncedSearch);
    }
    
    // Category filter functionality
    categoryChips.forEach(chip => {
      chip.addEventListener('click', function() {
        // Update active state
        categoryChips.forEach(c => {
          c.classList.remove('chip--active');
          c.setAttribute('aria-pressed', 'false');
        });
        this.classList.add('chip--active');
        this.setAttribute('aria-pressed', 'true');
        
        // Update URL
        const category = this.dataset.category;
        const newURL = category === 'all' 
          ? 'browse.html' 
          : `browse.html?cat=${category}`;
        window.history.pushState({}, '', newURL);
        
        // Filter animals
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        filterAnimals(category, searchTerm);
      });
    });
    
  } catch (error) {
    animalsGrid.innerHTML = `
      <div class="empty-state">
        <p class="empty-state__text">Failed to load animals. Please try again later.</p>
      </div>
    `;
  }
});

function filterAnimals(category, searchTerm) {
  const animalsGrid = document.getElementById('animals-grid');
  const emptyState = document.getElementById('empty-state');
  
  // Filter by category
  if (category === 'all') {
    filteredAnimals = [...allAnimals];
  } else {
    filteredAnimals = allAnimals.filter(animal => animal.category === category);
  }
  
  // Filter by search term
  if (searchTerm) {
    filteredAnimals = filteredAnimals.filter(animal => {
      const searchableText = `${animal.name} ${animal.scientificName} ${animal.quickFacts.join(' ')}`.toLowerCase();
      return searchableText.includes(searchTerm);
    });
  }
  
  // Render results
  if (filteredAnimals.length === 0) {
    animalsGrid.classList.add('hidden');
    emptyState.classList.remove('hidden');
  } else {
    animalsGrid.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    animalsGrid.innerHTML = filteredAnimals
      .map((animal, index) => {
        const card = Misunderstood.createAnimalCard(animal);
        // Add animation delay for staggered effect
        return card.replace('class="card fade-in"', `class="card fade-in" style="animation-delay: ${index * 0.05}s"`);
      })
      .join('');
    
    // Setup slideshows for all cards
    const cards = animalsGrid.querySelectorAll('.card');
    cards.forEach(card => {
      Misunderstood.setupCardSlideshow(card);
    });
  }
}
