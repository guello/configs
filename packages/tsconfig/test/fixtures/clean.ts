import { readFileSync } from 'node:fs'

import { name } from './imported.ts'

export const text: string = `${name}: ${readFileSync(process.cwd(), 'utf8')}`

export const { promise, resolve } = Promise.withResolvers<string>()
export const lengths = Object.groupBy([name, text], value => value.length)

export function handle(_event: unknown) {
  return name
}
