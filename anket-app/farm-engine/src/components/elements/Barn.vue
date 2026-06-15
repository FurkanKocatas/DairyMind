<script setup lang="ts">
import type { FarmState } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';
defineProps<{ farm: FarmState }>();
</script>

<template>
  <!-- Free-stall: open sides, red roof, DAIRYMIND sign -->
  <g v-if="farm.barn === 'free'" :transform="zoneTransform('barn')">
    <g class="pop-in">
      <ellipse cx="0" cy="115" rx="145" ry="22" fill="black" opacity="0.2"/>
      <polygon points="-130,40 -130,90 0,160 130,90 130,40 0,-30" fill="url(#dm-barn-front)"/>
      <polygon points="-130,40 -130,90 0,160 0,110" fill="#fde68a"/>
      <polygon points="0,110 0,160 130,90 130,40" fill="url(#dm-barn-side)"/>
      <polygon points="-130,40 0,-30 130,40 0,40" fill="url(#dm-roof-grad)"/>
      <polygon points="0,-30 130,40 0,40" fill="#991b1b"/>
      <rect x="-115" y="50" width="10" height="35" fill="#1e293b" opacity="0.6"/>
      <rect x="-95" y="60" width="10" height="35" fill="#1e293b" opacity="0.6"/>
      <rect x="-75" y="70" width="10" height="35" fill="#1e293b" opacity="0.6"/>
      <rect x="-55" y="80" width="10" height="35" fill="#1e293b" opacity="0.6"/>
      <rect x="-35" y="90" width="10" height="35" fill="#1e293b" opacity="0.6"/>
      <rect x="-45" y="-10" width="90" height="18" fill="#fbbf24" rx="3" stroke="#92400e" stroke-width="1"/>
      <text x="0" y="3" text-anchor="middle" font-size="10" fill="#7c2d12" font-weight="bold" font-family="Fredoka">DAIRYMIND</text>
    </g>
  </g>

  <!-- Tie-stall: closed orange, windows -->
  <g v-else-if="farm.barn === 'tie'" :transform="zoneTransform('barn')">
    <g class="pop-in">
      <ellipse cx="0" cy="105" rx="125" ry="20" fill="black" opacity="0.2"/>
      <polygon points="-110,40 -110,90 0,150 110,90 110,40 0,-15" fill="#fed7aa"/>
      <polygon points="-110,40 -110,90 0,150 0,100" fill="#fdba74"/>
      <polygon points="0,100 0,150 110,90 110,40" fill="#fb923c"/>
      <polygon points="-110,40 0,-15 110,40 0,40" fill="#7c2d12"/>
      <polygon points="0,-15 110,40 0,40" fill="#5c1f0a"/>
      <rect x="-14" y="80" width="28" height="40" fill="#451a03"/>
      <rect x="-90" y="55" width="14" height="14" fill="#7dd3fc" stroke="#451a03" stroke-width="1"/>
      <rect x="-65" y="65" width="14" height="14" fill="#7dd3fc" stroke="#451a03" stroke-width="1"/>
    </g>
  </g>

  <!-- Open lot: canopy + fence -->
  <g v-else-if="farm.barn === 'open'" :transform="zoneTransform('barn', 0, 30)">
    <g class="pop-in">
      <ellipse cx="0" cy="80" rx="155" ry="18" fill="black" opacity="0.1"/>
      <polygon points="-50,15 50,15 70,40 -70,40" fill="#7c2d12"/>
      <polygon points="-70,40 -50,15 50,15 70,40 0,55" fill="#92400e" opacity="0.8"/>
      <line x1="-130" y1="60" x2="130" y2="60" stroke="#92400e" stroke-width="3"/>
    </g>
  </g>
</template>
