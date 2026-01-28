import js from '@eslint/js';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/dist/**',
      '**/public/**',
      '**/*.config.{js,mjs}',
      '**/eslint_report.txt',
      '**/.vscode/**',
      '**/playwright-report/**',
      '**/.clerk/**',
      '**/test-results/**',
      '**/*.html',
      '**/*.log',
      '**/*.json',
      '**/*.lock',
      '**/.eslintcache',
      // TypeScript project service tarafından bulunamayan test dosyası
      '**/*.test.tsx',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    // Sadece src altındaki TS/TSX dosyalarına odaklanıyoruz
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': hooksPlugin,
      import: importPlugin,
      unicorn: unicorn,
      'unused-imports': unusedImports,
      sonarjs: sonarjs,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // --- OTOMATİK TEMİZLEME (FIX) KURALLARI ---
      '@typescript-eslint/no-unused-vars': 'off', // Çakışmayı önlemek için kapalı
      'unused-imports/no-unused-imports': 'error', // 'fix' komutuyla kullanılmayan importları siler
      'unused-imports/no-unused-vars': [
        'error', // Hata olarak işaretle ki 'fix' mekanizması tetiklensin
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          // Bu kısım çok önemli: 'fix' komutu çalıştığında ne yapılacağını belirler
        },
      ],

      // --- PERFORMANS ---
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',

      // --- SOLID & CLEAN CODE ---
      complexity: ['warn', 50],
      'max-lines': ['warn', 1000],
      'max-statements': ['warn', 100],
      'sonarjs/no-nested-functions': ['warn', { threshold: 5 }],
      'no-param-reassign': 'error',
      'no-else-return': 'warn',
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],

      // --- DİĞER ---
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-undef': 'off',
      ...hooksPlugin.configs.recommended.rules,
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['src/**/__tests__/**', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  },
  prettierConfig
);
