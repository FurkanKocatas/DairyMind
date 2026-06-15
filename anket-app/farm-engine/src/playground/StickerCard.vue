<script setup lang="ts">
import { computed } from 'vue';
import FarmScene from '@/components/FarmScene.vue';
import { createDefaultState, type FarmState } from '@/state/farm-state';

const props = defineProps<{
  batch: string;        // 'B1' | 'B2' | 'B3' | 'B4' | 'Core'
  code: string;         // '2.7'
  title: string;        // 'Ahır (Serbest)'
  state: Partial<FarmState>;
}>();

const farm = computed(() => ({ ...createDefaultState(), ...props.state }));

const batchColor: Record<string, string> = {
  Core: 'bg-slate-100 text-slate-600',
  B1:   'bg-emerald-100 text-emerald-700',
  B2:   'bg-amber-100 text-amber-800',
  B3:   'bg-rose-100 text-rose-700',
  B4:   'bg-violet-100 text-violet-700',
  B5:   'bg-sky-100 text-sky-700'
};
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
    <div class="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" :class="batchColor[batch]">{{ batch }}</span>
        <span class="text-[10px] font-mono text-slate-500">{{ code }}</span>
      </div>
      <span class="text-xs font-bold text-slate-800 font-display truncate">{{ title }}</span>
    </div>
    <div class="aspect-[5/3] relative bg-gradient-to-b from-sky-50 to-emerald-50">
      <FarmScene :state="farm" bare />
    </div>
  </div>
</template>
