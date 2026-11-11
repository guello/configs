# @guello/oxlint-config

[![npm](https://img.shields.io/npm/v/@guello/oxlint-config?labelColor=%23333C46&color=red)](https://npmjs.com/package/@guello/oxlint-config) [![CI](https://github.com/guello/configs/actions/workflows/ci.yml/badge.svg)](https://github.com/guello/configs/actions/workflows/ci.yml)

Shared [Oxlint](https://oxc.rs/docs/guide/usage/linter) configuration: type-aware rules, enforced function style, Node.js and React support.

## Installation

```sh
pnpm add -D @guello/oxlint-config oxlint oxlint-tsgolint
```

The `react` preset also needs `oxlint-plugin-react-doctor`:

```sh
pnpm add -D oxlint-plugin-react-doctor
```

## Usage

Use the `defineConfig` factory in `oxlint.config.ts` to apply the configuration and specify options and overrides:

```ts
import { defineConfig } from '@guello/oxlint-config'

export default defineConfig({
  ignorePatterns: ['dist'],
  rules: {
    'no-console': 'off',
    'typescript/no-explicit-any': 'error',
  },
})
```

The function accepts all Oxlint settings:

- `env`, `plugins`, `jsPlugins` and `overrides` are merged with the preset values
- `rules`, `categories` and `options` replace only the preset keys they set
- Configurations in `extends` apply after the preset
- Any other key replaces the preset value

Specify the `node` or `react` option to activate the corresponding preset:

```ts
import { defineConfig } from '@guello/oxlint-config'

export default defineConfig({ react: true })
```

### Without `defineConfig`

Add a preset to `extends`:

```ts
import { node } from '@guello/oxlint-config'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [node],
  env: node.env,
  ignorePatterns: ['dist'],
})
```

Or export a preset directly to use it with no changes:

```ts
export { node as default } from '@guello/oxlint-config'
```

## Presets

### `base`

The base preset activates the following features.

- **Strict type-aware rules** such as `no-misused-promises` and `prefer-nullish-coalescing`.
- **Correctness rules** reported as errors, with a selection of the most important rules from the `eslint`, `import`, `jsdoc`, `oxc`, `promise`, `typescript` and `unicorn` plugins.
- **One function style** with `function` declarations at module scope and no return types that TypeScript infers (see [Rules](#rules)).
- **Awaited promises** instead of `then` chains, with each promise awaited, returned or caught.

<details>

<summary><strong>Example</strong></summary>

Before:

```ts
interface RequestOptions {
  retries?: number
  signal?: AbortSignal
}

export const fetchJson = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
  const retries = options.retries || 3
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { signal: options.signal })
      if (response.ok) return response.json() as Promise<T>
    } catch (error) {
      if (attempt === retries) throw error
    }
  }
  throw `Request to ${url} failed`
}

export function prefetch(urls: string[]) {
  urls.forEach(async url => {
    await fetchJson(url)
  })
}
```

With the `base` preset, Oxlint reports:

| Line | Rule                                   | Fix                                               |
| ---- | -------------------------------------- | ------------------------------------------------- |
| 6    | `@guello/func-style`                   | Use a `function` declaration.                     |
| 6    | `@guello/no-inferrable-return-type`    | Remove the `Promise<T>` return type.              |
| 7    | `typescript/prefer-nullish-coalescing` | Use `??`, so that `retries: 0` does not become 3. |
| 16   | `no-throw-literal`                     | Throw an `Error`, which has a stack trace.        |
| 20   | `unicorn/no-array-for-each`            | Use `map` with `Promise.all`.                     |
| 20   | `typescript/no-misused-promises`       | Await the promises, which `forEach` ignores.      |

`oxlint --fix` rewrites the arrow function. After all fixes:

```ts
interface RequestOptions {
  retries?: number
  signal?: AbortSignal
}

export async function fetchJson<T>(url: string, options: RequestOptions = {}) {
  const retries = options.retries ?? 3
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { signal: options.signal })
      if (response.ok) return response.json() as Promise<T>
    } catch (error) {
      if (attempt === retries) throw error
    }
  }
  throw new Error(`Request to ${url} failed`)
}

export async function prefetch(urls: string[]) {
  await Promise.all(urls.map(url => fetchJson(url)))
}
```

</details>

### `node`

The preset extends `base` for Node.js packages and tools.

- **Stricter categories** with the `pedantic`, `perf`, `style` and `suspicious` rules as errors.
- **Node-specific rules** such as `node/no-sync`, `unicorn/prefer-node-protocol` and `unicorn/no-process-exit`.
- **No warnings allowed**: each warning fails the run.
- **Test files** allow floating promises.

<details>

<summary><strong>Example</strong></summary>

Before:

```ts
import { execSync } from 'child_process'
import { readFile } from 'node:fs/promises'

interface Manifest {
  name: string
  version: string
}

async function release() {
  const manifest = JSON.parse(await readFile('package.json', 'utf8')) as Manifest
  const changelog = await readFile('CHANGELOG.md', 'utf8')
  if (!changelog.includes(`## ${manifest.version}`)) {
    console.error(`CHANGELOG.md has no entry for ${manifest.version}`)
    process.exit(1)
  }
  execSync(`git tag v${manifest.version} && git push origin v${manifest.version}`)
  console.log(`Released ${manifest.name}@${manifest.version}`)
}

release()
```

With the `node` preset, Oxlint reports:

| Line | Rule                              | Fix                                                              |
| ---- | --------------------------------- | ---------------------------------------------------------------- |
| 1    | `unicorn/prefer-node-protocol`    | Import from `node:child_process`.                                |
| 14   | `unicorn/no-process-exit`         | Throw an error.                                                  |
| 16   | `node/no-sync`                    | Use `execFile`, which does not block and takes an argument list. |
| 17   | `no-console`                      | Use `console.info`. This warning fails the run.                  |
| 20   | `unicorn/prefer-top-level-await`  | Await at the top level, without the `release` function.          |
| 20   | `typescript/no-floating-promises` | Await the promise.                                               |

`oxlint --fix` adds the `node:` prefix. After all fixes:

```ts
import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { promisify } from 'node:util'

interface Manifest {
  name: string
  version: string
}

const run = promisify(execFile)

const manifest = JSON.parse(await readFile('package.json', 'utf8')) as Manifest
const changelog = await readFile('CHANGELOG.md', 'utf8')
if (!changelog.includes(`## ${manifest.version}`)) {
  throw new Error(`CHANGELOG.md has no entry for ${manifest.version}`)
}
await run('git', ['tag', `v${manifest.version}`])
await run('git', ['push', 'origin', `v${manifest.version}`])
console.info(`Released ${manifest.name}@${manifest.version}`)
```

</details>

### `react`

The preset extends `base` for React apps:

- **React rules** with compiler checks and the rules of hooks.
- **Strict accessibility rules** from `jsx-a11y`.
- **Useful [react-doctor](https://github.com/millionco/react-doctor) enforcements**, such as `no-random-key` and `effect-needs-cleanup`.
- **Import paths** with no parent folders such as `../utils`, and no `.js`, `.jsx`, `.ts` or `.tsx` extensions. Use a path alias such as `@/` instead of a parent folder.
- **Browser globals** with the ES2022 environment.

<details>

<summary><strong>Example</strong></summary>

Before:

```tsx
import { useEffect, useState } from 'react'

type Status = 'loading' | 'error' | 'ready'

interface Photo {
  url: string
  caption: string
}

interface Props {
  photos: Photo[]
  status: Status
  onShare: (url: string) => Promise<void>
}

function message(status: Status) {
  switch (status) {
    case 'loading':
      return 'Loading photos'
    case 'error':
      return 'Could not load the photos'
  }
}

export function Slideshow({ photos, status, onShare }: Props) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    setIndex(0)
  }, [photos])
  if (status !== 'ready') return <p>{message(status)}</p>

  useEffect(() => {
    setInterval(() => setIndex(i => (i + 1) % photos.length), 5000)
  }, [photos.length])

  const photo = photos[index]
  return (
    <figure>
      <img src={photo.url} />
      <figcaption>{photo.caption}</figcaption>
      <button onClick={async () => await onShare(photo.url)}>Share</button>
    </figure>
  )
}
```

With the `react` preset, Oxlint reports:

| Line | Rule                                     | Fix                                                     |
| ---- | ---------------------------------------- | ------------------------------------------------------- |
| 17   | `typescript/switch-exhaustiveness-check` | Handle `'ready'`, or remove it from the parameter type. |
| 28   | `react/set-state-in-effect`              | Compute the index from `photos` during render.          |
| 32   | `react/hooks`                            | Call the hooks before the early return.                 |
| 32   | `react-doctor/effect-needs-cleanup`      | Clear the interval in a cleanup function.               |
| 39   | `jsx-a11y/alt-text`                      | Add an `alt` attribute.                                 |
| 41   | `typescript/no-misused-promises`         | Do not pass an async function to `onClick`.             |

After the fixes:

```tsx
import { useEffect, useState } from 'react'

