import type { Context } from '@azure/functions'

export default async function (context: Context): Promise<void> {
  const timeStamp = new Date().toISOString()

  context.log('Timer trigger function ran!', timeStamp)
}
