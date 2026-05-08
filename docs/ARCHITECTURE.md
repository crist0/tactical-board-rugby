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
- **playStore** - Manages players and ball state as the canonical tactical element model (bench/field location + coordinates)
- **uiStore** - UI shell state for panel visibility (`isRightSidebarOpen`, `isTimelineOpen`), zoom (`zoomLevel`, constrained from 1.0x to 3.0x), and pan (`panX`, `panY`) for drag navigation
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
Responsive scaling is handled natively in CSS with `aspect-ratio: 124 / 74`, mapped to a `1240 x 740` SVG viewBox.
This dimension includes the 100m playing field, two 10m in-goal areas, and a 2m run-off boundary on all sides while preserving real-world rugby proportions at all viewport sizes.
The zoom system is centralized in `uiStore` and applied to the field container through CSS transforms, constrained between `1.0x` and `3.0x`.
`uiStore` also manages drag pan coordinates (`panX`, `panY`), with strict mathematical clamping based on current `zoomLevel` and container dimensions to prevent dragging the field out of the visible viewport.

#### Visual Indicators
Optional visual overlays are rendered as independent SVG layers so they remain synchronized with field scaling and panning.
`FieldGrid.vue` implements a 5m alignment grid over the playable and in-goal area only (`x: 20 -> 1220`, `y: 20 -> 720`) using 50-unit spacing on the `1240 x 740` field coordinate system.
Grid visibility is controlled globally in Pinia by `uiStore.showGrid`, toggled through `uiStore.toggleGrid()`.

Hover coordinates are computed in real-world meters from the field SVG space with this mapping:
- `1m = 10 SVG units`
- `xMeters = (svgX - 20) / 10`
- `yMeters = (svgY - 20) / 10`

The `20`-unit offset accounts for the run-off boundary before the playable/in-goal region begins, so displayed coordinates align with rugby field measurement origin at the top-left of the in-bounds field area.

### Data Models & playStore
`src/stores/playStore.js` is the single source of truth for tactical element state, including each element's coordinates (`x`, `y`) and placement status (`location`, e.g. `'bench'` or `'field'`).

`Player` model:
- `id: string` (`A1` -> `A15`, `B1` -> `B15`)
- `number: number` (`1` -> `15`)
- `team: 'A' | 'B'`
- `color: string` (Team A `#0055ff`, Team B `#ff2222`)
- `location: 'bench' | 'field'`
- `x: number`
- `y: number`

`Ball` model:
- `id: 'ball'`
- `location: string` (initialized as `'center'`)
- `x: number`
- `y: number`
- `color: string` (`#ffffff`)

`src/stores/uiStore.js` also controls dynamic tactical element sizing via `playerSize` (meters). Element render size is converted to SVG units at runtime with `sizeUnits = playerSize * 10`, preserving the global mapping `1m = 10 units`.

### Drag & Drop Strategy
The board uses a hybrid approach for drag interactions:
- **Bench -> Field:** Native HTML5 drag and drop (`dragstart`, `dataTransfer`, `drop`) is used to move a player or the ball from bench components into field coordinates.
- **In-Field Movement:** Custom mouse-event dragging is used for smooth frame-by-frame repositioning (`mousedown` on element, global `mousemove`/`mouseup`) with all pointer coordinates converted through SVG matrices (`getScreenCTM().inverse()`).

Field tactical elements are rendered inside the field SVG through `<foreignObject>` nodes under `#field-elements`, allowing Vue component visuals (`Player.vue`, `Ball.vue`) to stay consistent while their positions remain in SVG coordinate space.

## Development Phases
See ROADMAP.txt for detailed phase breakdown.