type Status = 'loading' | 'error' | 'ready'

interface Photo {
  url: string
  caption: string
}

interface Props {
  photos: Photo[]
  status: Status
  onShare: (url: string) => Promise<void>
}

function message(status: Exclude<Status, 'ready'>) {
  switch (status) {
    case 'loading':
      return 'Loading photos'
    case 'error':
      return 'Could not load the photos'
  }
}

export function Slideshow({ photos, status, onShare }: Props) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (status !== 'ready') return
    const timer = setInterval(() => setIndex(i => i + 1), 5000)
    return () => clearInterval(timer)
  }, [status])

  if (status !== 'ready') return <p>{message(status)}</p>
  const photo = photos[index % photos.length]
  return (
    <figure>
      <img src={photo.url} alt={photo.caption} />
      <figcaption>{photo.caption}</figcaption>
      <button onClick={() => void onShare(photo.url)}>Share</button>
    </figure>
  )
}
```

</details>

## Rules

The presets load [`@guello/oxlint-plugin`](https://github.com/guello/configs/tree/main/packages/oxlint-plugin#readme) and turn on its rules:

- `@guello/func-style`: enforces `function` declarations at module scope and `const` arrows inside function bodies.
- `@guello/no-inferrable-return-type`: omit inferrable return types.

## License

[MIT](./LICENSE)
