import { extname, join } from 'node:path'

import { RuleConfigSeverity, type RuleConfigTuple } from '@commitlint/types'

export const presetPath: string = join(
  import.meta.dirname,
  extname(import.meta.filename) === '.ts' ? 'preset.ts' : 'preset.mjs',
)

export function lineLength(value: number | false): RuleConfigTuple<number> {
  return value === false
    ? [RuleConfigSeverity.Disabled]
    : [RuleConfigSeverity.Error, 'always', value]
}
