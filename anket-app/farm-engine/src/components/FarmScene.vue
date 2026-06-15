<script setup lang="ts">
import { computed } from 'vue';
import type { FarmState } from '@/state/farm-state';
import { createDefaultState, countBuilt } from '@/state/farm-state';
import { SCENE } from '@/design-tokens';

import Sky from './decor/Sky.vue';
import Ground from './decor/Ground.vue';
import Defs from './decor/Defs.vue';

import Silo from './elements/Silo.vue';
import Barn from './elements/Barn.vue';
import BarnFan from './elements/BarnFan.vue';
import BarnVentilation from './elements/BarnVentilation.vue';
import BarnShower from './elements/BarnShower.vue';
import BarnCooling from './elements/BarnCooling.vue';
import BarnBadges from './elements/BarnBadges.vue';
import BarnBedding from './elements/BarnBedding.vue';
import Parlor from './elements/Parlor.vue';
import MilkTank from './elements/MilkTank.vue';
import Manure from './elements/Manure.vue';
import EnergyGrid from './elements/EnergyGrid.vue';
import EnergySolar from './elements/EnergySolar.vue';
import Water from './elements/Water.vue';
import FeedField from './elements/FeedField.vue';
import FeedStorage from './elements/FeedStorage.vue';
import HerdCluster from './elements/HerdCluster.vue';
import TotalAreaBadge from './elements/TotalAreaBadge.vue';
// Batch 4
import Lighting from './elements/Lighting.vue';
import TmrMixer from './elements/TmrMixer.vue';
import Workers from './elements/Workers.vue';
// Batch 5
import AnnualMilkBadge from './elements/AnnualMilkBadge.vue';
import MilkDrops from './elements/MilkDrops.vue';
import FeedingMode from './elements/FeedingMode.vue';
import AutoFeeder from './elements/AutoFeeder.vue';

const props = defineProps<{
  state?: FarmState;
  bare?: boolean;  // when true: skip sky/ground/decor (sticker-sheet mode)
}>();

const farm = computed<FarmState>(() => props.state ?? createDefaultState());
const built = computed(() => countBuilt(farm.value));

defineExpose({ farm, built });
</script>

<template>
  <div class="farm-scene-wrapper relative w-full h-full overflow-hidden"
       :class="bare ? 'bg-transparent' : 'farm-scene-bg'">
    <!-- Top-overlay HTML elements -->
    <TotalAreaBadge v-if="!bare" :farm="farm" />
    <AnnualMilkBadge v-if="!bare" :farm="farm" />

    <!-- Decor: sun + clouds (separate SVGs for browser perf) -->
    <Sky v-if="!bare" />

    <!-- Main iso scene -->
    <svg :viewBox="SCENE.viewBox" class="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
      <Defs />

      <!-- Back layer -->
      <Ground v-if="!bare" />
      <EnergyGrid :farm="farm" />

      <!-- Field cluster (SW) -->
      <FeedField :farm="farm" />

      <!-- Mid layer -->
      <Silo :farm="farm" />
      <Water :farm="farm" />
      <FeedStorage :farm="farm" />

      <!-- TMR mixer (between silo & barn, drawn before barn so barn overlaps) -->
      <TmrMixer :farm="farm" />

      <!-- Main barn + add-ons -->
      <Barn :farm="farm" />
      <Lighting :farm="farm" />
      <BarnFan :farm="farm" />
      <BarnVentilation :farm="farm" />
      <BarnCooling :farm="farm" />
      <BarnShower :farm="farm" />

      <!-- Parlor + tank -->
      <Parlor :farm="farm" />
      <MilkTank :farm="farm" />
      <MilkDrops :farm="farm" />

      <!-- Workers near barn -->
      <Workers :farm="farm" />

      <!-- Batch 5: feeding mode + auto feeder -->
      <FeedingMode :farm="farm" />
      <AutoFeeder :farm="farm" />

      <!-- Right-side: solar + manure -->
      <EnergySolar :farm="farm" />
      <Manure :farm="farm" />

      <!-- Front layer: badges + bedding + herd -->
      <BarnBadges :farm="farm" />
      <BarnBedding :farm="farm" />
      <HerdCluster :farm="farm" />
    </svg>
  </div>
</template>

<style scoped>
.farm-scene-wrapper { min-height: 380px; }
</style>
