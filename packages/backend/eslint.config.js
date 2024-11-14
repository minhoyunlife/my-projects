import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import enforceTopLevelDepsRelatedDescribe from './eslint-rules/enforce-top-level-deps-related-describe.cjs';

export default [
  // 기본 타입스크립트 설정
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroups: [
            {
              pattern: '@nestjs/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@typeorm/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/src/**',
              group: 'internal',
            },
            {
              pattern: '@/test/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
      'prettier/prettier': 'error',
      ...prettierConfig.rules,
    },
  },

  // 테스트 룰 설정
  {
    files: ['**/*.spec.ts'],
    plugins: {
      'local-rules': {
        rules: {
          'enforce-top-level-deps-related-describe':
            enforceTopLevelDepsRelatedDescribe,
        },
      },
    },
    rules: {
      'local-rules/enforce-top-level-deps-related-describe': 'error',
    },
  },
];
