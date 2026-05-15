<template>
  <div class="app-footer">
    <div class="timeline" v-if="playbackStore.keyframes.length > 0">
      <div class="timeline__header">
        <span class="timeline__title">Timeline</span>
        <span class="timeline__counter">{{ playbackStore.currentKeyframeIndex + 1 }} / {{ playbackStore.keyframes.length }}</span>
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
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import { usePlaybackStore } from '@/stores/playbackStore';
import TimelineKeyframe from '@/components/timeline/TimelineKeyframe.vue';
import ContextMenu from '@/components/timeline/ContextMenu.vue';

const playbackStore = usePlaybackStore();

const scrollContainerRef = ref(null);

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
function deleteKeyframe(index) {
  // If deleting the current keyframe, first load an adjacent one to keep state consistent
  if (index === playbackStore.currentKeyframeIndex && playbackStore.keyframes.length > 1) {
    const targetIndex = index === 0 ? 1 : index - 1;
    playbackStore.loadKeyframe(targetIndex);
  }
  playbackStore.deleteKeyframe(index);
}

/**
 * Duplicates a keyframe to the end of the list.
 * @param {number} index
 */
function duplicateKeyframe(index) {
  playbackStore.duplicateKeyframeToEnd(index);
  scrollToActive();
}

/**
 * Inserts a cloned keyframe after the given index.
 * @param {number} index
 */
function insertKeyframe(index) {
  playbackStore.insertKeyframeAfter(index);
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
function handleDropEvent(event, dropIndex) {
  const dragIndex = parseInt(event.dataTransfer.getData('text/plain'), 10);
  if (isNaN(dragIndex)) return;
  if (dragIndex === dropIndex) return;

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
</style>
