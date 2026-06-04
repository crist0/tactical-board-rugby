<template>
  <div class="app-header">
    <span class="label">Header</span>
    <div class="header-actions">
      <button
        class="header-btn"
        :class="{ 'header-btn--disabled': historyStore.past.length === 0 }"
        :disabled="historyStore.past.length === 0"
        @click="historyStore.undo()"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 :size="18" />
      </button>
      <button
        class="header-btn"
        :class="{ 'header-btn--disabled': historyStore.future.length === 0 }"
        :disabled="historyStore.future.length === 0"
        @click="historyStore.redo()"
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 :size="18" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { Undo2, Redo2 } from 'lucide-vue-next';
import { useHistoryStore } from '@/stores/historyStore';

const historyStore = useHistoryStore();
</script>

<style lang="scss" scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #243447;
  color: #f7fafc;
  padding: 0 16px;
}

.label {
  font-weight: 700;
  letter-spacing: 0.03em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 6px;
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

  &--disabled {
    opacity: 0.4;
    cursor: default;

    &:hover {
      background-color: transparent;
      color: #9ca3af;
    }

    &:active {
      background-color: transparent;
      color: #9ca3af;
    }
  }
}
</style>