<script setup lang="ts">
import type { FarmState } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';
defineProps<{ farm: FarmState }>();
</script>

<template>
  <!-- Auto feeder robot — small box that patrols along the barn feed alley -->
  <g v-if="farm.autoFeeder && farm.barn && farm.barn !== 'open'" :transform="zoneTransform('barn', 0, 130)">
    <g class="feeder-patrol">
      <!-- Shadow -->
      <ellipse cx="0" cy="6" rx="10" ry="2" fill="black" opacity="0.2"/>
      <!-- Body -->
      <rect x="-9" y="-6" width="18" height="12" rx="2" fill="#0ea5e9"/>
      <rect x="-9" y="-6" width="18" height="3" fill="#0284c7"/>
      <!-- Sensor LEDs -->
      <circle cx="-4" cy="-3" r="1.2" fill="#fbbf24" class="pulse-soft"/>
      <circle cx="0" cy="-3" r="1.2" fill="#22c55e" class="pulse-soft" style="animation-delay: 0.5s"/>
      <circle cx="4" cy="-3" r="1.2" fill="#dc2626" class="pulse-soft" style="animation-delay: 1s"/>
      <!-- Tracks (wheels) -->
      <rect x="-9" y="3" width="18" height="3" fill="#1e293b"/>
      <!-- Feed nozzle on top -->
      <rect x="-2" y="-9" width="4" height="4" fill="#475569"/>
      <text x="0" y="14" text-anchor="middle" font-size="6" font-weight="bold" fill="#0ea5e9" font-family="Fredoka">YEM</text>
    </g>
  </g>
</template>

<style scoped>
.feeder-patrol {
  animation: patrol 6s ease-in-out infinite;
}
@keyframes patrol {
  0%   { transform: translateX(-90px); }
  45%  { transform: translateX(90px); }
  50%  { transform: translateX(90px) scaleX(-1); }
  95%  { transform: translateX(-90px) scaleX(-1); }
  100% { transform: translateX(-90px); }
}
</style>
