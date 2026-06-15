<script setup lang="ts">
import { computed } from 'vue';
import type { FarmState } from '@/state/farm-state';
import { ZONES } from '@/layout/zones';
const props = defineProps<{ farm: FarmState }>();

const scale = computed(() =>
  props.farm.tank === 'small' ? 0.75 : props.farm.tank === 'medium' ? 0.95 : 1.15
);
const sizeLabel = computed(() =>
  props.farm.tank === 'small' ? '500L' : props.farm.tank === 'medium' ? '2000L' : '5000L'
);
const shapeBadge = computed(() => {
  const s = props.farm.tankShape;
  return s === 'ibt' ? 'IBT' : s === 'open_dx' ? 'DX' : s === 'pre_cooler' ? 'PC' : s === 'direct' ? 'DE' : '';
});
</script>

<template>
  <g v-if="farm.tank" :transform="`translate(${ZONES.tank.x}, ${ZONES.tank.y}) scale(${scale})`">
    <g class="pop-in">
      <ellipse cx="0" cy="25" rx="40" ry="9" fill="black" opacity="0.2"/>
      <ellipse cx="0" cy="15" rx="36" ry="8" fill="#94a3b8"/>

      <!-- Body: shape varies by tankShape -->
      <!-- IBT: rectangular with ice block frame -->
      <template v-if="farm.tankShape === 'ibt'">
        <rect x="-38" y="-15" width="76" height="30" fill="url(#dm-tank-grad)" rx="2"/>
        <rect x="-38" y="-15" width="76" height="6" fill="#60a5fa" opacity="0.5"/>
        <rect x="-38" y="-15" width="6" height="30" fill="#60a5fa" opacity="0.5"/>
      </template>
      <!-- Pre-cooler: extra side unit -->
      <template v-else-if="farm.tankShape === 'pre_cooler'">
        <rect x="-30" y="-15" width="60" height="30" fill="url(#dm-tank-grad)"/>
        <rect x="32" y="-10" width="14" height="20" fill="#475569" rx="1"/>
        <circle cx="39" cy="0" r="3" fill="#fbbf24" class="pulse-soft"/>
      </template>
      <!-- Direct expansion: round profile -->
      <template v-else-if="farm.tankShape === 'direct'">
        <ellipse cx="0" cy="0" rx="38" ry="18" fill="url(#dm-tank-grad)"/>
        <ellipse cx="0" cy="-12" rx="38" ry="6" fill="#f1f5f9"/>
      </template>
      <!-- Default / open DX: classic flat-top cylinder -->
      <template v-else>
        <rect x="-36" y="-15" width="72" height="30" fill="url(#dm-tank-grad)"/>
      </template>

      <ellipse cx="0" cy="-15" rx="36" ry="8" fill="#f1f5f9"/>
      <ellipse cx="0" cy="-15" rx="32" ry="6" fill="#e2e8f0"/>

      <!-- Size label -->
      <text x="0" y="3" text-anchor="middle" font-size="8" fill="#1e293b" font-weight="bold" font-family="Fredoka">
        🥛 {{ sizeLabel }}
      </text>

      <!-- Shape badge (top-right of tank) -->
      <g v-if="shapeBadge" transform="translate(28, -22)">
        <rect x="-10" y="-5" width="20" height="10" rx="5" fill="#0ea5e9"/>
        <text x="0" y="3" text-anchor="middle" font-size="7" font-weight="bold" fill="white" font-family="Fredoka">{{ shapeBadge }}</text>
      </g>
    </g>
  </g>
</template>
