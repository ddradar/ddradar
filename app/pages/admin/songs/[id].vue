<spec lang="md">
# Song Edit Page for Admins

This page allows administrators to edit song information, including adding and modifying step charts.

## Prequisites

- User must be authenticated and have the 'admin' role to access this page. (use [`auth`](../../middleware/auth.ts) middleware with roles)
- The `id` route parameter must be a valid song ID. (`/^[01689bdiloqDIOPQ]{32}$/`)

## Features

- Fetches song data from `GET /api/songs/{id}` endpoint.
- Displays a form to edit song attributes such as name, artist, BPM, series, and charts.
- Allows adding new charts and editing existing chart details.
- Validates form inputs using Zod schemas defined in `songSchema` and `stepChartSchema`.
- Submits updated song data to `POST /api/songs/` endpoint.

## Fields

- **Name**(required): Name of the song.
- **Name Kana**(required): Kana representation of the song name. (for sorting)
- **Artist**: Artist of the song. (allow empty)
- **BPM**: Beats per minute of the song. Only set if known on A3 or GRAND PRIX. (allow null)
- **Series**(required): Series category of the song. ("DDR 1st" to "DDR WORLD")
  - default: "DDR WORLD"
- **Charts**: List of step charts for the song.
  - **Play Style**(required): Play style of the chart. (SINGLE/DOUBLE)
  - **Difficulty**(required): Difficulty level of the chart. (BEGINNER to CHALLENGE)
  - **BPM**(required): BPM values for the chart. (min, core, max)
  - **Level**(required): Difficulty level number of the chart. (1-20)
  - **Notes**: Number of notes in the chart. (allow null)
  - **Freezes**: Number of freeze arrows in the chart. (allow null)
  - **Shocks**: Number of shock arrows in the chart. (default: 0)
  - **Radar**: Radar data for the chart. (allow null)
    - stream, voltage, air, freeze, chaos: Numeric radar values.
</spec>

<script setup lang="ts">
import type { AccordionItem } from '@nuxt/ui'

import { seriesList, songSchema } from '#shared/schemas/song'
import {
  Difficulty,
  getChartName,
  PlayStyle,
  stepChartSchema,
} from '#shared/schemas/step-chart'
import { getSelectItems } from '~/utils'

definePageMeta({
  middleware: 'auth',
  roles: ['admin'],
  validate: route =>
    'id' in route.params &&
    songSchema.shape.id.safeParse(route.params.id).success,
})

/** Select items for song.playStyle */
const playStyles = getSelectItems(PlayStyle)
/** Select items for song.difficulty */
const difficulties = getSelectItems(Difficulty)

const { t } = useI18n()
const route = useRoute('admin-songs-id')
const toast = useToast()

const { data, refresh } = await useFetch<
  Omit<SongInfo, 'seriesCategory' | 'nameIndex'>
>(`/api/songs/${route.params.id}`, {
  method: 'GET',
  pick: ['id', 'name', 'nameKana', 'artist', 'bpm', 'series', 'charts'],
  default: () => ({
    id: route.params.id,
    name: '',
    nameKana: '',
    artist: '',
    bpm: null,
    series: seriesList[seriesList.length - 1]!,
    charts: [],
  }),
  deep: true,
})
const charts = computed((): AccordionItem[] =>
  data.value.charts.map(chart => ({ label: getChartName(chart), chart }))
)

/** Add a new chart to the song */
const addChart = () => {
  const lastChart = data.value.charts.at(-1)
  data.value.charts.push({
    playStyle: lastChart ? lastChart.playStyle : PlayStyle.SINGLE,
    difficulty: lastChart ? lastChart.difficulty : Difficulty.BEGINNER,
    bpm: lastChart ? [...lastChart.bpm] : [0, 0, 0],
    level: 1,
    notes: null,
    freezes: null,
    shocks: 0,
    radar: null,
  })
}

/** Add radar data to a chart */
const addRadar = (chart: StepChart) => {
  chart.radar = { stream: 0, voltage: 0, air: 0, freeze: 0, chaos: 0 }
}

/** Remove radar data from a chart */
const removeRadar = (chart: StepChart) => {
  chart.radar = null
}

/**
 * Save the song data to the server.
 */
const onSubmit = async () => {
  const named = { entity: t('schema.song.entity') }
  try {
    await $fetch(`/api/songs/`, { method: 'POST', body: data.value })
    toast.add({ color: 'success', title: t('actions.save.success', named) })
    await refresh()
  } catch (error: unknown) {
    toast.add({
      color: 'error',
      title: t('actions.save.error', named),
      description: String(error),
    })
  }
}
</script>

