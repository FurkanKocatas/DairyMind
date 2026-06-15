<script setup lang="ts">
import type { FarmState, BeddingMat } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';
defineProps<{ farm: FarmState }>();

const COLOR_BY_MAT: Record<BeddingMat, string> = {
  sand: '#fde68a',
  sawdust: '#fb923c',
  rubber: '#1e293b',
  straw: '#facc15',
  waterbed: '#3b82f6',
  compost: '#78350f'
};

function colorFor(b?: BeddingMat) {
  return b ? COLOR_BY_MAT[b] : '#94a3b8';
}
</script>

<template>
  <g v-if="farm.bedding.length > 0 && farm.barn" :transform="zoneTransform('barnSouth', 0, 45)">
    <g class="pop-in">
      <text x="-90" y="0" text-anchor="end" font-size="9" fill="#475569" font-weight="bold" font-family="Fredoka">
        Yataklık:
      </text>
      <template v-for="(b, i) in farm.bedding.slice(0, 5)" :key="b">
        <g :transform="`translate(${-72 + i * 22}, -4)`">
          <circle r="8" stroke="white" stroke-width="1.5" :fill="colorFor(b)"/>
        </g>
      </template>
    </g>
  </g>
</template>
