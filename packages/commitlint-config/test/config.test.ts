import { join } from 'node:path'

import conventional from '@commitlint/config-conventional'
import { RuleConfigSeverity } from '@commitlint/types'
import { describe, expect, it } from 'vitest'

import { defineConfig } from '../src/index.ts'

const preset = join(import.meta.dirname, '..', 'src', 'preset.ts')

describe('defineConfig', () => {
  it('extends the preset without an option', () => {
    expect(defineConfig()).toStrictEqual({ extends: [preset], rules: {} })
  })

  it('passes the Conventional Commits types to a types function', () => {
    expect(defineConfig({ types: types => [...types, 'wip'] }).rules).toStrictEqual({
      'type-enum': [2, 'always', [...conventional.rules['type-enum'][2], 'wip']],
    })
  })

  it('sets the rule of each option', () => {
    expect(
      defineConfig({
        types: ['feat', 'fix'],
        scopes: ['api'],
        requireScope: true,
        headerMaxLength: 100,
        bodyMaxLineLength: 100,
        footerMaxLineLength: false,
      }).rules,
    ).toStrictEqual({
      'type-enum': [2, 'always', ['feat', 'fix']],
      'scope-enum': [2, 'always', ['api']],
      'scope-empty': [2, 'never'],
      'header-max-length': [2, 'always', 100],
      'body-max-line-length': [2, 'always', 100],
      'footer-max-line-length': [0],
    })
    expect(defineConfig({ requireScope: false }).rules).toStrictEqual({ 'scope-empty': [0] })
  })

  it('applies the user configs after the preset and the rules after the options', () => {
    expect(
      defineConfig({
        extends: 'other',
        headerMaxLength: 100,
        helpUrl: 'https://example.com',
        rules: { 'header-max-length': [RuleConfigSeverity.Warning, 'always', 80] },
      }),
    ).toStrictEqual({
      helpUrl: 'https://example.com',
      extends: [preset, 'other'],
      rules: { 'header-max-length': [1, 'always', 80] },
    })
  })

  it('rejects an unknown option', () => {
    // @ts-expect-error: the options have no index signature.
    expect(defineConfig({ headerMaxLenght: 50 }).rules).toStrictEqual({})
  })
})
