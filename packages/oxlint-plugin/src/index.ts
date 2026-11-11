import { type Plugin, eslintCompatPlugin } from '@oxlint/plugins'

import { funcStyle } from './rules/func-style.ts'
import { noInferrableReturnType } from './rules/no-inferrable-return-type.ts'

const plugin: Plugin = eslintCompatPlugin({
  meta: {
    name: '@guello',
  },
  rules: {
    'func-style': funcStyle,
    'no-inferrable-return-type': noInferrableReturnType,
  },
})

export default plugin
