# Astro_web

Welcome to the Astro_web project! This is a dynamic React-based web application providing a platform for space enthusiasts. It features a modern, cosmic-themed design with interactive dashboards, sky maps, and educational workshops.

## Project Structure

```
Astro_web/
├── index.html        # Entry HTML file
├── package.json      # Project dependencies and scripts
├── vite.config.js    # Vite bundler configuration
├── src/              # Main source code directory
│   ├── index.css     # Global styles and design system
│   ├── App.css       # App-specific styles
│   ├── main.jsx      # React entry point
│   ├── App.jsx       # Root component handling routing and layout
│   ├── components/   # Reusable UI components (Sidebar, Topbar, Dashboard, etc.)
│   ├── services/     # Backend integration and API services (e.g., api.js)
│   └── assets/       # Static assets like images and icons
├── public/           # Publicly served assets
└── dist/             # Production build output (generated upon build)
```

## Features

- **Dashboard**: A central hub for club statistics and updates.
- **Magazine**: Read articles and featured posts about astronomy.
- **Sky Map**: Interactive tools for exploring the night sky.
- **Workshops**: Browse, search, and join live or archived educational workshops (Data driven by mock API backend).
- **Authentication**: Login and Account management pages ready for backend integration.

## Getting Started

1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Build for production: `npm run build`

## Design System

The application uses a custom cosmic-themed design system centered around `index.css`, employing modern CSS features like CSS variables, flexbox, grid, and glassmorphism for a premium aesthetic.
