<script setup lang="ts">
import { computed } from 'vue';
import type { FarmState, Breed } from '@/state/farm-state';
import { zoneTransform } from '@/layout/zones';
import { COLORS } from '@/design-tokens';

const props = defineProps<{ farm: FarmState }>();

function breedColor(b: Breed): string {
  return b ? COLORS.breed[b] : COLORS.breed.mixed;
}

const spotColor = computed(() => breedColor(props.farm.herd.breed));

// Sub-group chips definition (data-driven for easy designer edit)
const chips = computed(() => [
  { show: props.farm.herd.milking > 0, icon: '🥛', count: props.farm.herd.milking, label: 'sağmal', color: COLORS.badge.milking },
  { show: props.farm.herd.dry > 0,     icon: '💤', count: props.farm.herd.dry,     label: 'kuru',   color: COLORS.badge.dry     },
  { show: props.farm.herd.heifer > 0,  icon: '🐂', count: props.farm.herd.heifer,  label: 'düve',   color: COLORS.badge.heifer  },
  { show: props.farm.herd.calf > 0,    icon: '🍼', count: props.farm.herd.calf,    label: 'buzağı', color: COLORS.badge.calf    },
  { show: props.farm.herd.bull > 0,    icon: '♂',  count: props.farm.herd.bull,    label: 'boğa',   color: COLORS.badge.bull    },
]);
</script>

<template>
  <g v-if="farm.herdSize > 0" :transform="zoneTransform('herd')">
    <g class="pop-in">
      <!-- Big cow -->
      <g class="cow-bob">
        <ellipse cx="0" cy="6" rx="14" ry="3" fill="black" opacity="0.25"/>
        <ellipse cx="0" cy="0" rx="13" ry="7" fill="white"/>
        <ellipse cx="-3" cy="-1" rx="4" ry="3" :fill="spotColor"/>
        <ellipse cx="4" cy="1" rx="3" ry="2" :fill="spotColor"/>
        <circle cx="-10" cy="-1" r="4" fill="white"/>
        <circle cx="-11" cy="-2" r="0.7" fill="#1e293b"/>
        <ellipse cx="-12" cy="-4" rx="1.8" ry="2.3" fill="#fda4af"/>
      </g>
      <!-- Walking small cow -->
      <g class="cow-walk-iso" style="animation-delay: 1.2s">
        <g transform="translate(35, 18) scale(0.65)">
          <ellipse cx="0" cy="4" rx="10" ry="2.5" fill="black" opacity="0.22"/>
          <ellipse cx="0" cy="0" rx="10" ry="5.5" fill="white"/>
          <ellipse cx="-2" cy="-1" rx="3" ry="2.2" :fill="spotColor"/>
          <circle cx="-8" cy="-1" r="3.2" fill="white"/>
          <ellipse cx="-10" cy="-3.5" rx="1.5" ry="2" fill="#fda4af"/>
        </g>
      </g>
      <!-- Bobbing small cow -->
      <g class="cow-bob" style="animation-delay: 0.6s">
        <g transform="translate(-32, 16) scale(0.65)">
          <ellipse cx="0" cy="4" rx="10" ry="2.5" fill="black" opacity="0.22"/>
          <ellipse cx="0" cy="0" rx="10" ry="5.5" fill="white"/>
          <ellipse cx="-2" cy="-1" rx="3" ry="2.2" :fill="spotColor"/>
          <circle cx="-8" cy="-1" r="3.2" fill="white"/>
          <ellipse cx="-10" cy="-3.5" rx="1.5" ry="2" fill="#fda4af"/>
        </g>
      </g>

      <!-- Total badge -->
      <g transform="translate(0, 40)">
        <rect x="-32" y="-10" width="64" height="20" rx="10" :fill="COLORS.badge.herd.bg" stroke="white" stroke-width="1.5"/>
        <text x="0" y="4" text-anchor="middle" font-size="11" font-weight="bold" :fill="COLORS.badge.herd.text" font-family="Fredoka">
          🐄 {{ farm.herdSize }} baş
        </text>
      </g>

      <!-- Sub-group chips (Batch 3) -->
      <template v-for="(chip, i) in chips" :key="chip.label">
        <g v-if="chip.show" :transform="`translate(-35, ${65 + i * 17})`">
          <rect x="0" y="-7" width="70" height="14" rx="7" fill="white" :stroke="chip.color" stroke-width="1"/>
          <text x="35" y="3" text-anchor="middle" font-size="9" font-weight="bold" :fill="chip.color" font-family="Fredoka">
            {{ chip.icon }} {{ chip.count }} {{ chip.label }}
          </text>
        </g>
      </template>
    </g>
  </g>
</template>
