<template>
  <svg ref="svgElement" class="field-lines" viewBox="0 0 1240 740" aria-hidden="true">
    <!-- Outer run-off area -->
    <rect x="0" y="0" width="1240" height="740" class="runoff-area" />

    <!-- Main playable area -->
    <rect x="20" y="20" width="1200" height="700" class="playable-area" />

    <!-- In-goal areas -->
    <rect x="20" y="20" width="100" height="700" fill="rgba(0, 0, 0, 0.14)" />
    <rect x="1120" y="20" width="100" height="700" fill="rgba(0, 0, 0, 0.14)" />

    <!-- Goal lines -->
    <line x1="120" y1="20" x2="120" y2="720" class="solid-line" />
    <line x1="1120" y1="20" x2="1120" y2="720" class="solid-line" />

    <!-- 22-meter lines -->
    <line x1="340" y1="20" x2="340" y2="720" class="solid-line" />
    <line x1="900" y1="20" x2="900" y2="720" class="solid-line" />

    <!-- Halfway line -->
    <line x1="620" y1="20" x2="620" y2="720" class="solid-line" />

    <!-- 10-meter dashed lines -->
    <line x1="520" y1="20" x2="520" y2="720" class="dashed-line" />
    <line x1="720" y1="20" x2="720" y2="720" class="dashed-line" />

    <!-- 5-meter dashed lines -->
    <line x1="170" y1="20" x2="170" y2="720" class="dashed-line" />
    <line x1="1070" y1="20" x2="1070" y2="720" class="dashed-line" />

    <!-- Top 5m lineout marks -->
    <line x1="150" y1="70" x2="190" y2="70" class="mark-line" />
    <line x1="320" y1="70" x2="360" y2="70" class="mark-line" />
    <line x1="500" y1="70" x2="540" y2="70" class="mark-line" />
    <line x1="600" y1="70" x2="640" y2="70" class="mark-line" />
    <line x1="700" y1="70" x2="740" y2="70" class="mark-line" />
    <line x1="880" y1="70" x2="920" y2="70" class="mark-line" />
    <line x1="1050" y1="70" x2="1090" y2="70" class="mark-line" />

    <!-- Top 15m lineout marks -->
    <line x1="150" y1="170" x2="190" y2="170" class="mark-line" />
    <line x1="320" y1="170" x2="360" y2="170" class="mark-line" />
    <line x1="500" y1="170" x2="540" y2="170" class="mark-line" />
    <line x1="600" y1="170" x2="640" y2="170" class="mark-line" />
    <line x1="700" y1="170" x2="740" y2="170" class="mark-line" />
    <line x1="880" y1="170" x2="920" y2="170" class="mark-line" />
    <line x1="1050" y1="170" x2="1090" y2="170" class="mark-line" />

    <!-- Bottom 15m lineout marks -->
    <line x1="150" y1="570" x2="190" y2="570" class="mark-line" />
    <line x1="320" y1="570" x2="360" y2="570" class="mark-line" />
    <line x1="500" y1="570" x2="540" y2="570" class="mark-line" />
    <line x1="600" y1="570" x2="640" y2="570" class="mark-line" />
    <line x1="700" y1="570" x2="740" y2="570" class="mark-line" />
    <line x1="880" y1="570" x2="920" y2="570" class="mark-line" />
    <line x1="1050" y1="570" x2="1090" y2="570" class="mark-line" />

    <!-- Bottom 5m lineout marks -->
    <line x1="150" y1="670" x2="190" y2="670" class="mark-line" />
    <line x1="320" y1="670" x2="360" y2="670" class="mark-line" />
    <line x1="500" y1="670" x2="540" y2="670" class="mark-line" />
    <line x1="600" y1="670" x2="640" y2="670" class="mark-line" />
    <line x1="700" y1="670" x2="740" y2="670" class="mark-line" />
    <line x1="880" y1="670" x2="920" y2="670" class="mark-line" />
    <line x1="1050" y1="670" x2="1090" y2="670" class="mark-line" />

    <!-- Goal posts (H-shape) -->
    <line x1="120" y1="342" x2="120" y2="398" class="goal-post" />
    <line x1="124" y1="342" x2="124" y2="398" class="goal-post" />
    <line x1="120" y1="370" x2="124" y2="370" class="goal-post" />

    <line x1="1120" y1="342" x2="1120" y2="398" class="goal-post" />
    <line x1="1116" y1="342" x2="1116" y2="398" class="goal-post" />
    <line x1="1116" y1="370" x2="1120" y2="370" class="goal-post" />
  </svg>
</template>

<script setup>
import { ref } from 'vue';

const svgElement = ref(null);

defineExpose({
  svgElement,
});
</script>

<style lang="scss" scoped>
.runoff-area {
  fill: #276749;
}

.playable-area {
  fill: #2f855a;
  stroke: rgba(255, 255, 255, 0.9);
  stroke-width: 3;
}

.field-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.solid-line {
  stroke: rgba(255, 255, 255, 0.9);
  stroke-width: 3;
}

.dashed-line {
  stroke: rgba(255, 255, 255, 0.75);
  stroke-width: 2;
  stroke-dasharray: 12 12;
}

.goal-post {
  stroke: rgba(255, 215, 0, 0.95);
  stroke-width: 4;
  stroke-linecap: round;
}

.mark-line {
  stroke: rgba(255, 255, 255, 0.9);
  stroke-width: 3;
  stroke-linecap: round;
}
</style>
