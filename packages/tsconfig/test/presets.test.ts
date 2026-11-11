import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'

import { describe, expect, it } from 'vitest'

const run = promisify(execFile)
const root = join(import.meta.dirname, '..')
const fixtures = join(root, 'test', 'fixtures')
const tsc = join(root, 'node_modules', '.bin', 'tsc')
const manifest = join(root, 'node_modules', 'typescript', 'package.json')
const { version } = JSON.parse(await readFile(manifest, 'utf8')) as { version: string }
const sideEffectImport = version.startsWith('5.') ? 'TS2307' : 'TS2882'

async function check(preset: string) {
  try {
    await run(tsc, ['-p', `${preset}.tsconfig.json`], { cwd: fixtures })
    return []
  } catch (error) {
    const { stdout } = error as { stdout: string }
    return [...new Set(stdout.match(/TS\d+/g))].toSorted()
  }
}

async function options(preset: string) {
  const { stdout } = await run(tsc, ['-p', `${preset}.tsconfig.json`, '--showConfig'], {
    cwd: fixtures,
  })
  const config = JSON.parse(stdout) as { compilerOptions: Record<string, unknown> }
  return config.compilerOptions
}

describe('presets', () => {
  it('base', async () => {
    expect(await check('base')).toStrictEqual(
      [
        'TS1294',
        'TS2532',
        sideEffectImport,
        'TS4114',
        'TS5097',
        'TS6133',
        'TS7006',
        'TS7029',
        'TS7030',
      ].toSorted(),
    )
    expect(await options('base')).toMatchObject({
      lib: ['es2023'],
      module: 'preserve',
      moduleDetection: 'force',
      strict: true,
      target: 'es2023',
      types: [],
    })
  })

  it('node', async () => {
    expect(await check('node')).toStrictEqual([])
    expect(await options('node')).toMatchObject({
      lib: ['es2024'],
      module: 'nodenext',
      rewriteRelativeImportExtensions: true,
      target: 'es2024',
      types: ['node'],
    })
  })

  it('react', async () => {
    expect(await check('react')).toStrictEqual([])
    expect(await options('react')).toMatchObject({
      allowArbitraryExtensions: true,
      jsx: 'react-jsx',
      lib: ['es2023', 'dom', 'dom.iterable'],
      module: 'preserve',
    })
  })
})
