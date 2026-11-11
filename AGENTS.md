# guello/configs

Shared tool configurations in a single pnpm workspace. Each package ships to npm with its own version, changelog, tag and GitHub release.

## Layout

| Path                         | Package                     | What it is                                                                    |
| ---------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| `packages/commitlint-config` | `@guello/commitlint-config` | commitlint preset for Conventional Commits, and `defineConfig`.               |
| `packages/oxlint-config`     | `@guello/oxlint-config`     | Oxlint presets `base`, `node` and `react`, and `defineConfig`.                |
| `packages/oxlint-plugin`     | `@guello/oxlint-plugin`     | `@guello` plugin with the `func-style` and `no-inferrable-return-type` rules. |
| `packages/oxfmt-config`      | `@guello/oxfmt-config`      | Oxfmt presets `base` and `react`, and `defineConfig`.                         |
| `packages/tsconfig`          | `@guello/tsconfig`          | TypeScript presets `base`, `node` and `react` as JSON files.                  |

## Commands

Use the Node.js version in `.node-version` and the pnpm version in `packageManager` of `package.json`. Run these commands at the root:

| Command          | What it runs                                                             |
| ---------------- | ------------------------------------------------------------------------ |
| `pnpm install`   | Installs every package and points Git at `.githooks/` through `prepare`. |
| `pnpm check`     | The oxfmt, knip, oxlint and tsc checks on the root and every package.    |
| `pnpm test`      | The `test` script of every package: its `build`, then Vitest.            |
| `pnpm run ci`    | `pnpm check` + `pnpm test`.                                              |
| `pnpm build`     | tsdown and publint, or only `publint --strict` for `tsconfig`.           |
| `pnpm fix`       | oxlint fixes, then oxfmt. Use it instead of hand fixes.                  |
| `pnpm changeset` | Adds a changeset for a change that ships.                                |

- The Git hooks run `pnpm run check` before a commit, commitlint on the message, and `pnpm run ci` before a push.
- On each push to `main`, pull request and manual run, CI runs `pnpm run check` on `.node-version`, and commitlint on pull request commits.
- CI runs `pnpm run test` on Node.js 22.18.0 (the `engines` floor), 24 and 26.

## Workspace rules

- The root `commitlint.config.ts`, `oxlint.config.ts` and `oxfmt.config.ts` call `defineConfig` from package sources. The root `tsconfig.json` extends `packages/tsconfig/node.json`.
- From source, the `oxlint-config` presets load the `oxlint-plugin` source, so the root lint needs no build. From `dist`, they load the built plugin.
- The root `devDependencies` hold the repository tools. Each package holds its own build and test tools.
- A tool that more than one package uses gets its version from the strict catalog in `pnpm-workspace.yaml`.
- A peer range starts at the oldest version that passes the package tests. Test an older version before you lower a floor.
- Fixture configs never use the default config file name of their tool, so that the root does not load them as nested configs.
- `packages/oxlint-config/test/fixtures/tsconfig.json` keeps the default name, because the type-aware rules read the nearest `tsconfig.json`.
- oxfmt, oxlint, knip and tsc own the format and the style. Do not restate their rules in a review.

## Conventions

- Commits follow Conventional Commits, enforced by commitlint: `type(scope): description`, with a header of 72 characters or fewer.
- The scope is a package folder name, or `agents`, `ci`, `deps` or `release`. A change to root files or every package can omit it.
- Module scope uses `function` declarations, and function bodies use `const` arrows. The `func-style` rule enforces it.
- Omit return types that TypeScript can infer. The `no-inferrable-return-type` rule enforces it.
- Keep the return types that `isolatedDeclarations` needs, type predicates, and types with `undefined` for paths that return no value.
- Give each export and option a JSDoc for its users: what it is or returns, and what each option changes.
- Leave implementation details, `{type}` braces and repeated signature tags out of a JSDoc. Give `defineConfig` one `@example`.
- Give `defineConfig` and each preset an `@see {@link <url> | <label>}` to its README section.
- Tests use Vitest in the `test/` folder of each package. Rule tests use `RuleTester`, and preset tests run the tool CLI on `test/fixtures/`.

## Release

1. Add a changeset with `pnpm changeset` in the pull request that changes a package.
2. On push to `main`, `release.yml` opens or updates the version pull request, with a title from `.github/scripts/release-message.ts`.
3. `release.yml` starts the CI through `workflow_dispatch` because `GITHUB_TOKEN` events don't start workflows.
4. After the merge, `release.yml` runs `pnpm run release`: `pnpm run ci`, then `changeset publish` through npm trusted publishing.
5. It also pushes the `<name>@<version>` tag and creates the GitHub release.

Add a changeset when a pull request changes a `dependencies` or `peerDependencies` range, also to a Dependabot pull request.

### New package

npm accepts a trusted publisher only for a package that exists. Release a new package in this order:

1. Merge the pull request that adds the package at `0.0.0` with a changeset.
2. On `main`, publish `0.0.0` with `pnpm --filter <name> publish --access public`. Approve the 2FA request at the link that pnpm prints.
3. If npm stages the version, approve it in the "Staged Packages" tab on npmjs.com.
4. On npmjs.com, add a trusted publisher for GitHub Actions with the repository `guello/configs` and the workflow `release.yml`. Then set the publishing access to require 2FA and disallow tokens.
5. Merge the version pull request. `release.yml` publishes the first release, pushes its tag and creates the GitHub release.

Publish from a local machine only version `0.0.0` of a new package. Never add an npm token to the repository.
