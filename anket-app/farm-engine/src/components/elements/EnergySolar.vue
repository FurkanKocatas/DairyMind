<script setup lang="ts">
import type { FarmState } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';
defineProps<{ farm: FarmState }>();
</script>

<template>
  <g v-if="farm.energy === 'solar' || farm.energy === 'mixed'" :transform="zoneTransform('solar')">
    <g class="pop-in">
      <polygon points="0,0 50,-25 90,-5 40,20" fill="#1e3a8a"/>
      <polygon points="0,0 50,-25 90,-5 40,20" fill="url(#dm-solar-grad)" opacity="0.7"/>
      <line x1="15" y1="-7" x2="55" y2="-15" stroke="#1e40af" stroke-width="0.7"/>
      <line x1="30" y1="-2" x2="70" y2="-10" stroke="#1e40af" stroke-width="0.7"/>
      <line x1="50" y1="-25" x2="40" y2="20" stroke="#1e40af" stroke-width="0.7"/>
      <line x1="65" y1="-15" x2="55" y2="10" stroke="#1e40af" stroke-width="0.7"/>
      <line x1="30" y1="0" x2="33" y2="20" stroke="#475569" stroke-width="2"/>
      <line x1="60" y1="10" x2="63" y2="30" stroke="#475569" stroke-width="2"/>
      <circle cx="45" cy="-12" r="2" fill="white" class="pulse-soft"/>
    </g>
  </g>
</template>
