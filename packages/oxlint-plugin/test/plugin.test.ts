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

describe('plugin', () => {
  it('loads the built rules under the package name', async () => {
    const options = { cwd: join(root, 'test', 'fixtures') }
    const args = ['--config', 'fixture.config.ts', '--format', 'json', '.']
    let stdout: string
    try {
      ;({ stdout } = await run(oxlint, args, options))
    } catch (error) {
      ;({ stdout } = error as { stdout: string })
    }
    const report = JSON.parse(stdout) as Report
    expect(
      report.diagnostics.map(({ code, filename }) => `${filename} ${code}`).toSorted(),
    ).toStrictEqual([
      'failing.ts @guello(func-style)',
      'failing.ts @guello(no-inferrable-return-type)',
    ])
  })
})
