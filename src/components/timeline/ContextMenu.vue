<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="context-menu-backdrop"
      @click="$emit('close')"
    ></div>
    <div
      v-if="visible"
      ref="menuRef"
      class="context-menu"
      :style="computedMenuStyle"
    >
      <button class="context-menu__item" @click="handleAction('add')">
        <span class="context-menu__icon">+</span>
        Add Keyframe
      </button>
      <button class="context-menu__item" @click="handleAction('duplicate')">
        <span class="context-menu__icon">⧉</span>
        Duplicate to end
      </button>
      <button class="context-menu__item" @click="handleAction('insert')">
        <span class="context-menu__icon">↪</span>
        Insert next
      </button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 }),
  },
  keyframeIndex: { type: Number, default: -1 },
});

const emit = defineEmits(['close', 'add', 'duplicate', 'insert']);

const menuRef = ref(null);
const adjustedPosition = ref({ ...props.position });

/**
 * Computed style using the dynamically adjusted position.
 */
const computedMenuStyle = computed(() => ({
  left: `${adjustedPosition.value.x}px`,
  top: `${adjustedPosition.value.y}px`,
}));

const DEFAULT_MENU_HEIGHT = 120; // fallback when getBoundingClientRect().height is 0

/**
 * Always renders the menu upward (above the click point) since it is only
 * triggered from the timeline footer at the very bottom of the screen.
 * Uses a safe fallback height when getBoundingClientRect returns 0 during
 * the initial paint.
 */
function adjustPosition() {
  if (!menuRef.value) return;

  const menuRect = menuRef.value.getBoundingClientRect();
  const menuHeight = menuRect.height || DEFAULT_MENU_HEIGHT;

  let x = props.position.x;
  let y = props.position.y;

  // Always position above the click point
  y = props.position.y - menuHeight - 8;
  // Clamp to top of viewport so it never goes off-screen
  y = Math.max(8, y);

  // If the menu overflows to the right, nudge it left
  if (menuRect.right > window.innerWidth) {
    x = window.innerWidth - menuRect.width - 8;
    if (x < 8) x = 8;
  }

  adjustedPosition.value = { x, y };
}

// Recalculate whenever the menu becomes visible (after the DOM is updated)
watch(
  () => props.visible,
  async (isVisible) => {
    if (isVisible) {
      await nextTick();
      adjustPosition();
    }
  },
  { immediate: false }
);

function handleAction(action) {
  if (action === 'add') {
    emit('add');
  } else if (action === 'duplicate') {
    emit('duplicate', props.keyframeIndex);
  } else if (action === 'insert') {
    emit('insert', props.keyframeIndex);
  }
  emit('close');
}
</script>

<style lang="scss" scoped>
.context-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}

.context-menu {
  position: fixed;
  z-index: 1000;
  min-width: 180px;
  background-color: #1f2937;
  border: 1px solid #4b5563;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  padding: 4px;
  overflow: hidden;

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: none;
    border: none;
    color: #e5e7eb;
    font-size: 13px;
    cursor: pointer;
    border-radius: 4px;
    text-align: left;
    white-space: nowrap;

    &:hover {
      background-color: #374151;
      color: #ffffff;
    }

    &:active {
      background-color: #4b5563;
    }
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    font-size: 14px;
    color: #9ca3af;
  }
}
</style>
