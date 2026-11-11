import type { OxlintConfig } from 'oxlint'

import { base } from './base.ts'

/**
 * Base preset with the React, React Compiler and `jsx-a11y` rules, react-doctor, import path rules
 * and browser globals.
 *
 * @see {@link https://github.com/guello/configs/tree/main/packages/oxlint-config#react | React preset}
 */
export const react: OxlintConfig = {
  ...base,
  plugins: [...(base.plugins ?? []), 'jsx-a11y', 'react'],
  jsPlugins: [
    ...(base.jsPlugins ?? []),
    { name: 'react-doctor', specifier: 'oxlint-plugin-react-doctor' },
  ],
  env: { browser: true, es2022: true },
  rules: {
    ...base.rules,
    curly: ['error', 'multi-line'],
    'import/extensions': [
      'error',
      { checkTypeImports: true, js: 'never', jsx: 'never', ts: 'never', tsx: 'never' },
    ],
    'import/no-relative-parent-imports': 'error',
    'no-shadow': 'error',
    'prefer-template': 'error',
    'promise/no-promise-in-callback': 'error',
    'promise/no-return-wrap': 'error',
    'promise/param-names': 'error',
    // The React Compiler checks the Rules of Hooks, so the preset leaves `react/rules-of-hooks` off.
    'react/hooks': 'error',
    'react/iframe-missing-sandbox': 'warn',
    'react/jsx-fragments': ['error', 'syntax'],
    'react/jsx-no-target-blank': 'error',
    'react/jsx-no-useless-fragment': 'error',
    'react/no-array-index-key': 'warn',
    'react/no-unescaped-entities': 'error',
    'react/only-export-components': [
      'warn',
      {
        allowConstantExport: true,
      },
    ],
    'react/self-closing-comp': 'error',
    'react/unsupported-syntax': 'warn',
    'react-doctor/effect-needs-cleanup': 'error',
    'react-doctor/no-create-context-in-render': 'error',
    'react-doctor/no-event-handler': 'warn',
    'react-doctor/no-mutating-reducer-state': 'error',
    'react-doctor/no-random-key': 'error',
    'typescript/switch-exhaustiveness-check': 'error',
    'unicorn/no-negated-condition': 'warn',
  },
}
