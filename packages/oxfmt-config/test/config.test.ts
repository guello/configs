import { describe, expect, it } from 'vitest'

import { base, defineConfig, react } from '../src/index.ts'

describe('defineConfig', () => {
  it('applies base without an option', () => {
    expect(defineConfig()).toStrictEqual(base)
  })

  it('applies react with its option', () => {
    expect(defineConfig({ react: true })).toStrictEqual(react)
  })

  it('puts the user overrides after the preset overrides', () => {
    const override = { files: ['*.md'], options: { proseWrap: 'always' as const } }
    expect(defineConfig({ printWidth: 80, overrides: [override] })).toStrictEqual({
      ...base,
      printWidth: 80,
      overrides: [...(base.overrides ?? []), override],
    })
  })
})
