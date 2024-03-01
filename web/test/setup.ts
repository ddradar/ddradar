import {
  defineEventHandler,
  getValidatedQuery,
  getValidatedRouterParams,
  readValidatedBody,
} from 'h3'
import { vi } from 'vitest'

// Nuxt (server)
vi.stubGlobal('defineEventHandler', defineEventHandler)
vi.stubGlobal('getValidatedQuery', getValidatedQuery)
vi.stubGlobal('getValidatedRouterParams', getValidatedRouterParams)
vi.stubGlobal('readValidatedBody', readValidatedBody)
