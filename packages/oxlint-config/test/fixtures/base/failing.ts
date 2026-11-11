import { type Settings } from './settings.ts'

export const describe = (settings: Settings) => settings.name

/**
 * Compares a number with a string.
 *
 * @param left
 * @private
 */
export function same(left: number, right: string): boolean {
  return left == Number(right)
}
