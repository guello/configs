import { readFile } from 'node:fs/promises'

/**
 * Returns the first line of a file.
 *
 * @param path - The path of the file.
 */
export async function readName(path: string) {
  const text = await readFile(path, 'utf8')
  const firstLine = (value: string) => value.split('\n')[0] ?? ''
  return firstLine(text)
}
