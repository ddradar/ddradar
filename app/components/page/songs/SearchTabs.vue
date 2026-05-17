<spec lang="md">
# Song Search Tabs

4-tab search UI for the /songs page.

## Props

- `activeTab`: currently visible tab
- `activeLevel`: active level button state
- `activeSeries`: active series button state
- `activeName`: active title-index button state

## Emits

- `update:activeTab`: user switched the visible tab
- `search`: user submitted one or more song search conditions

## Panels

- **Level**: 1–19 buttons; play style applied from `useStyleVisibility`
- **Version**: series name buttons grouped by category (CLASSIC / WHITE / GOLD)
- **Title**: nameIndex buttons (あ行–数字、記号)
- **Custom**: multi-select form for fine-grained search (name, series, style, level)
</spec>

<script setup lang="ts">
import type { SelectMenuItem, TabsItem } from '@nuxt/ui'

import { NameIndex, seriesList } from '#shared/schemas/song'
import { PlayStyle } from '#shared/schemas/step-chart'

const { t } = useI18n()
const style = useStyleVisibility()

type SearchTab = 'level' | 'version' | 'title' | 'custom'

const props = withDefaults(
  defineProps<{
    activeTab: SearchTab
    activeLevel?: number | null
    activeSeries?: number | null
    activeName?: number | null
  }>(),
  {
    activeLevel: null,
    activeSeries: null,
    activeName: null,
  }
)

const emit = defineEmits<{
  'update:activeTab': [value: SearchTab]
  search: [
    payload: { tab: SearchTab; query: Record<string, string | string[]> },
  ]
}>()

const activeTabModel = computed({
  get: () => props.activeTab,
  set: value => emit('update:activeTab', value),
})

// --- Tab definitions ---
const tabItems = computed<TabsItem[]>(() => [
  { label: t('page.songs.tab.level'), value: 'level', slot: 'level' },
  { label: t('page.songs.tab.version'), value: 'version', slot: 'version' },
  { label: t('page.songs.tab.title'), value: 'title', slot: 'title' },
  { label: t('page.songs.tab.custom'), value: 'custom', slot: 'custom' },
])

/** Display label for the current style setting */
const levelHintLabel = computed(() => {
  if (style.value === 0) return t('component.preference.playStyle.both')
  if (style.value === PlayStyle.SINGLE)
    return t('component.preference.playStyle.single')
  return t('component.preference.playStyle.double')
})

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

// --- Title tab: nameIndex ---
const nameIndexEntries = Object.entries(NameIndex) as [string, number][]

// --- Custom tab ---
const customFilters = reactive({
  name: [] as number[],
  series: [] as number[],
  style: 0, // 0=both, 1=SINGLE, 2=DOUBLE
  level: [] as number[],
})

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

const levelItems = Array.from({ length: 19 }, (_, i) => ({
  label: String(i + 1),
  value: i + 1,
}))

function searchBy(tab: SearchTab, query: Record<string, number | number[]>) {
  const stringQuery = Object.fromEntries(
    Object.entries(query)
      .filter(([key, value]) => {
        if (Array.isArray(value)) return value.length > 0
        if (key === 'style') return value !== 0
        return true
      })
      .map(([key, value]) => [
        key,
        Array.isArray(value) ? value.map(String) : String(value),
      ])
  ) as Record<string, string | string[]>

  emit('search', { tab, query: stringQuery })
}
</script>

<template>
  <UTabs v-model="activeTabModel" :items="tabItems" :unmount-on-hide="false">
    <!-- Level tab -->
    <template #level>
      <div class="p-3">
        <p class="text-sm text-muted mb-2">
          {{ t('page.songs.tab.levelHint', { style: levelHintLabel }) }}
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="level in 19"
            :key="level"
            :variant="props.activeLevel === level ? 'solid' : 'outline'"
            class="w-10 justify-center"
            @click="searchBy('level', { level, style })"
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
            :variant="props.activeSeries === item.index ? 'solid' : 'outline'"
            @click="searchBy('version', { series: item.index })"
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
          :variant="props.activeName === index ? 'solid' : 'outline'"
          @click="searchBy('title', { name: index })"
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
            v-model="customFilters.name"
            :items="nameIndexItems"
            value-key="value"
            multiple
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('schema.song.series.label')">
          <USelectMenu
            v-model="customFilters.series"
            :items="seriesItems"
            value-key="value"
            multiple
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('schema.song.chart.playStyle.label')">
          <USelect
            v-model="customFilters.style"
            :items="styleItems"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('schema.song.chart.level.label')">
          <USelectMenu
            v-model="customFilters.level"
            :items="levelItems"
            value-key="value"
            multiple
            class="w-full"
          />
        </UFormField>

        <div class="sm:col-span-2 flex justify-end">
          <UButton @click="searchBy('custom', customFilters)">
            {{ t('actions.search.label') }}
          </UButton>
        </div>
      </div>
    </template>
  </UTabs>
</template>
