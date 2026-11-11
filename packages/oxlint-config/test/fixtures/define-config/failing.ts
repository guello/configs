import { readFileSync } from 'node:fs'

export function same(left: number, right: string) {
  return left == Number(right) && readFileSync(process.cwd(), 'utf8') !== ''
}
