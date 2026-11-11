# guello/configs

Shared configurations for TypeScript projects.

| Package                                                     | Description                                                                      |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`@guello/commitlint-config`](./packages/commitlint-config) | Commitlint configuration using Conventional Commits and canonical commit format. |
| [`@guello/oxfmt-config`](./packages/oxfmt-config)           | Oxfmt presets for clean formatting and organized imports.                        |
| [`@guello/oxlint-config`](./packages/oxlint-config)         | Oxlint configuration with strict type-aware and correctness rules.               |
| [`@guello/oxlint-plugin`](./packages/oxlint-plugin)         | Oxlint rules for function declarations and return types.                         |
| [`@guello/tsconfig`](./packages/tsconfig)                   | TypeScript configs with strict checks and erasable syntax.                       |

## Develop and contribute

This repository is a pnpm workspace. Use the Node.js version in `.node-version` and the pnpm version in the `packageManager` field of `package.json`.

```sh
pnpm install
pnpm run ci
```

`pnpm run ci` runs Oxfmt, Oxlint, Knip, the type checks and tests of each package.

To release an update, add a changeset with `pnpm changeset`. The release workflow opens a version pull request and publishes the packages to npm.

## License

[MIT](./LICENSE)
