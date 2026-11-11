import { readFileSync } from 'node:fs'

export function start(task: () => Promise<void>) {
  task()
  return readFileSync('name.txt', 'utf8')
}
