import { defineConfig } from "@vue/cli-service";

const isDebug = process.env.NODE_ENV !== "production" ? "true" : "false";
//const entry = process.env.SSR > 0 ? "client" : "server";

console.log("SSR =", process.env.SSR);

export default defineConfig({
  runtimeCompiler: true,
  chainWebpack: (config) => {
    config.plugin("define").tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: "true",
        __VUE_PROD_DEVTOOLS__: "true",
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "true",
      });
      console.log(definitions);
      return definitions;
    });
  },
  pages: {
    app: {
      entry: "src/entry-client.js",
      template: "public/index.html",
      filename: "index.html",
      chunks: ["chunk-vendors", "chunk-common", "app"],
    },
    /* swagger: {
      entry: "src/swagger.js",
      template: "public/backend-api/index.html",
      filename: "backend-api/index.html",
      chunks: ["chunk-vendors", "chunk-common", "swagger"],
    },*/
  },
  transpileDependencies: true,
});
