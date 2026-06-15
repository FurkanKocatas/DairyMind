/**
 * Layout Zones — declarative anchor points on the iso scene.
 * Defaults live here; a reactive override layer (applyLayout) lets an admin
 * drag-place objects and persist their positions globally.
 */
import { reactive } from 'vue';

export type Zone =
  | 'sky'         // top overlay
  | 'silo'        // NW — silo position
  | 'barn'        // center — main barn
  | 'barnRoof'    // above barn (fans, sprinklers)
  | 'barnSouth'   // directly below barn (badges)
  | 'parlor'      // NE-ish — milking parlor
  | 'tank'        // SE — milk tank
  | 'manure'      // E — manure system
  | 'feedStorage' // far NE — storage shed
  | 'water'       // W — water source
  | 'energyPole'  // far NW — power line
  | 'solar'       // S-SE — solar panels
  | 'herd'        // SW — cow cluster
  | 'feedField'   // far SW — crop field
  | 'tmrMixer'    // between silo & barn — yellow mixer wagon
  | 'workers';    // east of barn — worker figures

export interface ZonePos { x: number; y: number; }

/** Factory defaults — never mutated. Reset target. */
export const ZONE_DEFAULTS: Record<Zone, ZonePos> = {
  sky:         { x: 0,   y: 0   },
  silo:        { x: 250, y: 260 },
  barn:        { x: 450, y: 290 },
  barnRoof:    { x: 450, y: 235 },
  barnSouth:   { x: 450, y: 480 },
  parlor:      { x: 640, y: 380 },
  tank:        { x: 700, y: 530 },
  manure:      { x: 770, y: 460 },
  feedStorage: { x: 795, y: 320 },
  water:       { x: 160, y: 410 },
  energyPole:  { x: 70,  y: 280 },
  solar:       { x: 700, y: 410 },
  herd:        { x: 180, y: 410 },
  feedField:   { x: 50,  y: 470 },
  tmrMixer:    { x: 340, y: 360 },
  workers:     { x: 590, y: 290 }
};

/** Live reactive zone positions — what components actually read. */
export const ZONES: Record<Zone, ZonePos> = reactive(
  JSON.parse(JSON.stringify(ZONE_DEFAULTS))
);

/** Apply a saved layout (partial map zone→{x,y}) on top of defaults. */
export function applyLayout(overrides: Partial<Record<Zone, ZonePos>> | null | undefined): void {
  for (const key of Object.keys(ZONE_DEFAULTS) as Zone[]) {
    const o = overrides?.[key];
    ZONES[key].x = o && typeof o.x === 'number' ? o.x : ZONE_DEFAULTS[key].x;
    ZONES[key].y = o && typeof o.y === 'number' ? o.y : ZONE_DEFAULTS[key].y;
  }
}

/** Reset all zones to factory defaults. */
export function resetLayout(): void {
  applyLayout(null);
}

/** Reactive SVG transform string for a zone with optional offset. */
export function zoneTransform(zone: Zone, dx = 0, dy = 0): string {
  const { x, y } = ZONES[zone];
  return `translate(${x + dx}, ${y + dy})`;
}

/** Human-friendly Turkish labels for the editor UI. */
export const ZONE_LABELS: Record<Zone, string> = {
  sky: 'Gökyüzü', silo: 'Silaj Silosu', barn: 'Ahır', barnRoof: 'Ahır Çatısı (fan/duş)',
  barnSouth: 'Ahır Altı (rozetler)', parlor: 'Sağım Odası', tank: 'Süt Tankı',
  manure: 'Gübre', feedStorage: 'Yem Deposu', water: 'Su Kaynağı',
  energyPole: 'Elektrik Direği', solar: 'Güneş Paneli', herd: 'Sürü',
  feedField: 'Yem Tarlası', tmrMixer: 'TMR Mikser', workers: 'Çalışanlar'
};

/** Zones that are user-meaningful to drag (skip 'sky'). */
export const EDITABLE_ZONES: Zone[] = [
  'barn', 'barnRoof', 'barnSouth', 'parlor', 'tank', 'manure',
  'feedStorage', 'water', 'energyPole', 'solar', 'herd', 'feedField',
  'tmrMixer', 'workers', 'silo'
];
