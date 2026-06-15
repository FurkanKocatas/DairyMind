<script setup lang="ts">
import { COLORS } from '@/design-tokens';
</script>

<template>
  <defs>
    <linearGradient id="dm-solar-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" :stop-color="COLORS.solar.face" stop-opacity="0.9"/>
      <stop offset="100%" :stop-color="COLORS.solar.panel" stop-opacity="0.5"/>
    </linearGradient>
    <linearGradient id="dm-barn-front" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" :stop-color="COLORS.barn.free.front"/>
      <stop offset="100%" :stop-color="COLORS.barn.free.frontMid"/>
    </linearGradient>
    <linearGradient id="dm-barn-side" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" :stop-color="COLORS.barn.free.side"/>
      <stop offset="100%" :stop-color="COLORS.barn.free.sideDark"/>
    </linearGradient>
    <linearGradient id="dm-roof-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" :stop-color="COLORS.barn.free.roof"/>
      <stop offset="100%" :stop-color="COLORS.barn.free.roofDark"/>
    </linearGradient>
    <radialGradient id="dm-grass-grad" cx="0.5" cy="0.5" r="0.7">
      <stop offset="0%" :stop-color="COLORS.ground.light"/>
      <stop offset="100%" :stop-color="COLORS.ground.dark"/>
    </radialGradient>
    <linearGradient id="dm-tank-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" :stop-color="COLORS.tank.cap"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
    <linearGradient id="dm-silo-grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#64748b"/>
      <stop offset="50%" :stop-color="COLORS.silo.cap"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
  </defs>
</template>
