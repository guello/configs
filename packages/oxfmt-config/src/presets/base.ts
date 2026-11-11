import { AGENT_FILES, AGENT_FOLDERS } from '../constants.ts'
import type { Preset } from '../types.ts'

/**
 * No semicolons, single quotes, trailing commas and sorted imports.
 *
 * @see {@link https://github.com/guello/configs/tree/main/packages/oxfmt-config#base | Base preset}
 */
export const base: Preset = {
  arrowParens: 'avoid',
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  jsdoc: {
    capitalizeDescriptions: false,
  },
  sortImports: {
    groups: [
      ['side_effect', 'side_effect_style'],
      'builtin',
      'external',
      ['internal', 'subpath'],
      ['parent', 'sibling', 'index'],
      'style',
      'unknown',
    ],
  },
  sortPackageJson: true,
  overrides: [
    {
      files: ['*.css', '*.less', '*.scss'],
      options: {
        singleQuote: false,
      },
    },
    {
      files: [...AGENT_FILES, ...AGENT_FOLDERS.map(folder => `**/${folder}/**`)],
      options: {
        embeddedLanguageFormatting: 'off',
      },
    },
  ],
}
