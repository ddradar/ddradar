<spec lang="md">
# Song Search Tabs

4-tab search UI for the /songs page.

## Tabs

- **Level**: 1–19 buttons; play style applied from `useStyleVisibility`
- **Version**: series name buttons grouped by category (CLASSIC / WHITE / GOLD)
- **Title**: nameIndex buttons (あ行–数字、記号)
- **Custom**: multi-select form for fine-grained search (name, series, style, level)

## Behaviour

- Clicking any button in Level / Version / Title navigates with a single query condition
- Custom tab submits multiple conditions on button press
- Active tab is derived from the current route query; clicking a tab header only
  changes the visible panel (no navigation)
</spec>

<script setup lang="ts">
import type { SelectMenuItem, TabsItem } from '@nuxt/ui'

import { NameIndex, seriesList } from '#shared/schemas/song'
import { PlayStyle } from '#shared/schemas/step-chart'

const { t } = useI18n()
const route = useRoute()
const style = useStyleVisibility()

// --- Active tab: derived from URL, writable for local tab switching ---
function getTabFromQuery(query: typeof route.query): string {
  if (query.level !== undefined) return 'level'
  if (query.series !== undefined) return 'version'
  if (query.name !== undefined) return 'title'
  return 'custom'
}

const activeTab = ref(getTabFromQuery(route.query))
watch(
  () => route.query,
  q => {
    activeTab.value = getTabFromQuery(q)
  }
)

// --- Tab definitions ---
const tabItems = computed<TabsItem[]>(() => [
  { label: t('page.songs.tab.level'), value: 'level', slot: 'level' },
  { label: t('page.songs.tab.version'), value: 'version', slot: 'version' },
  { label: t('page.songs.tab.title'), value: 'title', slot: 'title' },
  { label: t('page.songs.tab.custom'), value: 'custom', slot: 'custom' },
])

// --- Level tab (1–19) ---
const levels = Array.from({ length: 19 }, (_, i) => i + 1)

/** Display label for the current style setting */
const levelHintLabel = computed(() => {
  if (style.value === 0) return t('component.preference.playStyle.both')
  if (style.value === PlayStyle.SINGLE)
    return t('component.preference.playStyle.single')
  return t('component.preference.playStyle.double')
})

const activeLevel = computed<number | null>(() => {
  const v = route.query.level
  if (!v) return null
  const n = Number(Array.isArray(v) ? v[0] : v)
  return Number.isNaN(n) ? null : n
})

function searchByLevel(level: number) {
  const query: Record<string, string> = { level: String(level) }
  if (style.value !== 0) query.style = String(style.value)
  navigateTo({ query })
}

// --- Version tab: series colored by category (no headers) ---
const seriesGroups = [
  {
    color: 'secondary' as const, // bronze / copper = CLASSIC
    items: seriesList.slice(0, 13).map((name, i) => ({ name, index: i })),
  },
  {
    color: 'neutral' as const, // silver = WHITE
    items: seriesList.slice(13, 16).map((name, i) => ({ name, index: 13 + i })),
  },
  {
    color: 'warning' as const, // gold = GOLD
    items: seriesList.slice(16).map((name, i) => ({ name, index: 16 + i })),
  },
]

const activeSeries = computed<number | null>(() => {
  const v = route.query.series
  if (!v) return null
  const n = Number(Array.isArray(v) ? v[0] : v)
  return Number.isNaN(n) ? null : n
})

function searchBySeries(index: number) {
  navigateTo({ query: { series: String(index) } })
}

// --- Title tab: nameIndex ---
const nameIndexEntries = Object.entries(NameIndex) as [string, number][]

const activeName = computed<number | null>(() => {
  const v = route.query.name
  if (!v) return null
  const n = Number(Array.isArray(v) ? v[0] : v)
  return Number.isNaN(n) ? null : n
})

function searchByName(index: number) {
  navigateTo({ query: { name: String(index) } })
}

