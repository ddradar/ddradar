<spec lang="md">
# Song Result Table

Displays a paginated list of songs with a "Load More" button.

## Props

- `pagenation`: Pagenation<SongSearchResult> — items list and pagination metadata
- `pending`: loading indicator
- `filterStyle`: current play style filter (1 for SINGLE, 2 for DOUBLE, other for both)
- `filterLevels`: current level filter (array of level numbers)

## Emits

- `load-more`: user clicked "Load More" button

## Columns

- **Series**: category-colored badge with tooltip (CLASSIC/WHITE/GOLD)
- **Name**: NuxtLink to /songs/[id]
- **Artist**: plain text
- **Charts**: difficulty level badges per chart, colored by difficulty and outlined if not matching current filter
  - Chart rows are conditionally rendered based on current play style filter (SINGLE/DOUBLE/both)
</spec>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

import { getSeriesCategory } from '#shared/schemas/song'
import { Difficulty, getChartName, PlayStyle } from '#shared/schemas/step-chart'
import { getEnumKey } from '#shared/utils'

const props = defineProps<{
  pagenation: Pagenation<SongSearchResult>
  pending?: boolean
  filterStyle?: number
  filterLevels?: number[]
}>()
defineEmits<{ 'load-more': [] }>()

const { t } = useI18n()

const columns = computed<TableColumn<SongSearchResult>[]>(() => [
  { accessorKey: 'series', header: t('schema.song.series.label') },
  { accessorKey: 'name', header: t('schema.song.name.label') },
  { accessorKey: 'artist', header: t('schema.song.artist.label') },
  { accessorKey: 'charts', header: t('schema.song.chart.label') },
])

function getDifficultyColor(difficulty: StepChart['difficulty']) {
  const key = getEnumKey(Difficulty, difficulty)
  return (
    (key?.toLowerCase() as Lowercase<Exclude<typeof key, undefined>>) ??
    'neutral'
  )
}

function getSeriesCategoryColor(series: string) {
  const cat = getSeriesCategory(series)
  if (cat === 'CLASSIC') return 'secondary' as const
  if (cat === 'WHITE') return 'neutral' as const
  return 'warning' as const
}

function isMatchingChart(
  chart: Pick<StepChart, 'playStyle' | 'level'>
): boolean {
  return !props.filterLevels?.length || props.filterLevels.includes(chart.level)
}
</script>

<template>
  <div>
    <UTable :data="pagenation.items" :columns="columns" :loading="pending">
      <template #series-cell="{ row }">
        <UTooltip :text="getSeriesCategory(row.original.series)">
          <UBadge
            :color="getSeriesCategoryColor(row.original.series)"
            variant="outline"
            size="sm"
          >
            {{ row.original.series }}
          </UBadge>
        </UTooltip>
      </template>

      <template #name-cell="{ row }">
        <NuxtLink
          :to="`/songs/${row.original.id}`"
          class="font-medium text-primary hover:underline"
        >
          {{ row.original.name }}
        </NuxtLink>
      </template>

      <template #charts-cell="{ row }">
        <div class="space-y-1">
          <!-- SINGLE row: show when filterStyle is 0 (both) or 1 (SINGLE) -->
          <div
            v-if="filterStyle !== PlayStyle.DOUBLE"
            class="flex flex-wrap gap-1"
          >
            <UTooltip
              v-for="chart in row.original.charts?.filter(
                c => c.playStyle === PlayStyle.SINGLE
              )"
              :key="`${chart.playStyle}-${chart.difficulty}`"
              :text="getChartName(chart)"
            >
              <UBadge
                :color="getDifficultyColor(chart.difficulty)"
                :variant="isMatchingChart(chart) ? 'solid' : 'outline'"
                size="sm"
              >
                {{ chart.level }}
              </UBadge>
            </UTooltip>
          </div>
          <!-- DOUBLE row: show when filterStyle is 0 (both) or 2 (DOUBLE) -->
          <div
            v-if="filterStyle !== PlayStyle.SINGLE"
            class="flex flex-wrap gap-1"
          >
            <UTooltip
              v-for="chart in row.original.charts?.filter(
                c => c.playStyle === PlayStyle.DOUBLE
              )"
              :key="`${chart.playStyle}-${chart.difficulty}`"
              :text="getChartName(chart)"
            >
              <UBadge
                :color="getDifficultyColor(chart.difficulty)"
                :variant="isMatchingChart(chart) ? 'solid' : 'outline'"
                size="sm"
              >
                {{ chart.level }}
              </UBadge>
            </UTooltip>
          </div>
        </div>
      </template>
    </UTable>

    <div v-if="pagenation.hasMore" class="mt-4 flex justify-center">
      <UButton :loading="pending" @click="$emit('load-more')">
        {{ t('actions.loadMore.label') }}
      </UButton>
    </div>
  </div>
</template>
