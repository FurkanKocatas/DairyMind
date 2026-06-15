<script setup lang="ts">
import { computed } from 'vue';
import type { FarmState } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';

const props = defineProps<{ farm: FarmState }>();

// Window glow color by lighting type — designer can tweak here
const COLOR: Record<string, string> = {
  led:         '#fef9c3', // bright cool white-yellow
  fluorescent: '#fde047', // pale yellow
  halogen:     '#fb923c', // warm orange
  mixed:       '#facc15', // warm yellow
  natural:     'transparent' // no artificial glow
};

const glow = computed(() => COLOR[props.farm.lighting ?? 'natural'] ?? 'transparent');
const opacity = computed(() => (props.farm.lighting && props.farm.lighting !== 'natural') ? 0.9 : 0);
</script>

<template>
  <!-- Glow overlays on barn windows (only when barn exists and not open lot) -->
  <g v-if="farm.barn && farm.barn !== 'open' && farm.lighting" :transform="zoneTransform('barn')">
    <g class="pop-in" :opacity="opacity">
      <!-- 5 glowing window slots along barn side -->
      <circle cx="-115" cy="65" r="5" :fill="glow" class="pulse-soft"/>
      <circle cx="-95"  cy="75" r="5" :fill="glow" class="pulse-soft"/>
      <circle cx="-75"  cy="85" r="5" :fill="glow" class="pulse-soft"/>
      <circle cx="-55"  cy="95" r="5" :fill="glow" class="pulse-soft"/>
      <circle cx="-35"  cy="105" r="5" :fill="glow" class="pulse-soft"/>
    </g>
  </g>
</template>
