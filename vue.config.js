import { defineConfig } from "@vue/cli-service";

const isDebug = process.env.NODE_ENV !== "production" ? "true" : "false";
const isServer = process.env.SSR > 0;
const entry = isServer ? "server" : "client";

console.log("SSR =", process.env.SSR, process.env.SSR > 0, entry);

/*
If you just have to deacivate the commonschunks plugins

module.exports = {
  chainWebpack: config => {
    config.plugins
      .delete('split-vendor')
      .delete('split-vendor-async')
      .delete('split-manifest')
      .delete('inline-manifest')
  }
}
*/

export default defineConfig({
  runtimeCompiler: true,
  chainWebpack: (config) => {
    // console.log(config);

    if (isServer) {
      // SSR-only config
    } else {
      // Client-only config
    }

    config.plugin("define").tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: "true",
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "true",
      });
      return definitions;
    });
  },
  pages: {
    app: {
      entry: "src/entry-" + entry + ".js",
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
