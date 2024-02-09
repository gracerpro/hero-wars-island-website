const { defineConfig } = require("@vue/cli-service");

const isDebug = process.env.NODE_ENV !== "production" ? "true" : "false";

module.exports = defineConfig({
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
    ssr: {
      entry: "src/app.js",
      template: "public/ssr_index.html",
      filename: "ssr_index.html",
    },
    /*app: {
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
    },*/
  },
  transpileDependencies: true,
});
