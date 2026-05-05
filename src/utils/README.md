# Utilities

## Purpose
Provides shared constants and helper utilities used across components, stores, and composables.

## Planned Utility Files
- `constants.js` (Phase 1) - Core project constants (layout, field, colors, animation, breakpoints).
- `coordinates.js` (Phase 2) - Field coordinate conversion utilities.
- `validation.js` (Phase 4) - Input and data integrity checks for plays.
- `storage.js` (Phase 7) - LocalStorage persistence helpers.

## Usage Notes
- Keep utility files framework-agnostic where possible.
- Prefer named exports to improve tree-shaking and readability.
