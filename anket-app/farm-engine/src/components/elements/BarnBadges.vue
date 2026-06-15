<script setup lang="ts">
import type { FarmState } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';
import { COLORS } from '@/design-tokens';
defineProps<{ farm: FarmState }>();
</script>

<template>
  <!-- Area badge (left under barn) -->
  <g v-if="farm.barnAreaM2 > 0" :transform="zoneTransform('barnSouth', -55, 0)">
    <g class="pop-in">
      <rect x="-34" y="-11" width="68" height="22" rx="11" :fill="COLORS.badge.area.bg" stroke="white" stroke-width="1.5"/>
      <text x="0" y="4" text-anchor="middle" font-size="10" font-weight="bold" :fill="COLORS.badge.area.text" font-family="Fredoka">
        🏠 {{ farm.barnAreaM2 }}m²
      </text>
    </g>
  </g>

  <!-- Capacity badge (right under barn, slightly below area) -->
  <g v-if="farm.barnCapacity > 0" :transform="zoneTransform('barnSouth', 55, 20)">
    <g class="pop-in">
      <rect x="-38" y="-11" width="76" height="22" rx="11" :fill="COLORS.badge.capacity.bg" stroke="white" stroke-width="1.5"/>
      <text x="0" y="4" text-anchor="middle" font-size="10" font-weight="bold" :fill="COLORS.badge.capacity.text" font-family="Fredoka">
        👥 {{ farm.barnCapacity }} baş
      </text>
    </g>
  </g>
</template>
