import { defineConfig } from '@guello/commitlint-config'

export default defineConfig({
  types: types => [...types, 'wip'],
  scopes: ['api'],
  requireScope: true,
  headerMaxLength: 50,
})
