/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { ViteEjsPlugin } from "vite-plugin-ejs";
import compression from 'vite-plugin-compression2';
import path from 'path';

// https://vite.dev/config/
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
        algorithms: ['gzip'],
        exclude: [/\.(br)$ /, /\.(gz)$/]
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // Maps @ to the absolute path of your src directory
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
