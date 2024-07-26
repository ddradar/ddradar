import type { JSONValue, SqlParameter } from '@azure/cosmos'

export type Column<DBSchema, T = DBSchema, Alias extends string = 'c'> =
  | `${Alias}.${Extract<keyof DBSchema & keyof T, string>}`
  | `${Alias}.${Extract<Exclude<keyof DBSchema, keyof T>, string>} AS ${Extract<keyof T, string>}`

export type FuncColumn<
  DBSchema,
  T = DBSchema,
  Alias extends string = 'c',
> = `${string}${Alias}.${Extract<Exclude<keyof DBSchema, keyof T>, string>}${string} AS ${Extract<keyof T, string>}`

/** SQL WHERE condition */
export type QueryFilter<T, Alias extends string = 'c'> =
  | {
      /** WHERE condition */
      condition: `${Exclude<string, '@'>}${Alias}.${Extract<keyof T, string>}${Exclude<string, '@'>}`
      value?: never
    }
  | {
      /**
       * WHERE condition.
       * `"@"` replaces to `"@paramXX"`.
       */
      condition:
        | `${string}${Alias}.${Extract<keyof T, string>}${string}@${string}`
        | `${string}@${string}${Alias}.${Extract<keyof T, string>}${string}`
      /** Parameter value */ value: JSONValue
    }

export function generateQueryConditions(
  conditions: readonly { condition: string; value?: JSONValue }[]
) {
  return {
    queryConditions: conditions
      .map((c, i) => c.condition.replace('@', `@param${i}`))
      .join(' AND '),
    parameters: conditions
      .map((c, i) => ({ name: `@param${i}`, value: c.value }))
      .filter((c): c is SqlParameter => c.value !== undefined),
  }
}
