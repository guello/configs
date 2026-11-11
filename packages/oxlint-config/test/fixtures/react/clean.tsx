import './clean.css'

export function Greeting({ name }: { name: string }) {
  const label = `Hello, ${name}`
  return <p>{label}</p>
}
