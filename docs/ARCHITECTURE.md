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
- `color: string` (Team A `#0055ff`, Team B `#ff2222`) - DEPRECATED: See `teamAColor` and `teamBColor`.
- `location: 'bench' | 'field'`
- `x: number`
- `y: number`

The store also holds `teamAColor` and `teamBColor` as state properties, which are persisted to LocalStorage to maintain color selections across sessions.

A "Logical Guard" in the `playStore` ensures that no two players with the same `team` and `number` can be on the `'field'` at the same time.

`Ball` model:
- `id: 'ball'`
- `location: string` (initialized as `'center'`)
- `x: number`
- `y: number`
- `color: string` (`#ffffff`)

`src/stores/uiStore.js` also controls dynamic tactical element sizing. 1 Meter = 10 SVG Units. Element size is controlled globally via uiStore.playerSize, where the value directly maps to SVG units (Value * 10).

### Drag & Drop Strategy
The board uses a hybrid approach for drag interactions:
- **Bench -> Field:** Native HTML5 drag and drop (`dragstart`, `dataTransfer`, `drop`) is used to move a player or the ball from bench components into field coordinates. To ensure a clean, circular drag preview without the browser's default square background, a custom drag image is generated on `dragstart`. A clone of the dragged element is created, styled with a transparent background, appended to the body, and then set as the drag image using `event.dataTransfer.setDragImage()`. The cloned element is removed from the body immediately after.
- **In-Field Movement:** Custom mouse-event dragging is used for smooth frame-by-frame repositioning (`mousedown` on element, global `mousemove`/`mouseup`) with all pointer coordinates converted through SVG matrices (`getScreenCTM().inverse()`). To prevent elements from being dragged outside the visible field boundaries, their coordinates are clamped within the valid SVG coordinate space (`0` to `1240` for `x`, `0` to `740` for `y`).
- **Return to Bench:** Double-clicking a player or the ball on the field instantly returns it to the bench via the `playStore.returnToBench` action.
- **Ghost System:** The bench displays all players and the ball, even those on the field. Fielded items appear as "ghosts" (semi-transparent, grayscale) and are not draggable. Double-clicking a ghost element returns it to the bench, making it draggable again.
- **Reset Board:** A "Reset Board" button in the RightSidebar allows the user to return all players and the ball to the bench, after a confirmation.



Field tactical elements are rendered inside the field SVG through `<foreignObject>` nodes under `#field-elements`, allowing Vue component visuals (`Player.vue`, `Ball.vue`) to stay consistent while their positions remain in SVG coordinate space.

## Linked State

The ball can be "linked" to a player so that it automatically follows its carrier during drag operations. This is managed through the `linkedTo` property on the ball object.

- **`ball.linkedTo: string | null`** — Stores the player ID (e.g. `A5`) of the player currently carrying the ball, or `null` if the ball is independent.
- **`playStore.linkBallToPlayer(playerId)`** — Links the ball to a specific player. Passing `null` unlinks the ball.
- **Position Synchronization:** When `updateItemPosition` is called on a player, the store checks `ball.linkedTo`. If the ball is linked to that player and the ball is on the field, the ball's position is automatically set relative to the player (offset to the right by 15 SVG units). This ensures the ball visually follows its carrier without requiring a separate `updateItemPosition` call for the ball.
- **Defensive Override:** If the ball itself is dragged while linked, its position is recalculated from the linked player's position rather than using the raw mouse coordinates. This prevents the ball from detaching during manual movement.
- **Cleanup:** When a linked player is returned to the bench, the ball's `linkedTo` is automatically cleared. Similarly, returning the ball to the bench clears its `linkedTo`.
- **Reset Behaviour:** `resetBoard()` clears all links by setting `ball.linkedTo = null`.

## Rendering Order (Z-Index)

SVG renders child elements in document order — elements declared later in the DOM appear visually on top of earlier ones. The field's `#field-elements` `<g>` group uses a single `v-for` over a `sortedElements` computed property to establish a predictable 4-tier stacking hierarchy:

| Priority | Layer | Condition | Example |
|---|---|---|---|
| 0 (bottom) | Default | No special state | Stationary players without the ball |
| 1 | Highlighted | `item.id === highlightedPlayerId` | Player glowing during ball proximity detection |
| 2 | Active Drag | `item.isDragging` | Player or ball being moved by the user |
| 3 (top) | Ball Carrier | `playStore.ball.linkedTo === item.id` | Player currently holding the ball |

The sort is ascending: priority-0 elements are rendered first (backmost), priority-3 elements are rendered last (topmost). This ensures:
- The ball carrier is always visible above other players.
- The element being dragged stays on top of everything else for a smooth visual experience.
- The highlighted target player is visible above static elements but below the dragged item.
- The priority calculation is reactive via Vue's computed dependency tracking — any change to `isDragging`, `highlightedPlayerId`, or `ball.linkedTo` triggers a re-sort.

#### Chronological Stack (Phase 4)
Within each priority tier, elements are further ordered by a `lastMovedTimestamp` (a numeric timestamp updated on every drag end). This chronological refinement ensures:

- **The Ball is always on top** — it occupies its own priority tier (tier 3) alongside the ball carrier, but within that tier the ball element sorts last.
- **The Linked Player** sits directly beneath the ball within tier 3.
- **Most Recently Dragged items** float above less recently interacted elements within the same tier. If two players share priority tier 0 (both stationary and unhighlighted), the one dragged most recently renders on top.

This chronological stack prevents stale elements from obscuring active ones and keeps the visual hierarchy predictable during rapid drag interactions.

### Hitbox Management
`<foreignObject>` nodes used to render Vue components inside the field SVG have their `width` and `height` kept strictly proportional to the rendered player/ball visual size. This minimal hitbox prevents elements from intercepting pointer events on elements positioned beneath them. The CSS property `overflow: visible` is applied to the `foreignObject` so that visual effects (e.g., the glow aura from Proximity Detection) can extend beyond the hitbox bounds without expanding the clickable area:

| Property | Purpose |
|---|---|
| Minimal `foreignObject` size | Reduces selection obstruction by limiting the pointer-event surface |
| `overflow: visible` | Allows glow/aura effects to render outside the hitbox without affecting hit detection |

## Development Phases
See ROADMAP.txt for detailed phase breakdown.
