import 'dotenv/config'

import { CosmosClient } from '@azure/cosmos'
import consola from 'consola'

import { notifications, scores, songs, userData } from '../e2e/data'
import {
  databaseName,
  notificationContainer,
  scoreContainer,
  songContainer,
  userDataContainer,
} from '../src/constants'

const connectionString = process.env.COSMOS_DB_CONN

async function run() {
  if (!connectionString) {
    consola.error('Environment variable "COSMOS_DB_CONN" is required.')
    return
  }

  const client = new CosmosClient(connectionString)
  const db = client.database(databaseName)

  for (const { container, data } of [
    { container: songContainer, data: songs },
    { container: userDataContainer, data: userData },
    { container: scoreContainer, data: scores },
    { container: notificationContainer, data: notifications },
  ]) {
    await db
      .container(container)
      .items.bulk(
        data.map(resourceBody => ({ operationType: 'Create', resourceBody }))
      )
    consola.success(
      `Inserted ${data.length} records to ${container} container.`
    )
  }
}

run().catch(consola.error)
