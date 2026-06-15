<script setup lang="ts">
import type { FarmState } from '@/state/farm-state';
defineProps<{ farm: FarmState }>();
</script>

<template>
  <div v-if="farm.totalAreaDa > 0"
    class="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
    <div class="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow border border-emerald-200 flex items-center gap-2">
      <span class="text-xl">🌾</span>
      <span class="text-sm font-bold text-emerald-800">{{ farm.totalAreaDa }} dönüm</span>
    </div>
  </div>
</template>
