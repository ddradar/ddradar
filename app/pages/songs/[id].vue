<spec lang="md">
# Song Detail Page

This page displays detailed information about a specific song, including its title, series, charts, and other relevant metadata.
And also provides all users score records that have been submitted for the song charts.

## Features

- Fetches song data from `GET /api/songs/{id}` endpoint.
- Displays song info and charts.
- Filter charts by play style via `useStyleVisibility`.
- Shows current user and all users (excluding private users) score record rankings for each chart.
- Score Edit modal button for logged-in users.
- Edit Song button for admin users.

## Fields

- **Name**: Name of the song.
- **Artist**: Artist of the song. (possibly empty)
- **BPM**: Beats per minute of the song. (possibly null)
- **Series**: Series category of the song. ("DDR 1st" to "DDR WORLD")
- **Charts**: List of step charts for the song.
  - **Play Style**: Play style of the chart. (SINGLE/DOUBLE)
  - **Difficulty**: Difficulty level of the chart. (BEGINNER to CHALLENGE)
  - **BPM**: BPM values for the chart. (min, core, max)
  - **Level**: Difficulty level number of the chart. (1-20)
  - **Notes**: Number of notes in the chart. (possibly null)
  - **Freezes**: Number of freeze arrows in the chart. (possibly null)
  - **Shocks**: Number of shock arrows in the chart. (possibly null)
  - **Radar**: Radar data for the chart. (possibly null)
    - stream, voltage, air, freeze, chaos: Numeric radar values.
  - **Score Records**: List of user score records for the chart. (Placeholder now)
</spec>

<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

import { songSchema } from '#shared/schemas/song'
import { Difficulty, getChartName } from '#shared/schemas/step-chart'
import { displayedBPM } from '~/utils'

definePageMeta({
  validate: route =>
    'id' in route.params &&
    songSchema.shape.id.safeParse(route.params.id).success,
})

const { t } = useI18n()
const route = useRoute('songs-id')
const { user } = useUserSession()
const style = useStyleVisibility()

/** Fetch song data from API */
const { data: song } = await useFetch<SongInfo>(`/api/songs/${route.params.id}`)

if (!song.value) {
  throw createError({ status: 404, statusText: 'Song not found' })
}

const links = computed<ButtonProps[]>(() =>
  user.value?.roles?.includes('admin')
    ? [
        {
          to: `/admin/songs/${song.value!.id}`,
          color: 'warning',
          icon: 'i-lucide-pencil',
          label: t('actions.edit.label'),
        },
      ]
    : []
)

/** Filtered charts based on play style visibility */
const filteredCharts = computed(() => {
  if (!song.value?.charts) return []
  if (style.value === 0) return song.value.charts
  return song.value.charts.filter(c => c.playStyle === style.value)
})

/** Get difficulty badge color */
function getDifficultyColor(difficulty: StepChart['difficulty']) {
  const value = getEnumKey(Difficulty, difficulty)
  return (
    (value?.toLowerCase() as Lowercase<Exclude<typeof value, undefined>>) ??
    'neutral'
  )
}

/** Check if chart has detailed info (notes, freezes, shocks, radar) */
function hasChartDetails(chart: StepChart): boolean {
  return hasNotesInfo(chart) || !!chart.radar
}
</script>

