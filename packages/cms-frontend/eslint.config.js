import nextPlugin from "@next/eslint-plugin-next";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import autoImportConfig from "./test/.eslintrc-auto-import.json" assert { type: "json" };

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        sourceType: "module",
        project: "./tsconfig.json",
      },
      globals: {
        ...autoImportConfig.globals,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
      "@next/next": nextPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      "no-undef": "off",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "import/order": [
        "error",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "next/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@tanstack/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@/components/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/hooks/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/lib/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],
      "prettier/prettier": "error",
      ...prettierConfig.rules,
    },
  },
];
