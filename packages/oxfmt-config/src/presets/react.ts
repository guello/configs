import type { Preset } from '../types.ts'
import { base } from './base.ts'

/**
 * Base preset with a `react` and `react-dom` import group after the Node.js built-in modules.
 *
 * @see {@link https://github.com/guello/configs/tree/main/packages/oxfmt-config#react | React preset}
 */
export const react: Preset = {
  ...base,
  sortImports: {
    customGroups: [
      {
        groupName: 'react',
        elementNamePattern: ['react', 'react/**', 'react-dom', 'react-dom/**'],
      },
    ],
    groups: [
      ['side_effect', 'side_effect_style'],
      'builtin',
      'react',
      'external',
      ['internal', 'subpath'],
      ['parent', 'sibling', 'index'],
      'style',
      'unknown',
    ],
  },
}
