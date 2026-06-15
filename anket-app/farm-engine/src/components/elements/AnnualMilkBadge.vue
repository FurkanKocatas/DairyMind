<script setup lang="ts">
import type { FarmState } from '@/state/farm-state';
defineProps<{ farm: FarmState }>();
</script>

<template>
  <!-- Top-right HTML overlay badge — yearly milk production -->
  <div v-if="farm.annualMilkTon > 0"
    class="absolute top-3 right-28 z-10 pointer-events-none">
    <div class="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow border border-sky-200 flex items-center gap-2">
      <span class="text-xl">🥛</span>
      <div class="leading-tight">
        <div class="text-sm font-bold text-sky-800">{{ farm.annualMilkTon }} ton</div>
        <div class="text-[9px] font-semibold text-sky-600 uppercase tracking-wider">yıllık üretim</div>
      </div>
    </div>
  </div>
</template>
