# Stores

## Purpose
Pinia stores for centralized state management across tactical board modules.

## Planned Stores
- `usePlayStore.js` (Phase 5) - Manage plays (name, keyframes, players, ball positions).
- `useUIStore.js` (Phase 1.6) - UI state (panels open/closed, zoom level, selected tool).
- `usePlaybackStore.js` (Phase 6) - Playback control (play/pause, speed, current keyframe).

## Usage Notes
- Keep each store domain-focused.
- Prefer explicit actions for state mutations.
