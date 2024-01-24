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
  transpileDependencies: true,
});
