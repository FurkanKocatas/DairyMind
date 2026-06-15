<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import FarmScene from '@/components/FarmScene.vue';
import StickerSheet from './StickerSheet.vue';
import { mapAnswersToFarm } from '@/state/answer-mapper';
import { countBuilt } from '@/state/farm-state';

const view = ref<'sticker' | 'scene'>('sticker');

// ─── Playground state (UI controls) ───
const ui = reactive({
  // Batch 1
  totalAreaDa: 150, farmAreaDa: 80, cornSilageTon: 1200, irrigation: true, feedStorageMonths: 6,
  // Batch 2
  barnAreaM2: 800, barnCapacity: 100, cooling: 'fan_shower' as string | null,
  ventilation: 'mechanical' as string | null,
  bedding: ['sand', 'rubber'] as string[],
  // Batch 3 — sürü grupları
  milkingCount: 75, dryCount: 15, heiferCount: 20, calfCount: 10, bullCount: 1,
  // Batch 4 — aydınlatma / tank tipi / TMR / silaj kapasite / çalışan
  lighting: 'led' as string | null,
  tankShape: 'ibt' as string | null,
  tmrMixer: true,
  siloCapacityTon: 200,
  workers: 4,
  // Batch 5 — yıllık süt / inek başı / beslenme / oto yemleme
  annualMilkTon: 600,
  perCowKg: 28,
  feedingSystem: 'tmr' as string | null,
  autoFeeder: false,
  // Main
  barn: 'free' as string | null,
  parlor: 'robot' as string | null,
  tank: 'medium' as string | null,
  silo: 'concrete' as string | null,
  energy: 'mixed' as string | null,
  water: 'well' as string | null,
  manure: 'biogas' as string | null,
  herdSize: 120,
  breed: 'simmental' as string | null,
});

