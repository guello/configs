export function start(task: () => Promise<void>) {
  task()
}
