import { execFile } from 'node:child_process'
import { join } from 'node:path'
import { promisify } from 'node:util'

import { describe, expect, it } from 'vitest'

const run = promisify(execFile)
const root = join(import.meta.dirname, '..')
const commitlint = join(root, 'node_modules', '.bin', 'commitlint')

async function lint(config: string, message: string) {
  const pending = run(commitlint, ['--config', config, '--no-color'], {
    cwd: join(root, 'test', 'fixtures'),
  })
  pending.child.stdin?.end(message)
  try {
    await pending
    return []
  } catch (error) {
    const { stdout } = error as { stdout: string }
    const rules = [...stdout.matchAll(/^✖.*\[([a-z-]+)\]$/gmu)].flatMap(([, rule]) => rule ?? [])
    if (rules.length === 0) throw error
    return rules.toSorted((a, b) => a.localeCompare(b))
  }
}

const longLine = 'word '.repeat(40).trim()

describe('preset', () => {
  it('accepts a Conventional Commits message with long body and footer lines', async () => {
    expect(
      await lint('preset.json', `fix: handle empty input\n\n${longLine}\n\nRefs: ${longLine}\n`),
    ).toStrictEqual([])
  })

  it('rejects a header longer than 72 characters', async () => {
    expect(await lint('preset.json', `feat: ${'x'.repeat(67)}\n`)).toStrictEqual([
      'header-max-length',
    ])
  })

  it('rejects an unknown type', async () => {
    expect(await lint('preset.json', 'wip: add login\n')).toStrictEqual(['type-enum'])
  })
})

describe('defineConfig', () => {
  it.each(['wip(api): add login', 'docs(api): add guide'])('accepts %s', async message => {
    expect(await lint('define-config.config.ts', `${message}\n`)).toStrictEqual([])
  })

  it.each([
    ['feat: add login', 'scope-empty'],
    ['feat(web): add login', 'scope-enum'],
    [`feat(api): ${'x'.repeat(40)}`, 'header-max-length'],
  ])('rejects %s', async (message, rule) => {
    expect(await lint('define-config.config.ts', `${message}\n`)).toStrictEqual([rule])
  })
})
