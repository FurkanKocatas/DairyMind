import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const isElement = mode === 'element';

  return {
    plugins: [
      vue({
        template: {
          // Allow custom elements (kebab-case Web Components) without warnings
          compilerOptions: {
            isCustomElement: (tag) => tag.startsWith('dm-')
          }
        }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: { port: 5173, host: true, open: true },
    base: isElement ? '/' : '/preview/',
    define: {
      // Vue 3 production build flags + Node.js shim (IIFE bundle runs in browser)
      'process.env.NODE_ENV': JSON.stringify('production'),
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
    },
    build: isElement
      ? {
          lib: {
            entry: 'src/element.ts',
            formats: ['iife'],
            name: 'DairyMindFarmScene',
            fileName: () => 'farm-scene.js'
          },
          rollupOptions: {
            output: { inlineDynamicImports: true }
          },
          outDir: '../public/farm-engine',
          emptyOutDir: true,
          cssCodeSplit: false
        }
      : {
          // Default build: full SPA for the dev playground (served at /preview/)
          outDir: 'dist',
          emptyOutDir: true
        }
  };
});
