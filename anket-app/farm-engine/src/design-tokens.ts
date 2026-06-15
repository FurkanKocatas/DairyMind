/**
 * Design Tokens — single source of truth for visual constants.
 * Designer changes here propagate to every component.
 */

export const COLORS = {
  // Brand
  brand: '#16a34a',
  brandDark: '#15803d',
  brandLight: '#86efac',

  // Sky / atmosphere
  sky: { top: '#bae6fd', mid: '#7dd3fc', horizon: '#a7f3d0' },
  ground: { light: '#bef264', mid: '#a3e635', dark: '#65a30d' },
  hills: { far: '#86efac', near: '#65a30d' },

  // Sun
  sun: { core: '#f59e0b', glow: '#fbbf24', halo: '#fde68a' },

  // Building palette
  barn: {
    free: { front: '#fef3c7', frontMid: '#fde68a', side: '#fcd34d', sideDark: '#f59e0b', roof: '#dc2626', roofDark: '#991b1b' },
    tie:  { front: '#fed7aa', frontMid: '#fdba74', side: '#fb923c', roof: '#7c2d12', roofDark: '#5c1f0a' },
    open: { canopy: '#7c2d12', canopyMid: '#92400e' },
    sign: '#fbbf24',
    signText: '#7c2d12'
  },

  // Parlor
  parlorHerringbone: { front: '#bfdbfe', mid: '#93c5fd', side: '#60a5fa', roof: '#1d4ed8', roofDark: '#1e40af' },
  parlorRobot: { front: '#e0e7ff', mid: '#c7d2fe', side: '#a5b4fc', roof: '#4338ca', roofDark: '#312e81' },
  parlorRotary: { base: '#475569', face: '#94a3b8', spokes: '#1e293b' },

  // Tank
  tank: { body: '#cbd5e1', cap: '#f1f5f9', shadow: 'rgba(0,0,0,0.2)' },

  // Silo
  silo: { body: '#94a3b8', cap: '#cbd5e1', topGrain: '#16a34a', roof: '#dc2626', door: '#1e293b' },

  // Manure
  manure: { lagoon: '#92400e', compost: '#78350f', biogas: '#16a34a' },

  // Field / crops
  field: { grass: '#84cc16', grassLight: '#a3e635', corn: '#fbbf24', cornStem: '#a16207' },

  // Water
  water: { deep: '#1e3a8a', mid: '#3b82f6', light: '#60a5fa' },

  // Solar
  solar: { panel: '#1e3a8a', face: '#60a5fa', frame: '#475569' },

  // Cow breed tints (used on cow body spots)
  breed: {
    holstein: '#1e293b',  // black
    simmental: '#dc2626', // red
    jersey: '#92400e',    // brown
    montofon: '#a16207',
    native: '#451a03',
    mixed: '#1e293b'
  },

  // UI chips / badges
  badge: {
    area: { bg: '#fbbf24', text: '#451a03' },
    capacity: { bg: '#0ea5e9', text: '#ffffff' },
    herd: { bg: '#15803d', text: '#ffffff' },
    milking: '#15803d',
    dry: '#7c2d12',
    heifer: '#a16207',
    calf: '#0ea5e9',
    bull: '#1e293b'
  }
} as const;

export const ANIMATION = {
  popIn: '0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
  bob: '3s ease-in-out',
  walkIso: '13s ease-in-out',
  spinSlow: '5s linear',
  spinFast: '1.5s linear',
  pulse: '2.5s ease-in-out',
  smoke: '4.5s ease-in-out',
  sunRays: '4s ease-in-out',
  cloudDrift: '60s linear'
} as const;

export const SCENE = {
  viewBox: '0 0 900 620',
  // Iso ground polygon corners — defines the visible farm plot
  groundCorners: { top: [450, 160], right: [820, 335], bottom: [450, 510], left: [80, 335] }
} as const;

export type DesignTokens = {
  colors: typeof COLORS;
  animation: typeof ANIMATION;
  scene: typeof SCENE;
};
