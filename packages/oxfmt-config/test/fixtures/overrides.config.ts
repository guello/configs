import { defineConfig } from '@guello/oxfmt-config'

export default defineConfig({
  semi: true,
  overrides: [{ files: ['*.mts'], options: { semi: false } }],
})
