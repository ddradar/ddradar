import {
  createError,
  defineEventHandler,
  getValidatedQuery,
  getValidatedRouterParams,
  readValidatedBody,
} from 'h3'
import { vi } from 'vitest'

// Nuxt (server)
vi.stubGlobal('createError', createError)
vi.stubGlobal('defineEventHandler', defineEventHandler)
vi.stubGlobal('getValidatedQuery', getValidatedQuery)
vi.stubGlobal('getValidatedRouterParams', getValidatedRouterParams)
vi.stubGlobal('readValidatedBody', readValidatedBody)

// Nuxt SWA (server)
vi.stubGlobal('hasRole', vi.fn())
vi.stubGlobal('getClientPrincipal', vi.fn())

// Server Utils (/server/utils)
vi.stubGlobal('getCosmosClient', vi.fn())
