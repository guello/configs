import { defineConfig } from './packages/oxfmt-config/src/index.ts'

export default defineConfig({
  ignorePatterns: ['packages/*/test/fixtures/**', 'pnpm-lock.yaml'],
})
