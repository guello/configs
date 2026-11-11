import { defineConfig } from 'oxlint'

export default defineConfig({
  jsPlugins: ['@guello/oxlint-plugin'],
  rules: {
    '@guello/func-style': 'error',
    '@guello/no-inferrable-return-type': 'error',
  },
})
