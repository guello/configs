import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { OxlintConfig } from 'oxlint'

const pluginRoot = dirname(fileURLToPath(import.meta.resolve('@guello/oxlint-plugin/package.json')))

const pluginPath =
  extname(import.meta.filename) === '.ts'
    ? join(pluginRoot, 'src', 'index.ts')
    : fileURLToPath(import.meta.resolve('@guello/oxlint-plugin'))

/**
 * Type-aware rules for TypeScript projects, with the `@guello` plugin rules.
 *
 * @see {@link https://github.com/guello/configs/tree/main/packages/oxlint-config#base | Base preset}
 */
export const base: OxlintConfig = {
  plugins: ['eslint', 'import', 'jsdoc', 'oxc', 'promise', 'typescript', 'unicorn'],
  jsPlugins: [{ name: '@guello', specifier: pluginPath }],
  categories: { correctness: 'error' },
  options: { typeAware: true },
  rules: {
    'arrow-body-style': ['error', 'as-needed'],
    eqeqeq: 'error',
    'func-style': 'off',
    'no-console': [
      'warn',
      {
        allow: ['info', 'warn', 'error'],
      },
    ],
    'no-else-return': 'error',
    'no-extend-native': 'error',
    'no-label-var': 'error',
    'no-new-func': 'error',
    'no-param-reassign': 'warn',
    'no-proto': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-throw-literal': 'error',
    'no-unused-vars': [
      'error',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        fix: {
          imports: 'safe-fix',
        },
        ignoreRestSiblings: true,
        vars: 'all',
        varsIgnorePattern: '^_',
      },
    ],
    'no-useless-concat': 'error',
    'no-useless-constructor': 'error',
    'no-var': 'error',
    'operator-assignment': 'error',
    'prefer-const': 'error',
    'prefer-promise-reject-errors': 'warn',
    radix: 'error',
    'require-await': 'error',
    'symbol-description': 'warn',
    'import/consistent-type-specifier-style': 'off',
    'import/no-absolute-path': 'error',
    'import/no-commonjs': 'error',
    'import/no-cycle': 'error',
    'import/no-duplicates': [
      'error',
      {
        preferInline: true,
      },
    ],
    'import/no-self-import': 'error',
    'jsdoc/check-tag-names': ['error', { typed: true }],
    'jsdoc/empty-tags': 'error',
    'jsdoc/no-blank-blocks': 'error',
    'jsdoc/require-param-description': 'error',
    'jsdoc/require-param-name': 'error',
    'jsdoc/require-property-type': 'off',
    'jsdoc/require-returns-description': 'error',
    'jsdoc/require-yields': 'off',
    'jsdoc/require-yields-description': 'error',
    'oxc/no-accumulating-spread': 'warn',
    'promise/always-return': 'error',
    'promise/catch-or-return': 'error',
    'promise/no-nesting': 'warn',
    'promise/prefer-await-to-then': 'error',
    'typescript/array-type': [
      'error',
      {
        default: 'array',
      },
    ],
    'typescript/ban-ts-comment': [
      'error',
      {
        'ts-check': false,
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': true,
        'ts-nocheck': true,
      },
    ],
    'typescript/consistent-type-definitions': ['error', 'interface'],
    'typescript/consistent-type-imports': [
      'error',
      {
        fixStyle: 'inline-type-imports',
        prefer: 'type-imports',
      },
    ],
    'typescript/no-empty-object-type': 'warn',
    'typescript/no-explicit-any': 'warn',
    'typescript/no-import-type-side-effects': 'error',
    'typescript/no-inferrable-types': 'error',
    'typescript/no-misused-promises': 'error',
    'typescript/no-require-imports': 'error',
    'typescript/no-unnecessary-type-assertion': 'warn',
    'typescript/prefer-nullish-coalescing': 'warn',
    'typescript/prefer-optional-chain': 'warn',
    'unicorn/error-message': 'error',
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
      },
    ],
    'unicorn/new-for-builtins': 'error',
    'unicorn/no-array-for-each': 'error',
    'unicorn/no-instanceof-array': 'error',
    'unicorn/no-unnecessary-await': 'warn',
    'unicorn/no-useless-promise-resolve-reject': 'warn',
    'unicorn/prefer-array-flat': 'warn',
    'unicorn/prefer-array-flat-map': 'warn',
    'unicorn/prefer-includes': 'warn',
    'unicorn/prefer-number-properties': 'warn',
    'unicorn/prefer-optional-catch-binding': 'warn',
    'unicorn/prefer-prototype-methods': 'warn',
    'unicorn/prefer-spread': 'warn',
    'unicorn/prefer-string-trim-start-end': 'warn',
    'unicorn/prefer-structured-clone': 'warn',
    'unicorn/prefer-type-error': 'warn',
    'unicorn/throw-new-error': 'error',
    '@guello/func-style': 'error',
    '@guello/no-inferrable-return-type': 'error',
  },
}
