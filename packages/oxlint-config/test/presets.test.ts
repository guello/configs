import { execFile } from 'node:child_process'
import { join } from 'node:path'
import { promisify } from 'node:util'

import { describe, expect, it } from 'vitest'

interface Report {
  diagnostics: {
    code: string
    filename: string
  }[]
}

const run = promisify(execFile)
const root = join(import.meta.dirname, '..')
const oxlint = join(root, 'node_modules', '.bin', 'oxlint')

async function lint(fixture: string) {
  const options = { cwd: join(root, 'test', 'fixtures', fixture) }
  const args = ['--config', 'fixture.config.ts', '--format', 'json', '.']
  let stdout: string
  try {
    ;({ stdout } = await run(oxlint, args, options))
  } catch (error) {
    ;({ stdout } = error as { stdout: string })
  }
  const report = JSON.parse(stdout) as Report
  return report.diagnostics.map(({ code, filename }) => `${filename} ${code}`).toSorted()
}

describe('presets', () => {
  it('base', async () => {
    expect(await lint('base')).toStrictEqual([
      'failing.ts @guello(func-style)',
      'failing.ts @guello(no-inferrable-return-type)',
      'failing.ts eslint(eqeqeq)',
      'failing.ts jsdoc(check-tag-names)',
      'failing.ts jsdoc(require-param-description)',
      'failing.ts typescript(no-import-type-side-effects)',
    ])
  })

  it('node', async () => {
    expect(await lint('node')).toStrictEqual([
      'failing.ts node(no-sync)',
      'failing.ts typescript(no-floating-promises)',
    ])
  })

  it('react', async () => {
    expect(await lint('react')).toStrictEqual([
      'failing.tsx @guello(func-style)',
      'failing.tsx eslint(no-shadow)',
      'failing.tsx react(hooks)',
      'failing.tsx react(purity)',
      'failing.tsx react-doctor(no-random-key)',
      'nested/failing.tsx import(extensions)',
      'nested/failing.tsx import(no-relative-parent-imports)',
    ])
  })

  it('defineConfig', async () => {
    expect(await lint('define-config')).toStrictEqual(['failing.ts eslint(eqeqeq)'])
  })
})
