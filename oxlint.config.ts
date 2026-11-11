import { defineConfig } from './packages/oxlint-config/src/index.ts'

export default defineConfig({
  node: true,
  ignorePatterns: ['**/dist', 'packages/*/test/fixtures/**'],
})
