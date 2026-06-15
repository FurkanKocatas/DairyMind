import { createDefaultState, type FarmState, type WaterSource, type BeddingMat } from './farm-state';

/**
 * Map raw DairyMind survey answers (question_id → value) to canonical FarmState.
 * Use `override` to inject IoT/manual data on top of survey baseline.
 */
export function mapAnswersToFarm(
  answers: Record<string, unknown> = {},
  override: Partial<FarmState> = {}
): FarmState {
  const f = createDefaultState();
  const get = <T = unknown>(k: string): T | undefined => answers[k] as T | undefined;
  const num = (v: unknown): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const isYes = (v: unknown): boolean =>
    typeof v === 'string' && (v.startsWith('Evet') || v === 'Kısmen');

  // ===== Main structures =====
  const barnA = get<string>('q_2_2_7');
  if (barnA === 'Serbest dolaşımlı (free-stall)' || barnA === 'Karma') f.barn = 'free';
  else if (barnA === 'Bağlı sistem (tie-stall)') f.barn = 'tie';
  else if (barnA === 'Açık padok (Open lot)' || barnA === 'Mera (Pastoral)') f.barn = 'open';

  const pA = get<string>('q_2_2_17');
  if (pA && ['Balık sırtı (herringbone)','Paralel (parallel)','Tandem','Sabit boru sistemi','Seyyar kova'].includes(pA))
    f.parlor = 'herringbone';
  else if (pA === 'Karusel (rotary)') f.parlor = 'rotary';
  else if (pA === 'Robotik (AMS)') f.parlor = 'robot';

  f.tankCapacityL = num(get('q_2_2_19'));
  if (f.tankCapacityL > 0) {
    f.tank = f.tankCapacityL < 1000 ? 'small' : f.tankCapacityL < 3000 ? 'medium' : 'large';
  }

  const sA = get<string>('q_2_2_23');
  if (sA === 'Evet, beton silo' || sA === 'Evet, toprak silo') f.silo = 'concrete';
  else if (sA === 'Evet, yığın silaj') f.silo = 'pile';
  else if (sA === 'Balya silaj') f.silo = 'bale';

  const eA = get<string>('q_2_2_25');
  const rA = get<string>('q_2_2_27');
  const hasGridSolar = eA === 'Şebeke + güneş enerjisi' || eA === 'Şebeke + güneş + jeneratör';
  const hasRenewable = rA === 'Güneş enerjisi (GES)' || rA === 'Karma';
  if (hasGridSolar || (hasRenewable && eA && eA.toLowerCase().includes('şebeke'))) f.energy = 'mixed';
  else if (hasRenewable) f.energy = 'solar';
  else if (eA) f.energy = 'grid';

  // ===== Land =====
  const totalA = num(get('q_2_2_1'));
  f.totalAreaDa = totalA > 10000 ? Math.round(totalA / 1000) : totalA;
  f.farmAreaDa = num(get('q_2_2_4'));
  f.irrigation = isYes(get('q_2_2_5'));
  f.cornSilageTon = num(get('q_6_6_4'));
  f.feedStorageMonths = num(get('q_6_6_19'));

  // ===== Water (multi) =====
  const wA = get<unknown[]>('q_2_2_6');
  if (Array.isArray(wA) && wA.length) {
    const sources: WaterSource[] = [];
    if (wA.includes('Kuyu suyu') || wA.includes('Yer altı sondaj')) sources.push('well');
    if (wA.includes('Dere/Nehir') || wA.includes('Sulama kanalı') || wA.includes('Yağmur suyu toplama'))
      sources.push('pond');
    if (wA.includes('Şebeke suyu') || wA.includes('DSİ')) sources.push('mains');
    f.waterSources = sources;
    f.water = sources[0] ?? null;
  }

  // ===== Manure =====
  const mA = get<string>('q_2_2_28');
  if (mA === 'Sıvı gübre lagünü') f.manure = 'lagoon';
  else if (mA === 'Katı gübre yığını' || mA === 'Kompost') f.manure = 'compost';
  else if (mA === 'Biyogaz tesisi') f.manure = 'biogas';

  // ===== Barn details =====
  f.barnAreaM2 = num(get('q_2_2_8'));
  f.barnCapacity = num(get('q_2_2_9'));

  const coolA = get<string>('q_2_2_12');
  if (coolA === 'Fan ve duş sistemi') f.cooling = 'fan_shower';
  else if (coolA === 'Sadece fan') f.cooling = 'fan';
  else if (coolA === 'Sadece duş/sprey') f.cooling = 'shower';
  else if (coolA === 'Doğal havalandırma') f.cooling = 'natural';

  const ventA = get<string>('q_2_2_15');
  if (ventA === 'Doğal (yan açık + çatı)') f.ventilation = 'natural';
  else if (ventA === 'Mekanik (fanlı)') f.ventilation = 'mechanical';
  else if (ventA === 'Karma') f.ventilation = 'hybrid';

  const bedA = get<unknown[]>('q_2_2_16');
  if (Array.isArray(bedA)) {
    const map: Record<string, BeddingMat> = {
      'Sap/saman': 'straw', 'Kum': 'sand', 'Talaş': 'sawdust',
      'Lastik mat': 'rubber', 'Vakumlu yatak (waterbed)': 'waterbed', 'Gübre kompostu': 'compost'
    };
    f.bedding = bedA
      .map((x) => (typeof x === 'string' ? map[x] : null))
      .filter((b): b is BeddingMat => !!b);
  }

  // ===== BATCH 4 =====

  // 2.13 Lighting
  const lightA = get<string>('q_2_2_13');
  if (lightA === 'LED') f.lighting = 'led';
  else if (lightA === 'Floresan') f.lighting = 'fluorescent';
  else if (lightA === 'Halojen') f.lighting = 'halogen';
  else if (lightA === 'Sadece doğal ışık') f.lighting = 'natural';
  else if (lightA === 'Doğal ışık + yapay karma') f.lighting = 'mixed';

  // 2.20 Tank shape
  const tShape = get<string>('q_2_2_20');
  if (tShape === 'Açık tip (DX)') f.tankShape = 'open_dx';
  else if (tShape === 'Kapalı tip (IBT - Ice Bank)') f.tankShape = 'ibt';
  else if (tShape === 'Doğrudan genleşmeli') f.tankShape = 'direct';
  else if (tShape === 'Ön soğutucu + tank') f.tankShape = 'pre_cooler';

  // 2.21 TMR mixer
  const tmrA = get<string>('q_2_2_21');
  f.tmrMixer = typeof tmrA === 'string' && tmrA.startsWith('Evet');

  // 2.24 Silo capacity ton
  f.siloCapacityTon = num(get('q_2_2_24'));

  // 8.1 Worker count
  f.workers = num(get('q_8_8_1'));

  // ===== BATCH 5 =====
  // 5.1 Yıllık süt (ton)
  f.annualMilkTon = num(get('q_5_5_1'));

  // 5.2 İnek başı günlük süt (kg)
  f.perCowKg = num(get('q_5_5_2'));

  // 6.1 Beslenme sistemi
  const feedA = get<string>('q_6_6_1');
  if (feedA === 'TMR (Tam Karma Rasyon)') f.feedingSystem = 'tmr';
  else if (feedA === 'Yarı-TMR (PMR)') f.feedingSystem = 'partial_tmr';
  else if (feedA === 'Komponent (ayrı ayrı)') f.feedingSystem = 'component';
  else if (feedA === 'Mera + kesif') f.feedingSystem = 'pasture_concentrate';
  else if (feedA === 'Sadece mera') f.feedingSystem = 'pasture';

  // 6.27 Otomatik yemleme
  const afA = get<string>('q_6_6_27');
  f.autoFeeder = typeof afA === 'string' && (afA.startsWith('Evet, full') || afA.startsWith('Evet'));

  // ===== Herd =====
  f.herd.total = num(get('q_3_3_1'));
  f.herd.milking = num(get('q_3_3_2'));
  f.herd.dry = num(get('q_3_3_3'));
  f.herd.heifer = num(get('q_3_3_4'));
  f.herd.calf = num(get('q_3_3_5'));
  f.herd.bull = num(get('q_3_3_6'));
  f.herdSize = f.herd.total;

  const breedA = get<string>('q_3_3_7');
  if (breedA) {
    if (breedA.includes('Holstein')) f.herd.breed = 'holstein';
    else if (breedA.includes('Simental')) f.herd.breed = 'simmental';
    else if (breedA.includes('Jersey')) f.herd.breed = 'jersey';
    else if (breedA.includes('Montofon')) f.herd.breed = 'montofon';
    else if (breedA.includes('Yerli')) f.herd.breed = 'native';
    else f.herd.breed = 'mixed';
  }

  return { ...f, ...override };
}
