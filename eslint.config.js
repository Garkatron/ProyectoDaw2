import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["**/node_modules/**", "dist/", "**/vite.config.js"] },
  {
    rules: {
      semi: "error",
      "prefer-const": "error",
    },
  },
]);   