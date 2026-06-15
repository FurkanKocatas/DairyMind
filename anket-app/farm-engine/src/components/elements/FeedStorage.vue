<script setup lang="ts">
import { computed } from 'vue';
import type { FarmState } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';
const props = defineProps<{ farm: FarmState }>();
const scale = computed(() => Math.min(0.7 + props.farm.feedStorageMonths * 0.05, 1.2));
</script>

<template>
  <g v-if="farm.feedStorageMonths > 0" :transform="zoneTransform('feedStorage')">
    <g class="pop-in">
      <ellipse cx="0" cy="65" rx="38" ry="8" fill="black" opacity="0.2"/>
      <g :transform="`scale(${scale})`">
        <rect x="-30" y="0" width="60" height="50" fill="#a16207"/>
        <polygon points="-30,0 0,-20 30,0" fill="#7c2d12"/>
        <polygon points="-30,0 0,-20 0,0" fill="#92400e"/>
        <rect x="-8" y="20" width="16" height="30" fill="#451a03"/>
        <circle cx="-3" cy="35" r="1" fill="#fbbf24"/>
        <rect x="-22" y="10" width="10" height="10" fill="#7dd3fc" stroke="#451a03" stroke-width="0.8"/>
        <text x="0" y="-25" text-anchor="middle" font-size="7" fill="#451a03" font-weight="bold" font-family="Fredoka">YEM</text>
      </g>
    </g>
  </g>
</template>
