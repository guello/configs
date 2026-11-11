import type { OxlintConfig } from 'oxlint'

import { base } from './presets/base.ts'
import { node } from './presets/node.ts'
import { react } from './presets/react.ts'
import type { UserConfig } from './types.ts'

/**
 * Returns an Oxlint configuration with the rules from the selected preset. The options `rules` and
 * `extends` apply after the shared rules.
 *
 * @example
 *   export default defineConfig({ node: true, ignorePatterns: ['dist'] })
 *
 * @see {@link https://github.com/guello/configs/tree/main/packages/oxlint-config#usage}
 */
export function defineConfig(config: UserConfig = {}): OxlintConfig {
  const { node: isNode, react: isReact, ...settings } = config
  if (isNode && isReact) {
    throw new TypeError('Set `node` or `react`, not both.')
  }
  const preset = isReact ? react : isNode ? node : base
  const env = { ...preset.env, ...settings.env }
  return {
    ...settings,
    ...(Object.keys(env).length > 0 && { env }),
    extends: [preset, ...(settings.extends ?? [])],
  }
}
