<script setup lang="ts">
import { COLORS } from '@/design-tokens';
</script>

<template>
  <!-- Sun -->
  <svg viewBox="0 0 100 100" class="absolute top-3 right-6 w-16 h-16 z-10 pointer-events-none">
    <g class="sun-rays">
      <circle cx="50" cy="50" r="38" :fill="COLORS.sun.halo" opacity="0.35"/>
      <circle cx="50" cy="50" r="32" :fill="COLORS.sun.glow" opacity="0.5"/>
    </g>
    <circle cx="50" cy="50" r="20" :fill="COLORS.sun.glow"/>
    <circle cx="50" cy="50" r="16" :fill="COLORS.sun.core"/>
    <circle cx="46" cy="46" r="3" fill="white" opacity="0.6"/>
  </svg>

  <!-- Drifting clouds -->
  <svg viewBox="0 0 100 30" class="absolute top-10 cloud-drift w-32 h-10 opacity-90 pointer-events-none" preserveAspectRatio="none">
    <ellipse cx="22" cy="18" rx="16" ry="9" fill="white"/>
    <ellipse cx="42" cy="14" rx="20" ry="11" fill="white"/>
    <ellipse cx="65" cy="18" rx="18" ry="9" fill="white"/>
  </svg>
  <svg viewBox="0 0 100 30" class="absolute top-24 cloud-drift2 w-24 h-8 opacity-80 pointer-events-none" preserveAspectRatio="none">
    <ellipse cx="20" cy="15" rx="14" ry="7" fill="white"/>
    <ellipse cx="40" cy="13" rx="16" ry="8" fill="white"/>
    <ellipse cx="58" cy="17" rx="12" ry="6" fill="white"/>
  </svg>
</template>
