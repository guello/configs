# @guello/oxfmt-config

[![npm](https://img.shields.io/npm/v/@guello/oxfmt-config?labelColor=%23333C46&color=red)](https://npmjs.com/package/@guello/oxfmt-config) [![CI](https://github.com/guello/configs/actions/workflows/ci.yml/badge.svg)](https://github.com/guello/configs/actions/workflows/ci.yml)

Shared [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) configuration: clean syntax, organized imports, agent-aware.

Before:

<!-- oxfmt-ignore -->
```tsx
import { cn } from "@/lib/utils";
import { readFile } from "node:fs/promises";
import styles from "./page.module.css";
import { Suspense } from "react"
import { notFound } from "next/navigation";
import "./globals.css";

import { join } from "node:path"
import { preload } from "react-dom";
import { Markdown } from "@/components/ui/markdown";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: 'Posts',
  'description': "A collection of posts."
};

export default async function Post({ params }: PageProps<"/posts/[slug]">){
  const { slug } = await params;
  const text = await readFile(join(process.cwd(), "posts", `${slug}.md`), "utf8").catch(notFound);
  preload("/fonts/inter.woff2", { as: "font" });

  return (
    <article className={cn(styles.post, "prose")}>
      <Suspense fallback={<p>Loading</p>}><Markdown text={text} /></Suspense>
    </article>
  );
}
```

After, using the [`react`](#react) preset:

<!-- oxfmt-ignore -->
```tsx
import './globals.css'

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { Suspense } from 'react'
import { preload } from 'react-dom'

import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Markdown } from '@/components/ui/markdown'
import { cn } from '@/lib/utils'

import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Posts',
  description: 'A collection of posts.',
}

export default async function Post({ params }: PageProps<'/posts/[slug]'>) {
  const { slug } = await params
  const text = await readFile(join(process.cwd(), 'posts', `${slug}.md`), 'utf8').catch(notFound)
  preload('/fonts/inter.woff2', { as: 'font' })

  return (
    <article className={cn(styles.post, 'prose')}>
      <Suspense fallback={<p>Loading</p>}>
        <Markdown text={text} />
      </Suspense>
    </article>
  )
}
```

## Installation

```sh
pnpm add -D @guello/oxfmt-config oxfmt
```

## Usage

Use the `defineConfig` factory in `oxfmt.config.ts` to apply the configuration and specify options and overrides:

```ts
import { defineConfig } from '@guello/oxfmt-config'

export default defineConfig({
  ignorePatterns: ['dist'],
  overrides: [
    {
      files: ['*.md'],
      options: {
        proseWrap: 'always',
      },
    },
  ],
})
```

The function accepts all Oxfmt settings. The specified overrides are appended to the preset `overrides` array. All other options replace the preset value.

Specify the `react` option to activate React-aware formatting:

```ts
import { defineConfig } from '@guello/oxfmt-config'

export default defineConfig({ react: true })
```

### Without `defineConfig`

Oxfmt has no `extends`, so spread a preset instead:

```ts
import { base } from '@guello/oxfmt-config'
import { defineConfig } from 'oxfmt'

export default defineConfig({ ...base, ignorePatterns: ['dist'] })
```

Export a preset directly to use it with no changes:

```ts
export { base as default } from '@guello/oxfmt-config'
```

## Presets

### `base`

The base preset activates the following features.

- **Clean syntax** with single quotes, trailing commas, no semicolons or unneeded parentheses. The line width is inherited from `.editorconfig`.
- **Organized imports** grouping side-effect and built-in modules first, then external and internal modules.
- **Standard formats** for other files, such as double quotes in CSS and single or no quotes in YAML files.
- **Normalized JSDoc comments** with canonical tag aliases, wrapped lines, and short comments placed on a single line.
- **Agent instructions** ignore code blocks to avoid formatting templates and examples (see [Agents](#agents)).

### `react`

The preset formats `.jsx`/`.tsx` files and adds a `react` import group after the built-in modules:

<!-- oxfmt-ignore -->
```ts
import { readFile } from 'node:fs/promises'

import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { type VariantProps, cva } from 'class-variance-authority'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

## Agents

Agentic files and instructions follow the same rules as other code but ignore code blocks to avoid altering templates and examples.

The configuration matches `AGENTS.md`, `CLAUDE.md`, and all files and folders defined in [`constants.ts`](./src/constants.ts) at any depth.

## License

[MIT](./LICENSE)
