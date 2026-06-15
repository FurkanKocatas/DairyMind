<script setup lang="ts">
import type { FarmState } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';
defineProps<{ farm: FarmState }>();
</script>

<template>
  <!-- Always-on roof fan when any barn (not open lot) -->
  <g v-if="farm.barn && farm.barn !== 'open'" :transform="zoneTransform('barnRoof')">
    <g class="pop-in">
      <rect x="-12" y="-12" width="24" height="24" fill="#475569" rx="3"/>
      <circle cx="0" cy="0" r="9" fill="#1e293b"/>
      <g class="spin-slow">
        <path d="M 0,-9 Q 3,-3 0,0 Q -3,-3 0,-9 Z" fill="#94a3b8"/>
        <path d="M 9,0 Q 3,3 0,0 Q 3,-3 9,0 Z" fill="#94a3b8"/>
        <path d="M 0,9 Q -3,3 0,0 Q 3,3 0,9 Z" fill="#94a3b8"/>
        <path d="M -9,0 Q -3,-3 0,0 Q -3,3 -9,0 Z" fill="#94a3b8"/>
      </g>
      <circle cx="0" cy="0" r="2" fill="#fbbf24"/>
    </g>
  </g>
</template>
