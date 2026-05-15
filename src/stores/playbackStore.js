import { defineStore } from 'pinia';

/**
 * Deep clone helper to ensure keyframes are independent snapshots
 * and not reactive references to the current state.
 * @template T
 * @param {T} obj - The object to deep clone.
 * @returns {T} A deep copy of the object.
 */
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Creates a lightweight snapshot of playStore state.
 * Extracts only essential data: id, x, y, location, and linkedTo (for the ball).
 * @param {import('pinia').StoreGeneric} playStore - The play store instance.
 * @returns {{ players: Array<{id: string, x: number, y: number, location: string}>, ball: {id: string, x: number, y: number, location: string, linkedTo: string|null} }}
 */
const createSnapshot = (playStore) => ({
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
});

export const usePlaybackStore = defineStore('playback', {
  state: () => ({
    /**
     * Array of snapshot objects. Each snapshot captures the essential
     * state of all players and the ball at a moment in time.
     * @type {Array<{players: Array<{id: string, x: number, y: number, location: string}>, ball: {id: string, x: number, y: number, location: string, linkedTo: string|null}}>}
     */
    keyframes: [],
    /** @type {number} Index of the currently active keyframe. */
    currentKeyframeIndex: 0,
  }),

  actions: {
    /**
     * Internal: Returns the playStore instance.
     * Uses lazy import to avoid circular dependency at module evaluation time.
     * @returns {Promise<import('pinia').StoreGeneric>} The play store instance.
     */
    async _getPlayStore() {
      const { usePlayStore } = await import('@/stores/playStore');
      return usePlayStore();
    },

    /**
     * Initializes the store with a single default keyframe capturing
     * the current playStore state. Must be called once after both stores
     * are instantiated.
     * @returns {Promise<void>}
     */
    async initialize() {
      const playStore = await this._getPlayStore();
      this.keyframes = [createSnapshot(playStore)];
      this.currentKeyframeIndex = 0;
    },

    /**
     * Captures the current playStore state and returns a lightweight snapshot.
     * @returns {Promise<{players: Array<{id: string, x: number, y: number, location: string}>, ball: {id: string, x: number, y: number, location: string, linkedTo: string|null}}>}
     */
    async _captureSnapshot() {
      const playStore = await this._getPlayStore();
      return createSnapshot(playStore);
    },

    /**
     * Overwrites playStore data with a snapshot's data.
     * @param {{ players: Array<{id: string, x: number, y: number, location: string}>, ball: {id: string, x: number, y: number, location: string, linkedTo: string|null} }} snapshot - The snapshot to apply.
     * @returns {Promise<void>}
     */
    async _applySnapshot(snapshot) {
      const playStore = await this._getPlayStore();

      for (const snapPlayer of snapshot.players) {
        const player = playStore.players.find((p) => p.id === snapPlayer.id);
        if (player) {
          player.x = snapPlayer.x;
          player.y = snapPlayer.y;
          player.location = snapPlayer.location;
        }
      }

      playStore.ball.x = snapshot.ball.x;
      playStore.ball.y = snapshot.ball.y;
      playStore.ball.location = snapshot.ball.location;
      playStore.ball.linkedTo = snapshot.ball.linkedTo;
    },

    /**
     * Updates the current keyframe with a fresh snapshot of the current playStore state.
     * @returns {Promise<void>}
     */
    async saveSnapshot() {
      if (this.keyframes.length === 0) {
        return;
      }
      this.keyframes[this.currentKeyframeIndex] = deepClone(
        await this._captureSnapshot(),
      );
    },

    /**
     * Loads a keyframe's state into playStore.
     * @param {number} index - The index of the keyframe to load.
     * @returns {Promise<void>}
     */
    async loadKeyframe(index) {
      if (index < 0 || index >= this.keyframes.length) {
        return;
      }

      this.currentKeyframeIndex = index;
      await this._applySnapshot(this.keyframes[index]);
    },

    /**
     * Creates a new keyframe at the end, inheriting positions from the current one.
     * If keyframes exist, copies the last keyframe's data.
     * Otherwise, captures the current playStore state as the initial keyframe.
     * @returns {Promise<void>}
     */
    async addKeyframe() {
      const snapshot =
        this.keyframes.length > 0
          ? deepClone(this.keyframes[this.keyframes.length - 1])
          : deepClone(await this._captureSnapshot());

      this.keyframes.push(snapshot);
      this.currentKeyframeIndex = this.keyframes.length - 1;
    },

    /**
     * Deep clones the keyframe at the given index and appends it to the end.
     * Also updates currentKeyframeIndex to point to the new keyframe.
     * @param {number} index - The index of the keyframe to duplicate.
     */
    duplicateKeyframeToEnd(index) {
      if (index < 0 || index >= this.keyframes.length) {
        return;
      }

      const cloned = deepClone(this.keyframes[index]);
      this.keyframes.push(cloned);
      this.currentKeyframeIndex = this.keyframes.length - 1;
    },

    /**
     * Deep clones the keyframe at the given index and inserts it
     * immediately after that index (at index + 1).
     * Updates currentKeyframeIndex to point to the new keyframe.
     * @param {number} index - The index after which to insert the clone.
     */
    insertKeyframeAfter(index) {
      if (index < 0 || index > this.keyframes.length) {
        return;
      }

      const cloned = deepClone(this.keyframes[index]);
      this.keyframes.splice(index + 1, 0, cloned);
      this.currentKeyframeIndex = index + 1;
    },

    /**
     * Removes a keyframe at the specified index and manages
     * currentKeyframeIndex to avoid out-of-bounds.
     * - If only one keyframe remains, it is kept as is.
     * - If removing the current or a previous keyframe, the index shifts down.
     * - If removing a later keyframe, the index stays unchanged.
     * @param {number} index - The index of the keyframe to delete.
     */
    deleteKeyframe(index) {
      if (index < 0 || index >= this.keyframes.length) {
        return;
      }

      // Never allow deleting the last remaining keyframe
      if (this.keyframes.length <= 1) {
        return;
      }

      this.keyframes.splice(index, 1);

      if (this.currentKeyframeIndex >= this.keyframes.length) {
        this.currentKeyframeIndex = this.keyframes.length - 1;
      } else if (index < this.currentKeyframeIndex) {
        this.currentKeyframeIndex--;
      } else if (index === this.currentKeyframeIndex) {
        this.currentKeyframeIndex = Math.min(
          this.currentKeyframeIndex,
          this.keyframes.length - 1,
        );
      }
    },

    /**
     * Resets the keyframes array with a single snapshot of the current state.
     * @returns {Promise<void>}
     */
    async resetKeyframes() {
      const snapshot = deepClone(await this._captureSnapshot());
      this.keyframes = [snapshot];
      this.currentKeyframeIndex = 0;
    },
  },
});