<template>
  <UPage v-if="song" class="m-4">
    <UPageHeader
      :title="song.name"
      :description="song.artist"
      :headline="`${song.seriesCategory} > ${song.series}`"
      :links="links"
    />

    <!-- Charts Section -->
    <div class="my-6">
      <UEmpty
        v-if="filteredCharts.length === 0"
        icon="i-lucide-file-music"
        :description="t('page.songs-id.chartCard.noData')"
      />

      <UPageGrid v-else>
        <UPageCard
          v-for="chart in filteredCharts"
          :key="`${chart.playStyle}-${chart.difficulty}`"
          :ui="{ header: 'mb-1' }"
        >
          <!-- Chart Header -->
          <template #header>
            <div class="flex gap-2">
              <UBadge
                :color="getDifficultyColor(chart.difficulty)"
                size="xl"
                variant="solid"
              >
                {{ getChartName(chart) }}
              </UBadge>
              <div class="font-bold text-2xl pb-1">
                {{ chart.level }}
              </div>
            </div>
          </template>

          <!-- Score Records Placeholder -->
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 class="font-semibold mb-2">
              {{ t('page.songs-id.chartCard.ranking.title') }}
            </h3>
            <div class="text-center py-4 text-gray-500">
              <p class="text-sm">
                {{ t('page.songs-id.chartCard.ranking.noData') }}
              </p>
            </div>
          </div>

          <!-- Chart Details (Collapsible) -->
          <UCollapsible v-if="hasChartDetails(chart)">
            <template #default="{ open }">
              <UButton variant="ghost" color="neutral">
                <template #leading>
                  <UIcon
                    :name="
                      open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
                    "
                  />
                </template>
                {{
                  open
                    ? t('actions.collapse.hide', {
                        entity: t('schema.song.chart.label'),
                      })
                    : t('actions.collapse.show', {
                        entity: t('schema.song.chart.label'),
                      })
                }}
              </UButton>
            </template>

            <template #content>
              <!-- BPM (always visible) -->
              <div class="mb-3">
                <dt class="text-sm text-gray-600 dark:text-gray-400">
                  {{ t('schema.song.chart.bpm.label') }}
                </dt>
                <dd class="font-semibold">{{ displayedBPM(chart.bpm) }}</dd>
              </div>
              <!-- Notes Details -->
              <div
                v-if="hasNotesInfo(chart)"
                class="grid grid-cols-3 gap-3 mb-4"
              >
                <div v-if="chart.notes != null">
                  <dt class="text-sm text-gray-600 dark:text-gray-400">
                    {{ t('schema.song.chart.notes.label') }}
                  </dt>
                  <dd class="font-semibold">{{ chart.notes }}</dd>
                </div>
                <div v-if="chart.freezes != null">
                  <dt class="text-sm text-gray-600 dark:text-gray-400">
                    {{ t('schema.song.chart.freezes.label') }}
                  </dt>
                  <dd class="font-semibold">{{ chart.freezes }}</dd>
                </div>
                <div v-if="chart.shocks != null">
                  <dt class="text-sm text-gray-600 dark:text-gray-400">
                    {{ t('schema.song.chart.shocks.label') }}
                  </dt>
                  <dd class="font-semibold">{{ chart.shocks }}</dd>
                </div>
              </div>

              <!-- Radar -->
              <div v-if="chart.radar" class="mb-4">
                <dt class="text-sm font-semibold mb-2">
                  {{ t('schema.song.chart.radar.label') }}
                </dt>
                <div class="grid grid-cols-5 gap-2 text-center text-sm">
                  <div>
                    <div class="text-gray-600 dark:text-gray-400">
                      {{ t('schema.song.chart.radar.stream') }}
                    </div>
                    <div class="font-semibold">{{ chart.radar.stream }}</div>
                  </div>
                  <div>
                    <div class="text-gray-600 dark:text-gray-400">
                      {{ t('schema.song.chart.radar.voltage') }}
                    </div>
                    <div class="font-semibold">{{ chart.radar.voltage }}</div>
                  </div>
                  <div>
                    <div class="text-gray-600 dark:text-gray-400">
                      {{ t('schema.song.chart.radar.air') }}
                    </div>
                    <div class="font-semibold">{{ chart.radar.air }}</div>
                  </div>
                  <div>
                    <div class="text-gray-600 dark:text-gray-400">
                      {{ t('schema.song.chart.radar.freeze') }}
                    </div>
                    <div class="font-semibold">{{ chart.radar.freeze }}</div>
                  </div>
                  <div>
                    <div class="text-gray-600 dark:text-gray-400">
                      {{ t('schema.song.chart.radar.chaos') }}
                    </div>
                    <div class="font-semibold">{{ chart.radar.chaos }}</div>
                  </div>
                </div>
              </div>
            </template>
          </UCollapsible>
        </UPageCard>
      </UPageGrid>
    </div>
  </UPage>
</template>