// ─── Map playground UI → survey-style answers → canonical farm state ───
const farm = computed(() => mapAnswersToFarm({
  'q_2_2_1': ui.totalAreaDa,
  'q_2_2_4': ui.farmAreaDa,
  'q_2_2_5': ui.irrigation ? 'Evet, yıl boyu yeterli' : null,
  'q_6_6_4': ui.cornSilageTon,
  'q_6_6_19': ui.feedStorageMonths,
  'q_2_2_6': ui.water ? [ui.water === 'well' ? 'Kuyu suyu' : ui.water === 'pond' ? 'Dere/Nehir' : 'Şebeke suyu'] : [],
  'q_2_2_7':  ui.barn === 'free' ? 'Serbest dolaşımlı (free-stall)' : ui.barn === 'tie' ? 'Bağlı sistem (tie-stall)' : ui.barn === 'open' ? 'Açık padok (Open lot)' : null,
  'q_2_2_17': ui.parlor === 'herringbone' ? 'Balık sırtı (herringbone)' : ui.parlor === 'rotary' ? 'Karusel (rotary)' : ui.parlor === 'robot' ? 'Robotik (AMS)' : null,
  'q_2_2_19': ui.tank === 'small' ? 500 : ui.tank === 'medium' ? 2000 : ui.tank === 'large' ? 5000 : 0,
  'q_2_2_23': ui.silo === 'concrete' ? 'Evet, beton silo' : ui.silo === 'pile' ? 'Evet, yığın silaj' : ui.silo === 'bale' ? 'Balya silaj' : null,
  'q_2_2_25': ui.energy === 'grid' ? 'Sadece şebeke' : ui.energy === 'mixed' ? 'Şebeke + güneş enerjisi' : null,
  'q_2_2_27': ui.energy === 'solar' ? 'Güneş enerjisi (GES)' : null,
  'q_2_2_28': ui.manure === 'lagoon' ? 'Sıvı gübre lagünü' : ui.manure === 'compost' ? 'Kompost' : ui.manure === 'biogas' ? 'Biyogaz tesisi' : null,
  'q_3_3_1': ui.herdSize,
  'q_3_3_7': ui.breed === 'holstein' ? 'Holstein (Siyah Alaca)' : ui.breed === 'simmental' ? 'Simental' : ui.breed === 'jersey' ? 'Jersey' : null,
  // Batch 2
  'q_2_2_8':  ui.barnAreaM2,
  'q_2_2_9':  ui.barnCapacity,
  'q_2_2_12': ui.cooling === 'fan_shower' ? 'Fan ve duş sistemi' : ui.cooling === 'fan' ? 'Sadece fan' : ui.cooling === 'shower' ? 'Sadece duş/sprey' : ui.cooling === 'natural' ? 'Doğal havalandırma' : null,
  'q_2_2_15': ui.ventilation === 'natural' ? 'Doğal (yan açık + çatı)' : ui.ventilation === 'mechanical' ? 'Mekanik (fanlı)' : ui.ventilation === 'hybrid' ? 'Karma' : null,
  'q_2_2_16': ui.bedding.map(b => ({straw:'Sap/saman',sand:'Kum',sawdust:'Talaş',rubber:'Lastik mat',waterbed:'Vakumlu yatak (waterbed)',compost:'Gübre kompostu'} as Record<string,string>)[b]).filter(Boolean),
  // Batch 3
  'q_3_3_2': ui.milkingCount,
  'q_3_3_3': ui.dryCount,
  'q_3_3_4': ui.heiferCount,
  'q_3_3_5': ui.calfCount,
  'q_3_3_6': ui.bullCount,
  // Batch 4
  'q_2_2_13': ui.lighting === 'led' ? 'LED' : ui.lighting === 'fluorescent' ? 'Floresan' : ui.lighting === 'halogen' ? 'Halojen' : ui.lighting === 'natural' ? 'Sadece doğal ışık' : ui.lighting === 'mixed' ? 'Doğal ışık + yapay karma' : null,
  'q_2_2_20': ui.tankShape === 'open_dx' ? 'Açık tip (DX)' : ui.tankShape === 'ibt' ? 'Kapalı tip (IBT - Ice Bank)' : ui.tankShape === 'direct' ? 'Doğrudan genleşmeli' : ui.tankShape === 'pre_cooler' ? 'Ön soğutucu + tank' : null,
  'q_2_2_21': ui.tmrMixer ? 'Evet' : null,
  'q_2_2_24': ui.siloCapacityTon,
  'q_8_8_1':  ui.workers,
  // Batch 5
  'q_5_5_1': ui.annualMilkTon,
  'q_5_5_2': ui.perCowKg,
  'q_6_6_1': ui.feedingSystem === 'tmr' ? 'TMR (Tam Karma Rasyon)' : ui.feedingSystem === 'partial_tmr' ? 'Yarı-TMR (PMR)' : ui.feedingSystem === 'component' ? 'Komponent (ayrı ayrı)' : ui.feedingSystem === 'pasture_concentrate' ? 'Mera + kesif' : ui.feedingSystem === 'pasture' ? 'Sadece mera' : null,
  'q_6_6_27': ui.autoFeeder ? 'Evet, full otomatik' : null,
}));

const built = computed(() => countBuilt(farm.value));

function toggleBedding(b: string) {
  const i = ui.bedding.indexOf(b);
  if (i >= 0) ui.bedding = ui.bedding.filter(x => x !== b);
  else ui.bedding = [...ui.bedding, b];
}

function reset() {
  Object.assign(ui, {
    totalAreaDa: 0, farmAreaDa: 0, cornSilageTon: 0, irrigation: false, feedStorageMonths: 0,
    barnAreaM2: 0, barnCapacity: 0, cooling: null, ventilation: null, bedding: [],
    milkingCount: 0, dryCount: 0, heiferCount: 0, calfCount: 0, bullCount: 0,
    lighting: null, tankShape: null, tmrMixer: false, siloCapacityTon: 0, workers: 0,
    annualMilkTon: 0, perCowKg: 0, feedingSystem: null, autoFeeder: false,
    barn: null, parlor: null, tank: null, silo: null, energy: null, water: null, manure: null,
    herdSize: 0, breed: null
  });
}

