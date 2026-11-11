import { describe, expect, it } from 'vitest'

import { base, defineConfig, node, react } from '../src/index.ts'

describe('defineConfig', () => {
  it('extends base without an option', () => {
    expect(defineConfig()).toStrictEqual({ extends: [base] })
  })

  it('extends the preset before the user configs and merges env at the root', () => {
    const other = { rules: { eqeqeq: 'off' as const } }
    expect(defineConfig({ node: true, env: { browser: true }, extends: [other] })).toStrictEqual({
      env: { browser: true, es2022: true, node: true },
      extends: [node, other],
    })
  })

  it('extends react and lets the user env win', () => {
    expect(defineConfig({ react: true, env: { browser: false } })).toStrictEqual({
      env: { browser: false, es2022: true },
      extends: [react],
    })
  })

  it('rejects node and react together', () => {
    // @ts-expect-error: the types allow one preset option only.
    expect(() => defineConfig({ node: true, react: true })).toThrow(TypeError)
  })
})
