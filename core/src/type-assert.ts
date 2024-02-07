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

type Unbox<T> = T extends { [k: string]: infer U }
  ? U
  : T extends (infer U)[]
    ? U
    : T
type isPrimitive<T> = T extends Unbox<T> ? T : never
export type DeepNonNullable<T> = {
  [P in keyof T]-?: T[P] extends isPrimitive<T[P]>
    ? Exclude<T[P], null | undefined>
    : DeepNonNullable<T[P]>
}
