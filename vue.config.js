const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  chainWebpack: (config) => {
    config.plugin("define").tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: false,
        __VUE_PROD_DEVTOOLS__: process.env.NODE_ENV !== "prod",
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__:
          process.env.NODE_ENV !== "prod",
      });
      return definitions;
    });
  },
  transpileDependencies: true,
});
