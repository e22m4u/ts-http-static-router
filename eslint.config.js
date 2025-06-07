import globals from 'globals';
import eslintJs from '@eslint/js';
import eslintTypescript from 'typescript-eslint';
import eslintMochaPlugin from 'eslint-plugin-mocha';
import eslintPrettierConfig from 'eslint-config-prettier';
import eslintChaiExpectPlugin from 'eslint-plugin-chai-expect';

export default [
  {
    ignores: ['**/*.js'],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.mocha,
      },
      parser: eslintTypescript.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': eslintTypescript.plugin,
      'mocha': eslintMochaPlugin,
      'chai-expect': eslintChaiExpectPlugin,
    },
    rules: {
      ...eslintJs.configs.recommended.rules,
      ...eslintPrettierConfig.rules,
      ...eslintMochaPlugin.configs.recommended.rules,
      ...eslintTypescript.configs.recommended.reduce(
        (rules, config) => ({...rules, ...config.rules}),
        {},
      ),
      '@typescript-eslint/no-unused-expressions': 0,
    },
  },
];
