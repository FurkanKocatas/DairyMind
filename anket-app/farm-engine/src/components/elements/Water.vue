<script setup lang="ts">
import type { FarmState } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';
defineProps<{ farm: FarmState }>();
</script>

<template>
  <g v-if="farm.water === 'well'" :transform="zoneTransform('water')">
    <g class="pop-in">
      <ellipse cx="0" cy="5" rx="22" ry="11" fill="#7c2d12"/>
      <ellipse cx="0" cy="0" rx="22" ry="11" fill="#a16207"/>
      <ellipse cx="0" cy="0" rx="16" ry="7" fill="#1e3a8a"/>
      <ellipse cx="0" cy="-1" rx="14" ry="6" fill="#3b82f6"/>
      <rect x="-2" y="-30" width="4" height="30" fill="#92400e"/>
      <line x1="-12" y1="-20" x2="12" y2="-20" stroke="#92400e" stroke-width="2"/>
    </g>
  </g>
  <g v-else-if="farm.water === 'pond'" :transform="zoneTransform('water', 0, 10)">
    <g class="pop-in">
      <ellipse cx="0" cy="3" rx="42" ry="19" fill="#1e3a8a" opacity="0.4"/>
      <ellipse cx="-2" cy="-2" rx="38" ry="16" fill="#3b82f6"/>
      <ellipse cx="-2" cy="-3" rx="35" ry="14" fill="#60a5fa" opacity="0.7"/>
    </g>
  </g>
  <g v-else-if="farm.water === 'mains'" :transform="zoneTransform('water')">
    <g class="pop-in">
      <rect x="-12" y="-32" width="24" height="34" fill="#64748b" rx="2"/>
      <rect x="-10" y="-30" width="20" height="30" fill="#94a3b8" rx="1"/>
      <circle cx="0" cy="-14" r="6" fill="#1e3a8a"/>
      <text x="0" y="-11" text-anchor="middle" font-size="6" fill="white" font-weight="bold">H₂O</text>
    </g>
  </g>
</template>
