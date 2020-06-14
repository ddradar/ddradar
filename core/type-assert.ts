export const hasProperty = <K extends string>(
  x: unknown,
  ...names: K[]
): x is { [M in K]: unknown } => x instanceof Object && names.every(n => n in x)

export const hasStringProperty = <K extends string>(
  x: unknown,
  ...names: K[]
): x is { [M in K]: string } =>
  hasProperty(x, ...names) && names.every(n => typeof x[n] === 'string')

export const hasNumberProperty = <K extends string>(
  x: unknown,
  ...names: K[]
): x is { [M in K]: number } =>
  hasProperty(x, ...names) && names.every(n => typeof x[n] === 'number')
