<script setup lang="ts">
import { computed } from 'vue';
import type { FarmState } from '@/state/farm-state';
const props = defineProps<{ farm: FarmState }>();

// Drop count scales with per-cow productivity (perCowKg) — 0-30 kg → 0-6 drops
const dropCount = computed(() => Math.min(6, Math.ceil(props.farm.perCowKg / 5)));
const drops = computed(() => Array.from({ length: dropCount.value }, (_, i) => i));

// Drop path: from parlor (640, 380) to tank (700, 530)
// We use individual animations with staggered delays so the stream looks continuous
</script>

<template>
  <!-- Milk drops flowing from parlor → tank, only when both exist and there's production -->
  <g v-if="farm.parlor && farm.tank && farm.perCowKg > 0">
    <g v-for="i in drops" :key="i" class="milk-drop" :style="`animation-delay: ${i * 0.4}s`">
      <ellipse cx="0" cy="0" rx="2.5" ry="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.5"/>
    </g>
  </g>
</template>

<style scoped>
.milk-drop {
  animation: dropFlow 2.4s linear infinite;
  transform-origin: center;
}
@keyframes dropFlow {
  0%   { transform: translate(640px, 380px); opacity: 0; }
  10%  { opacity: 0.9; }
  100% { transform: translate(700px, 530px); opacity: 0; }
}
</style>
