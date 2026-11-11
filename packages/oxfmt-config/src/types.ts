import type { OxfmtConfig } from 'oxfmt'

export interface Preset extends OxfmtConfig {
  sortImports: Exclude<OxfmtConfig['sortImports'], boolean | undefined>
}

export interface UserConfig extends OxfmtConfig {
  /** Places `react` and `react-dom` imports in a group after the Node.js built-in modules. */
  react?: boolean
}
