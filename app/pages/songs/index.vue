<spec lang="md">
# Song List Page

Search and display songs via `GET /api/songs`.

## Features

- 4-tab search UI: Level / Version / Title / Custom (via `SongsSearchTabs`)
- Results table with "Load More" pagination (via `SongsResultTable`)
- Search conditions stored in URL query; pagination managed client-side
- Resets accumulated results on new search (URL query change)

## URL Query Parameters

- `name`: nameIndex value(s)
- `series`: series index value(s)
- `style`: play style (1 or 2)
- `level`: chart level value(s)
</spec>

<script setup lang="ts">
import SongsResultTable from '~/components/page/songs/ResultTable.vue'
import SongsSearchTabs from '~/components/page/songs/SearchTabs.vue'

const { t } = useI18n()
const route = useRoute()

/** API params derived from URL query (search conditions only, no pagination) */
const baseParams = computed(() => {
  const q = route.query
  const params: Record<string, string | string[]> = {}
  if (q.name) params.name = q.name as string | string[]
  if (q.series) params.series = q.series as string | string[]
  if (q.style) params.style = q.style as string
  if (q.level) params.level = q.level as string | string[]
  return params
})

/** Stable serialised key for detecting search changes */
const baseQueryKey = computed(() => JSON.stringify(baseParams.value))

// --- Client-side pagination state ---
const pending = ref(false)
const allItems = ref<SongSearchResult[]>([])
const meta = ref<Omit<Pagenation<SongSearchResult>, 'items'> | null>(null)
const fetchError = ref<Error | null>(null)

async function fetchPage(offset: number, replace: boolean) {
  if (!import.meta.client) return
  pending.value = true
  fetchError.value = null
  try {
    const result = await $fetch<Pagenation<SongSearchResult>>('/api/songs', {
      query: { ...baseParams.value, offset, limit: 50, includeCharts: true },
    })
    if (replace) {
      allItems.value = [...result.items]
    } else {
      allItems.value = [...allItems.value, ...result.items]
    }
    meta.value = {
      limit: result.limit,
      offset: result.offset,
      nextOffset: result.nextOffset,
      hasMore: result.hasMore,
    }
  } catch (e) {
    fetchError.value = e instanceof Error ? e : new Error(String(e))
  } finally {
    pending.value = false
  }
}

// Trigger new search on URL query change; skip fetch when there are no conditions
watch(
  baseQueryKey,
  () => {
    if (Object.keys(baseParams.value).length === 0) {
      allItems.value = []
      meta.value = null
      return
    }
    fetchPage(0, true)
  },
  { immediate: true }
)

function loadMore() {
  if (meta.value?.nextOffset != null) {
    fetchPage(meta.value.nextOffset, false)
  }
}

/** Whether no search condition has been specified yet */
const hasNoCondition = computed(
  () => Object.keys(baseParams.value).length === 0 && !pending.value
)

/** Chart filter conditions derived from URL query */
const filterStyle = computed(() => {
  const v = route.query.style
  if (!v || Array.isArray(v)) return undefined
  const n = Number(v)
  return Number.isNaN(n) ? undefined : n
})

const filterLevels = computed(() => {
  const v = route.query.level
  if (!v) return [] as number[]
  return (Array.isArray(v) ? v : [v]).map(Number).filter(n => !Number.isNaN(n))
})

/** Synthetic Pagenation<T> passed to ResultTable (items accumulated across pages) */
const displayData = computed<Pagenation<SongSearchResult>>(() => ({
  items: allItems.value,
  limit: meta.value?.limit ?? 50,
  offset: meta.value?.offset ?? 0,
  nextOffset: meta.value?.nextOffset ?? null,
  hasMore: meta.value?.hasMore ?? false,
}))
</script>

<template>
  <UPage class="m-4">
    <UPageHeader :title="t('page.songs.title')" />

    <div class="my-4">
      <SongsSearchTabs />
    </div>

    <template v-if="hasNoCondition">
      <UEmpty
        icon="i-lucide-search"
        :description="t('page.songs.searchPrompt')"
        class="py-8"
      />
    </template>

    <template v-else>
      <UAlert
        v-if="fetchError"
        color="error"
        icon="i-lucide-alert-circle"
        :description="fetchError.message"
        class="mb-4"
      />

      <SongsResultTable
        :pagenation="displayData"
        :pending="pending"
        :filter-style="filterStyle"
        :filter-levels="filterLevels"
        @load-more="loadMore"
      />
    </template>
  </UPage>
</template>
