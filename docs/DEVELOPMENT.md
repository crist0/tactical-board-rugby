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
