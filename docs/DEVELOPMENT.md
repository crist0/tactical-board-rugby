# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Code Formatting
```bash
npm run format
```

## Folder Structure Conventions

### Components
- Use PascalCase for component names
- One component per file
- Organize by feature in subfolders
- Include README.md in each feature folder

### Composables
- Use camelCase with 'use' prefix (e.g., useDragAndDrop)
- Return reactive values and functions
- Document parameters and return values

### Stores
- Use camelCase with 'use' prefix (e.g., usePlayStore)
- Define clear state, getters, and actions
- Keep stores focused on single responsibility

### Styling
- Use SCSS with scoped styles
- Import global variables when needed
- Follow BEM naming convention for classes

## UI Components

### Color Pickers
Standard HTML5 `<input type="color">` elements are used for team color customization in the right sidebar. This provides a native and consistent user experience for color selection without introducing new dependencies.

## Drag and Drop
- The bench drop zone is implemented in `RightSidebar.vue`.
- Visual feedback is provided by the `drag-over` class.
- The `isDraggingOver` reactive state tracks the drag-over state.
- Event handlers `@dragenter`, `@dragleave`, and `@drop` manage the drag-and-drop flow.
- The `handleDragEnter` function checks for valid data types to prevent conflicts with file drags.

## Proximity Detection
The ball can be "snapped" to a player by dragging it over the player's circle and releasing. This triggers a link (see "Linked State" in ARCHITECTURE.md) so the ball follows the player.

### Detection Math
- **Euclidean distance** is computed between the ball's center `(ball.x, ball.y)` and each player's center `(player.x, player.y)`:
  ```
  distance = √((ball.x - player.x)² + (ball.y - player.y)²)
  ```
- **Detection threshold:** A player is detected when the ball's center falls within the player's circular area, i.e. `distance < playerRadius`.
- **Player radius** is derived from the player's SVG unit size: `playerRadius = (uiStore.playerSize * 10) / 2` (half the width of the player's `foreignObject`).
- **Closest-only rule:** If multiple players are within range, only the closest one is highlighted. This prevents ambiguous targeting.

### Flow
1. While the ball is being dragged (`draggedElement.value.type === 'ball'`), `handleGlobalMouseMove` calls `findNearestPlayer(clamped.x, clamped.y)` after each position update.
2. The result is stored in `highlightedPlayerId` (a `ref`), which is passed as the `isHighlighted` prop to each `<Player>` component.
3. On mouse up (`handleMouseUp` / `handleGlobalMouseUp`), if `highlightedPlayerId` is set, `playStore.linkBallToPlayer(highlightedPlayerId)` is called to establish the link.
4. The ball is automatically positioned offset to the right of the linked player by the store's `updateItemPosition` logic.
5. `highlightedPlayerId` is cleared on mouse up and mouse leave to reset the visual state.

## Ball-Player Linking (Phase 4)

Once proximity is detected and the ball is dropped on a player, the linking system activates to create a visual and positional union between the ball and its carrier.

### Instant Snapping

When the ball is released (mouse up) while `highlightedPlayerId` is set, the following occurs in order:

1. `playStore.linkBallToPlayer(highlightedPlayerId)` is called, setting `ball.linkedTo` to the player's ID.
2. The store's `linkBallToPlayer` action triggers a position sync: the ball is instantly snapped to an offset to the right of the linked player (+15 SVG units on the X-axis, matching the Y coordinate).
3. No transition or animation occurs during snapping — the ball teleports immediately to its linked position, ensuring the coach sees the exact resulting formation without delay.

This instant snap is intentional: tactical board workflows require deterministic, frame-accurate placement rather than smooth animated transitions between unlinked and linked states.

### Visual Union (CSS `drop-shadow`)

Instead of drawing SVG connector lines between the ball and its carrier (which would add DOM complexity and need manual cleanup on unlink), the visual union is achieved entirely through CSS:

- When a player has the ball linked (`ball.linkedTo === player.id`), the player's `<foreignObject>` root element receives a dynamic CSS class (e.g., `.player--has-ball`).
- This class applies a CSS `drop-shadow` filter with the ball's color as the shadow tint, creating a subtle colored halo around the carrier that signals the union at a glance.
- The ball itself remains visually independent — it floats at its offset position next to the player — so both the carrier and the ball are individually selectable and movable.
- No extra SVG `<line>` or `<path>` elements are inserted into the DOM, keeping the rendering tree lean.

### Unlinking

The link is broken (and `ball.linkedTo` set back to `null`) under these conditions:
- The linked player is double-clicked (returned to bench).
- The ball itself is double-clicked (returned to bench).
- The ball is dragged more than a threshold distance from the linked player (see Phase 4.6 — drag-to-unlink).
- `resetBoard()` is called.
- A manual call to `linkBallToPlayer(null)` is issued.

## Git Workflow
- Commit at the end of each completed TASK.
- Use conventional commit messages: `feat/chore/fix: [Phase X - Task X.Y] - description` (e.g., `chore: [Phase 1 - Task 1.4] - Optimize gitignore and update commit strategy`).
- Keep commits focused and atomic

## Code Quality
- ESLint is configured and should pass before committing
- Prettier formats code automatically
- Use JSDoc comments for complex functions
- Keep components under 200 lines when possible

### Living Documentation
- The ARCHITECTURE.md and DEVELOPMENT.md files are the Single Source of Truth.
- Whenever new core libraries are installed or structural decisions are made, these markdown files MUST be updated in the same commit.

## Notes
- All code, comments, and documentation in English
- Desktop-first approach, responsive in Phase 10
- LocalStorage for now, IndexedDB migration planned
