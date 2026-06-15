<script setup lang="ts">
import type { FarmState } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';
defineProps<{ farm: FarmState }>();
</script>

<template>
  <!-- Yellow TMR mixer wagon (tractor + spinning drum) -->
  <g v-if="farm.tmrMixer" :transform="zoneTransform('tmrMixer')">
    <g class="pop-in">
      <!-- Shadow -->
      <ellipse cx="0" cy="25" rx="40" ry="6" fill="black" opacity="0.2"/>

      <!-- Tractor cab (rear) -->
      <rect x="-38" y="-12" width="18" height="22" fill="#dc2626"/>
      <rect x="-36" y="-10" width="14" height="10" fill="#7dd3fc" stroke="#7c2d12" stroke-width="0.8"/>
      <circle cx="-32" cy="20" r="6" fill="#1e293b"/>
      <circle cx="-32" cy="20" r="2.5" fill="#94a3b8"/>

      <!-- Mixer drum body -->
      <rect x="-18" y="-8" width="42" height="22" fill="#fbbf24" rx="2"/>
      <rect x="-18" y="-8" width="42" height="22" fill="url(#dm-tank-grad)" opacity="0.3" rx="2"/>
      <!-- Drum side opening -->
      <ellipse cx="24" cy="3" rx="6" ry="9" fill="#7c2d12"/>

      <!-- Front wheels -->
      <circle cx="-5" cy="20" r="7" fill="#1e293b"/>
      <circle cx="-5" cy="20" r="3" fill="#94a3b8"/>
      <circle cx="18" cy="20" r="7" fill="#1e293b"/>
      <circle cx="18" cy="20" r="3" fill="#94a3b8"/>

      <!-- Spinning mixer agitator (visible through drum top) -->
      <g transform="translate(3, 3)">
        <circle r="6" fill="#92400e"/>
        <g class="spin-slow" style="animation-duration: 3s">
          <ellipse cx="0" cy="-4" rx="1.5" ry="5" fill="#fcd34d"/>
          <ellipse cx="4" cy="0" rx="5" ry="1.5" fill="#fcd34d"/>
          <ellipse cx="0" cy="4" rx="1.5" ry="5" fill="#fcd34d"/>
          <ellipse cx="-4" cy="0" rx="5" ry="1.5" fill="#fcd34d"/>
        </g>
      </g>

      <!-- Label -->
      <text x="3" y="-1" text-anchor="middle" font-size="6" font-weight="bold" fill="#7c2d12" font-family="Fredoka">TMR</text>
    </g>
  </g>
</template>
