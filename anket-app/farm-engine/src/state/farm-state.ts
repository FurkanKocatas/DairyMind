/**
 * Canonical Farm State Schema — single source of truth.
 *
 * Consumed by:
 *  - Survey real-time preview (anket)
 *  - Full digital twin view (cifligim)
 *  - Dev playground (preview)
 *  - Future: IoT sensors, ML output, manual product entry
 */

export type BarnType = 'free' | 'tie' | 'open' | null;
export type ParlorType = 'herringbone' | 'rotary' | 'robot' | null;
export type TankBucket = 'small' | 'medium' | 'large' | null;
export type SiloType = 'concrete' | 'pile' | 'bale' | null;
export type EnergyMode = 'grid' | 'solar' | 'mixed' | null;
export type WaterSource = 'well' | 'pond' | 'mains';
export type ManureType = 'lagoon' | 'compost' | 'biogas' | null;
export type CoolingType = 'fan_shower' | 'fan' | 'shower' | 'natural' | null;
export type VentilationType = 'natural' | 'mechanical' | 'hybrid' | null;
export type BeddingMat = 'straw' | 'sand' | 'sawdust' | 'rubber' | 'waterbed' | 'compost';
export type Breed = 'holstein' | 'simmental' | 'jersey' | 'montofon' | 'native' | 'mixed' | null;
export type LightingType = 'led' | 'fluorescent' | 'halogen' | 'natural' | 'mixed' | null;
export type TankShape = 'open_dx' | 'ibt' | 'direct' | 'pre_cooler' | null;

export interface HerdGroups {
  total: number;
  milking: number;
  dry: number;
  heifer: number;
  calf: number;
  bull: number;
  breed: Breed;
}

export interface FarmState {
  // Main structures
  barn: BarnType;
  parlor: ParlorType;
  tank: TankBucket;
  silo: SiloType;
  energy: EnergyMode;
  water: WaterSource | null;
  waterSources: WaterSource[];
  manure: ManureType;

  // Land & crops
  totalAreaDa: number;
  farmAreaDa: number;
  irrigation: boolean;
  cornSilageTon: number;
  feedStorageMonths: number;

  // Barn details
  barnAreaM2: number;
  barnCapacity: number;
  cooling: CoolingType;
  ventilation: VentilationType;
  bedding: BeddingMat[];

  // Tank details
  tankCapacityL: number;
  tankShape: TankShape;

  // Barn lighting
  lighting: LightingType;

  // Silo size
  siloCapacityTon: number;

  // Equipment (Batch 4)
  tmrMixer: boolean;

  // Herd
  herdSize: number;
  herd: HerdGroups;

  // Production / labor / equipment (Batch 5+)
  workers: number;
  annualMilkTon: number;
  perCowKg: number;
  feedingSystem: 'tmr' | 'partial_tmr' | 'component' | 'pasture_concentrate' | 'pasture' | null;
  autoFeeder: boolean;
}

export function createDefaultState(): FarmState {
  return {
    barn: null, parlor: null, tank: null, silo: null,
    energy: null, water: null, waterSources: [], manure: null,
    totalAreaDa: 0, farmAreaDa: 0, irrigation: false, cornSilageTon: 0, feedStorageMonths: 0,
    barnAreaM2: 0, barnCapacity: 0, cooling: null, ventilation: null, bedding: [],
    tankCapacityL: 0, tankShape: null,
    lighting: null,
    siloCapacityTon: 0,
    tmrMixer: false,
    herdSize: 0,
    herd: { total: 0, milking: 0, dry: 0, heifer: 0, calf: 0, bull: 0, breed: null },
    workers: 0, annualMilkTon: 0, perCowKg: 0,
    feedingSystem: null, autoFeeder: false
  };
}

/** Total visualizable elements (denominator for progress UI) */
export const TOTAL_VISUAL = 32;

/** Count of "structural" pieces built (used by progress UI) */
export function countBuilt(s: FarmState): number {
  let n = 0;
  // Core 8
  if (s.barn) n++;
  if (s.parlor) n++;
  if (s.tank) n++;
  if (s.silo) n++;
  if (s.energy) n++;
  if (s.water) n++;
  if (s.manure) n++;
  if (s.herdSize > 0) n++;
  // Batch 1 (5)
  if (s.totalAreaDa > 0) n++;
  if (s.farmAreaDa > 0) n++;
  if (s.irrigation) n++;
  if (s.cornSilageTon > 0) n++;
  if (s.feedStorageMonths > 0) n++;
  // Batch 2 (5)
  if (s.barnAreaM2 > 0) n++;
  if (s.barnCapacity > 0) n++;
  if (s.cooling) n++;
  if (s.ventilation) n++;
  if (s.bedding.length > 0) n++;
  // Batch 3 (5)
  if (s.herd.milking > 0) n++;
  if (s.herd.dry > 0) n++;
  if (s.herd.heifer > 0) n++;
  if (s.herd.calf > 0) n++;
  if (s.herd.bull > 0) n++;
  // Batch 4 (5)
  if (s.lighting) n++;
  if (s.tankShape) n++;
  if (s.tmrMixer) n++;
  if (s.siloCapacityTon > 0) n++;
  if (s.workers > 0) n++;
  // Batch 5 (4)
  if (s.annualMilkTon > 0) n++;
  if (s.perCowKg > 0) n++;
  if (s.feedingSystem) n++;
  if (s.autoFeeder) n++;
  return n;
}
