<script setup lang="ts">
import { COLORS } from '@/design-tokens';
</script>

<template>
  <g>
    <!-- Distant hills -->
    <path d="M 0,200 Q 200,150 400,180 T 900,170 L 900,250 L 0,250 Z" :fill="COLORS.hills.far" opacity="0.35"/>
    <path d="M 0,230 Q 180,200 400,220 T 900,215 L 900,260 L 0,260 Z" :fill="COLORS.hills.near" opacity="0.4"/>

    <!-- Iso ground — scaled 1.5x around its center (450,335); buildings stay fixed -->
    <g transform="translate(450,335) scale(1.5) translate(-450,-335)">
      <polygon points="450,160 820,335 450,510 80,335" fill="url(#dm-grass-grad)" :stroke="COLORS.ground.dark" stroke-width="1.33"/>
      <polygon points="450,200 740,335 450,470 160,335" :fill="COLORS.ground.mid" opacity="0.4"/>

      <!-- Grid lines (subtle) -->
      <g :stroke="COLORS.ground.dark" stroke-width="0.33" opacity="0.3">
        <line x1="280" y1="247" x2="620" y2="247"/>
        <line x1="190" y1="291" x2="710" y2="291"/>
        <line x1="190" y1="378" x2="710" y2="378"/>
        <line x1="280" y1="423" x2="620" y2="423"/>
        <line x1="365" y1="203" x2="365" y2="467"/>
        <line x1="450" y1="160" x2="450" y2="510"/>
        <line x1="535" y1="203" x2="535" y2="467"/>
      </g>
    </g>

    <!-- Path -->
    <path d="M 450,510 Q 600,540 820,560" stroke="#a16207" stroke-width="7" fill="none" opacity="0.45"/>

    <!-- Bushes -->
    <g class="cow-bob">
      <circle cx="115" cy="355" r="14" fill="#15803d"/>
      <circle cx="130" cy="350" r="10" fill="#22c55e"/>
    </g>
    <g class="cow-bob" style="animation-delay: 1.2s">
      <circle cx="810" cy="385" r="14" fill="#15803d"/>
      <circle cx="795" cy="380" r="10" fill="#22c55e"/>
    </g>
  </g>
</template>
