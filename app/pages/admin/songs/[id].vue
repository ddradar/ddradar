<script setup lang="ts">
import type { AccordionItem } from '@nuxt/ui'
import { useToast } from '@nuxt/ui/composables'

import { seriesList, songSchema } from '#shared/schemas/song'
import {
  Difficulty,
  getChartName,
  PlayStyle,
  stepChartSchema,
} from '#shared/schemas/step-chart'
import type { SongInfo } from '#shared/types/song'
import { getSelectItems } from '~/utils'

definePageMeta({
  middleware: 'auth',
  roles: ['admin'],
  validate: route =>
    'id' in route.params &&
    songSchema.shape.id.safeParse(route.params.id).success,
})

const playStyleOptions = ref(getSelectItems(PlayStyle))
const difficultyOptions = ref(getSelectItems(Difficulty))

const route = useRoute('admin-songs-id')
const toast = useToast()

const { data } = await useFetch<Omit<SongInfo, 'seriesCategory' | 'nameIndex'>>(
  `/api/songs/${route.params.id}`,
  {
    method: 'GET',
    pick: ['id', 'name', 'nameKana', 'artist', 'bpm', 'series', 'charts'],
    default: () => ({
      id: route.params.id,
      name: '',
      nameKana: '',
      artist: '',
      bpm: null,
      series: 'DDR WORLD' as const,
      charts: [],
    }),
    deep: true,
  }
)
const charts = computed((): AccordionItem[] =>
  data.value.charts.map(chart => ({ label: getChartName(chart), chart }))
)
const emptyRadar = {
  stream: 0,
  voltage: 0,
  air: 0,
  freeze: 0,
  chaos: 0,
}

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

const onSubmit = async () => {
  try {
    await $fetch(`/api/songs/`, {
      method: 'POST',
      body: data.value,
    })
    toast.add({ color: 'success', title: '曲情報を保存しました' })
  } catch (error) {
    console.error('曲情報の保存に失敗しました:', error)
    toast.add({ color: 'error', title: '曲情報の保存に失敗しました' })
  }
}
</script>

<template>
  <UPage>
    <UContainer>
      <UPageHeader :title="data.name" />
      <UForm :schema="songSchema" :state="data" @submit="onSubmit">
        <UCard variant="soft" class="mb-6">
          <template #header>
            <h2 class="text-xl font-bold">基本情報</h2>
          </template>

          <UFormField label="曲名" name="name" required>
            <UInput v-model="data.name" />
          </UFormField>
          <UFormField label="曲名フリガナ" name="nameKana" required>
            <UInput v-model="data.nameKana" />
          </UFormField>
          <UFormField label="アーティスト" name="artist" required>
            <UInput v-model="data.artist" />
          </UFormField>
          <UFormField label="表示BPM" name="bpm">
            <UInput v-model="data.bpm" />
          </UFormField>
          <UFormField label="シリーズ" name="series" required>
            <USelect v-model="data.series" :items="seriesList" />
          </UFormField>

          <template #footer>
            <div class="flex gap-2 justify-end">
              <UButton data-test="add-button" @click="addChart">追加</UButton>
              <UButton type="submit">保存</UButton>
            </div>
          </template>
        </UCard>
      </UForm>

      <UAccordion :items="charts">
        <template #content="{ item }">
          <UForm :schema="stepChartSchema" :state="item.chart">
            <UFormField label="プレースタイル" name="playStyle" required>
              <USelect
                v-model="item.chart.playStyle"
                :items="playStyleOptions"
              />
            </UFormField>
            <UFormField label="難易度" name="difficulty">
              <USelect
                v-model="item.chart.difficulty"
                :items="difficultyOptions"
              />
            </UFormField>
            <UFormField label="BPM" name="bpm" required>
              <UFieldGroup>
                <UInput v-model.number="item.chart.bpm[0]" type="number" />
                <UInput v-model.number="item.chart.bpm[1]" type="number" />
                <UInput v-model.number="item.chart.bpm[2]" type="number" />
              </UFieldGroup>
            </UFormField>
            <UFormField label="レベル" name="level" required>
              <UInput v-model.number="item.chart.level" type="number" />
            </UFormField>
            <UFormField label="ノーツ数" name="notes">
              <UInput v-model.number="item.chart.notes" type="number" />
            </UFormField>
            <UFormField label="フリーズアロー数" name="freezes">
              <UInput v-model.number="item.chart.freezes" type="number" />
            </UFormField>
            <UFormField label="ショックアロー数" name="shocks">
              <UInput v-model.number="item.chart.shocks" type="number" />
            </UFormField>
            <UFormField
              label="Groove Radar"
              name="radar"
              description="Str, Vol, Air, Fre, Cha"
            >
              <UFieldGroup v-if="item.chart.radar">
                <UInput
                  v-model.number="item.chart.radar.stream"
                  placeholder="Stream"
                />
                <UInput
                  v-model.number="item.chart.radar.voltage"
                  placeholder="Voltage"
                />
                <UInput
                  v-model.number="item.chart.radar.air"
                  placeholder="Air"
                />
                <UInput
                  v-model.number="item.chart.radar.freeze"
                  placeholder="Freeze"
                />
                <UInput
                  v-model.number="item.chart.radar.chaos"
                  placeholder="Chaos"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  @click="item.chart.radar = null"
                >
                  削除
                </UButton>
              </UFieldGroup>
              <UButton
                v-else
                icon="i-lucide-plus"
                @click="item.chart.radar = { ...emptyRadar }"
              >
                追加
              </UButton>
            </UFormField>
          </UForm>
        </template>
      </UAccordion>
    </UContainer>
  </UPage>
</template>
