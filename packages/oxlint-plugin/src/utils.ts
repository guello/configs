import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, isAbsolute, join, resolve } from 'node:path'

interface TsConfig {
  extends?: string | string[]
  compilerOptions?: {
    isolatedDeclarations?: unknown
  }
}

const STRING_REGEX = String.raw`"(?:\\.|[^"\\])*"`
const COMMENT_REGEX = new RegExp(String.raw`(${STRING_REGEX})|\/\/[^\n]*|\/\*[\s\S]*?\*\/`, 'gu')
const TRAILING_COMMA_REGEX = new RegExp(String.raw`(${STRING_REGEX})|,(?=\s*[\]}])`, 'gu')

const tsconfigs = new Map<string, TsConfig | undefined>()
const tsconfigFolders = new Map<string, boolean>()

function loadTsconfig(path: string) {
  if (tsconfigs.has(path)) return tsconfigs.get(path)
  let config: TsConfig | undefined
  try {
    // oxlint-disable-next-line node/no-sync
    const text = readFileSync(path, 'utf8')
    try {
      const json = text
        .replaceAll(COMMENT_REGEX, (_, string?: string) => string ?? '')
        .replaceAll(TRAILING_COMMA_REGEX, (_, string?: string) => string ?? '')
      config = JSON.parse(json) as TsConfig
    } catch {
      config = {}
    }
  } catch {
    config = undefined
  }
  tsconfigs.set(path, config)
  return config
}

function resolveTsconfigPackage(specifier: string, from: string): string | undefined {
  const require = createRequire(from)
  for (const request of [specifier, `${specifier}/tsconfig.json`]) {
    try {
      const path = require.resolve(request)
      if (path.endsWith('.json')) return path
    } catch {}
  }
  return undefined
}

function resolveTsconfigExtends(specifier: string, from: string) {
  if (!isAbsolute(specifier) && !specifier.startsWith('./') && !specifier.startsWith('../')) {
    return resolveTsconfigPackage(specifier, from)
  }
  const path = resolve(dirname(from), specifier)
  return path.endsWith('.json') || loadTsconfig(path) ? path : `${path}.json`
}

function tsconfigOption(path: string, seen: Set<string>): boolean | undefined {
  const config = loadTsconfig(path)
  if (!config || seen.has(path)) return undefined
  seen.add(path)
  const value = config.compilerOptions?.isolatedDeclarations
  if (typeof value === 'boolean') return value
  for (const specifier of [config.extends ?? []].flat().toReversed()) {
    const base = resolveTsconfigExtends(specifier, path)
    const inherited = base === undefined ? undefined : tsconfigOption(base, seen)
    if (inherited !== undefined) return inherited
  }
  return undefined
}

export function isolatedDeclarations(filename: string): boolean {
  const visited: string[] = []
  let value = false
  for (let folder = dirname(resolve(filename)); ; folder = dirname(folder)) {
    const cached = tsconfigFolders.get(folder)
    if (cached !== undefined) {
      value = cached
      break
    }
    visited.push(folder)
    const path = join(folder, 'tsconfig.json')
    if (loadTsconfig(path)) {
      value = tsconfigOption(path, new Set()) ?? false
      break
    }
    if (dirname(folder) === folder) break
  }
  for (const folder of visited) tsconfigFolders.set(folder, value)
  return value
}
