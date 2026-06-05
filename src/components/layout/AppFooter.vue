<template>
  <div class="app-footer">
    <div class="timeline" v-if="playbackStore.keyframes.length > 0">
      <div class="timeline__header">
        <span class="timeline__title">Timeline</span>
        <span class="timeline__counter">{{ playbackStore.currentKeyframeIndex + 1 }} / {{ playbackStore.keyframes.length }}</span>
      </div>

      <!-- Playback Controls -->
      <div class="playback-controls">
        <button
          class="playback-controls__btn"
          @click="firstFrame"
          title="First frame"
        >
          <SkipBack :size="14" />
        </button>

        <button
          class="playback-controls__btn"
          @click="prevFrame"
          title="Previous frame"
        >
          <ChevronLeft :size="14" />
        </button>

        <button
          class="playback-controls__btn playback-controls__btn--main"
          :class="{ 'playback-controls__btn--active': playbackStore.isPlaying }"
          @click="togglePlayback"
          :title="playbackStore.isPlaying ? 'Pause' : 'Play'"
        >
          <Play v-if="!playbackStore.isPlaying" :size="16" />
          <Pause v-else :size="16" />
        </button>

        <button
          class="playback-controls__btn"
          @click="nextFrame"
          title="Next frame"
        >
          <ChevronRight :size="14" />
        </button>

        <button
          class="playback-controls__btn"
          @click="lastFrame"
          title="Last frame"
        >
          <SkipForward :size="14" />
        </button>

        <div class="playback-controls__divider"></div>

        <button
          class="playback-controls__btn"
          :class="{ 'playback-controls__btn--looping': playbackStore.isLooping }"
          @click="toggleLoop"
          :title="playbackStore.isLooping ? 'Disable loop' : 'Enable loop'"
        >
          <Repeat :size="14" />
        </button>

        <div class="playback-controls__divider"></div>

        <button
          class="playback-controls__speed-btn"
          @click="cycleSpeed"
          title="Cycle playback speed"
        >
          {{ playbackStore.playbackSpeed }}x
        </button>
      </div>

      <div class="timeline__scroll-container" ref="scrollContainerRef">
        <div class="timeline__keyframes-wrapper">
          <TimelineKeyframe
            v-for="(_, index) in playbackStore.keyframes"
            :key="index"
            :index="index"
            :is-active="index === playbackStore.currentKeyframeIndex"
            :show-delete="playbackStore.keyframes.length > 1"
            @select="selectKeyframe(index)"
            @delete="deleteKeyframe(index)"
            @toggle-menu="openContextMenu($event, index)"
            @drop="handleDropEvent($event, index)"
          />
        </div>
      </div>

      <div class="timeline__actions">
        <button
          class="timeline__btn timeline__btn--add"
          @click="addKeyframe"
          title="Add keyframe"
        >
          + Keyframe
        </button>
      </div>
    </div>

    <div class="timeline timeline--empty" v-else>
      <span class="timeline__empty-label">No keyframes</span>
      <button
        class="timeline__btn timeline__btn--add"
        @click="addKeyframe"
        title="Add keyframe"
      >
        + Keyframe
      </button>
    </div>

    <ContextMenu
      :visible="contextMenu.visible"
      :position="contextMenu.position"
      :keyframe-index="contextMenu.keyframeIndex"
      @close="closeContextMenu"
      @add="addKeyframe"
      @duplicate="duplicateKeyframe"
      @insert="insertKeyframe"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { Play, Pause, SkipBack, ChevronLeft, ChevronRight, SkipForward, Repeat } from 'lucide-vue-next';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useHistoryStore } from '@/stores/historyStore';
import TimelineKeyframe from '@/components/timeline/TimelineKeyframe.vue';
import ContextMenu from '@/components/timeline/ContextMenu.vue';

const playbackStore = usePlaybackStore();
const historyStore = useHistoryStore();

const scrollContainerRef = ref(null);

/** Available playback speed options for cycling. */
const speedOptions = [0.5, 1, 2];

const contextMenu = reactive({
  visible: false,
  position: { x: 0, y: 0 },
  keyframeIndex: -1,
});

