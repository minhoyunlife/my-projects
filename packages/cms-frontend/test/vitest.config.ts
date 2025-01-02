import { resolve } from "path";

import react from "@vitejs/plugin-react";
import AutoImport from "unplugin-auto-import/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

import { testingLibraryPreset } from "./testing-library-preset";

const PROJECT_ROOT = resolve(__dirname, "..");

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    AutoImport({
      imports: ["vitest", testingLibraryPreset],
      dts: resolve(PROJECT_ROOT, "./test/auto-imports.d.ts"),
      eslintrc: {
        enabled: true,
        filepath: resolve(PROJECT_ROOT, "./test/.eslintrc-auto-import.json"),
        globalsPropValue: true,
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [
      "@testing-library/react",
      "@testing-library/jest-dom/vitest",
      "@testing-library/user-event",
      "./test/utils/setup.ts",
    ],
    exclude: ["../node_modules", "../.next"],
  },
});
