import conventional from '@commitlint/config-conventional'
import { type UserConfig as CommitlintConfig, RuleConfigSeverity } from '@commitlint/types'

import { lineLength, presetPath } from './utils.ts'

export type UserConfig = {
  [K in keyof CommitlintConfig as string extends K ? never : K]: CommitlintConfig[K]
}

/**
 * Returns a commitlint configuration extending the preset.
 *
 * @example
 *   export default defineConfig({
 *     types: types => [...types, 'wip'],
 *     scopes: ['api', 'web'],
 *   })
 *
 * @see {@link https://github.com/guello/configs/tree/main/packages/commitlint-config#usage | Usage}
 */
export function defineConfig(
  config: UserConfig & {
    /**
     * The allowed commit types. An array replaces the default Conventional Commit types, a function
     * receives them and returns the new list.
     */
    types?: string[] | ((defaults: string[]) => string[])
    /** The allowed scopes. A commit can still have no scope unless `requireScope` is set. */
    scopes?: string[]
    /** Rejects a commit with no scope. */
    requireScope?: boolean
    /** The maximum length of the header. The default is 72. */
    headerMaxLength?: number
    /** The maximum length of each body line, or `false` for no limit (default). */
    bodyMaxLineLength?: number | false
    /** The maximum length of each footer line, or `false` for no limit (default). */
    footerMaxLineLength?: number | false
  } = {},
): UserConfig {
  const {
    types,
    scopes,
    requireScope,
    headerMaxLength,
    bodyMaxLineLength,
    footerMaxLineLength,
    extends: extendsConfig = [],
    rules,
    ...settings
  } = config
  const typeList =
    typeof types === 'function' ? types([...conventional.rules['type-enum'][2]]) : types
  return {
    ...settings,
    extends: [presetPath, ...[extendsConfig].flat()],
    rules: {
      ...(typeList && { 'type-enum': [RuleConfigSeverity.Error, 'always', typeList] as const }),
      ...(scopes && { 'scope-enum': [RuleConfigSeverity.Error, 'always', scopes] as const }),
      ...(requireScope !== undefined && {
        'scope-empty': requireScope
          ? ([RuleConfigSeverity.Error, 'never'] as const)
          : ([RuleConfigSeverity.Disabled] as const),
      }),
      ...(headerMaxLength !== undefined && {
        'header-max-length': [RuleConfigSeverity.Error, 'always', headerMaxLength] as const,
      }),
      ...(bodyMaxLineLength !== undefined && {
        'body-max-line-length': lineLength(bodyMaxLineLength),
      }),
      ...(footerMaxLineLength !== undefined && {
        'footer-max-line-length': lineLength(footerMaxLineLength),
      }),
      ...rules,
    },
  }
}
