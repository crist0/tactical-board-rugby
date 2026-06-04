import { defineStore } from 'pinia';

/**
 * Maximum number of undo steps kept in the history stack.
 * @type {number}
 */
const MAX_HISTORY_LENGTH = 20;

/**
 * Creates a deep, isolated clone of the given value using JSON round-trip.
 * Ensures the snapshot is completely separated from Vue's reactive system.
 * @template T
 * @param {T} value - The value to clone.
 * @returns {T} A deep copy.
 */
const deepClone = (value) => JSON.parse(JSON.stringify(value));

/**
 * Captures a lightweight snapshot of the current global state.
 * Extracts only the data needed to fully restore state on undo/redo.
 * @param {import('pinia').StoreGeneric} playStore - The play store instance.
 * @param {import('pinia').StoreGeneric} playbackStore - The playback store instance.
 * @returns {{ players: Array<{id: string, x: number, y: number, location: string}>, ball: {id: string, x: number, y: number, location: string, linkedTo: string|null}, keyframes: Array, currentKeyframeIndex: number }}
 */
const captureSnapshot = (playStore, playbackStore) => ({
  players: playStore.players.map((p) => ({
    id: p.id,
    x: p.x,
    y: p.y,
    location: p.location,
  })),
  ball: {
    id: playStore.ball.id,
    x: playStore.ball.x,
    y: playStore.ball.y,
    location: playStore.ball.location,
    linkedTo: playStore.ball.linkedTo,
  },
  keyframes: deepClone(playbackStore.keyframes),
  currentKeyframeIndex: playbackStore.currentKeyframeIndex,
});

/**
 * Overwrites the reactive state of both stores with a snapshot's data.
 * Performs direct property-by-property mutation to preserve reactivity.
 * Does NOT trigger any saveSnapshot or auto-save logic.
 * @param {import('pinia').StoreGeneric} playStore - The play store instance.
 * @param {import('pinia').StoreGeneric} playbackStore - The playback store instance.
 * @param {{ players: Array, ball: Object, keyframes: Array, currentKeyframeIndex: number }} snapshot - The snapshot to apply.
 */
const applySnapshot = (playStore, playbackStore, snapshot) => {
  // Overwrite players — mutate each matching player's properties
  for (const snapPlayer of snapshot.players) {
    const player = playStore.players.find((p) => p.id === snapPlayer.id);
    if (player) {
      player.x = snapPlayer.x;
      player.y = snapPlayer.y;
      player.location = snapPlayer.location;
    }
  }

  // Overwrite ball
  playStore.ball.x = snapshot.ball.x;
  playStore.ball.y = snapshot.ball.y;
  playStore.ball.location = snapshot.ball.location;
  playStore.ball.linkedTo = snapshot.ball.linkedTo;

  // Overwrite keyframes — replace the array entirely
  playbackStore.keyframes.splice(0, playbackStore.keyframes.length, ...deepClone(snapshot.keyframes));
  playbackStore.currentKeyframeIndex = snapshot.currentKeyframeIndex;
};

export const useHistoryStore = defineStore('history', {
  state: () => ({
    /**
     * Stack of past state snapshots. Newest entries are at the end.
     * Max length is governed by MAX_HISTORY_LENGTH.
     * @type {Array<{players: Array, ball: Object, keyframes: Array, currentKeyframeIndex: number}>}
     */
    past: [],

    /**
     * Stack of future (redo) state snapshots. Newest entries are at the end.
     * Cleared whenever a new action records a state.
     * @type {Array<{players: Array, ball: Object, keyframes: Array, currentKeyframeIndex: number}>}
     */
    future: [],

    /**
     * Guards against re-recording state while an undo/redo operation
     * is actively overwriting store values. When false, saveState() returns early.
     * @type {boolean}
     */
    isTracking: true,
  }),

  actions: {
    /**
     * Lazy-imports and returns the playStore instance.
     * Avoids circular dependency at module evaluation time.
     * @returns {Promise<import('pinia').StoreGeneric>}
     */
    async _getPlayStore() {
      const { usePlayStore } = await import('@/stores/playStore');
      return usePlayStore();
    },

    /**
     * Lazy-imports and returns the playbackStore instance.
     * Avoids circular dependency at module evaluation time.
     * @returns {Promise<import('pinia').StoreGeneric>}
     */
    async _getPlaybackStore() {
      const { usePlaybackStore } = await import('@/stores/playbackStore');
      return usePlaybackStore();
    },

    /**
     * Captures a snapshot of the current global state and pushes it onto
     * the past stack. Clears the future (redo) stack since any new user
     * action invalidates the redo timeline.
     *
     * If isTracking is false (i.e., we are in the middle of applying an
     * undo/redo), this method returns immediately to prevent recursion.
     *
     * @returns {Promise<void>}
     */
    async saveState() {
      if (!this.isTracking) {
        return;
      }

      const playStore = await this._getPlayStore();
      const playbackStore = await this._getPlaybackStore();

      const snapshot = captureSnapshot(playStore, playbackStore);
      this.past.push(snapshot);

      // Enforce the maximum history length
      if (this.past.length > MAX_HISTORY_LENGTH) {
        this.past.shift();
      }

      // Clear redo stack — any new action invalidates it
      this.future = [];
    },

    /**
     * Reverts to the previous state in the past stack.
     * - Pops the latest snapshot from past.
     * - Captures the current state and pushes it to future (so redo can return).
     * - Overwrites both playStore and playbackStore with the popped snapshot.
     *
     * Temporarily sets isTracking = false to prevent saveState from
     * re-recording the state during the overwrite.
     *
     * @returns {Promise<void>}
     */
    async undo() {
      if (this.past.length === 0) {
        return;
      }

      const playStore = await this._getPlayStore();
      const playbackStore = await this._getPlaybackStore();

      // Prevent this operation from being recorded
      this.isTracking = false;

      // Pop the state we are reverting to
      const snapshot = this.past.pop();

      // Capture the current state so redo can get back to it
      const currentSnapshot = captureSnapshot(playStore, playbackStore);
      this.future.push(currentSnapshot);

      // Apply the popped snapshot
      applySnapshot(playStore, playbackStore, snapshot);

      // Re-enable tracking
      this.isTracking = true;
    },

    /**
     * Re-applies a previously undone state from the future stack.
     * - Pops the latest snapshot from future.
     * - Captures the current state and pushes it to past (so undo can return).
     * - Overwrites both playStore and playbackStore with the popped snapshot.
     *
     * Temporarily sets isTracking = false to prevent saveState from
     * re-recording the state during the overwrite.
     *
     * @returns {Promise<void>}
     */
    async redo() {
      if (this.future.length === 0) {
        return;
      }

      const playStore = await this._getPlayStore();
      const playbackStore = await this._getPlaybackStore();

      // Prevent this operation from being recorded
      this.isTracking = false;

      // Pop the state we are re-applying
      const snapshot = this.future.pop();

      // Capture the current state so undo can get back to it
      const currentSnapshot = captureSnapshot(playStore, playbackStore);
      this.past.push(currentSnapshot);

      // Apply the popped snapshot
      applySnapshot(playStore, playbackStore, snapshot);

      // Re-enable tracking
      this.isTracking = true;
    },

    /**
     * Resets both the past and future stacks to empty arrays.
     * The current state is preserved — only the undo/redo history is cleared.
     */
    clearHistory() {
      this.past = [];
      this.future = [];
    },
  },
});