/**
 * Scrolls the timeline to ensure the active keyframe is visible.
 */
function scrollToActive() {
  nextTick(() => {
    if (!scrollContainerRef.value) return;
    const container = scrollContainerRef.value;
    const activeEl = container.querySelector('.timeline-keyframe--active');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });
}

/**
 * Selects and loads a keyframe by index.
 * Immediately updates the playStore via loadKeyframe.
 */
async function selectKeyframe(index) {
  await playbackStore.loadKeyframe(index);
  scrollToActive();
}

/**
 * Adds a new keyframe at the end, inheriting from the last one.
 */
async function addKeyframe() {
  await playbackStore.addKeyframe();
  scrollToActive();
}

/**
 * Deletes a keyframe at the given index.
 */
async function deleteKeyframe(index) {
  // If deleting the current keyframe, first load an adjacent one to keep state consistent
  if (index === playbackStore.currentKeyframeIndex && playbackStore.keyframes.length > 1) {
    const targetIndex = index === 0 ? 1 : index - 1;
    await playbackStore.loadKeyframe(targetIndex);
  }
  await playbackStore.deleteKeyframe(index);
}

/**
 * Duplicates a keyframe to the end of the list.
 * @param {number} index
 */
async function duplicateKeyframe(index) {
  await playbackStore.duplicateKeyframeToEnd(index);
  scrollToActive();
}

/**
 * Inserts a cloned keyframe after the given index.
 * @param {number} index
 */
async function insertKeyframe(index) {
  await playbackStore.insertKeyframeAfter(index);
  scrollToActive();
}

/**
 * Opens the context menu at the click position.
 * @param {MouseEvent} event
 * @param {number} index
 */
function openContextMenu(event, index) {
  contextMenu.visible = true;
  contextMenu.position = { x: event.clientX, y: event.clientY };
  contextMenu.keyframeIndex = index;
}

/**
 * Closes the context menu.
 */
function closeContextMenu() {
  contextMenu.visible = false;
  contextMenu.keyframeIndex = -1;
}

/**
 * Handles the drop event for reordering keyframes via drag and drop.
 * Reads the source index from the dataTransfer payload.
 * @param {DragEvent} event - The native drop event.
 * @param {number} dropIndex - The index where the keyframe was dropped.
 */
async function handleDropEvent(event, dropIndex) {
  const dragIndex = parseInt(event.dataTransfer.getData('text/plain'), 10);
  if (isNaN(dragIndex)) return;
  if (dragIndex === dropIndex) return;

  // Save undo state BEFORE any mutation
  await historyStore.saveState();

  const keyframes = playbackStore.keyframes;
  const [moved] = keyframes.splice(dragIndex, 1);
  keyframes.splice(dropIndex, 0, moved);

  // Adjust currentKeyframeIndex if needed
  if (playbackStore.currentKeyframeIndex === dragIndex) {
    playbackStore.currentKeyframeIndex = dropIndex;
  } else {
    // Shift index if elements before it moved
    if (dragIndex < dropIndex && playbackStore.currentKeyframeIndex > dragIndex && playbackStore.currentKeyframeIndex <= dropIndex) {
      playbackStore.currentKeyframeIndex--;
    } else if (dragIndex > dropIndex && playbackStore.currentKeyframeIndex >= dropIndex && playbackStore.currentKeyframeIndex < dragIndex) {
      playbackStore.currentKeyframeIndex++;
    }
  }

  scrollToActive();
}

// --- Playback control handlers ---

/**
 * Toggles playback between play and pause.
 */
async function togglePlayback() {
  await playbackStore.togglePlayback();
}

/**
 * Jumps to the first keyframe.
 */
async function firstFrame() {
  await playbackStore.firstFrame();
  scrollToActive();
}

/**
 * Jumps to the previous keyframe.
 */
async function prevFrame() {
  await playbackStore.prevFrame();
  scrollToActive();
}

/**
 * Jumps to the next keyframe.
 */
async function nextFrame() {
  await playbackStore.nextFrame();
  scrollToActive();
}

/**
 * Jumps to the last keyframe.
 */