<template>
  <UPage>
    <UContainer>
      <UPageHeader :title="data.name" />
      <UForm
        id="main-form"
        role="form"
        :schema="songSchema"
        :state="data"
        @submit="onSubmit"
      >
        <UCard variant="soft" class="mb-6">
          <template #header>
            <h2 class="text-xl font-bold">{{ t('schema.song.entity') }}</h2>
          </template>

          <UFormField :label="t('schema.song.name.label')" name="name" required>
            <UInput v-model="data.name" />
          </UFormField>
          <UFormField
            :label="t('schema.song.nameKana.label')"
            name="nameKana"
            required
          >
            <UInput v-model="data.nameKana" />
          </UFormField>
          <UFormField
            :label="t('schema.song.artist.label')"
            name="artist"
            required
          >
            <UInput v-model="data.artist" />
          </UFormField>
          <UFormField :label="t('schema.song.bpm.label')" name="bpm">
            <UInput v-model="data.bpm" />
          </UFormField>
          <UFormField
            :label="t('schema.song.series.label')"
            name="series"
            required
          >
            <USelect v-model="data.series" :items="seriesList" />
          </UFormField>

          <template #footer>
            <div class="flex gap-2 justify-end">
              <UButton id="add-button" @click="addChart">
                {{ t('actions.add.label') }}
              </UButton>
              <UButton id="save-button" type="submit">
                {{ t('actions.save.label') }}
              </UButton>
            </div>
          </template>
        </UCard>

        <UAccordion :items="charts">
          <template #content="{ item }">
            <UForm :schema="stepChartSchema" :state="item.chart" nested>
              <UFormField
                :label="t('schema.song.chart.playStyle.label')"
                name="playStyle"
                required
              >
                <USelect v-model="item.chart.playStyle" :items="playStyles" />
              </UFormField>
              <UFormField
                :label="t('schema.song.chart.difficulty.label')"
                name="difficulty"
              >
                <USelect
                  v-model="item.chart.difficulty"
                  :items="difficulties"
                />
              </UFormField>
              <UFormField
                :label="t('schema.song.chart.bpm.label')"
                name="bpm"
                required
              >
                <UFieldGroup>
                  <UInput
                    v-model.number="item.chart.bpm[0]"
                    type="number"
                    :placeholder="t('schema.song.chart.bpm.min')"
                  />
                  <UInput
                    v-model.number="item.chart.bpm[1]"
                    type="number"
                    :placeholder="t('schema.song.chart.bpm.core')"
                  />
                  <UInput
                    v-model.number="item.chart.bpm[2]"
                    type="number"
                    :placeholder="t('schema.song.chart.bpm.max')"
                  />
                </UFieldGroup>
              </UFormField>
              <UFormField
                :label="t('schema.song.chart.level.label')"
                name="level"
                required
              >
                <UInput v-model.number="item.chart.level" type="number" />
              </UFormField>
              <UFormField
                :label="t('schema.song.chart.notes.label')"
                name="notes"
              >
                <UInput v-model.number="item.chart.notes" type="number" />
              </UFormField>
              <UFormField
                :label="t('schema.song.chart.freezes.label')"
                name="freezes"
              >
                <UInput v-model.number="item.chart.freezes" type="number" />
              </UFormField>
              <UFormField
                :label="t('schema.song.chart.shocks.label')"
                name="shocks"
              >
                <UInput v-model.number="item.chart.shocks" type="number" />
              </UFormField>
              <UFormField
                :label="t('schema.song.chart.radar.label')"
                name="radar"
                description="Str, Vol, Air, Fre, Cha"
              >
                <UFieldGroup v-if="item.chart.radar">
                  <UInput
                    v-model.number="item.chart.radar.stream"
                    :placeholder="t('schema.song.chart.radar.stream')"
                  />
                  <UInput
                    v-model.number="item.chart.radar.voltage"
                    :placeholder="t('schema.song.chart.radar.voltage')"
                  />
                  <UInput
                    v-model.number="item.chart.radar.air"
                    :placeholder="t('schema.song.chart.radar.air')"
                  />
                  <UInput
                    v-model.number="item.chart.radar.freeze"
                    :placeholder="t('schema.song.chart.radar.freeze')"
                  />
                  <UInput
                    v-model.number="item.chart.radar.chaos"
                    :placeholder="t('schema.song.chart.radar.chaos')"
                  />
                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    @click="removeRadar(item.chart)"
                  >
                    {{ t('actions.delete.label') }}
                  </UButton>
                </UFieldGroup>
                <UButton
                  v-else
                  icon="i-lucide-plus"
                  @click="addRadar(item.chart)"
                >
                  {{ t('actions.add.label') }}
                </UButton>
              </UFormField>
            </UForm>
          </template>
        </UAccordion>
      </UForm>
    </UContainer>
  </UPage>
</template>
