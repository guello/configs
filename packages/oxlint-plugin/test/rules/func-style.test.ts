import { RuleTester } from 'oxlint/plugins-dev'
import { describe, it } from 'vitest'

import { funcStyle } from '../../src/rules/func-style.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { sourceType: 'module', parserOptions: { lang: 'ts' } },
})

tester.run('func-style', funcStyle, {
  valid: [
    'export function declared(value: number) { return value }',
    'type Handler = () => void\nexport const typed: Handler = () => {}',
    'export const wrapped = memo(() => null)',
    'export const satisfied = (() => {}) satisfies () => void',
    'export let reassigned = () => {}\nreassigned = () => {}',
    'export const generator = function* () { yield 1 }',
    'export const usesThis = function () { return this }',
    'export const usesArguments = function () { return arguments.length }',
    'export function outer() { const inner = () => 1\n  return inner() }',
    'export function outer() { hoisted()\n  function hoisted() { return 1 } }',
    'export function outer() { function* generator() { yield 1 }\n  return generator }',
    'export function outer() { function bound(this: Window) { return this }\n  return bound }',
    'export function outer() { function counted() { return arguments.length }\n  return counted }',
    'export function outer() { function assert(value: unknown): asserts value is string {}\n  return assert }',
    [
      'export function outer() {',
      '  function pick(value: string): string',
      '  function pick(value: number): number',
      '  function pick(value: string | number) { return value }',
      '  return pick',
      '}',
    ].join('\n'),
    'export function outer() { function typed(this: Window) { return 1 }\n  return typed }',
    'export function outer() { const typed = function (this: Window) { return 1 }\n  return typed }',
    'export function outer() { const assert = function (value: unknown): asserts value is string {}\n  return assert }',
    'if (ready) { function scoped() {} }',
    'export default function main() {}',
    'export default function () {}',
    'class Service { method() { function helper() { return this } return helper } }',
  ],
  invalid: [
    {
      code: 'export const exported = (value: number) => value',
      output: 'export function exported(value: number) {\n  return value\n}',
      errors: [{ messageId: 'moduleArrow', data: { name: 'exported' } }],
    },
    {
      code: 'const local = async () => {}',
      output: 'async function local() {}',
      errors: [{ messageId: 'moduleArrow', data: { name: 'local' } }],
    },
    {
      code: 'const single = value => value;',
      output: 'function single(value) {\n  return value\n}',
      errors: [{ messageId: 'moduleArrow', data: { name: 'single' } }],
    },
    {
      code: 'export const identity = async <T,>(value: T): Promise<T> => value',
      output: 'export async function identity<T,>(value: T): Promise<T> {\n  return value\n}',
      errors: [{ messageId: 'moduleArrow', data: { name: 'identity' } }],
    },
    {
      code: 'const make = () => ({ size: 1 })',
      output: 'function make() {\n  return { size: 1 }\n}',
      errors: [{ messageId: 'moduleArrow', data: { name: 'make' } }],
    },
    {
      code: 'const build = () => class { size = this }',
      output: 'function build() {\n  return class { size = this }\n}',
      errors: [{ messageId: 'moduleArrow', data: { name: 'build' } }],
    },
    {
      code: 'const self = () => this',
      errors: [{ messageId: 'moduleArrow', data: { name: 'self' } }],
    },
    {
      code: 'const count = () => arguments.length',
      errors: [{ messageId: 'moduleArrow', data: { name: 'count' } }],
    },
    {
      code: 'const first = () => 1, second = 2',
      errors: [{ messageId: 'moduleArrow', data: { name: 'first' } }],
    },
    {
      code: 'const noted = /* keep */ () => 1',
      errors: [{ messageId: 'moduleArrow', data: { name: 'noted' } }],
    },
    {
      code: 'const expression = function named() {}',
      errors: [{ messageId: 'moduleArrow', data: { name: 'expression' } }],
    },
    {
      code: 'export function outer() { function nested() { return 1 }\n  return nested() }',
      errors: [{ messageId: 'nestedArrow', data: { name: 'nested' } }],
    },
    {
      code: 'export function outer() { const inner = function () { return 1 }\n  return inner() }',
      errors: [{ messageId: 'nestedArrow', data: { name: 'inner' } }],
    },
    {
      code: 'export function outer() { const arrow = () => { function deep() {} return deep } \n  return arrow }',
      errors: [{ messageId: 'nestedArrow', data: { name: 'deep' } }],
    },
    {
      code: 'export function outer() { const use = () => this\n  function plain() { return use }\n  return plain }',
      errors: [{ messageId: 'nestedArrow', data: { name: 'plain' } }],
    },
    {
      code: 'class Service { method() { function helper() { return 1 } return helper } }',
      errors: [{ messageId: 'nestedArrow', data: { name: 'helper' } }],
    },
    {
      code: 'export function outer() { function build() { class Box { size = this }\n  return new Box() }\n  return build }',
      errors: [{ messageId: 'nestedArrow', data: { name: 'build' } }],
    },
    {
      code: 'export function outer() { function read(call: { arguments: number }) { return call.arguments }\n  return read }',
      errors: [{ messageId: 'nestedArrow', data: { name: 'read' } }],
    },
    {
      code: 'export function outer() { function make() { return { arguments: 1 } }\n  return make }',
      errors: [{ messageId: 'nestedArrow', data: { name: 'make' } }],
    },
    {
      code: 'export default (value: number) => value',
      errors: [{ messageId: 'defaultArrow' }],
    },
    {
      code: 'export default async () => {}',
      errors: [{ messageId: 'defaultArrow' }],
    },
  ],
})
