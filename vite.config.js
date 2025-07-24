/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { ViteEjsPlugin } from "vite-plugin-ejs";
import compression from 'vite-plugin-compression2';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd());

  return {
    server: {
      host: true,
      allowedHosts: true,
      port: 8082,
      strictPort: true,
      hmr: {
        protocol: "ws",
        host: '127.0.0.1',
        port: 24679,
      },
    },
    preview: {
      host: true,
      allowedHosts: true,
      port: 4082,
      strictPort: true,
    },
    plugins: [
      vue(),
      ViteEjsPlugin(env),
      compression({
        algorithm: 'gzip',
        exclude: [/\.(br)$ /, /\.(gz)$/]
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      }
    },
    test: {
      environment: 'jsdom',
      coverage: {
        provider: 'v8',
        reporter: ['text'],
      },
      setupFiles: 'vitest.setup.js',
    }
  }
})
