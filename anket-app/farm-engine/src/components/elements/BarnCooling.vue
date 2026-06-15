<script setup lang="ts">
import type { FarmState } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';
defineProps<{ farm: FarmState }>();
</script>

<template>
  <!-- Cooling fan icons (small, only when cooling=fan or fan_shower) -->
  <g v-if="(farm.cooling === 'fan_shower' || farm.cooling === 'fan') && farm.barn && farm.barn !== 'open'"
     :transform="zoneTransform('barnRoof', 0, -20)">
    <g class="pop-in">
      <g transform="translate(-25, 0)">
        <circle r="7" fill="#475569"/>
        <g class="spin-slow" style="animation-duration: 2s">
          <ellipse cx="0" cy="-4" rx="2" ry="5" fill="#cbd5e1"/>
          <ellipse cx="4" cy="0" rx="5" ry="2" fill="#cbd5e1"/>
          <ellipse cx="0" cy="4" rx="2" ry="5" fill="#cbd5e1"/>
          <ellipse cx="-4" cy="0" rx="5" ry="2" fill="#cbd5e1"/>
        </g>
        <circle r="1.5" fill="#fbbf24"/>
      </g>
      <g transform="translate(25, 0)">
        <circle r="7" fill="#475569"/>
        <g class="spin-slow" style="animation-duration: 2.3s">
          <ellipse cx="0" cy="-4" rx="2" ry="5" fill="#cbd5e1"/>
          <ellipse cx="4" cy="0" rx="5" ry="2" fill="#cbd5e1"/>
          <ellipse cx="0" cy="4" rx="2" ry="5" fill="#cbd5e1"/>
          <ellipse cx="-4" cy="0" rx="5" ry="2" fill="#cbd5e1"/>
        </g>
        <circle r="1.5" fill="#fbbf24"/>
      </g>
    </g>
  </g>

  <!-- Natural cooling → leaf icon -->
  <g v-else-if="farm.cooling === 'natural' && farm.barn && farm.barn !== 'open'"
     :transform="zoneTransform('barnRoof', 0, -20)">
    <g class="pop-in">
      <g class="cow-bob">
        <ellipse cx="-12" cy="0" rx="6" ry="9" fill="#22c55e" transform="rotate(-30, -12, 0)"/>
        <ellipse cx="0" cy="-4" rx="6" ry="9" fill="#16a34a"/>
        <ellipse cx="12" cy="0" rx="6" ry="9" fill="#22c55e" transform="rotate(30, 12, 0)"/>
      </g>
    </g>
  </g>
</template>
