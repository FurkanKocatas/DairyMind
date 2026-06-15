/**
 * Web Component entry — bundled as `dm-farm-scene` custom element.
 * Usage on any HTML page:
 *   <script src="/farm-engine/farm-scene.js"></script>
 *   <dm-farm-scene state='{"barn":"free",...}' layout='{"barn":{"x":450,"y":290}}'></dm-farm-scene>
 *
 * Also exposes window.DMFarmEngine = { applyLayout, resetLayout, ZONE_DEFAULTS, ... }
 * so the layout editor page can drive positions live.
 */
import { defineCustomElement, h } from 'vue';
import FarmScene from './components/FarmScene.vue';
import { createDefaultState, type FarmState } from './state/farm-state';
import { applyLayout, resetLayout, ZONES, ZONE_DEFAULTS, ZONE_LABELS, EDITABLE_ZONES } from './layout/zones';
import './styles/globals.css';
import globalsCSS from './styles/globals.css?inline';

const Wrapped = defineCustomElement({
  props: {
    state: { type: [String, Object], default: () => createDefaultState() },
    layout: { type: [String, Object], default: null }
  },
  styles: [globalsCSS],
  setup(props) {
    const parseState = (): FarmState => {
      if (typeof props.state === 'string') {
        try { return JSON.parse(props.state) as FarmState; }
        catch { return createDefaultState(); }
      }
      return (props.state as FarmState) ?? createDefaultState();
    };
    const applyLayoutProp = () => {
      let l = props.layout;
      if (typeof l === 'string') {
        if (!l.trim()) { applyLayout(null); return; }
        try { l = JSON.parse(l); } catch { l = null; }
      }
      applyLayout(l as any);
    };
    return () => {
      applyLayoutProp();        // reactive — re-applies whenever layout attr changes
      return h(FarmScene, { state: parseState() });
    };
  }
});

if (!customElements.get('dm-farm-scene')) {
  customElements.define('dm-farm-scene', Wrapped);
}

// Global API for the layout editor page
(window as any).DMFarmEngine = {
  applyLayout,
  resetLayout,
  ZONES,
  ZONE_DEFAULTS,
  ZONE_LABELS,
  EDITABLE_ZONES,
  createDefaultState
};

export { createDefaultState, applyLayout, resetLayout, ZONES, ZONE_DEFAULTS };
export { mapAnswersToFarm } from './state/answer-mapper';
export type { FarmState } from './state/farm-state';
