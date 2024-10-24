import eslintPluginVue from 'eslint-plugin-vue'
import js from '@eslint/js'
import skipFormattingConfig from "@vue/eslint-config-prettier/skip-formatting";

export default [
  {
    ignores: [
      "dist/*",
      "*.config.js",
      "prerender.js",
      "server.js"
    ]
  },
  js.configs.recommended,
  ...eslintPluginVue.configs['flat/recommended'],
  {
    files: ["src/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest"
    },
  },
  {
    files: ["src/**/*.vue"],
    languageOptions: {
      ecmaVersion: "latest",
    },
    rules: {
      "vue/component-name-in-template-casing": ["error", "kebab-case", {
        "registeredComponentsOnly": true,
      }],
      "vue/no-v-html": "off",
    }
  },
  skipFormattingConfig,
];