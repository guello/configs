import { defineConfig } from '@guello/oxlint-config'

export default defineConfig({
  node: true,
  rules: { 'no-undef': 'error', 'node/no-sync': 'off' },
})