function demoFill() {
  Object.assign(ui, {
    totalAreaDa: 200, farmAreaDa: 100, cornSilageTon: 1500, irrigation: true, feedStorageMonths: 8,
    barnAreaM2: 1200, barnCapacity: 150, cooling: 'fan_shower', ventilation: 'mechanical', bedding: ['sand','rubber'],
    milkingCount: 95, dryCount: 18, heiferCount: 25, calfCount: 12, bullCount: 1,
    lighting: 'led', tankShape: 'ibt', tmrMixer: true, siloCapacityTon: 250, workers: 6,
    annualMilkTon: 800, perCowKg: 30, feedingSystem: 'tmr', autoFeeder: true,
    barn: 'free', parlor: 'robot', tank: 'large', silo: 'concrete',
    energy: 'mixed', water: 'well', manure: 'biogas',
    herdSize: 150, breed: 'holstein'
  });
}

// Pill button option types
type Opt = { id: any; l: string };
const barnOpts: Opt[]  = [{id:null,l:'Yok'},{id:'free',l:'Serbest'},{id:'tie',l:'Bağlı'},{id:'open',l:'Açık'}];
const parlorOpts: Opt[] = [{id:null,l:'Yok'},{id:'herringbone',l:'Klasik'},{id:'rotary',l:'Karusel'},{id:'robot',l:'Robot'}];
const tankOpts: Opt[]   = [{id:null,l:'Yok'},{id:'small',l:'500L'},{id:'medium',l:'2000L'},{id:'large',l:'5000L+'}];
const siloOpts: Opt[]   = [{id:null,l:'Yok'},{id:'concrete',l:'Beton'},{id:'pile',l:'Yığın'},{id:'bale',l:'Balya'}];
const energyOpts: Opt[] = [{id:null,l:'Yok'},{id:'grid',l:'Şebeke'},{id:'solar',l:'Güneş'},{id:'mixed',l:'Karma'}];
const waterOpts: Opt[]  = [{id:null,l:'Yok'},{id:'well',l:'Kuyu'},{id:'pond',l:'Gölet'},{id:'mains',l:'Şebeke'}];
const manureOpts: Opt[] = [{id:null,l:'Yok'},{id:'lagoon',l:'Lagün'},{id:'compost',l:'Kompost'},{id:'biogas',l:'Biyogaz'}];
const coolingOpts: Opt[]= [{id:null,l:'Yok'},{id:'fan',l:'Fan'},{id:'shower',l:'Duş'},{id:'fan_shower',l:'Fan+Duş'},{id:'natural',l:'Doğal'}];
const ventOpts: Opt[]   = [{id:null,l:'Yok'},{id:'natural',l:'Doğal'},{id:'mechanical',l:'Mekanik'},{id:'hybrid',l:'Karma'}];
const breedOpts: Opt[]  = [{id:null,l:'—'},{id:'holstein',l:'Holstein'},{id:'simmental',l:'Simental'},{id:'jersey',l:'Jersey'}];
const beddingOpts: Opt[]= [{id:'straw',l:'Saman'},{id:'sand',l:'Kum'},{id:'sawdust',l:'Talaş'},{id:'rubber',l:'Lastik'},{id:'waterbed',l:'Waterbed'},{id:'compost',l:'Kompost'}];
const lightingOpts: Opt[] = [{id:null,l:'Yok'},{id:'led',l:'LED'},{id:'fluorescent',l:'Floresan'},{id:'halogen',l:'Halojen'},{id:'mixed',l:'Karma'},{id:'natural',l:'Doğal'}];
const tankShapeOpts: Opt[] = [{id:null,l:'Yok'},{id:'open_dx',l:'Açık DX'},{id:'ibt',l:'IBT'},{id:'direct',l:'Direkt'},{id:'pre_cooler',l:'Ön Soğ.'}];
const feedingOpts: Opt[]   = [{id:null,l:'Yok'},{id:'tmr',l:'TMR'},{id:'partial_tmr',l:'Yarı-TMR'},{id:'component',l:'Komponent'},{id:'pasture_concentrate',l:'Mera+K'},{id:'pasture',l:'Mera'}];

