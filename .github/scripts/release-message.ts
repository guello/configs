import { appendFile, readFile } from 'node:fs/promises'

interface ReleasePlan {
  releases: {
    name: string
    newVersion: string
    type: string
  }[]
}

const MAX_HEADER_LENGTH = 72

function header(packages: string[]) {
  const [first = '', ...others] = packages
  const last = others.at(-1)
  const listed =
    last === undefined ? first : `${[first, ...others.slice(0, -1)].join(', ')} and ${last}`
  const full = `chore(release): ${listed}`
  return full.length <= MAX_HEADER_LENGTH
    ? full
    : `chore(release): ${first} and ${others.length} more`
}

async function main(planPath: string) {
  const plan = JSON.parse(await readFile(planPath, 'utf8')) as ReleasePlan
  const packages = plan.releases
    .filter(release => release.type !== 'none')
    .map(release => `${release.name}@${release.newVersion}`)
    .toSorted()
  const title = packages.length > 0 ? header(packages) : 'chore(release): remove empty changesets'
  const lines = packages.map(name => `- ${name}`)
  const message = lines.length > 0 ? `${title}\n\n${lines.join('\n')}` : title
  const outputs = `title=${title}\nmessage<<MESSAGE\n${message}\nMESSAGE\n`
  const file = process.env.GITHUB_OUTPUT
  if (file) {
    await appendFile(file, outputs)
    return
  }
  process.stdout.write(outputs)
}

const [planPath] = process.argv.slice(2)
if (!planPath) throw new Error('Pass the path of the release plan JSON file.')
await main(planPath)
