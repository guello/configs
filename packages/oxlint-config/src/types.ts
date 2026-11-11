import type { OxlintConfig } from 'oxlint'

interface NodeOptions {
  /** Enables the Node.js preset, which includes the `node` environment, plugin, and configuration. */
  node?: boolean
  react?: false
}

interface ReactOptions {
  node?: false
  /** Adds the React, React Compiler and `jsx-a11y` rules, react-doctor and browser globals. */
  react?: boolean
}

export type UserConfig = OxlintConfig & (NodeOptions | ReactOptions)
