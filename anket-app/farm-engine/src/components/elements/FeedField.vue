<script setup lang="ts">
import type { FarmState } from '@/state/farm-state';
import { computed } from 'vue';
const props = defineProps<{ farm: FarmState }>();

const labelText = computed(() => {
  const dön = `🌽 ${props.farm.farmAreaDa} dön`;
  return props.farm.cornSilageTon > 0 ? `${dön} · ${props.farm.cornSilageTon}t` : dön;
});
</script>

<template>
  <!-- Field plot + corn texture + irrigation sprinkler + label -->
  <g v-if="farm.farmAreaDa > 0">
    <g class="pop-in">
      <polygon points="60,395 290,540 60,615 -190,455" fill="#84cc16" opacity="0.55" stroke="#65a30d" stroke-width="1.5"/>
      <polygon points="60,425 260,540 60,585 -155,455" fill="#a3e635" opacity="0.4"/>

      <!-- Corn texture overlay -->
      <g v-if="farm.cornSilageTon > 0">
        <g stroke="#a16207" stroke-width="1" opacity="0.75">
          <line x1="-60" y1="478" x2="0" y2="510"/>
          <line x1="-30" y1="460" x2="30" y2="492"/>
          <line x1="0" y1="442" x2="60" y2="474"/>
          <line x1="30" y1="424" x2="90" y2="456"/>
          <line x1="60" y1="446" x2="120" y2="478"/>
          <line x1="90" y1="466" x2="150" y2="498"/>
          <line x1="120" y1="486" x2="180" y2="518"/>
        </g>
        <g fill="#fbbf24">
          <circle cx="-45" cy="467" r="2.5"/><circle cx="-15" cy="450" r="2.5"/>
          <circle cx="15" cy="432" r="2.5"/><circle cx="45" cy="415" r="2.5"/>
          <circle cx="75" cy="445" r="2.5"/><circle cx="105" cy="465" r="2.5"/>
          <circle cx="135" cy="485" r="2.5"/><circle cx="165" cy="505" r="2.5"/>
        </g>
      </g>

      <!-- Field label badge -->
      <g transform="translate(65, 595)">
        <rect x="-50" y="-10" width="100" height="20" rx="10" fill="#15803d"/>
        <text x="0" y="4" text-anchor="middle" font-size="11" font-weight="bold" fill="white" font-family="Fredoka">
          {{ labelText }}
        </text>
      </g>
    </g>
  </g>

  <!-- Sprinkler -->
  <g v-if="farm.irrigation && farm.farmAreaDa > 0" transform="translate(0, 440)">
    <g class="pop-in">
      <rect x="-1.5" y="0" width="3" height="28" fill="#475569"/>
      <circle cx="0" cy="0" r="3.5" fill="#1e293b"/>
      <g class="pulse-soft" stroke="#3b82f6" stroke-width="1.2" fill="none" opacity="0.8">
        <path d="M -2,0 Q -20,-18 -32,-8"/>
        <path d="M 2,0 Q 20,-18 32,-8"/>
        <path d="M 0,-2 Q 0,-22 0,-30"/>
      </g>
      <g fill="#60a5fa" class="pulse-soft" style="animation-delay: 0.5s">
        <circle cx="-28" cy="-5" r="1.8" opacity="0.85"/>
        <circle cx="28" cy="-5" r="1.8" opacity="0.85"/>
        <circle cx="0" cy="-27" r="1.8" opacity="0.85"/>
        <circle cx="-15" cy="-20" r="1.2" opacity="0.7"/>
        <circle cx="15" cy="-20" r="1.2" opacity="0.7"/>
      </g>
    </g>
  </g>
</template>
