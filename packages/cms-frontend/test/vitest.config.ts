import { resolve } from "path";

import react from "@vitejs/plugin-react";
import AutoImport from "unplugin-auto-import/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const PROJECT_ROOT = resolve(__dirname, "..");

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    AutoImport({
      imports: [
        "vitest",
        {
          "@testing-library/react": ["render", "screen", "fireEvent"], // 그 밖에 주로 쓰일 만한 함수들이 있다면 추가할 것.
          "@testing-library/user-event": [["default", "userEvent"]], // 그 밖에 주로 쓰일 만한 함수들이 있다면 추가할 것.
        },
      ],
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
    exclude: ["../node_modules", "../.next"],
  },
});
