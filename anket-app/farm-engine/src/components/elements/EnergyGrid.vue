<script setup lang="ts">
import type { FarmState } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';
defineProps<{ farm: FarmState }>();
</script>

<template>
  <g v-if="farm.energy === 'grid' || farm.energy === 'mixed'" :transform="zoneTransform('energyPole')">
    <g class="pop-in">
      <line x1="0" y1="0" x2="380" y2="-80" stroke="#1e293b" stroke-width="1.5" opacity="0.5"/>
      <rect x="-5" y="-40" width="6" height="60" fill="#475569"/>
      <line x1="-8" y1="-30" x2="8" y2="-30" stroke="#475569" stroke-width="2"/>
    </g>
  </g>
</template>
