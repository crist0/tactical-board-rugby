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

/**
 * Linearly interpolates between two values.
 * @param {number} start - The start value.
 * @param {number} end - The end value.
 * @param {number} t - Progress from 0.0 to 1.0.
 * @returns {number} The interpolated value.
 */
const lerp = (start, end, t) => start + (end - start) * t;

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

    // --- Playback state ---
    /** @type {boolean} Whether playback is currently active. */
    isPlaying: false,
    /** @type {number} Playback speed multiplier (e.g., 0.5, 1, 2). */
    playbackSpeed: 1,
    /** @type {number|null} The requestAnimationFrame ID for the playback loop. */
    animationFrameId: null,
    /** @type {number} Delta-time accumulator for interpolation progress (0.0 to 1.0). */
    _currentProgress: 0,
    /** @type {number|null} The timestamp of the previous frame, used for delta-time calculation. */
    _lastFrameTime: null,
    /** @type {{ players: Array<{id: string, x: number, y: number, location: string}>, ball: {id: string, x: number, y: number, location: string, linkedTo: string|null} }|null} */
    _interpolationFromKeyframe: null,
    /** @type {{ players: Array<{id: string, x: number, y: number, location: string}>, ball: {id: string, x: number, y: number, location: string, linkedTo: string|null} }|null} */
    _interpolationToKeyframe: null,
  }),

  actions: {
    /**
     * Internal: Returns the historyStore instance.
     * Uses lazy import to avoid circular dependency at module evaluation time.
     * @returns {Promise<import('pinia').StoreGeneric>} The history store instance.
     */
    async _getHistoryStore() {
      const { useHistoryStore } = await import('@/stores/historyStore');
      return useHistoryStore();
    },

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
     * This is INSTANT — no interpolation. Used for manual timeline clicks.
     * Resets paused elapsed time since a manual jump invalidates any saved progress.
     * @param {number} index - The index of the keyframe to load.
     * @returns {Promise<void>}
     */
    async loadKeyframe(index) {
      if (index < 0 || index >= this.keyframes.length) {
        return;
      }

      this.currentKeyframeIndex = index;
      this._currentProgress = 0;
      this._lastFrameTime = null;
      await this._applySnapshot(this.keyframes[index]);
    },

    /**
     * Creates a new keyframe at the end, inheriting positions from the current one.
     * If keyframes exist, copies the last keyframe's data.
     * Otherwise, captures the current playStore state as the initial keyframe.
     * @returns {Promise<void>}
     */
    async addKeyframe() {
      // Save undo state BEFORE any mutation
      await (await this._getHistoryStore()).saveState();

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
    async duplicateKeyframeToEnd(index) {
      if (index < 0 || index >= this.keyframes.length) {
        return;
      }

      // Save undo state BEFORE any mutation
      await (await this._getHistoryStore()).saveState();

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
    async insertKeyframeAfter(index) {
      if (index < 0 || index > this.keyframes.length) {
        return;
      }

      // Save undo state BEFORE any mutation
      await (await this._getHistoryStore()).saveState();

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
    async deleteKeyframe(index) {
      if (index < 0 || index >= this.keyframes.length) {
        return;
      }

      // Never allow deleting the last remaining keyframe
      if (this.keyframes.length <= 1) {
        return;
      }

      // Save undo state BEFORE any mutation
      await (await this._getHistoryStore()).saveState();

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

    // --- Playback actions ---

    /**
     * The main requestAnimationFrame tick function.
     * Computes the interpolation progress between the from-keyframe and to-keyframe,
     * applies the interpolated positions to playStore, and advances frames when complete.
     * @param {number} timestamp - The high-resolution timestamp provided by rAF.
     * @returns {Promise<void>}
     */
    async _tick(timestamp) {
      if (!this.isPlaying) {
        return;
      }

      // Initialize _lastFrameTime on the first tick of a segment (including resume from pause)
      if (this._lastFrameTime === null) {
        this._lastFrameTime = timestamp;
      }

      // Compute delta time and accumulate progress
      const deltaTime = timestamp - this._lastFrameTime;
      this._lastFrameTime = timestamp;

      const duration = 1000 / this.playbackSpeed;
      this._currentProgress += deltaTime / duration;
      const progress = Math.min(this._currentProgress, 1.0);

      const fromKF = this._interpolationFromKeyframe;
      const toKF = this._interpolationToKeyframe;

      if (fromKF && toKF) {
        const playStore = await this._getPlayStore();

        // Interpolate players
        for (const fromPlayer of fromKF.players) {
          const toPlayer = toKF.players.find((p) => p.id === fromPlayer.id);
          const livePlayer = playStore.players.find((p) => p.id === fromPlayer.id);

          if (!livePlayer) {
            continue;
          }

          if (toPlayer) {
            if (fromPlayer.location !== toPlayer.location) {
              // Location changed (e.g., bench ↔ field) — do NOT interpolate position.
              // Keep the player at their from-keyframe position until the final snap.
              livePlayer.x = fromPlayer.x;
              livePlayer.y = fromPlayer.y;
              livePlayer.location = fromPlayer.location;
            } else {
              // Same location — interpolate position normally
              livePlayer.x = lerp(fromPlayer.x, toPlayer.x, progress);
              livePlayer.y = lerp(fromPlayer.y, toPlayer.y, progress);
              livePlayer.location = fromPlayer.location;
            }
          } else {
            // Player is in from-keyframe but not in to-keyframe (e.g., moved to bench)
            // Snap to the from-keyframe position until the transition completes,
            // then the final snap will handle it
            livePlayer.x = fromPlayer.x;
            livePlayer.y = fromPlayer.y;
            livePlayer.location = fromPlayer.location;
          }
        }

        // Handle players that are in to-keyframe but NOT in from-keyframe
        // (e.g., a player was brought onto the field)
        for (const toPlayer of toKF.players) {
          const fromPlayer = fromKF.players.find((p) => p.id === toPlayer.id);
          if (!fromPlayer) {
            const livePlayer = playStore.players.find((p) => p.id === toPlayer.id);
            if (livePlayer) {
              // Player is new in the to-keyframe — keep them at their current position
              // until the transition completes, then snap to to-keyframe
              livePlayer.x = toPlayer.x;
              livePlayer.y = toPlayer.y;
              livePlayer.location = toPlayer.location;
            }
          }
        }

        // Interpolate ball
        if (fromKF.ball.location !== toKF.ball.location) {
          // Location changed — do NOT interpolate position.
          // Keep the ball at its from-keyframe position until the final snap.
          playStore.ball.x = fromKF.ball.x;
          playStore.ball.y = fromKF.ball.y;
          playStore.ball.location = fromKF.ball.location;
        } else {
          // Same location — interpolate position and location normally
          playStore.ball.x = lerp(fromKF.ball.x, toKF.ball.x, progress);
          playStore.ball.y = lerp(fromKF.ball.y, toKF.ball.y, progress);
          playStore.ball.location = fromKF.ball.location;
        }
        // Interpolate ball linkedTo at midpoint
        if (progress >= 0.5 && fromKF.ball.linkedTo !== toKF.ball.linkedTo) {
          playStore.ball.linkedTo = toKF.ball.linkedTo;
        } else if (progress < 0.5) {
          playStore.ball.linkedTo = fromKF.ball.linkedTo;
        }
      }

      if (progress >= 1.0) {
        // Transition complete — snap to the exact to-keyframe positions
        if (toKF) {
          await this._applySnapshot(toKF);
        }

        // Advance to the next keyframe
        const nextIndex = this.currentKeyframeIndex + 1;

        if (nextIndex >= this.keyframes.length) {
          // Finished the last keyframe — stop playback entirely
          this.stop();
          return;
        }

        this.currentKeyframeIndex = nextIndex;

        // Reset accumulator for the next segment
        this._currentProgress = 0;
        this._lastFrameTime = null;

        // Start the next interpolation
        await this._startNextInterpolation();
      }

      // Schedule the next frame if still playing
      if (this.isPlaying) {
        this.animationFrameId = requestAnimationFrame((ts) => this._tick(ts));
      }
    },

    /**
     * Sets up the from/to keyframes for the next interpolation segment.
     * Called when starting playback and after each frame transition completes.
     * @returns {Promise<void>}
     */
    async _startNextInterpolation() {
      if (this.keyframes.length === 0) {
        this.pause();
        return;
      }

      const fromIndex = this.currentKeyframeIndex;
      const toIndex = (fromIndex + 1) % this.keyframes.length;

      this._interpolationFromKeyframe = this.keyframes[fromIndex];
      this._interpolationToKeyframe = this.keyframes[toIndex];
      this._currentProgress = 0;
      this._lastFrameTime = null;
    },

    /**
     * Cancels the current animation frame without changing state flags.
     */
    _cancelAnimationFrame() {
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    },

    /**
     * Toggles playback between playing and paused states.
     * @returns {Promise<void>}
     */
    async togglePlayback() {
      if (this.isPlaying) {
        this.pause();
      } else {
        await this.play();
      }
    },

    /**
     * Starts or resumes playback.
     * If called from a paused state, _interpolationFromKeyframe is still set,
     * so _startNextInterpolation is skipped (preserving _currentProgress).
     * If called fresh (e.g., after stop or manual keyframe load), sets up a new segment.
     * @returns {Promise<void>}
     */
    async play() {
      if (this.keyframes.length === 0) {
        return;
      }

      // If at the last keyframe, restart from the beginning
      if (this.currentKeyframeIndex >= this.keyframes.length - 1) {
        this.currentKeyframeIndex = 0;
        await this._applySnapshot(this.keyframes[0]);
      }

      this.isPlaying = true;

      // Only set up a new interpolation segment when starting fresh (not resuming from pause)
      if (!this._interpolationFromKeyframe) {
        await this._startNextInterpolation();
      }

      // Start the rAF loop
      this.animationFrameId = requestAnimationFrame((ts) => this._tick(ts));
    },

    /**
     * Pauses playback without changing the current keyframe.
     * The interpolated positions from the last _tick remain visible.
     * Does NOT snap to any keyframe — keeps the current visual state intact.
     * Keeps from/to keyframes so resume continues from the exact paused progress.
     * @returns {Promise<void>}
     */
    async pause() {
      this.isPlaying = false;
      this._cancelAnimationFrame();
      this._lastFrameTime = null;
      // _currentProgress is preserved — resume will continue from this exact value
    },

    /**
     * Stops playback and resets to the first keyframe.
     * @returns {Promise<void>}
     */
    async stop() {
      this.isPlaying = false;
      this._cancelAnimationFrame();

      this._interpolationFromKeyframe = null;
      this._interpolationToKeyframe = null;
      this._currentProgress = 0;
      this._lastFrameTime = null;

      await this.loadKeyframe(0);
    },

    /**
     * Updates the playback speed. Takes effect immediately on the next frame
     * since duration is computed inline in _tick from this.playbackSpeed.
     * @param {number} speed - The new speed multiplier (e.g., 0.5, 1, 2).
     */
    setSpeed(speed) {
      this.playbackSpeed = speed;
    },
  },
});