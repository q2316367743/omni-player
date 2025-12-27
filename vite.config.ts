import {resolve} from "path";
import {defineConfig} from 'vite'
import UnoCSS from 'unocss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import {TDesignResolver} from '@tdesign-vue-next/auto-import-resolver';

const host = process.env.TAURI_DEV_HOST;

function _resolve(dir: string) {
  return resolve(__dirname, dir);
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(),
    AutoImport({
      resolvers: [TDesignResolver({
        library: 'vue-next'
      })],
      imports: ['vue', '@vueuse/core', 'vue-router'],
      eslintrc: {
        enabled: true,
      }
    }),
    Components({
      resolvers: [TDesignResolver({
        library: 'vue-next'
      })],
    }), UnoCSS()],
  // prevent vite from obscuring rust errors
  clearScreen: false,
  resolve: {
    alias: {
      "@": _resolve("src"),
    }
  },
  optimizeDeps: {
    include: ['monaco-editor']
  },
  server: {
    // make sure this port matches the devUrl port in tauri.conf.json file
    port: 5123,
    // Tauri expects a fixed port, fail if that port is not available
    strictPort: true,
    // if the host Tauri is expecting is set, use it
    host: host || false,
    hmr: host
      ? {
        protocol: 'ws',
        host,
        port: 1421,
      }
      : undefined,

    watch: {
      // tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
  // Env variables starting with the item of `envPrefix` will be exposed in tauri's source code through `import.meta.env`.
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target:
      process.env.TAURI_ENV_PLATFORM == 'windows'
        ? 'chrome105'
        : 'safari13',
    // don't minify for debug builds
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_ENV_DEBUG,

    rolldownOptions: {
      input: {
        main: _resolve('index.html'),
        'player-media': _resolve('player-media.html'),
        'player-network': _resolve('player-network.html'),
      },
    },

  },
})