async function lastFrame() {
  await playbackStore.lastFrame();
  scrollToActive();
}

/**
 * Toggles looping mode on/off.
 */
function toggleLoop() {
  playbackStore.toggleLoop();
}

/**
 * Cycles through speed options: 0.5x → 1x → 2x → 0.5x ...
 */
function cycleSpeed() {
  const currentIdx = speedOptions.indexOf(playbackStore.playbackSpeed);
  const nextIdx = (currentIdx + 1) % speedOptions.length;
  playbackStore.setSpeed(speedOptions[nextIdx]);
}

// Auto-scroll to the active keyframe whenever the index changes
watch(
  () => playbackStore.currentKeyframeIndex,
  () => {
    scrollToActive();
  },
);

// Listen for keyboard shortcut to dismiss context menu on Escape
function onKeyDown(event) {
  if (event.key === 'Escape' && contextMenu.visible) {
    closeContextMenu();
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown);
});
</script>

<style lang="scss" scoped>
.app-footer {
  display: flex;
  align-items: center;
  background-color: #1f2937;
  color: #f3f4f6;
  padding: 0 12px;
  overflow: hidden;
}

.timeline {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 100%;

  &--empty {
    justify-content: center;
    gap: 12px;
  }

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    flex-shrink: 0;
    min-width: 50px;
  }

  &__title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #9ca3af;
  }

  &__counter {
    font-size: 10px;
    font-weight: 600;
    color: #6b7280;
  }

  &__empty-label {
    font-size: 13px;
    color: #6b7280;
    font-style: italic;
  }

  &__scroll-container {
    flex: 1;
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 6px 4px;
    scrollbar-width: thin;
    scrollbar-color: #4b5563 transparent;

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #4b5563;
      border-radius: 2px;
    }
  }

  &__keyframes-wrapper {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  &__actions {
    flex-shrink: 0;
    padding-left: 4px;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid #4b5563;
    border-radius: 6px;
    cursor: pointer;
    background-color: #374151;
    color: #d1d5db;
    transition: background-color 0.15s ease, border-color 0.15s ease;
    white-space: nowrap;

    &:hover {
      background-color: #4b5563;
      border-color: #6b7280;
      color: #f3f4f6;
    }

    &:active {
      background-color: #2563eb;
      border-color: #3b82f6;
      color: #ffffff;
    }

    &--add {
      background-color: #1e40af;
      border-color: #2563eb;
      color: #bfdbfe;

      &:hover {
        background-color: #2563eb;
        border-color: #3b82f6;
        color: #ffffff;
      }

      &:active {
        background-color: #1d4ed8;
      }
    }
  }
}

/* Playback Controls */
.playback-controls {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  padding: 0 4px;
  border-right: 1px solid #374151;
  margin-right: 4px;

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    background-color: transparent;
    color: #9ca3af;
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
      background-color: #374151;
      color: #f3f4f6;
    }

    &:active {
      background-color: #2563eb;
      color: #ffffff;
    }

    &--active {
      background-color: #1e40af;
      color: #bfdbfe;

      &:hover {
        background-color: #2563eb;
        color: #ffffff;
      }
    }

    &--main {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border-color: #4b5563;
      background-color: #374151;
      color: #d1d5db;

      &:hover {
        background-color: #4b5563;
        color: #f3f4f6;
      }

      &--active {
        background-color: #1e40af;
        color: #bfdbfe;
        border-color: #2563eb;

        &:hover {
          background-color: #2563eb;
          color: #ffffff;
        }
      }
    }

    &--looping {
      color: #60a5fa;

      &:hover {
        color: #93c5fd;
      }
    }
  }

  &__divider {
    width: 1px;
    height: 20px;
    background-color: #374151;
    margin: 0 3px;
  }

  &__speed-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 24px;
    padding: 0 6px;
    font-size: 11px;
    font-weight: 700;
    border: 1px solid #4b5563;
    border-radius: 4px;
    cursor: pointer;
    background-color: #374151;
    color: #9ca3af;
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
      background-color: #4b5563;
      color: #f3f4f6;
    }

    &:active {
      background-color: #2563eb;
      color: #ffffff;
    }
  }
}
</style>