<script setup lang="ts">
import type { FarmState } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';
defineProps<{ farm: FarmState }>();
</script>

<template>
  <g v-if="(farm.cooling === 'fan_shower' || farm.cooling === 'shower') && farm.barn && farm.barn !== 'open'"
     :transform="zoneTransform('barnRoof', 0, 5)">
    <g class="pop-in">
      <g class="pulse-soft">
        <circle cx="-32" cy="-18" r="2.2" fill="#60a5fa" opacity="0.8"/>
        <circle cx="-16" cy="-25" r="2.2" fill="#60a5fa" opacity="0.8"/>
        <circle cx="0" cy="-28" r="2.2" fill="#60a5fa" opacity="0.8"/>
        <circle cx="16" cy="-25" r="2.2" fill="#60a5fa" opacity="0.8"/>
        <circle cx="32" cy="-18" r="2.2" fill="#60a5fa" opacity="0.8"/>
        <ellipse cx="-32" cy="-5" rx="1" ry="4" fill="#3b82f6"/>
        <ellipse cx="-16" cy="-12" rx="1" ry="4" fill="#3b82f6"/>
        <ellipse cx="0" cy="-15" rx="1" ry="4" fill="#3b82f6"/>
        <ellipse cx="16" cy="-12" rx="1" ry="4" fill="#3b82f6"/>
        <ellipse cx="32" cy="-5" rx="1" ry="4" fill="#3b82f6"/>
      </g>
    </g>
  </g>
</template>
