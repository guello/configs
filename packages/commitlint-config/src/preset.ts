import { RuleConfigSeverity, type UserConfig } from '@commitlint/types'

/**
 * Commitlint preset using Conventional Commits, short headers, free-form bodies and footers.
 *
 * @see {@link https://github.com/guello/configs/tree/main/packages/commitlint-config#preset | Preset}
 */
const preset: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [RuleConfigSeverity.Disabled],
    'footer-max-line-length': [RuleConfigSeverity.Disabled],
    'header-max-length': [RuleConfigSeverity.Error, 'always', 72],
  },
}

export default preset
