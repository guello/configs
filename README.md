# guello/configs

Shared tool configurations for TypeScript projects.

| Package                                             | Description                                                  |
| --------------------------------------------------- | ------------------------------------------------------------ |
| [`@guello/oxfmt-config`](./packages/oxfmt-config)   | Oxfmt presets: no semicolons, single quotes, sorted imports. |
| [`@guello/oxlint-config`](./packages/oxlint-config) | Oxlint presets with type-aware rules.                        |
| [`@guello/oxlint-plugin`](./packages/oxlint-plugin) | Oxlint rules for function declarations and return types.     |
| [`@guello/tsconfig`](./packages/tsconfig)           | TypeScript configs: strict checks and erasable syntax.       |

## Develop and contribute

This repository is a pnpm workspace. Use the Node.js version in `.node-version` and the pnpm version in the `packageManager` field of `package.json`.

```sh
pnpm install
pnpm run ci
```

`pnpm run ci` runs Oxfmt, Oxlint, Knip, type checks, and the tests of each package.

To release an update, add a changeset with `pnpm changeset`. The release workflow opens a version pull request and publishes the packages to npm.

## License

[MIT](./LICENSE)
