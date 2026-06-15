<script setup lang="ts">
import type { FarmState } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';
defineProps<{ farm: FarmState }>();
</script>

<template>
  <g v-if="farm.parlor === 'herringbone'" :transform="zoneTransform('parlor')">
    <g class="pop-in">
      <ellipse cx="0" cy="60" rx="65" ry="12" fill="black" opacity="0.2"/>
      <polygon points="-55,15 -55,40 0,75 55,40 55,15 0,-15" fill="#bfdbfe"/>
      <polygon points="-55,15 -55,40 0,75 0,45" fill="#93c5fd"/>
      <polygon points="0,45 0,75 55,40 55,15" fill="#60a5fa"/>
      <polygon points="-55,15 0,-15 55,15 0,15" fill="#1d4ed8"/>
      <polygon points="0,-15 55,15 0,15" fill="#1e40af"/>
      <text x="0" y="38" text-anchor="middle" font-size="9" fill="#1e3a8a" font-weight="bold" font-family="Fredoka">SAĞIM</text>
    </g>
  </g>
  <g v-else-if="farm.parlor === 'robot'" :transform="zoneTransform('parlor')">
    <g class="pop-in">
      <ellipse cx="0" cy="60" rx="50" ry="12" fill="black" opacity="0.2"/>
      <polygon points="-40,5 -40,40 0,70 40,40 40,5 0,-25" fill="#e0e7ff"/>
      <polygon points="-40,5 -40,40 0,70 0,35" fill="#c7d2fe"/>
      <polygon points="0,35 0,70 40,40 40,5" fill="#a5b4fc"/>
      <polygon points="-40,5 0,-25 40,5 0,5" fill="#4338ca"/>
      <polygon points="0,-25 40,5 0,5" fill="#312e81"/>
      <g class="pulse-soft">
        <circle cx="-15" cy="25" r="2" fill="#fbbf24"/>
        <circle cx="-5" cy="25" r="2" fill="#22c55e"/>
        <circle cx="5" cy="25" r="2" fill="#3b82f6"/>
      </g>
      <text x="0" y="20" text-anchor="middle" font-size="9" fill="#312e81" font-weight="bold" font-family="Fredoka">🤖 ROBOT</text>
    </g>
  </g>
  <g v-else-if="farm.parlor === 'rotary'" :transform="zoneTransform('parlor')">
    <g class="pop-in">
      <ellipse cx="0" cy="60" rx="60" ry="14" fill="black" opacity="0.2"/>
      <ellipse cx="0" cy="40" rx="55" ry="24" fill="#475569"/>
      <g class="spin-slow">
        <ellipse cx="0" cy="40" rx="50" ry="20" fill="#94a3b8"/>
        <circle cx="-35" cy="40" r="3" fill="#1e293b"/>
        <circle cx="35" cy="40" r="3" fill="#1e293b"/>
        <circle cx="0" cy="22" r="3" fill="#1e293b"/>
        <circle cx="0" cy="58" r="3" fill="#1e293b"/>
      </g>
      <circle cx="0" cy="40" r="8" fill="#1e293b"/>
    </g>
  </g>
</template>
