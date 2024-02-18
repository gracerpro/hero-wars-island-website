const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const { defineConfig } = require("@vue/cli-service");

const isDebug = process.env.NODE_ENV !== "production" ? "true" : "false";
const isSrr = process.env.SSR > 0;

console.log("SSR =", process.env.SSR > 0);

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

const clientConfig = {
  runtimeCompiler: true,
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.plugin("define").tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: "true",
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "true",
      });
      return definitions;
    });

    //console.log(config.toConfig())
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
}

const serverConfig = {
  chainWebpack: (config) => {
    config
    .entry("app")
    .clear()
    .add("./src/entry-server.js");

    config.target("node");
    config.output.libraryTarget("commonjs2");

    //config.output.libraryTarget("commonjs2"); // depricated
    //config.output.library.type = "commonjs2";

    config.optimization.splitChunks(false).minimize(false);

    config
     .plugin("manifest")
     .use(new WebpackManifestPlugin({ fileName: "ssr-manifest.json" }));

    config.plugins
      .delete("hmr")
      .delete("preload")
      .delete("prefetch")
      .delete("progress")
      .delete("friendly-errors")
     // .delete('split-vendor')
     // .delete('split-vendor-async')
     // .delete('split-manifest')
     // .delete('inline-manifest')

     //console.log(config.toConfig());
  }
}

module.exports = defineConfig(
  isSrr ? serverConfig : clientConfig
);
