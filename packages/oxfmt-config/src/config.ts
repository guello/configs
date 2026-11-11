import type { OxfmtConfig } from 'oxfmt'

import { base } from './presets/base.ts'
import { react } from './presets/react.ts'
import type { UserConfig } from './types.ts'

/**
 * Returns an Oxfmt configuration with no semicolons, single quotes and sorted imports. Your
 * settings replace the preset values, and `overrides` applies after the preset overrides.
 *
 * @example
 *   export default defineConfig({
 *     react: true,
 *     ignorePatterns: ['dist'],
 *   })
 *
 * @see {@link https://github.com/guello/configs/tree/main/packages/oxfmt-config#usage}
 */
export function defineConfig(config: UserConfig = {}): OxfmtConfig {
  const { react: isReact, overrides = [], ...settings } = config
  const preset = isReact ? react : base
  return { ...preset, ...settings, overrides: [...(preset.overrides ?? []), ...overrides] }
}