// --- Custom tab ---
const customName = ref<number[]>([])
const customSeries = ref<number[]>([])
const customStyle = ref<number>(0) // 0=both, 1=SINGLE, 2=DOUBLE
const customLevel = ref<number[]>([])

const nameIndexItems = computed<SelectMenuItem[]>(() =>
  Object.entries(NameIndex).map(([label, value]) => ({ label, value }))
)

const seriesItems = computed<SelectMenuItem[]>(() =>
  seriesList.map((name, i) => ({ label: name, value: i }))
)

const styleItems = computed<SelectMenuItem[]>(() => [
  { label: t('component.preference.playStyle.both'), value: 0 },
  {
    label: t('component.preference.playStyle.single'),
    value: PlayStyle.SINGLE,
  },
  {
    label: t('component.preference.playStyle.double'),
    value: PlayStyle.DOUBLE,
  },
])

const levelItems = computed<SelectMenuItem[]>(() =>
  Array.from({ length: 19 }, (_, i) => ({ label: String(i + 1), value: i + 1 }))
)

function submitCustomSearch() {
  const query: Record<string, string | string[]> = {}
  if (customName.value.length > 0) query.name = customName.value.map(String)
  if (customSeries.value.length > 0)
    query.series = customSeries.value.map(String)
  if (customStyle.value !== 0) query.style = String(customStyle.value)
  if (customLevel.value.length > 0) query.level = customLevel.value.map(String)
  navigateTo({ query })
}
</script>

<template>
  <UTabs v-model="activeTab" :items="tabItems" :unmount-on-hide="false">
    <!-- Level tab -->
    <template #level>
      <div class="p-3">
        <p class="text-sm text-muted mb-2">
          {{ t('page.songs.tab.levelHint', { style: levelHintLabel }) }}
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="level in levels"
            :key="level"
            :variant="activeLevel === level ? 'solid' : 'outline'"
            class="w-10 justify-center"
            @click="searchByLevel(level)"
          >
            {{ level }}
          </UButton>
        </div>
      </div>
    </template>

    <!-- Version tab -->
    <template #version>
      <div class="flex flex-wrap gap-2 p-3">
        <template v-for="group in seriesGroups" :key="group.color">
          <UButton
            v-for="item in group.items"
            :key="item.index"
            size="sm"
            :color="group.color"
            :variant="activeSeries === item.index ? 'solid' : 'outline'"
            @click="searchBySeries(item.index)"
          >
            {{ item.name }}
          </UButton>
        </template>
      </div>
    </template>

    <!-- Title tab -->
    <template #title>
      <div class="flex flex-wrap gap-2 p-3">
        <UButton
          v-for="[label, index] in nameIndexEntries"
          :key="index"
          size="sm"
          :variant="activeName === index ? 'solid' : 'outline'"
          @click="searchByName(index)"
        >
          {{ label }}
        </UButton>
      </div>
    </template>

    <!-- Custom tab -->
    <template #custom>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3">
        <UFormField :label="t('schema.song.name.label')">
          <USelectMenu
            v-model="customName"
            :items="nameIndexItems"
            value-key="value"
            multiple
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('schema.song.series.label')">
          <USelectMenu
            v-model="customSeries"
            :items="seriesItems"
            value-key="value"
            multiple
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('schema.song.chart.playStyle.label')">
          <USelect v-model="customStyle" :items="styleItems" class="w-full" />
        </UFormField>

        <UFormField :label="t('schema.song.chart.level.label')">
          <USelectMenu
            v-model="customLevel"
            :items="levelItems"
            value-key="value"
            multiple
            class="w-full"
          />
        </UFormField>

        <div class="sm:col-span-2 flex justify-end">
          <UButton @click="submitCustomSearch">
            {{ t('actions.search.label') }}
          </UButton>
        </div>
      </div>
    </template>
  </UTabs>
</template>
