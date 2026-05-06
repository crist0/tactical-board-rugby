# Project Architecture

## Overview
Tactical Board Rugby is a Vue 3 application for creating and animating rugby plays using a keyframe-based system.

## Technology Stack
- **Framework:** Vue.js 3 (Composition API)
- **Build Tool:** Vite
- **State Management:** Pinia
- **Styling:** SCSS
- **Icons:** Lucide Vue
- **Reactive Utilities:** @vueuse/core (reactivity, LocalStorage, and complex drag/drop interactions via `useDraggable`)
- **Storage:** LocalStorage (future: IndexedDB)
- **ID Generation:** Native Web API `crypto.randomUUID()` (no UUID library dependency)

## Project Structure

### /src/components
Organized by feature/module:
- **layout/** - Main layout components (header, sidebars, footer)
- **field/** - Rugby field rendering components
- **players/** - Player-related components
- **ball/** - Ball component
- **controls/** - UI controls (playback, zoom, etc.)
- **annotations/** - Drawing tools (arrows, lines, text, markers)

### /src/composables
Reusable composition functions following Vue 3 best practices.

### /src/stores
Pinia stores for global state management:
- **playStore** - Manages plays, keyframes, and element positions
- **uiStore** - UI shell state for panel visibility, including `isRightSidebarOpen` and `isTimelineOpen`
- **playbackStore** - Animation playback control

### /src/utils
Utility functions and constants.

### /src/assets/styles
Global styles and SCSS variables.

## Design Principles
1. **Component Organization:** By feature/module for better scalability
2. **State Management:** Centralized with Pinia for complex state
3. **Styling:** SCSS with global variables for consistency
4. **Composition API:** Leverage Vue 3's composition API for logic reuse
5. **Type Safety:** JSDoc comments for better IDE support (no TypeScript)

### Layout Strategy
The root application layout in `src/App.vue` follows a strict CSS Grid App Shell strategy.
The shell is locked to `100vw` by `100vh` with `overflow: hidden`, which prevents page-level scrolling and keeps layout behavior deterministic.
This ensures the center field canvas can expand and scale inside the available viewport space without pushing the full document beyond the screen.
Collapsible bench and timeline panels are animated natively by transitioning CSS Grid track sizes (`grid-template-columns` and `grid-template-rows`) instead of relying on manual width/height animations.

### Rendering Strategy
The field and tactical elements are rendered with a reactive DOM/Vue component approach rather than a native HTML5 `canvas`.
This keeps element positioning and interaction workflows aligned with Vue reactivity for upcoming drag-and-drop behavior.
Responsive scaling is handled natively in CSS with `aspect-ratio: 120 / 70`, mapped to a `1200 x 700` SVG viewBox.
This dimension includes the 100m playing field plus two 10m in-goal areas while preserving real-world rugby proportions at all viewport sizes.

## Development Phases
See ROADMAP.txt for detailed phase breakdown.
