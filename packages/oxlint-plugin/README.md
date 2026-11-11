# @guello/oxlint-plugin

[![npm](https://img.shields.io/npm/v/@guello/oxlint-plugin?labelColor=%23333C46&color=red)](https://npmjs.com/package/@guello/oxlint-plugin) [![CI](https://github.com/guello/configs/actions/workflows/ci.yml/badge.svg)](https://github.com/guello/configs/actions/workflows/ci.yml)

[Oxlint](https://oxc.rs/docs/guide/usage/linter) JS plugin with rules to enforce function style and omit inferrable return types.

[`@guello/oxlint-config`](https://github.com/guello/configs/tree/main/packages/oxlint-config#readme) loads this plugin and turns on its rules.

## Installation

```sh
pnpm add -D @guello/oxlint-plugin oxlint
```

## Usage

Add the plugin to your configuration and turn on the rules:

```ts
// oxlint.config.ts
import { defineConfig } from 'oxlint'

export default defineConfig({
  jsPlugins: ['@guello/oxlint-plugin'],
  rules: {
    '@guello/func-style': 'error',
    '@guello/no-inferrable-return-type': 'error',
  },
})
```

```jsonc
// .oxlintrc.json
{
  "jsPlugins": ["@guello/oxlint-plugin"],
  "rules": {
    "@guello/func-style": "error",
    "@guello/no-inferrable-return-type": "error",
  },
}
```

## Rules

### `@guello/func-style`

Use `function` declarations at module scope and `const` arrows inside function bodies.

```ts
// Incorrect
export const parse = (text: string) => JSON.parse(text)

export function load() {
  function read() {
    return '{}'
  }
  return read()
}

export default () => {}

// Correct
export function parse(text: string) {
  return JSON.parse(text)
}

export function load() {
  const read = () => '{}'
  return read()
}

export default function main() {}
```

`oxlint --fix` rewrites module-scope arrow functions as `function` declarations.

### `@guello/no-inferrable-return-type`

Omit return types that TypeScript can infer without reporting the required ones.

```ts
// Incorrect
export function double(value: number): number {
  return value * 2
}

// Correct
export function double(value: number) {
  return value * 2
}
```

The rule offers a suggestion because the inferred type can differ. Apply it with `oxlint --fix-suggestions`, then run `tsc` to check.

#### Configuration

##### `allowExported`

type: `boolean`

default: `isolatedDeclarations` of `tsconfig.json`

With `isolatedDeclarations`, TypeScript needs the return types of all exported functions. The rule reads the nearest `tsconfig.json`, the configurations it extends, and allows return types when `isolatedDeclarations` is on. Set the option to ignore the tsconfig value.

## License

[MIT](./LICENSE)
