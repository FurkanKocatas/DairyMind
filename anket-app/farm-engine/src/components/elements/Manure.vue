<script setup lang="ts">
import type { FarmState } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';
defineProps<{ farm: FarmState }>();
</script>

<template>
  <g v-if="farm.manure === 'lagoon'" :transform="zoneTransform('manure')">
    <g class="pop-in">
      <ellipse cx="0" cy="8" rx="50" ry="12" fill="#451a03"/>
      <ellipse cx="0" cy="3" rx="46" ry="10" fill="#78350f"/>
      <ellipse cx="0" cy="0" rx="42" ry="8" fill="#92400e"/>
    </g>
  </g>
  <g v-else-if="farm.manure === 'compost'" :transform="zoneTransform('manure')">
    <g class="pop-in">
      <ellipse cx="0" cy="8" rx="45" ry="11" fill="#451a03"/>
      <path d="M -40,5 Q 0,-20 40,5 L 40,8 L -40,8 Z" fill="#78350f"/>
      <g class="smoke"><ellipse cx="-5" cy="-15" rx="6" ry="4" fill="white" opacity="0.6"/></g>
      <g class="smoke" style="animation-delay: 1.5s"><ellipse cx="10" cy="-12" rx="5" ry="3" fill="white" opacity="0.6"/></g>
    </g>
  </g>
  <g v-else-if="farm.manure === 'biogas'" :transform="zoneTransform('manure', 0, -10)">
    <g class="pop-in">
      <ellipse cx="0" cy="35" rx="35" ry="10" fill="black" opacity="0.2"/>
      <circle cx="0" cy="5" r="32" fill="#15803d"/>
      <circle cx="0" cy="5" r="30" fill="#16a34a"/>
      <text x="0" y="10" text-anchor="middle" font-size="9" fill="white" font-weight="bold" font-family="Fredoka">⚡ BİYOGAZ</text>
    </g>
  </g>
</template>
