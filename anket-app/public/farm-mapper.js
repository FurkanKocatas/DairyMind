/* DairyMind farm-mapper v2 — canonical farm state schema.
 * Maps survey answers → farm state. Same state shape consumed by:
 *  - Survey real-time preview (anket.html)
 *  - Full digital twin view (cifligim.html)
 *  - Future: IoT sensor stream, manual product entry, ML output
 *
 * Use `override` param to inject dynamic data on top of survey baseline.
 */
(function (global) {

  function num(v) {
    const n = Number(v);
    return isFinite(n) ? n : 0;
  }

  function isYes(v) {
    if (!v || typeof v !== 'string') return false;
    return v.startsWith('Evet') || v === 'Kısmen';
  }

  function mapAnswersToFarm(answers, override) {
    answers = answers || {};
    override = override || {};

    const farm = {
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
      workers: 0,
      annualMilkTon: 0, perCowKg: 0,
      feedingSystem: null, autoFeeder: false
    };

    // ===== ANA YAPILAR =====
    const barnA = answers['q_2_2_7'];
    if (barnA === 'Serbest dolaşımlı (free-stall)' || barnA === 'Karma') farm.barn = 'free';
    else if (barnA === 'Bağlı sistem (tie-stall)') farm.barn = 'tie';
    else if (barnA === 'Açık padok (Open lot)' || barnA === 'Mera (Pastoral)') farm.barn = 'open';

    const pA = answers['q_2_2_17'];
    if (['Balık sırtı (herringbone)', 'Paralel (parallel)', 'Tandem', 'Sabit boru sistemi', 'Seyyar kova'].includes(pA)) farm.parlor = 'herringbone';
    else if (pA === 'Karusel (rotary)') farm.parlor = 'rotary';
    else if (pA === 'Robotik (AMS)') farm.parlor = 'robot';

    farm.tankCapacityL = num(answers['q_2_2_19']);
    if (farm.tankCapacityL > 0) {
      if (farm.tankCapacityL < 1000) farm.tank = 'small';
      else if (farm.tankCapacityL < 3000) farm.tank = 'medium';
      else farm.tank = 'large';
    }

    const sA = answers['q_2_2_23'];
    if (sA === 'Evet, beton silo' || sA === 'Evet, toprak silo') farm.silo = 'concrete';
    else if (sA === 'Evet, yığın silaj') farm.silo = 'pile';
    else if (sA === 'Balya silaj') farm.silo = 'bale';

    const eA = answers['q_2_2_25'];
    const rA = answers['q_2_2_27'];
    const hasGridSolar = eA === 'Şebeke + güneş enerjisi' || eA === 'Şebeke + güneş + jeneratör';
    const hasRenewable = rA === 'Güneş enerjisi (GES)' || rA === 'Karma';
    if (hasGridSolar || (hasRenewable && eA && eA.toLowerCase().includes('şebeke'))) farm.energy = 'mixed';
    else if (hasRenewable) farm.energy = 'solar';
    else if (eA) farm.energy = 'grid';

    // ===== BATCH 1: ARAZİ & TARLA =====

    // 2.1 Toplam arazi — kullanıcı m² veya dönüm yazabilir (placeholder muğlak)
    // Heuristic: >10000 ise m² → dönüm'e çevir
    const totalA = num(answers['q_2_2_1']);
    farm.totalAreaDa = totalA > 10000 ? Math.round(totalA / 1000) : totalA;

    // 2.4 Yem üretim arazisi
    farm.farmAreaDa = num(answers['q_2_2_4']);

    // 2.5 Sulama
    farm.irrigation = isYes(answers['q_2_2_5']);

    // 6.4 Mısır silajı
    farm.cornSilageTon = num(answers['q_6_6_4']);

    // 6.19 Yem deposu kapasitesi (ay)
    farm.feedStorageMonths = num(answers['q_6_6_19']);

    // ===== BATCH 2: AHIR DETAYLARI =====

    // 2.8 Ahır alanı
    farm.barnAreaM2 = num(answers['q_2_2_8']);

    // 2.9 Ahır kapasitesi
    farm.barnCapacity = num(answers['q_2_2_9']);

    // 2.12 Soğutma sistemi
    const coolA = answers['q_2_2_12'];
    if (coolA === 'Fan ve duş sistemi') farm.cooling = 'fan_shower';
    else if (coolA === 'Sadece fan') farm.cooling = 'fan';
    else if (coolA === 'Sadece duş/sprey') farm.cooling = 'shower';
    else if (coolA === 'Doğal havalandırma') farm.cooling = 'natural';

    // 2.15 Havalandırma tipi
    const ventA = answers['q_2_2_15'];
    if (ventA === 'Doğal (yan açık + çatı)') farm.ventilation = 'natural';
    else if (ventA === 'Mekanik (fanlı)') farm.ventilation = 'mechanical';
    else if (ventA === 'Karma') farm.ventilation = 'hybrid';

    // 2.16 Yataklık materyali (çoklu)
    const bedA = answers['q_2_2_16'];
    if (Array.isArray(bedA)) {
      const bedMap = {
        'Sap/saman': 'straw',
        'Kum': 'sand',
        'Talaş': 'sawdust',
        'Lastik mat': 'rubber',
        'Vakumlu yatak (waterbed)': 'waterbed',
        'Gübre kompostu': 'compost'
      };
      farm.bedding = bedA.map(x => bedMap[x]).filter(Boolean);
    }

    // 2.6 Su kaynağı (multi)
    const wA = answers['q_2_2_6'];
    if (Array.isArray(wA) && wA.length) {
      const sources = [];
      if (wA.includes('Kuyu suyu') || wA.includes('Yer altı sondaj')) sources.push('well');
      if (wA.includes('Dere/Nehir') || wA.includes('Sulama kanalı') || wA.includes('Yağmur suyu toplama')) sources.push('pond');
      if (wA.includes('Şebeke suyu') || wA.includes('DSİ')) sources.push('mains');
      farm.waterSources = sources;
      farm.water = sources[0] || null;  // legacy primary
    }

    // ===== MEVCUT (gübre + sürü) =====
    const mA = answers['q_2_2_28'];
    if (mA === 'Sıvı gübre lagünü') farm.manure = 'lagoon';
    else if (mA === 'Katı gübre yığını' || mA === 'Kompost') farm.manure = 'compost';
    else if (mA === 'Biyogaz tesisi') farm.manure = 'biogas';

    // Herd (legacy + groups)
    farm.herd.total = num(answers['q_3_3_1']);
    farm.herd.milking = num(answers['q_3_3_2']);
    farm.herd.dry = num(answers['q_3_3_3']);
    farm.herd.heifer = num(answers['q_3_3_4']);
    farm.herd.calf = num(answers['q_3_3_5']);
    farm.herd.bull = num(answers['q_3_3_6']);
    farm.herdSize = farm.herd.total;

    // Breed
    const breedA = answers['q_3_3_7'];
    if (breedA) {
      if (breedA.includes('Holstein')) farm.herd.breed = 'holstein';
      else if (breedA.includes('Simental')) farm.herd.breed = 'simmental';
      else if (breedA.includes('Jersey')) farm.herd.breed = 'jersey';
      else if (breedA.includes('Montofon')) farm.herd.breed = 'montofon';
      else if (breedA.includes('Yerli')) farm.herd.breed = 'native';
      else farm.herd.breed = 'mixed';
    }

    // ===== BATCH 4 =====
    const lightA = answers['q_2_2_13'];
    if (lightA === 'LED') farm.lighting = 'led';
    else if (lightA === 'Floresan') farm.lighting = 'fluorescent';
    else if (lightA === 'Halojen') farm.lighting = 'halogen';
    else if (lightA === 'Sadece doğal ışık') farm.lighting = 'natural';
    else if (lightA === 'Doğal ışık + yapay karma') farm.lighting = 'mixed';

    const tShape = answers['q_2_2_20'];
    if (tShape === 'Açık tip (DX)') farm.tankShape = 'open_dx';
    else if (tShape === 'Kapalı tip (IBT - Ice Bank)') farm.tankShape = 'ibt';
    else if (tShape === 'Doğrudan genleşmeli') farm.tankShape = 'direct';
    else if (tShape === 'Ön soğutucu + tank') farm.tankShape = 'pre_cooler';

    const tmrA = answers['q_2_2_21'];
    farm.tmrMixer = typeof tmrA === 'string' && tmrA.startsWith('Evet');

    farm.siloCapacityTon = num(answers['q_2_2_24']);
    farm.workers = num(answers['q_8_8_1']);

    // ===== BATCH 5 =====
    farm.annualMilkTon = num(answers['q_5_5_1']);
    farm.perCowKg = num(answers['q_5_5_2']);

    const feedA = answers['q_6_6_1'];
    if (feedA === 'TMR (Tam Karma Rasyon)') farm.feedingSystem = 'tmr';
    else if (feedA === 'Yarı-TMR (PMR)') farm.feedingSystem = 'partial_tmr';
    else if (feedA === 'Komponent (ayrı ayrı)') farm.feedingSystem = 'component';
    else if (feedA === 'Mera + kesif') farm.feedingSystem = 'pasture_concentrate';
    else if (feedA === 'Sadece mera') farm.feedingSystem = 'pasture';

    const afA = answers['q_6_6_27'];
    farm.autoFeeder = typeof afA === 'string' && afA.startsWith('Evet');

    return Object.assign({}, farm, override);
  }

  const TOTAL_VISUAL = 32;

  function countBuilt(f) {
    let n = 0;
    if (f.barn) n++; if (f.parlor) n++; if (f.tank) n++; if (f.silo) n++;
    if (f.energy) n++; if (f.water) n++; if (f.manure) n++;
    if (f.herdSize > 0) n++;
    if (f.totalAreaDa > 0) n++; if (f.farmAreaDa > 0) n++;
    if (f.irrigation) n++; if (f.cornSilageTon > 0) n++; if (f.feedStorageMonths > 0) n++;
    if (f.barnAreaM2 > 0) n++; if (f.barnCapacity > 0) n++;
    if (f.cooling) n++; if (f.ventilation) n++;
    if (f.bedding && f.bedding.length > 0) n++;
    if (f.herd && f.herd.milking > 0) n++;
    if (f.herd && f.herd.dry > 0) n++;
    if (f.herd && f.herd.heifer > 0) n++;
    if (f.herd && f.herd.calf > 0) n++;
    if (f.herd && f.herd.bull > 0) n++;
    if (f.lighting) n++; if (f.tankShape) n++; if (f.tmrMixer) n++;
    if (f.siloCapacityTon > 0) n++; if (f.workers > 0) n++;
    if (f.annualMilkTon > 0) n++; if (f.perCowKg > 0) n++;
    if (f.feedingSystem) n++; if (f.autoFeeder) n++;
    return n;
  }

  // Friendly Turkish labels per choice id
  const LABELS = {
    barn:   { free: 'Serbest Dolaşımlı Ahır', tie: 'Bağlı Sistem Ahır', open: 'Açık Padok' },
    parlor: { herringbone: 'Klasik Sağım', rotary: 'Karusel Sağım', robot: 'Robotik (AMS) Sağım' },
    tank:   { small: '500L Süt Tankı', medium: '2000L Süt Tankı', large: '5000L+ Süt Tankı' },
    silo:   { concrete: 'Beton Silaj Silosu', pile: 'Yığın Silaj', bale: 'Balya Silajı' },
    energy: { grid: 'Şebeke Elektriği', solar: 'Güneş Enerjisi', mixed: 'Şebeke + Güneş' },
    water:  { well: 'Kuyu', pond: 'Gölet', mains: 'Şebeke Su' },
    manure: { lagoon: 'Gübre Lagünü', compost: 'Kompost', biogas: 'Biyogaz Tesisi' }
  };

  function labelFor(key, id) {
    return LABELS[key] && LABELS[key][id] ? LABELS[key][id] : id;
  }

  global.DMFarmMapper = { mapAnswersToFarm, countBuilt, labelFor, LABELS, TOTAL_VISUAL };
})(window);
