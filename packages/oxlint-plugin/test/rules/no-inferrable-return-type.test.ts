import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { RuleTester } from 'oxlint/plugins-dev'
import { afterAll, describe, it } from 'vitest'

import { noInferrableReturnType } from '../../src/rules/no-inferrable-return-type.ts'

RuleTester.describe = describe
RuleTester.it = it

const root = await mkdtemp(join(tmpdir(), 'no-inferrable-return-type-'))
afterAll(() => rm(root, { recursive: true, force: true }))

const configs = {
  'isolated/tsconfig.json': `{
    // Comments, URLs in strings and trailing commas are valid in a tsconfig.
    "$schema": "https://json.schemastore.org/tsconfig",
    /* Block comment */
    "compilerOptions": { "isolatedDeclarations": true, },
  }`,
  'relative/tsconfig.json': '{ "extends": "../isolated/tsconfig" }',
  'package/tsconfig.json': '{ "extends": "shared/strict" }',
  'package/node_modules/shared/package.json': '{ "exports": { "./strict": "./strict.json" } }',
  'package/node_modules/shared/strict.json':
    '{ "compilerOptions": { "isolatedDeclarations": true } }',
  'array/tsconfig.json': '{ "extends": ["../isolated/tsconfig.json", "./off.json"] }',
  'array/off.json': '{ "compilerOptions": { "isolatedDeclarations": false } }',
  'override/tsconfig.json':
    '{ "extends": "../isolated/tsconfig.json", "compilerOptions": { "isolatedDeclarations": false } }',
}

await Promise.all(
  Object.entries(configs).map(async ([path, text]) => {
    await mkdir(dirname(join(root, path)), { recursive: true })
    await writeFile(join(root, path), text)
  }),
)

const tester = new RuleTester({
  cwd: root,
  languageOptions: { sourceType: 'module', parserOptions: { lang: 'ts' } },
})

const exportedParse = 'export function parse(text: string): number { return Number(text) }'
const exportedParseFixed = 'export function parse(text: string) { return Number(text) }'

function removal(code: string, output: string) {
  return {
    code,
    errors: [{ messageId: 'inferrable', suggestions: [{ messageId: 'remove', output }] }],
  }
}

tester.run('no-inferrable-return-type', noInferrableReturnType, {
  valid: [
    'export function double(value: number) { return value * 2 }',
    'export const triple = (value: number) => value * 3',
    'export function isText(value: unknown): value is string { return typeof value === "string" }',
    'export function assert(value: unknown): asserts value {}',
    'export function fail(message: string): never { throw new Error(message) }',
    'export function find(items: string[]): string | undefined { if (items.length > 0) return items[0]; return }',
    'export async function load(): Promise<string | undefined> { return }',
    'export function pick(value: string): string\nexport function pick(value: number): number\nexport function pick(value: string | number): string | number { return value }',
    'export class Box { pick(value: string): string\n  pick(value: number): number\n  pick(value: string | number): string | number { return value } }',
    'export abstract class Shape { abstract area(): number }',
    'export declare function declared(): number',
    'export interface Api { get(): number }',
    'export type Get = () => number',
    'export function factorial(value: number): number { return value <= 1 ? 1 : value * factorial(value - 1) }',
    'export const walk = (depth: number): number => (depth > 0 ? walk(depth - 1) : 0)',
    'export class Tree { depth(): number { return this.depth() + 1 } }',
    'export function parse(text: string): unknown { return JSON.parse(text) }',
    'export function load(): Result<Config> { return { ok: true, value: config } }',
    'export function plugin(): Plugin { return { apply(compiler) {} } }',
    'export function names(): readonly string[] { return [] }',
    'export function label(): string | null { return null }',
    'export function schema(): Record<string, unknown> { return {} }',
    'export async function fetchJson<T>(url: string): Promise<T> { return (await fetch(url)).json() }',
    'export function* count(): Generator<number> { yield 1 }',
    {
      code: 'export function parse(text: string): number { return Number(text) }',
      options: [{ allowExported: true }],
    },
    {
      code: 'export const parse = (text: string): number => Number(text)',
      options: [{ allowExported: true }],
    },
    {
      code: 'export default function parse(text: string): number { return Number(text) }',
      options: [{ allowExported: true }],
    },
    {
      code: 'export class Parser { parse(text: string): number { return Number(text) } }',
      options: [{ allowExported: true }],
    },
    {
      code: 'export const api = { parse(text: string): number { return Number(text) } }',
      options: [{ allowExported: true }],
    },
    {
      code: 'function parse(text: string): number { return Number(text) }\nexport { parse }',
      options: [{ allowExported: true }],
    },
    {
      code: 'const parse = (text: string): number => Number(text)\nexport default parse',
      options: [{ allowExported: true }],
    },
    { code: exportedParse, filename: join(root, 'isolated', 'index.ts') },
    { code: exportedParse, filename: join(root, 'isolated', 'src', 'lib', 'index.ts') },
    { code: exportedParse, filename: join(root, 'relative', 'index.ts') },
    { code: exportedParse, filename: join(root, 'package', 'index.ts') },
  ],
  invalid: [
    removal(
      'export function double(value: number): number { return value * 2 }',
      'export function double(value: number) { return value * 2 }',
    ),
    removal(
      'export const triple = (value: number): number => value * 3',
      'export const triple = (value: number) => value * 3',
    ),
    removal(
      'export const save = async (): Promise<void> => {}',
      'export const save = async () => {}',
    ),
    removal(
      'export class Box { size(): number { return 1 } }',
      'export class Box { size() { return 1 } }',
    ),
    removal(
      'export class Box { get size(): number { return 1 } }',
      'export class Box { get size() { return 1 } }',
    ),
    removal(
      'export const api = { size(): number { return 1 } }',
      'export const api = { size() { return 1 } }',
    ),
    removal(
      'export function names(): string[] { return [] }',
      'export function names() { return [] }',
    ),
    removal(
      'export function flags(): Array<boolean> { return [true] }',
      'export function flags() { return [true] }',
    ),
    removal(
      'export async function read(): Promise<string> { return "" }',
      'export async function read() { return "" }',
    ),
    removal(
      'export function log(): void { console.info(1) }',
      'export function log() { console.info(1) }',
    ),
    removal('[1].map((value): number => value)', '[1].map((value) => value)'),
    {
      code: 'export function outer() { function inner(): number { return 1 }\n  return inner() }',
      options: [{ allowExported: true }],
      errors: [
        {
          messageId: 'inferrable',
          suggestions: [
            {
              messageId: 'remove',
              output: 'export function outer() { function inner() { return 1 }\n  return inner() }',
            },
          ],
        },
      ],
    },
    {
      code: 'function local(): number { return 1 }\nexport const value = local()',
      options: [{ allowExported: true }],
      errors: [
        {
          messageId: 'inferrable',
          suggestions: [
            {
              messageId: 'remove',
              output: 'function local() { return 1 }\nexport const value = local()',
            },
          ],
        },
      ],
    },
    { ...removal(exportedParse, exportedParseFixed), filename: join(root, 'array', 'index.ts') },
    { ...removal(exportedParse, exportedParseFixed), filename: join(root, 'override', 'index.ts') },
    { ...removal(exportedParse, exportedParseFixed), filename: join(root, 'none', 'index.ts') },
    {
      ...removal(exportedParse, exportedParseFixed),
      filename: join(root, 'isolated', 'index.ts'),
      options: [{ allowExported: false }],
    },
  ],
})
