import { CosmosClient } from '@azure/cosmos'

import { connection } from './constants.js'

export const client = new CosmosClient(process.env[connection]!)
