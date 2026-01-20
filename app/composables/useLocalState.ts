/**
 * A wrapper for `useState` which allows the data to be saved in browser's `localStorage` as JSON.
 * The API is the same as `useState`.
 * @param key a unique key ensuring that data fetching can be properly de-duplicated across requests
 * @param init a function that provides initial value for the state when it's not initiated
 */
export default function <T>(key: string, init?: () => T | Ref<T>) {
  const state = useState<T>(key, init)

  // Keep the keys so there are no duplicate watch-ers.
  // The keys also should be only on the client side.
  let keys = ref<string[]>([])
  if (import.meta.client && localStorage) {
    keys = useState('usePersistedState-watch-keys', () => [])
    const stored = localStorage.getItem(key)
    if (stored !== null) state.value = JSON.parse(stored)
  }

  // Watch only if there are no other watchers
  if (!keys.value.includes(key)) {
    watch(
      () => state.value,
      newValue => {
        if (import.meta.client && localStorage) {
          if (newValue === undefined) {
            // clear the state
            keys.value = keys.value.filter(v => v !== key)
            try {
              localStorage.removeItem(key)
            } catch {
              console.warn('Failed to remove persisted state for key:', key)
            }
          } else {
            // set state
            keys.value.push(key)
            try {
              localStorage.setItem(key, JSON.stringify(state.value))
            } catch {
              console.warn('Failed to persist state for key:', key)
            }
          }
        }
      }
    )
  }

  return state
}
