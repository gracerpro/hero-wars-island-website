import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { ViteEjsPlugin } from "vite-plugin-ejs";

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd());

  console.log(mode, env);

  return {
    server: {
      port: 3000
    },
    plugins: [
      vue(),
      ViteEjsPlugin({...env}),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      }
    }
  }
})

/*
chainWebpack: (config) => {
    config.plugin("define").tap((definitions) => {
      Object.assign(definitions[0], {
        //__VUE_PROD_DEVTOOLS__: isDebug, // Conflicting values for '__VUE_PROD_DEVTOOLS__'
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: isDebug,
      });
      return definitions;
    });
  },
  pages: {
    app: {
      entry: "src/main.js",
      template: "public/index.html",
      filename: "index.html",
      chunks: ["chunk-vendors", "chunk-common", "app"],
    },
    swagger: {
      entry: "src/swagger.js",
      template: "public/backend-api/index.html",
      filename: "backend-api/index.html",
      chunks: ["chunk-vendors", "chunk-common", "swagger"],
    },
  },
  */