import eslintPluginVue from 'eslint-plugin-vue'
import js from '@eslint/js'
import tsEslint from "typescript-eslint"
import skipFormattingConfig from "@vue/eslint-config-prettier/skip-formatting";
import vueParser from "vue-eslint-parser";
import globals from "globals";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  {
    ignores: [
      "dist/*",
      "**/*.d.ts",
      "*.config.js",
      "vite.config.ts",
      "prerender.js",
      "server.js"
    ],
  },
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  ...eslintPluginVue.configs['flat/recommended'],
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    languageOptions: {
      parser: tsEslint.parser,
      globals: {
        ...globals.browser,
      }
    },
    plugins: {
      '@typescript-eslint': tsEslint.plugin
    },
  },
  {
    files: ["src/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
      }
    },
  },
  {
    files: ["src/**/*.vue"],
    languageOptions: {
      ecmaVersion: "latest",
      parser: vueParser,
      parserOptions: {
        parser: tsEslint.parser,
        tsconfigRootDir: __dirname, // Adjust if tsconfig.json is not in the root
        // if uncomment then display an error
        // Parsing error: ESLint was configured to run on `<tsconfigRootDir>
        //project: "./tsconfig.json", // Path to your tsconfig.json
        extraFileExtensions: [".vue"],
      },
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