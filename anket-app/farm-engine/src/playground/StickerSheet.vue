<script setup lang="ts">
import StickerCard from './StickerCard.vue';
import type { FarmState } from '@/state/farm-state';

interface Sticker { batch: string; code: string; title: string; state: Partial<FarmState>; }

// Ordered list — top-left → bottom-right
const stickers: Sticker[] = [
  // ─── CORE ───
  { batch: 'Core', code: '2.7',  title: 'Ahır · Serbest',        state: { barn: 'free' } },
  { batch: 'Core', code: '2.7',  title: 'Ahır · Bağlı',          state: { barn: 'tie' } },
  { batch: 'Core', code: '2.7',  title: 'Ahır · Açık Padok',     state: { barn: 'open' } },
  { batch: 'Core', code: '2.17', title: 'Sağım · Klasik',        state: { parlor: 'herringbone' } },
  { batch: 'Core', code: '2.17', title: 'Sağım · Karusel',       state: { parlor: 'rotary' } },
  { batch: 'Core', code: '2.17', title: 'Sağım · Robot',         state: { parlor: 'robot' } },
  { batch: 'Core', code: '2.19', title: 'Tank · 500L',           state: { tank: 'small' } },
  { batch: 'Core', code: '2.19', title: 'Tank · 2000L',          state: { tank: 'medium' } },
  { batch: 'Core', code: '2.19', title: 'Tank · 5000L+',         state: { tank: 'large' } },
  { batch: 'Core', code: '2.23', title: 'Silaj · Beton',         state: { silo: 'concrete' } },
  { batch: 'Core', code: '2.23', title: 'Silaj · Yığın',         state: { silo: 'pile' } },
  { batch: 'Core', code: '2.23', title: 'Silaj · Balya',         state: { silo: 'bale' } },
  { batch: 'Core', code: '2.25', title: 'Enerji · Şebeke',       state: { energy: 'grid' } },
  { batch: 'Core', code: '2.27', title: 'Enerji · Güneş',        state: { energy: 'solar' } },
  { batch: 'Core', code: '2.25', title: 'Enerji · Karma',        state: { energy: 'mixed' } },
  { batch: 'Core', code: '2.6',  title: 'Su · Kuyu',             state: { water: 'well' } },
  { batch: 'Core', code: '2.6',  title: 'Su · Gölet',            state: { water: 'pond' } },
  { batch: 'Core', code: '2.6',  title: 'Su · Şebeke',           state: { water: 'mains' } },
  { batch: 'Core', code: '2.28', title: 'Gübre · Lagün',         state: { manure: 'lagoon' } },
  { batch: 'Core', code: '2.28', title: 'Gübre · Kompost',       state: { manure: 'compost' } },
  { batch: 'Core', code: '2.28', title: 'Gübre · Biyogaz',       state: { manure: 'biogas' } },

  // ─── BATCH 1 — Arazi & Tarla ───
  { batch: 'B1', code: '2.1',  title: 'Toplam Arazi (badge)',
    state: { totalAreaDa: 150 } },
  { batch: 'B1', code: '2.4',  title: 'Yem Arazisi (parsel)',
    state: { farmAreaDa: 80 } },
  { batch: 'B1', code: '6.4',  title: 'Mısır Tarlası',
    state: { farmAreaDa: 80, cornSilageTon: 1200 } },
  { batch: 'B1', code: '2.5',  title: 'Sulama Sprinkler',
    state: { farmAreaDa: 80, irrigation: true } },
  { batch: 'B1', code: '6.19', title: 'Yem Deposu',
    state: { feedStorageMonths: 6 } },

  // ─── BATCH 2 — Ahır Detayları ───
  { batch: 'B2', code: '2.8',  title: 'Ahır Alanı Badge',
    state: { barn: 'free', barnAreaM2: 800 } },
  { batch: 'B2', code: '2.9',  title: 'Ahır Kapasite Badge',
    state: { barn: 'free', barnCapacity: 100 } },
  { batch: 'B2', code: '2.12', title: 'Soğutma · Fan+Duş',
    state: { barn: 'free', cooling: 'fan_shower' } },
  { batch: 'B2', code: '2.12', title: 'Soğutma · Sadece Fan',
    state: { barn: 'free', cooling: 'fan' } },
  { batch: 'B2', code: '2.12', title: 'Soğutma · Sadece Duş',
    state: { barn: 'free', cooling: 'shower' } },
  { batch: 'B2', code: '2.12', title: 'Soğutma · Doğal (leaf)',
    state: { barn: 'free', cooling: 'natural' } },
  { batch: 'B2', code: '2.15', title: 'Havalandırma · Mekanik',
    state: { barn: 'free', ventilation: 'mechanical' } },
  { batch: 'B2', code: '2.15', title: 'Havalandırma · Doğal',
    state: { barn: 'free', ventilation: 'natural' } },
  { batch: 'B2', code: '2.16', title: 'Yataklık · Kum+Lastik',
    state: { barn: 'free', bedding: ['sand', 'rubber'] } },
  { batch: 'B2', code: '2.16', title: 'Yataklık · Saman+Talaş',
    state: { barn: 'free', bedding: ['straw', 'sawdust'] } },

  // ─── BATCH 3 — Sürü Grupları ───
  { batch: 'B3', code: '3.1',  title: 'Sürü · Toplam',
    state: { herdSize: 50, herd: { total: 50, milking: 0, dry: 0, heifer: 0, calf: 0, bull: 0, breed: 'holstein' } } },
  { batch: 'B3', code: '3.2',  title: 'Sürü · Sağmal Chip',
    state: { herdSize: 50, herd: { total: 50, milking: 35, dry: 0, heifer: 0, calf: 0, bull: 0, breed: 'holstein' } } },
  { batch: 'B3', code: '3.3-6',title: 'Sürü · Tüm Gruplar',
    state: { herdSize: 80, herd: { total: 80, milking: 50, dry: 12, heifer: 10, calf: 7, bull: 1, breed: 'holstein' } } },
  { batch: 'B3', code: '3.7',  title: 'Irk · Holstein (siyah)',
    state: { herdSize: 20, herd: { total: 20, milking: 0, dry: 0, heifer: 0, calf: 0, bull: 0, breed: 'holstein' } } },
  { batch: 'B3', code: '3.7',  title: 'Irk · Simental (kırmızı)',
    state: { herdSize: 20, herd: { total: 20, milking: 0, dry: 0, heifer: 0, calf: 0, bull: 0, breed: 'simmental' } } },
  { batch: 'B3', code: '3.7',  title: 'Irk · Jersey (kahve)',
    state: { herdSize: 20, herd: { total: 20, milking: 0, dry: 0, heifer: 0, calf: 0, bull: 0, breed: 'jersey' } } },

  // ─── BATCH 4 — Aydınlatma / Tank / Mikser / Silaj / İşçi ───
  { batch: 'B4', code: '2.13', title: 'Aydınlatma · LED',
    state: { barn: 'free', lighting: 'led' } },
  { batch: 'B4', code: '2.13', title: 'Aydınlatma · Halojen',
    state: { barn: 'free', lighting: 'halogen' } },
  { batch: 'B4', code: '2.13', title: 'Aydınlatma · Floresan',
    state: { barn: 'free', lighting: 'fluorescent' } },
  { batch: 'B4', code: '2.20', title: 'Tank · DX (Açık)',
    state: { tank: 'medium', tankShape: 'open_dx' } },
  { batch: 'B4', code: '2.20', title: 'Tank · IBT (Ice Bank)',
    state: { tank: 'medium', tankShape: 'ibt' } },
  { batch: 'B4', code: '2.20', title: 'Tank · Pre-cooler',
    state: { tank: 'medium', tankShape: 'pre_cooler' } },
  { batch: 'B4', code: '2.20', title: 'Tank · Direct Exp.',
    state: { tank: 'medium', tankShape: 'direct' } },
  { batch: 'B4', code: '2.21', title: 'TMR Mikser Traktör',
    state: { tmrMixer: true } },
  { batch: 'B4', code: '2.24', title: 'Silaj Kapasite · 100t',
    state: { silo: 'concrete', siloCapacityTon: 100 } },
  { batch: 'B4', code: '2.24', title: 'Silaj Kapasite · 500t',
    state: { silo: 'concrete', siloCapacityTon: 500 } },
  { batch: 'B4', code: '8.1',  title: 'Çalışan · 4 kişi',
    state: { workers: 4 } },
  { batch: 'B4', code: '8.1',  title: 'Çalışan · 12 kişi',
    state: { workers: 12 } },

  // ─── BATCH 5 — Üretim & Beslenme ───
  { batch: 'B5', code: '5.1',  title: 'Yıllık Süt Badge',
    state: { annualMilkTon: 600 } },
  { batch: 'B5', code: '5.2',  title: 'Süt Damla Animasyon',
    state: { parlor: 'herringbone', tank: 'medium', perCowKg: 30 } },
  { batch: 'B5', code: '6.1',  title: 'Beslenme · TMR',
    state: { barn: 'free', feedingSystem: 'tmr' } },
  { batch: 'B5', code: '6.1',  title: 'Beslenme · Mera',
    state: { barn: 'free', feedingSystem: 'pasture' } },
  { batch: 'B5', code: '6.1',  title: 'Beslenme · Komponent',
    state: { barn: 'free', feedingSystem: 'component' } },
  { batch: 'B5', code: '6.27', title: 'Otomatik Yemleme Robotu',
    state: { barn: 'free', autoFeeder: true } },
];
</script>

<template>
  <div class="p-4 bg-slate-100 min-h-full">
    <div class="mb-4 px-2">
      <h2 class="text-lg font-bold text-slate-900 font-display">🎴 Component Sticker Sheet</h2>
      <p class="text-xs text-slate-500">Her component izole sahnede + batch etiketi. Layout sonradan tasarlanacak.</p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      <StickerCard
        v-for="(s, i) in stickers"
        :key="i"
        :batch="s.batch"
        :code="s.code"
        :title="s.title"
        :state="s.state"
      />
    </div>
  </div>
</template>
