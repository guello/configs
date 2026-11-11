import { glob } from 'node:fs/promises'
import { basename, dirname } from 'node:path'

import { defineConfig } from './packages/commitlint-config/src/index.ts'

const scopes = ['agents', 'ci', 'deps', 'release']

for await (const path of glob('packages/*/package.json', { cwd: import.meta.dirname })) {
  scopes.push(basename(dirname(path)))
}

export default defineConfig({ scopes })
