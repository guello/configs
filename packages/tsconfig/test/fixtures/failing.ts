import './missing.css'

import { name } from './imported.ts'

export enum Color {
  Red,
}

export function twice(value) {
  return value * 2
}

export function first(items: string[]) {
  return items[0].length
}

class Task {
  run() {
    return 1
  }
}

export class Job extends Task {
  run() {
    return 2
  }
}

export function label(kind: string, unused: number) {
  const hidden = 1
  switch (kind) {
    case 'a':
      kind = kind.toUpperCase()
    case 'b':
      return name
  }
}
