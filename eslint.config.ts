import * as js from "@eslint/js";
import * as globals from "globals";
import * as tseslint from "typescript-eslint";
import * as pluginVue from "eslint-plugin-vue";
import css from "@eslint/css";
import {defineConfig} from "eslint/config";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import autoImportGlobals from "./.eslintrc-auto-import.json";

export default defineConfig([
  {ignores: ["dist/**", "src-tauri/**", "node_modules/**"]},
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], plugins: {js}, extends: ["js/recommended"], languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        utools: true,
        Buffer: true,
        ...autoImportGlobals.globals, // 👈 合并自动导入的全局变量
      }
    }
  },
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  {files: ["**/*.vue"], languageOptions: {parserOptions: {parser: tseslint.parser}}},
  {files: ["**/*.css"], plugins: {css}, language: "css/css", extends: ["css/recommended"]},
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
]);
