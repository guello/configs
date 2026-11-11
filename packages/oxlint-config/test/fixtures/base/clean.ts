import { type Settings, defaults } from './settings.ts'

export function merge(settings: Partial<Settings>) {
  const pick = (key: keyof Settings) => settings[key] ?? defaults[key]
  return { name: pick('name') }
}
