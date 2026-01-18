import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test, vi } from 'vitest'

import Page from '~/pages/[...slug].vue'

// Mock queryCollection to return test content
const { mockQueryCollection } = vi.hoisted(() => ({
  mockQueryCollection: vi.fn(() => ({
    path: vi.fn((path: string) => ({
      first: vi.fn(async () =>
        path === '/'
          ? {
              _path: '/index',
              title: 'DDRadar',
              description:
                'Simple, fast tool to record, analyze, and share your DDR scores.',
              body: {
                type: 'root',
                children: [
                  {
                    type: 'element',
                    tag: 'h1',
                    props: {},
                    children: [{ type: 'text', value: 'DDRadar' }],
                  },
                ],
              },
            }
          : null
      ),
    })),
  })),
}))
mockNuxtImport('queryCollection', () => mockQueryCollection)

describe('[...slug]', () => {
  test('(route: "/") renders correctly', async () => {
    // Arrange - Act
    const wrapper = await mountSuspended(Page, { route: '/' })

    // Assert
    expect(wrapper.html()).toContain('DDRadar')
    expect(mockQueryCollection).toHaveBeenCalledWith(
      expect.stringContaining('content_')
    )
  })

  test('(route: "/invalid") throws error', async () => {
    await expect(
      mountSuspended(Page, { route: '/invalid' })
    ).rejects.toThrowError(expect.objectContaining({ statusCode: 404 }))
  })
})
