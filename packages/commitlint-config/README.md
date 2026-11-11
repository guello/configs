# @guello/commitlint-config

[![npm](https://img.shields.io/npm/v/@guello/commitlint-config?labelColor=%23333C46&color=red)](https://npmjs.com/package/@guello/commitlint-config) [![CI](https://github.com/guello/configs/actions/workflows/ci.yml/badge.svg)](https://github.com/guello/configs/actions/workflows/ci.yml)

Shared [commitlint](https://commitlint.js.org) configuration: Conventional Commits, short headers, free-form bodies.

## Installation

```sh
pnpm add -D @guello/commitlint-config @commitlint/cli
```

## Usage

Use the `defineConfig` factory in `commitlint.config.ts` to apply the preset and specify options and overrides:

```ts
import { defineConfig } from '@guello/commitlint-config'

export default defineConfig({
  scopes: ['api', 'web', 'deps'],
  requireScope: true,
})
```

Each option sets one rule:

| Option                | Rule                     | Preset value                    |
| --------------------- | ------------------------ | ------------------------------- |
| `types`               | `type-enum`              | The Conventional Commits types. |
| `scopes`              | `scope-enum`             | —                               |
| `requireScope`        | `scope-empty`            | `false`: the scope is optional. |
| `headerMaxLength`     | `header-max-length`      | `72`                            |
| `bodyMaxLineLength`   | `body-max-line-length`   | `false`: no limit.              |
| `footerMaxLineLength` | `footer-max-line-length` | `false`: no limit.              |

An array of `types` replaces the Conventional Commits types. A function receives them and returns the new list:

```ts
import { defineConfig } from '@guello/commitlint-config'

export default defineConfig({
  types: types => [...types.filter(type => type !== 'style'), 'wip'],
})
```

The function also accepts all commitlint settings:

- `rules` replace the rules that the options set
- Configurations in `extends` apply after the preset
- Any other key, such as `helpUrl` or `prompt`, replaces the preset value

### Without `defineConfig`

Extend `@guello` in a JSON configuration, such as `.commitlintrc.json`:

```json
{
  "extends": ["@guello"],
  "rules": {
    "scope-enum": [2, "always", ["api", "web", "deps"]]
  }
}
```

Or in the `commitlint` key of `package.json`:

```json
{
  "commitlint": {
    "extends": ["@guello"]
  }
}
```

## Preset

The preset extends [`@commitlint/config-conventional`](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) with these changes:

- **Short headers** of 72 characters or fewer, instead of 100.
- **Free-form body and footer** with no line length limit, so that paragraphs, links and logs can stay on one line.

<details>

<summary><strong>Example</strong></summary>

Before:

```text
Feat(auth): Added the login endpoint for the mobile app with OAuth tokens.
```

With the preset, commitlint reports:

| Rule                | Fix                                           |
| ------------------- | --------------------------------------------- |
| `type-case`         | Write the type in lower case.                 |
| `type-enum`         | Use one of the Conventional Commits types.    |
| `subject-case`      | Start the subject with a lower case letter.   |
| `subject-full-stop` | Remove the period at the end.                 |
| `header-max-length` | Shorten the header to 72 characters, from 74. |

After all fixes, with the details in the body:

```text
feat(auth): add the login endpoint for the mobile app

The app signs in with OAuth tokens from the identity provider and keeps the refresh token in the keychain, so a restart does not log the user out.

Closes #42
```

</details>

## License

[MIT](./LICENSE)
