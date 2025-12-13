# Misunderstood

An educational web application dedicated to debunking myths about commonly misunderstood animals. Learn the truth about sharks, bats, wolves, spiders, and more!

## Features

### Core Features

- **Interactive Animal Browser** - Browse and filter animals by myth category (Dangerous, Dirty/Diseased, Useless/Nuisance)
- **Detailed Animal Pages** - Each animal has a dedicated page with:
  - Photo gallery
  - Quick facts with categorized info cards
  - Myth Busters accordion sections revealing the truth
  - Ecological benefits explaining how they help our world
  - Cited sources for all information
- **Interactive World Map** - Visual map on the homepage showing where each animal can be found globally
- **Myth vs Fact Quiz** - Swipe-based quiz game to test your knowledge with:
  - Card flip animations
  - Score tracking with personal best
  - Immediate feedback on answers

### Gamification Features

- **Collectible Cards** - Earn unique animal cards by exploring animal pages
- **Achievement Badges** - Unlock badges for completing various activities
- **Collection Page** - View all your collected cards and earned badges
- **Progress Tracking** - Track your exploration progress across the site

### Additional Features

- **Submit an Animal** - Community submission form to suggest new misunderstood animals
- **Responsive Design** - Fully responsive layout that works on desktop, tablet, and mobile
- **Accessibility** - WCAG compliant with keyboard navigation and screen reader support
- **Fun Animations** - Floating animal stickers, confetti celebrations, and smooth transitions

## Team Members

| Name | Role |
|------|------|
| Nahuel Delias | Developer & Designer |
| Joanna | Developer & Designer |

## Setup Instructions

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional, for development)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd group-project-final
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - Or use a local development server:
     ```bash
     # Using Python
     python -m http.server 8000

     # Using Node.js (npx)
     npx serve

     # Using VS Code
     # Install "Live Server" extension and click "Go Live"
     ```

3. **Navigate the site**
   - Start at the homepage to see the interactive map
   - Click on animals to learn more
   - Take the quiz to test your knowledge
   - Check your collection to see earned cards and badges

### Project Structure

```
group-project-final/
├── index.html          # Homepage with interactive map
├── browse.html         # Animal browsing page with filters
├── detail.html         # Individual animal detail template
├── quiz.html           # Interactive myth vs fact quiz
├── collection.html     # User's collected cards and badges
├── submit.html         # Community animal submission form
├── about.html          # About page with mission and sources
├── design-system/      # CSS architecture
│   ├── main.css        # Main stylesheet (imports all)
│   ├── tokens.css      # Design tokens (colors, spacing, etc.)
│   ├── base.css        # Base styles and resets
│   └── components.css  # Reusable component styles
├── js/                 # JavaScript modules
│   ├── main.js         # Core functionality and utilities
│   ├── detail.js       # Animal detail page logic
│   ├── quiz.js         # Quiz game functionality
│   ├── collection.js   # Collection page management
│   └── submit.js       # Form validation and submission
├── data/               # JSON data files
│   ├── animals.json    # Animal information and metadata
│   └── quiz.json       # Quiz questions and answers
└── images/             # Image assets
    ├── animal sticks/  # Animal sticker illustrations
    ├── Collectible Card/ # Collectible card designs
    └── [animal folders]/ # Photos for each animal
```

## Technologies Used

- **HTML5** - Semantic markup with accessibility features
- **CSS3** - Custom properties, Flexbox, Grid, animations
- **Vanilla JavaScript** - No frameworks, pure JS for all interactivity
- **JSON** - Data storage for animals and quiz content
- **LocalStorage** - Persistent storage for user progress and collections

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Credits

All animal facts are sourced from reputable scientific organizations including:
- National Geographic
- Smithsonian Institution
- National Wildlife Federation
- Bat Conservation International
- International Wolf Center
- NOAA Fisheries

---

Made with love for misunderstood animals everywhere.