const pillBase = 'px-2 py-1 rounded text-[11px] font-semibold transition cursor-pointer';
const pillOn   = 'bg-emerald-600 text-white';
const pillOff  = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-100 text-slate-800 font-sans">
    <!-- Header -->
    <header class="bg-white border-b-2 border-amber-400 px-6 py-3 flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-xl">🧪</div>
        <div>
          <div class="text-[10px] font-bold tracking-wider text-amber-700 uppercase">DEV PLAYGROUND</div>
          <div class="text-base font-bold text-slate-900 font-display">Vue 3 Farm-Engine</div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex p-0.5 bg-slate-100 rounded-md">
          <button @click="view='sticker'" :class="view==='sticker' ? 'bg-white shadow text-slate-900' : 'text-slate-500'" class="px-3 py-1 text-xs font-bold rounded">🎴 Sticker</button>
          <button @click="view='scene'" :class="view==='scene' ? 'bg-white shadow text-slate-900' : 'text-slate-500'" class="px-3 py-1 text-xs font-bold rounded">🏞 Sahne</button>
        </div>
        <span class="text-xs text-slate-500">{{ built }}/8 yapı</span>
        <button @click="reset" class="px-3 py-1.5 text-xs font-bold rounded-md bg-slate-200 text-slate-700 hover:bg-slate-300">↻ Sıfırla</button>
        <button @click="demoFill" class="px-3 py-1.5 text-xs font-bold rounded-md bg-emerald-600 text-white hover:bg-emerald-700">✨ Demo</button>
      </div>
    </header>

    <div class="flex-1 grid lg:grid-cols-[380px_1fr] gap-0">
      <!-- Controls -->
      <aside class="bg-white border-r border-slate-200 p-4 overflow-y-auto" style="max-height: calc(100vh - 60px);">

        <!-- Batch banner -->
        <div class="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-300">
          <div class="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-display">📦 Aktif Batch</div>
          <div class="text-sm font-bold text-amber-900 mt-0.5">B1·B2·B3·B4·B5 ✓ — 33 işaretli tamam</div>
          <div class="text-[11px] text-amber-700 mt-1">B5: 5.1 · 5.2 · 6.1 · 6.27</div>
        </div>

        <details open class="mb-3">
          <summary class="cursor-pointer text-xs font-bold text-emerald-700 uppercase tracking-wider font-display px-2 py-1 bg-emerald-50 rounded-md">🌾 Batch 1 — Arazi & Tarla</summary>
          <div class="mt-3 space-y-3 pl-2">
            <label class="block">
              <span class="text-[11px] font-semibold text-slate-600 flex justify-between"><span>2.1 Toplam arazi (dönüm)</span><span class="font-mono font-bold text-emerald-700">{{ ui.totalAreaDa }}</span></span>
              <input type="range" min="0" max="500" step="10" v-model.number="ui.totalAreaDa" class="w-full accent-emerald-600 mt-1" />
            </label>
            <label class="block">
              <span class="text-[11px] font-semibold text-slate-600 flex justify-between"><span>2.4 Yem arazisi (dönüm)</span><span class="font-mono font-bold text-emerald-700">{{ ui.farmAreaDa }}</span></span>
              <input type="range" min="0" max="200" step="5" v-model.number="ui.farmAreaDa" class="w-full accent-emerald-600 mt-1" />
            </label>
            <label class="block">
              <span class="text-[11px] font-semibold text-slate-600 flex justify-between"><span>6.4 Mısır silajı (ton/yıl)</span><span class="font-mono font-bold text-emerald-700">{{ ui.cornSilageTon }}</span></span>
              <input type="range" min="0" max="3000" step="50" v-model.number="ui.cornSilageTon" class="w-full accent-emerald-600 mt-1" />
            </label>
            <label class="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md hover:bg-emerald-50">
              <input type="checkbox" v-model="ui.irrigation" class="w-4 h-4 accent-emerald-600" />
              <span class="text-xs font-semibold">2.5 Sulama aktif</span>
            </label>
            <label class="block">
              <span class="text-[11px] font-semibold text-slate-600 flex justify-between"><span>6.19 Yem deposu (ay)</span><span class="font-mono font-bold text-emerald-700">{{ ui.feedStorageMonths }}</span></span>
              <input type="range" min="0" max="12" step="1" v-model.number="ui.feedStorageMonths" class="w-full accent-emerald-600 mt-1" />
            </label>
          </div>
        </details>

        <details open class="mb-3">
          <summary class="cursor-pointer text-xs font-bold text-amber-700 uppercase tracking-wider font-display px-2 py-1 bg-amber-50 rounded-md">🏠 Batch 2 — Ahır Detayları</summary>
          <div class="mt-3 space-y-3 pl-2">
            <label class="block">
              <span class="text-[11px] font-semibold text-slate-600 flex justify-between"><span>2.8 Ahır alanı (m²)</span><span class="font-mono font-bold text-amber-700">{{ ui.barnAreaM2 }}</span></span>
              <input type="range" min="0" max="3000" step="50" v-model.number="ui.barnAreaM2" class="w-full accent-amber-600 mt-1" />
            </label>
            <label class="block">
              <span class="text-[11px] font-semibold text-slate-600 flex justify-between"><span>2.9 Ahır kapasite (baş)</span><span class="font-mono font-bold text-amber-700">{{ ui.barnCapacity }}</span></span>
              <input type="range" min="0" max="500" step="5" v-model.number="ui.barnCapacity" class="w-full accent-amber-600 mt-1" />
            </label>
            <div>
              <div class="text-[11px] font-bold text-slate-600 mb-1">2.12 Soğutma</div>
              <div class="flex gap-1 flex-wrap">
                <button v-for="o in coolingOpts" :key="o.l" @click="ui.cooling = o.id" :class="[pillBase, ui.cooling === o.id ? pillOn : pillOff]">{{ o.l }}</button>
              </div>
            </div>
            <div>
              <div class="text-[11px] font-bold text-slate-600 mb-1">2.15 Havalandırma</div>
              <div class="flex gap-1 flex-wrap">
                <button v-for="o in ventOpts" :key="o.l" @click="ui.ventilation = o.id" :class="[pillBase, ui.ventilation === o.id ? pillOn : pillOff]">{{ o.l }}</button>
              </div>
            </div>
            <div>
              <div class="text-[11px] font-bold text-slate-600 mb-1">2.16 Yataklık (çoklu)</div>
              <div class="flex gap-1 flex-wrap">
                <button v-for="o in beddingOpts" :key="o.id" @click="toggleBedding(o.id)" :class="[pillBase, ui.bedding.includes(o.id) ? pillOn : pillOff]">{{ o.l }}</button>
              </div>
            </div>
          </div>
        </details>

        <details open class="mb-3">
          <summary class="cursor-pointer text-xs font-bold text-violet-700 uppercase tracking-wider font-display px-2 py-1 bg-violet-50 rounded-md">⚙ Batch 4 — Tank / Aydınlatma / Mikser / Silaj / İşçi</summary>
          <div class="mt-3 space-y-3 pl-2">
            <div>
              <div class="text-[11px] font-bold text-slate-600 mb-1">2.13 Aydınlatma</div>
              <div class="flex gap-1 flex-wrap">
                <button v-for="o in lightingOpts" :key="o.l" @click="ui.lighting = o.id" :class="[pillBase, ui.lighting === o.id ? 'bg-violet-600 text-white' : pillOff]">{{ o.l }}</button>
              </div>
            </div>
            <div>
              <div class="text-[11px] font-bold text-slate-600 mb-1">2.20 Tank tipi</div>
              <div class="flex gap-1 flex-wrap">
                <button v-for="o in tankShapeOpts" :key="o.l" @click="ui.tankShape = o.id" :class="[pillBase, ui.tankShape === o.id ? 'bg-violet-600 text-white' : pillOff]">{{ o.l }}</button>
              </div>
            </div>
            <label class="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md hover:bg-violet-50">
              <input type="checkbox" v-model="ui.tmrMixer" class="w-4 h-4 accent-violet-600" />
              <span class="text-xs font-semibold">2.21 TMR mikser var</span>
            </label>
            <label class="block">
              <span class="text-[11px] font-semibold text-slate-600 flex justify-between"><span>2.24 Silaj kapasite (ton)</span><span class="font-mono font-bold text-violet-700">{{ ui.siloCapacityTon }}</span></span>
              <input type="range" min="0" max="1000" step="10" v-model.number="ui.siloCapacityTon" class="w-full accent-violet-600 mt-1" />
            </label>
            <label class="block">
              <span class="text-[11px] font-semibold text-slate-600 flex justify-between"><span>8.1 Çalışan sayısı</span><span class="font-mono font-bold text-violet-700">{{ ui.workers }}</span></span>
              <input type="range" min="0" max="20" step="1" v-model.number="ui.workers" class="w-full accent-violet-600 mt-1" />
            </label>
          </div>
        </details>

        <details open class="mb-3">
          <summary class="cursor-pointer text-xs font-bold text-sky-700 uppercase tracking-wider font-display px-2 py-1 bg-sky-50 rounded-md">🥛 Batch 5 — Üretim / Beslenme / Otomasyon</summary>
          <div class="mt-3 space-y-3 pl-2">
            <label class="block">
              <span class="text-[11px] font-semibold text-slate-600 flex justify-between"><span>5.1 Yıllık süt (ton)</span><span class="font-mono font-bold text-sky-700">{{ ui.annualMilkTon }}</span></span>
              <input type="range" min="0" max="2000" step="20" v-model.number="ui.annualMilkTon" class="w-full accent-sky-600 mt-1" />
            </label>
            <label class="block">
              <span class="text-[11px] font-semibold text-slate-600 flex justify-between"><span>5.2 İnek başı süt (kg/gün)</span><span class="font-mono font-bold text-sky-700">{{ ui.perCowKg }}</span></span>
              <input type="range" min="0" max="50" step="1" v-model.number="ui.perCowKg" class="w-full accent-sky-600 mt-1" />
            </label>
            <div>
              <div class="text-[11px] font-bold text-slate-600 mb-1">6.1 Beslenme sistemi</div>
              <div class="flex gap-1 flex-wrap">
                <button v-for="o in feedingOpts" :key="o.l" @click="ui.feedingSystem = o.id" :class="[pillBase, ui.feedingSystem === o.id ? 'bg-sky-600 text-white' : pillOff]">{{ o.l }}</button>
              </div>
            </div>
            <label class="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md hover:bg-sky-50">
              <input type="checkbox" v-model="ui.autoFeeder" class="w-4 h-4 accent-sky-600" />
              <span class="text-xs font-semibold">6.27 Otomatik yemleme robotu</span>
            </label>
          </div>
        </details>

        <details class="mb-3">
          <summary class="cursor-pointer text-xs font-bold text-sky-700 uppercase tracking-wider font-display px-2 py-1 bg-sky-50 rounded-md">🏗 Ana Yapılar</summary>
          <div class="mt-3 space-y-3 pl-2">
            <div><div class="text-[11px] font-bold text-slate-600 mb-1">Ahır</div><div class="flex gap-1 flex-wrap"><button v-for="o in barnOpts" :key="o.l" @click="ui.barn = o.id" :class="[pillBase, ui.barn === o.id ? pillOn : pillOff]">{{ o.l }}</button></div></div>
            <div><div class="text-[11px] font-bold text-slate-600 mb-1">Sağım</div><div class="flex gap-1 flex-wrap"><button v-for="o in parlorOpts" :key="o.l" @click="ui.parlor = o.id" :class="[pillBase, ui.parlor === o.id ? pillOn : pillOff]">{{ o.l }}</button></div></div>
            <div><div class="text-[11px] font-bold text-slate-600 mb-1">Tank</div><div class="flex gap-1 flex-wrap"><button v-for="o in tankOpts" :key="o.l" @click="ui.tank = o.id" :class="[pillBase, ui.tank === o.id ? pillOn : pillOff]">{{ o.l }}</button></div></div>
            <div><div class="text-[11px] font-bold text-slate-600 mb-1">Silaj</div><div class="flex gap-1 flex-wrap"><button v-for="o in siloOpts" :key="o.l" @click="ui.silo = o.id" :class="[pillBase, ui.silo === o.id ? pillOn : pillOff]">{{ o.l }}</button></div></div>
            <div><div class="text-[11px] font-bold text-slate-600 mb-1">Enerji</div><div class="flex gap-1 flex-wrap"><button v-for="o in energyOpts" :key="o.l" @click="ui.energy = o.id" :class="[pillBase, ui.energy === o.id ? pillOn : pillOff]">{{ o.l }}</button></div></div>
            <div><div class="text-[11px] font-bold text-slate-600 mb-1">Su</div><div class="flex gap-1 flex-wrap"><button v-for="o in waterOpts" :key="o.l" @click="ui.water = o.id" :class="[pillBase, ui.water === o.id ? pillOn : pillOff]">{{ o.l }}</button></div></div>
            <div><div class="text-[11px] font-bold text-slate-600 mb-1">Gübre</div><div class="flex gap-1 flex-wrap"><button v-for="o in manureOpts" :key="o.l" @click="ui.manure = o.id" :class="[pillBase, ui.manure === o.id ? pillOn : pillOff]">{{ o.l }}</button></div></div>
          </div>
        </details>

        <details open class="mb-3">
          <summary class="cursor-pointer text-xs font-bold text-rose-700 uppercase tracking-wider font-display px-2 py-1 bg-rose-50 rounded-md">🐄 Batch 3 — Sürü</summary>
          <div class="mt-3 space-y-3 pl-2">
            <label class="block"><span class="text-[11px] font-semibold text-slate-600 flex justify-between"><span>3.1 Toplam baş</span><span class="font-mono font-bold text-rose-700">{{ ui.herdSize }}</span></span><input type="range" min="0" max="500" step="5" v-model.number="ui.herdSize" class="w-full accent-rose-600 mt-1" /></label>
            <label class="block"><span class="text-[11px] font-semibold text-slate-600 flex justify-between"><span>🥛 3.2 Sağmal</span><span class="font-mono font-bold text-emerald-700">{{ ui.milkingCount }}</span></span><input type="range" min="0" max="300" step="1" v-model.number="ui.milkingCount" class="w-full accent-emerald-600 mt-1" /></label>
            <label class="block"><span class="text-[11px] font-semibold text-slate-600 flex justify-between"><span>💤 3.3 Kuru</span><span class="font-mono font-bold text-amber-700">{{ ui.dryCount }}</span></span><input type="range" min="0" max="100" step="1" v-model.number="ui.dryCount" class="w-full accent-amber-600 mt-1" /></label>
            <label class="block"><span class="text-[11px] font-semibold text-slate-600 flex justify-between"><span>🐂 3.4 Düve</span><span class="font-mono font-bold text-amber-700">{{ ui.heiferCount }}</span></span><input type="range" min="0" max="100" step="1" v-model.number="ui.heiferCount" class="w-full accent-amber-600 mt-1" /></label>
            <label class="block"><span class="text-[11px] font-semibold text-slate-600 flex justify-between"><span>🍼 3.5 Buzağı</span><span class="font-mono font-bold text-sky-700">{{ ui.calfCount }}</span></span><input type="range" min="0" max="100" step="1" v-model.number="ui.calfCount" class="w-full accent-sky-600 mt-1" /></label>
            <label class="block"><span class="text-[11px] font-semibold text-slate-600 flex justify-between"><span>♂ 3.6 Boğa</span><span class="font-mono font-bold text-slate-700">{{ ui.bullCount }}</span></span><input type="range" min="0" max="10" step="1" v-model.number="ui.bullCount" class="w-full accent-slate-600 mt-1" /></label>
            <div><div class="text-[11px] font-bold text-slate-600 mb-1">3.7 Irk</div><div class="flex gap-1 flex-wrap"><button v-for="o in breedOpts" :key="o.l" @click="ui.breed = o.id" :class="[pillBase, ui.breed === o.id ? 'bg-rose-600 text-white' : pillOff]">{{ o.l }}</button></div></div>
          </div>
        </details>
      </aside>

      <!-- Stage -->
      <main class="relative overflow-y-auto" style="max-height: calc(100vh - 60px);">
        <StickerSheet v-if="view === 'sticker'" />
        <template v-else>
          <FarmScene :state="farm" />
          <details class="absolute bottom-3 left-3 z-10 max-w-sm">
            <summary class="cursor-pointer text-[10px] font-bold text-slate-600 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow">📋 Farm State JSON</summary>
            <pre class="mt-2 text-[10px] bg-slate-900 text-emerald-300 p-3 rounded-lg max-h-64 overflow-auto">{{ JSON.stringify(farm, null, 2) }}</pre>
          </details>
        </template>
      </main>
    </div>
  </div>
</template>
