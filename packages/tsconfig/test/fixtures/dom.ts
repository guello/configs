import styles from './button.module.css'

export function countLinks() {
  let count = 0
  for (const link of document.querySelectorAll('a')) {
    if (link.href) count += 1
  }
  return count
}

export const primary = styles.primary
