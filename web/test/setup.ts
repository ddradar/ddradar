import { defineEventHandler } from 'h3'
import { vi } from 'vitest'

// Nuxt (server)
vi.stubGlobal('defineEventHandler', defineEventHandler)
