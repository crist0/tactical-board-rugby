<template>
  <div
    class="timeline-keyframe"
    :class="{
      'timeline-keyframe--active': isActive,
      'timeline-keyframe--dragging': isDragging,
    }"
    :draggable="true"
    @click="$emit('select')"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dragover.prevent
    @drop.prevent="$emit('drop', $event, index)"
    @dragenter.prevent="dragEnter"
    @dragleave="dragLeave"
    :data-index="index"
  >
    <span class="timeline-keyframe__number">{{ index + 1 }}</span>
    <button
      v-if="showDelete"
      class="timeline-keyframe__delete"
      @click.stop="$emit('delete', index)"
      title="Delete keyframe"
    >
      &times;
    </button>
    <button
      class="timeline-keyframe__menu-btn"
      @click="onMenuClick($event, index)"
      title="More actions"
    >
      &#8942;
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  index: { type: Number, required: true },
  isActive: { type: Boolean, default: false },
  showDelete: { type: Boolean, default: true },
});

const emit = defineEmits(['select', 'delete', 'toggle-menu', 'drag-start', 'drop']);

const isDragging = ref(false);

function onDragStart(event) {
  isDragging.value = true;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', String(props.index));
  // Add a slight delay class for visual feedback
  requestAnimationFrame(() => {
    event.target.classList.add('timeline-keyframe--dragging-source');
  });
}

function onDragEnd(event) {
  isDragging.value = false;
  event.target.classList.remove('timeline-keyframe--dragging-source');
}

function dragEnter(event) {
  event.currentTarget.classList.add('timeline-keyframe--drag-over');
}

function dragLeave(event) {
  event.currentTarget.classList.remove('timeline-keyframe--drag-over');
}

function onMenuClick(event, index) {
  event.stopImmediatePropagation();
  emit('toggle-menu', event, index);
}
</script>

<style lang="scss" scoped>
.timeline-keyframe {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 40px;
  padding: 0 8px;
  margin: 0 2px;
  background-color: #374151;
  border: 2px solid #4b5563;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  flex-shrink: 0;

  &:hover {
    background-color: #4b5563;
    border-color: #6b7280;
    transform: translateY(-1px);
  }

  &--active {
    background-color: #1e40af;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);

    &:hover {
      background-color: #2563eb;
      border-color: #60a5fa;
    }

    .timeline-keyframe__number {
      color: #ffffff;
      font-weight: 700;
    }
  }

  &--dragging {
    opacity: 0.4;
  }

  &--dragging-source {
    opacity: 0.3;
    transform: scale(0.95);
  }

  &--drag-over {
    border-color: #60a5fa;
    background-color: #1e3a5f;
    transform: scale(1.05);
    box-shadow: inset 3px 0 0 0 #60a5fa, inset -3px 0 0 0 #60a5fa;
  }

  &--drag-over-left {
    border-color: #60a5fa;
    background-color: #1e3a5f;
    transform: scale(1.05);
    box-shadow: inset 3px 0 0 0 #60a5fa;
  }

  &--drag-over-right {
    border-color: #60a5fa;
    background-color: #1e3a5f;
    transform: scale(1.05);
    box-shadow: inset -3px 0 0 0 #60a5fa;
  }

  &__number {
    font-size: 13px;
    font-weight: 600;
    color: #d1d5db;
    letter-spacing: 0.02em;
    pointer-events: none;
  }

  &__delete {
    position: absolute;
    top: -6px;
    right: -6px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    background-color: #ef4444;
    color: #ffffff;
    border: 1px solid #dc2626;
    border-radius: 50%;
    font-size: 11px;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s ease;

    &:hover {
      background-color: #dc2626;
    }
  }

  &:hover &__delete {
    opacity: 1;
  }

  &__menu-btn {
    position: absolute;
    bottom: -5px;
    right: -4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    padding: 0;
    background-color: #6b7280;
    color: #e5e7eb;
    border: 1px solid #4b5563;
    border-radius: 3px;
    font-size: 10px;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s ease;

    &:hover {
      background-color: #9ca3af;
    }
  }

  &:hover &__menu-btn {
    opacity: 1;
  }
}
</style>