# @guello/tsconfig

[![npm](https://img.shields.io/npm/v/@guello/tsconfig?labelColor=%23333C46&color=red)](https://npmjs.com/package/@guello/tsconfig) [![CI](https://github.com/guello/configs/actions/workflows/ci.yml/badge.svg)](https://github.com/guello/configs/actions/workflows/ci.yml)

Shared TypeScript configs: strict checks and erasable syntax.

## Installation

```sh
pnpm add -D @guello/tsconfig typescript
```

## Usage

Extend `@guello/tsconfig` for the `base` preset or `@guello/tsconfig/<preset>` for another one:

```json
{
  "extends": "@guello/tsconfig",
  "include": ["src", "*.config.ts"]
}
```

In a library built by a tool such as tsdown, also set the declaration options:

```json
{
  "extends": "@guello/tsconfig/node",
  "include": ["src"],
  "compilerOptions": {
    "declaration": true,
    "isolatedDeclarations": true
  }
}
```

In a React app, add the types of the bundler:

```json
{
  "extends": "@guello/tsconfig/react",
  "include": ["src"],
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

## Presets

| Preset  | Extend                   | Scope                     |
| ------- | ------------------------ | ------------------------- |
| `base`  | `@guello/tsconfig`       | Any project               |
| `node`  | `@guello/tsconfig/node`  | Node.js 22 or later       |
| `react` | `@guello/tsconfig/react` | React apps with a bundler |

The `node` preset uses the ES2024 APIs, like `Object.groupBy`, and relative `.ts` imports. All other presets use relative imports without a file extension.

The `react` preset accepts JSX, DOM globals, and CSS modules with a declaration file, such as `button.module.d.css.ts`.

In all presets, a parameter starting with `_` can stay unused.

## Example

```ts
export enum Role {
  Admin,
  User,
}

export function first(names: string[], limit: number) {
  return names[0].toUpperCase()
}
```

`tsc` reports:

| Position | Option                     | Error                                                                    |
| -------- | -------------------------- | ------------------------------------------------------------------------ |
| 1:13     | `erasableSyntaxOnly`       | TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled. |
| 6:40     | `noUnusedParameters`       | TS6133: 'limit' is declared but its value is never read.                 |
| 7:10     | `noUncheckedIndexedAccess` | TS2532: Object is possibly 'undefined'.                                  |

## License

[MIT](./LICENSE)
