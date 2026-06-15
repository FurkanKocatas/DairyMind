<script setup lang="ts">
import type { FarmState } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';
defineProps<{ farm: FarmState }>();
</script>

<template>
  <!-- Single worker figure + count badge (no literal multiplication) -->
  <g v-if="farm.workers > 0" :transform="zoneTransform('workers')">
    <g class="pop-in">
      <g class="cow-bob">
        <!-- Body -->
        <rect x="-4" y="0" width="8" height="14" fill="#0ea5e9" rx="1"/>
        <!-- Legs -->
        <rect x="-3" y="14" width="2" height="6" fill="#1e293b"/>
        <rect x="1" y="14" width="2" height="6" fill="#1e293b"/>
        <!-- Head -->
        <circle cx="0" cy="-5" r="4" fill="#fde68a"/>
        <!-- Hard hat -->
        <path d="M -5,-7 Q 0,-12 5,-7 L 5,-5 L -5,-5 Z" fill="#fbbf24"/>
        <rect x="-5" y="-5" width="10" height="1.5" fill="#f59e0b"/>
        <!-- Arms -->
        <rect x="-6" y="2" width="2" height="8" fill="#0ea5e9"/>
        <rect x="4" y="2" width="2" height="8" fill="#0ea5e9"/>
      </g>
      <!-- Shadow -->
      <ellipse cx="0" cy="22" rx="6" ry="1.5" fill="black" opacity="0.2"/>

      <!-- Count badge -->
      <g transform="translate(0, 35)">
        <rect x="-30" y="-10" width="60" height="20" rx="10" fill="#0ea5e9" stroke="white" stroke-width="1.5"/>
        <text x="0" y="4" text-anchor="middle" font-size="10" font-weight="bold" fill="white" font-family="Fredoka">
          👥 {{ farm.workers }} kişi
        </text>
      </g>
    </g>
  </g>
</template>
