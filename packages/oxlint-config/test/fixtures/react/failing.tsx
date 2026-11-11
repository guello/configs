export const List = ({ items }: { items: string[] }) => (
  <ul>
    {items.map(items => (
      <li key={Math.random()}>{items}</li>
    ))}
  </ul>
)

function useFlag() {
  return true
}

export function Flag({ on }: { on: boolean }) {
  if (on) {
    useFlag()
  }
  return <p>{on}</p>
}
