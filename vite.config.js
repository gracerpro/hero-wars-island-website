/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { ViteEjsPlugin } from "vite-plugin-ejs";

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd());

  return {
    server: {
      host: true,
      port: 8082,
      strictPort: true,
    },
    preview: {
      host: true,
      port: 4082,
      strictPort: true,
    },
    plugins: [
      vue(),
      ViteEjsPlugin(env),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      }
    },
    test: {
      /* for example, use global to avoid globals imports (describe, test, expect): */
      // globals: true,
      coverage: {
        provider: 'v8',
        reporter: ['text'],
      },
    }
  }
})
