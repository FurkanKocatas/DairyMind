<script setup lang="ts">
import { computed } from 'vue';
import type { FarmState } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';

const props = defineProps<{ farm: FarmState }>();

const MODE_META: Record<string, { icon: string; label: string; color: string }> = {
  tmr:                 { icon: '🥣', label: 'TMR',         color: '#16a34a' },
  partial_tmr:         { icon: '🥣', label: 'Yarı-TMR',    color: '#0ea5e9' },
  component:           { icon: '🌾', label: 'Komponent',   color: '#a16207' },
  pasture_concentrate: { icon: '🌿', label: 'Mera+Kesif',  color: '#15803d' },
  pasture:             { icon: '🌿', label: 'Mera',        color: '#22c55e' }
};

const meta = computed(() => props.farm.feedingSystem ? MODE_META[props.farm.feedingSystem] : null);
</script>

<template>
  <g v-if="meta" :transform="zoneTransform('barn', -110, 0)">
    <g class="pop-in">
      <rect x="-32" y="-10" width="64" height="20" rx="10" fill="white" :stroke="meta.color" stroke-width="1.5"/>
      <text x="0" y="4" text-anchor="middle" font-size="10" font-weight="bold" :fill="meta.color" font-family="Fredoka">
        {{ meta.icon }} {{ meta.label }}
      </text>
    </g>
  </g>
</template>
