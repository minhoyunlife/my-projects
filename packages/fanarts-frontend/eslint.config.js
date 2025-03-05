import { fileURLToPath } from 'node:url';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

import autoImportConfig from './.eslintrc-auto-import.json' assert { type: 'json' };

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

const importOrderRules = {
  'no-undef': 'off',
  'import/order': [
    'error',
    {
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true
      },
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      pathGroups: [
        {
          pattern: '$app/**',
          group: 'external',
          position: 'before'
        },
        {
          pattern: '$env/**',
          group: 'external',
          position: 'before'
        },
        {
          pattern: '$lib/components/**',
          group: 'internal',
          position: 'before'
        },
        {
          pattern: '$lib/services/**',
          group: 'internal',
          position: 'before'
        },
        {
          pattern: '$lib/stores/**',
          group: 'internal',
          position: 'before'
        },
        {
          pattern: '$lib/**',
          group: 'internal',
          position: 'before'
        }
      ],
      pathGroupsExcludedImportTypes: ['builtin']
    }
  ]
};

export default ts.config(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  prettier,
  ...svelte.configs['flat/prettier'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...autoImportConfig.globals
      }
    },
    plugins: {
      import: importPlugin
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json'
        }
      }
    },
    rules: importOrderRules
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser
      }
    },
    rules: importOrderRules
  }
);
