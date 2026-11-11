import { execFile } from 'node:child_process'
import { join } from 'node:path'
import { promisify } from 'node:util'

import { describe, expect, it } from 'vitest'

const run = promisify(execFile)
const root = join(import.meta.dirname, '..')
const oxfmt = join(root, 'node_modules', '.bin', 'oxfmt')

function lines(...rows: string[]) {
  return `${rows.join('\n')}\n`
}

// Uses the CLI because the `format()` API ignores `overrides`.
async function format(preset: string, file: string, source: string) {
  const cwd = join(root, 'test', 'fixtures')
  const pending = run(oxfmt, ['--config', `${preset}.config.ts`, `--stdin-filepath=${file}`], {
    cwd,
  })
  pending.child.stdin?.end(source)
  const { stdout } = await pending
  return stdout
}

describe('presets', () => {
  describe('base', () => {
    const fence = lines('```ts', 'const name = "foo";', '```')

    it('removes semicolons, uses single quotes, and adds trailing commas', async () => {
      const source = lines(
        'export const double = (value: number) => { return value * 2; };',
        'export const name = "foo";',
        'export const tripled = [1, 2].map((value) => value * 3);',
        "export const options = { first: 'alpha', second: 'bravo', third: 'charlie', fourth: 'delta', fifth: 'echo', sixth: 'foxtrot' };",
      )
      expect(await format('base', 'input.ts', source)).toBe(
        lines(
          'export const double = (value: number) => {',
          '  return value * 2',
          '}',
          "export const name = 'foo'",
          'export const tripled = [1, 2].map(value => value * 3)',
          'export const options = {',
          "  first: 'alpha',",
          "  second: 'bravo',",
          "  third: 'charlie',",
          "  fourth: 'delta',",
          "  fifth: 'echo',",
          "  sixth: 'foxtrot',",
          '}',
        ),
      )
    })

    it('puts each argument of a long call on its own line', async () => {
      expect(
        await format(
          'base',
          'input.ts',
          'createWidget("a first argument that is long", "a second argument that is long", "a third argument that is long")\n',
        ),
      ).toBe(
        lines(
          'createWidget(',
          "  'a first argument that is long',",
          "  'a second argument that is long',",
          "  'a third argument that is long',",
          ')',
        ),
      )
    })

    it.each(['README.md', 'docs/guide.md', 'input.mdx'])(
      'formats code blocks in %s',
      async file => {
        expect(await format('base', file, fence)).toBe(lines('```ts', "const name = 'foo'", '```'))
      },
    )

    it.each([
      'AGENTS.md',
      'docs/CLAUDE.md',
      '.agents/rules/style.md',
      'app/.claude/skills/name/SKILL.md',
      '.kiro/steering/style.md',
      '.github/agents/review.agent.md',
    ])('keeps code blocks in %s as written', async file => {
      expect(await format('base', file, fence)).toBe(fence)
    })

    it('formats scripts in HTML', async () => {
      expect(
        await format('base', 'input.html', lines('<script>', 'const name = "foo";', '</script>')),
      ).toBe(lines('<script>', "  const name = 'foo'", '</script>'))
    })

    it('uses single quotes in YAML', async () => {
      expect(await format('base', 'input.yaml', 'name: "foo"\n')).toBe("name: 'foo'\n")
    })

    it.each(['input.json', 'input.jsonc'])('uses double quotes in %s', async file => {
      expect(await format('base', file, "{ 'name': 'foo' }\n")).toBe('{ "name": "foo" }\n')
    })

    it('uses single quotes and quotes only the keys that need it in JSON5', async () => {
      expect(await format('base', 'input.json5', '{ "name": "foo", "dash-key": 1 }\n')).toBe(
        "{ name: 'foo', 'dash-key': 1 }\n",
      )
    })

    it('keeps a long JSON object on several lines, with a trailing comma in JSONC only', async () => {
      const long = lines(
        '{',
        '  "first": "a value that is long enough to keep the object on several lines of the file",',
        '  "second": "another value"',
        '}',
      )
      expect(await format('base', 'input.json', long)).toBe(long)
      expect(await format('base', 'input.jsonc', long)).toBe(long.replace('value"\n', 'value",\n'))
    })

    it('sorts imports into groups', async () => {
      const source = lines(
        "import './setup.ts'",
        "import { local } from './local.ts'",
        "import { parse } from 'yaml'",
        "import { readFile } from 'node:fs/promises'",
      )
      expect(await format('base', 'input.ts', source)).toBe(
        lines(
          "import './setup.ts'",
          '',
          "import { readFile } from 'node:fs/promises'",
          '',
          "import { parse } from 'yaml'",
          '',
          "import { local } from './local.ts'",
        ),
      )
    })

    it('formats JSDoc comments and keeps the first letter of descriptions', async () => {
      const source = lines(
        '/**',
        ' * defineConfig returns the config.',
        ' * @return the config',
        ' * @example',
        ' * defineConfig({ react: true })',
        ' */',
        'export const defineConfig = (config: object) => config',
        '',
        '/**',
        ' * Adds two numbers.',
        ' */',
        'export const add = (first: number, second: number) => first + second',
      )
      expect(await format('base', 'input.ts', source)).toBe(
        lines(
          '/**',
          ' * defineConfig returns the config.',
          ' *',
          ' * @example',
          ' *   defineConfig({ react: true })',
          ' *',
          ' * @returns the config',
          ' */',
          'export const defineConfig = (config: object) => config',
          '',
          '/** Adds two numbers. */',
          'export const add = (first: number, second: number) => first + second',
        ),
      )
    })
  })

  it('react', async () => {
    const source = lines(
      "import { useState } from 'react'",
      "import { clsx } from 'clsx'",
      "import { join } from 'node:path'",
      "import { helper } from './helper'",
      "import { Button } from '@/components/button'",
      "import styles from './app.module.css'",
      "import './styles.css'",
    )
    expect(await format('react', 'input.tsx', source)).toBe(
      lines(
        "import './styles.css'",
        '',
        "import { join } from 'node:path'",
        '',
        "import { useState } from 'react'",
        '',
        "import { clsx } from 'clsx'",
        '',
        "import { Button } from '@/components/button'",
        '',
        "import { helper } from './helper'",
        '',
        "import styles from './app.module.css'",
      ),
    )
    expect(await format('react', 'input.tsx', 'export const name = (value) => "foo";\n')).toBe(
      "export const name = value => 'foo'\n",
    )
    expect(await format('react', 'input.css', "a::before { content: 'foo'; }\n")).toBe(
      lines('a::before {', '  content: "foo";', '}'),
    )
  })

  it('defineConfig', async () => {
    const source = lines(
      "import { parse } from 'yaml'",
      "import { readFile } from 'node:fs/promises'",
      '',
      'export const name = "foo"',
    )
    expect(await format('overrides', 'input.ts', source)).toBe(
      lines(
        "import { readFile } from 'node:fs/promises';",
        '',
        "import { parse } from 'yaml';",
        '',
        "export const name = 'foo';",
      ),
    )
    expect(await format('overrides', 'input.mts', 'export const name = "foo"\n')).toBe(
      "export const name = 'foo'\n",
    )
    expect(await format('overrides', 'input.css', "a::before { content: 'foo'; }\n")).toBe(
      lines('a::before {', '  content: "foo";', '}'),
    )
  })
})
