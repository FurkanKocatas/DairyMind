<script setup lang="ts">
import { computed } from 'vue';
import type { FarmState } from '@/state/farm-state';
import { ZONES } from '@/layout/zones';
const props = defineProps<{ farm: FarmState }>();

// Silo height scale: 50 t = 0.8x, 200 t = 1.0x, 500 t = 1.25x
const scale = computed(() => {
  const t = props.farm.siloCapacityTon;
  if (!t) return 1;
  return Math.max(0.7, Math.min(1.3, 0.75 + t / 1000));
});

const tonLabel = computed(() => props.farm.siloCapacityTon > 0 ? `${props.farm.siloCapacityTon} t` : '');
</script>

<template>
  <g v-if="farm.silo === 'concrete'" :transform="`translate(${ZONES.silo.x}, ${ZONES.silo.y}) scale(${scale})`">
    <g class="pop-in">
      <ellipse cx="0" cy="80" rx="35" ry="12" fill="black" opacity="0.2"/>
      <rect x="-35" y="-30" width="70" height="110" fill="url(#dm-silo-grad)"/>
      <ellipse cx="0" cy="-30" rx="35" ry="12" fill="#cbd5e1"/>
      <ellipse cx="0" cy="-30" rx="32" ry="10" fill="#16a34a" opacity="0.6"/>
      <path d="M -35,-30 Q 0,-60 35,-30 Z" fill="#dc2626"/>
      <path d="M -35,-30 Q 0,-60 0,-30 Z" fill="#991b1b"/>
      <rect x="-5" y="50" width="10" height="30" fill="#1e293b" opacity="0.7"/>
      <text x="0" y="10" text-anchor="middle" font-size="11" font-weight="bold" fill="white" font-family="Fredoka" opacity="0.85">
        {{ tonLabel }}
      </text>
    </g>
  </g>
  <g v-else-if="farm.silo === 'pile'" :transform="`translate(${ZONES.silo.x}, ${ZONES.silo.y + 100}) scale(${scale})`">
    <g class="pop-in">
      <ellipse cx="0" cy="20" rx="55" ry="14" fill="#15803d"/>
      <ellipse cx="0" cy="10" rx="50" ry="22" fill="#16a34a"/>
      <ellipse cx="0" cy="5" rx="45" ry="20" fill="#22c55e"/>
      <text x="0" y="5" text-anchor="middle" font-size="9" font-weight="bold" fill="white" font-family="Fredoka">
        {{ tonLabel }}
      </text>
    </g>
  </g>
  <g v-else-if="farm.silo === 'bale'" :transform="`translate(${ZONES.silo.x}, ${ZONES.silo.y + 120}) scale(${scale})`">
    <g class="pop-in">
      <ellipse cx="-25" cy="0" rx="20" ry="14" fill="#facc15"/>
      <ellipse cx="20" cy="0" rx="20" ry="14" fill="#facc15"/>
      <ellipse cx="0" cy="-25" rx="20" ry="14" fill="#facc15"/>
      <text x="0" y="-20" text-anchor="middle" font-size="8" font-weight="bold" fill="#7c2d12" font-family="Fredoka">
        {{ tonLabel }}
      </text>
    </g>
  </g>
</template>
