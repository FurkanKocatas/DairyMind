<script setup lang="ts">
import type { FarmState } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';
defineProps<{ farm: FarmState }>();
</script>

<template>
  <!-- Mechanical → 2 extra fans flank center -->
  <g v-if="farm.ventilation === 'mechanical' && farm.barn && farm.barn !== 'open'" :transform="zoneTransform('barn', 0, -22)">
    <g class="pop-in">
      <g transform="translate(-55, 0)">
        <rect x="-9" y="-9" width="18" height="18" fill="#475569" rx="2"/>
        <circle cx="0" cy="0" r="7" fill="#1e293b"/>
        <g class="spin-slow" style="animation-duration: 4s">
          <path d="M 0,-7 Q 2,-2 0,0 Q -2,-2 0,-7 Z" fill="#94a3b8"/>
          <path d="M 7,0 Q 2,2 0,0 Q 2,-2 7,0 Z" fill="#94a3b8"/>
          <path d="M 0,7 Q -2,2 0,0 Q 2,2 0,7 Z" fill="#94a3b8"/>
          <path d="M -7,0 Q -2,-2 0,0 Q -2,2 -7,0 Z" fill="#94a3b8"/>
        </g>
        <circle cx="0" cy="0" r="1.5" fill="#fbbf24"/>
      </g>
      <g transform="translate(55, 0)">
        <rect x="-9" y="-9" width="18" height="18" fill="#475569" rx="2"/>
        <circle cx="0" cy="0" r="7" fill="#1e293b"/>
        <g class="spin-slow" style="animation-duration: 4.5s">
          <path d="M 0,-7 Q 2,-2 0,0 Q -2,-2 0,-7 Z" fill="#94a3b8"/>
          <path d="M 7,0 Q 2,2 0,0 Q 2,-2 7,0 Z" fill="#94a3b8"/>
          <path d="M 0,7 Q -2,2 0,0 Q 2,2 0,7 Z" fill="#94a3b8"/>
          <path d="M -7,0 Q -2,-2 0,0 Q -2,2 -7,0 Z" fill="#94a3b8"/>
        </g>
        <circle cx="0" cy="0" r="1.5" fill="#fbbf24"/>
      </g>
    </g>
  </g>

  <!-- Natural → extra windows on barn side -->
  <g v-else-if="farm.ventilation === 'natural' && farm.barn" :transform="zoneTransform('barn')">
    <g class="pop-in">
      <rect x="-110" y="55" width="12" height="20" fill="#7dd3fc" stroke="#451a03" stroke-width="1" opacity="0.85"/>
      <rect x="-85" y="62" width="12" height="20" fill="#7dd3fc" stroke="#451a03" stroke-width="1" opacity="0.85"/>
      <rect x="70" y="62" width="12" height="20" fill="#7dd3fc" stroke="#451a03" stroke-width="1" opacity="0.85"/>
      <rect x="95" y="55" width="12" height="20" fill="#7dd3fc" stroke="#451a03" stroke-width="1" opacity="0.85"/>
    </g>
  </g>
</template>
