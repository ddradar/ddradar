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
  throw createError({ statusCode: 404, statusMessage: 'Song not found' })
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

/** Get difficulty color class */
function getDifficultyColor(difficulty: StepChart['difficulty']): string {
  switch (difficulty) {
    case Difficulty.BEGINNER:
      return 'bg-blue-500'
    case Difficulty.BASIC:
      return 'bg-yellow-500'
    case Difficulty.DIFFICULT:
      return 'bg-red-500'
    case Difficulty.EXPERT:
      return 'bg-green-500'
    case Difficulty.CHALLENGE:
      return 'bg-purple-500'
    default:
      return 'bg-gray-500'
  }
}

/** Format BPM display */
function formatBpm(bpm: StepChart['bpm']): string {
  if (bpm.length === 1) return bpm[0].toString()
  return `${bpm[0]}-${bpm[2]}`
}

/** Check if user is logged in */
const isLoggedIn = computed(() => !!user.value?.id)
</script>

<template>
  <UPage v-if="song" class="m-4">
    <UPageHeader
      :title="song.name"
      :description="song.artist"
      :headline="song.series"
      :links="links"
    />

    <!-- Song Info -->
    <UCard class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-if="song.bpm">
          <dt class="font-semibold">{{ t('schema.song.bpm.label') }}</dt>
          <dd>{{ song.bpm }}</dd>
        </div>
        <div>
          <dt class="font-semibold">{{ t('schema.song.series.label') }}</dt>
          <dd>{{ song.series }}</dd>
        </div>
      </div>
    </UCard>

    <!-- Charts Section -->
    <UPageGrid>
      <UPageCard
        v-for="chart in filteredCharts"
        :key="`${chart.playStyle}-${chart.difficulty}`"
      >
      </UPageCard>
    </UPageGrid>
    <div class="mb-6">
      <h2 class="text-2xl font-bold mb-4">
        {{ t('schema.song.chart.label') }}
      </h2>

      <div v-if="filteredCharts.length === 0" class="text-center py-8">
        <p class="text-gray-500">
          No charts available for the selected play style.
        </p>
      </div>

      <div v-else class="space-y-4">
        <UCard
          v-for="chart in filteredCharts"
          :key="`${chart.playStyle}-${chart.difficulty}`"
          class="hover:shadow-lg transition-shadow"
        >
          <!-- Chart Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div
                :class="getDifficultyColor(chart.difficulty)"
                class="w-2 h-10 rounded"
              />
              <div>
                <div class="font-bold text-lg">{{ getChartName(chart) }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  Level {{ chart.level }}
                </div>
              </div>
            </div>

            <!-- Score Input Button (Placeholder) -->
            <UButton
              v-if="isLoggedIn"
              color="primary"
              variant="outline"
              disabled
              icon="i-lucide-plus"
            >
              Add Score (Coming Soon)
            </UButton>
          </div>

          <!-- Chart Details -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <dt class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('schema.song.chart.bpm.label') }}
              </dt>
              <dd class="font-semibold">{{ formatBpm(chart.bpm) }}</dd>
            </div>
            <div v-if="chart.notes !== null && chart.notes !== undefined">
              <dt class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('schema.song.chart.notes.label') }}
              </dt>
              <dd class="font-semibold">{{ chart.notes }}</dd>
            </div>
            <div v-if="chart.freezes !== null && chart.freezes !== undefined">
              <dt class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('schema.song.chart.freezes.label') }}
              </dt>
              <dd class="font-semibold">{{ chart.freezes }}</dd>
            </div>
            <div v-if="chart.shocks !== null && chart.shocks !== undefined">
              <dt class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('schema.song.chart.shocks.label') }}
              </dt>
              <dd class="font-semibold">{{ chart.shocks }}</dd>
            </div>
          </div>

          <!-- Radar (if available) -->
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

          <!-- Score Records Placeholder -->
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 class="font-semibold mb-2">Score Rankings</h3>
            <div class="text-center py-4 text-gray-500">
              <p>Score rankings will be displayed here</p>
              <p class="text-sm">(Coming Soon)</p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UPage>
</template>
