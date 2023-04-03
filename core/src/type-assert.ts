export function hasProperty<K extends string>(
  x: unknown,
  ...names: K[]
): x is { [M in K]: unknown } {
  return x instanceof Object && names.every(n => n in x)
}

export function hasStringProperty<K extends string>(
  x: unknown,
  ...names: K[]
): x is { [M in K]: string } {
  return hasProperty(x, ...names) && names.every(n => typeof x[n] === 'string')
}

export function hasBooleanProperty<K extends string>(
  x: unknown,
  ...names: K[]
): x is { [M in K]: number } {
  return hasProperty(x, ...names) && names.every(n => typeof x[n] === 'boolean')
}

export function hasIntegerProperty<K extends string>(
  x: unknown,
  ...names: K[]
): x is { [M in K]: number } {
  return hasProperty(x, ...names) && names.every(n => Number.isInteger(x[n]))
}

export type Strict<T, U> = Omit<T, keyof U> & U