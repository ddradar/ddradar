<script lang="ts" setup>
import {
  difficultyMap,
  getNameIndex,
  playStyleMap,
  songSchema,
  type StepChart,
} from '@ddradar/core'

definePageMeta({ allowedRoles: 'administrator' })

const _chart = {
  level: 1,
  notes: 1,
  bpm: [0, 0, 0],
  freezeArrow: 0,
  shockArrow: 0,
} as const satisfies Omit<StepChart, 'playStyle' | 'difficulty'>

const _toast = useToast()
const _route = useRoute('admin-songs-id')
const { id: _id } = _route.params

const { data: song, execute } = useFetch(`/api/v2/songs/${_id}`, {
  pick: ['id', 'name', 'nameKana', 'artist', 'series', 'deleted', 'charts'],
  default: () => ({
    id: _route.params.id,
    name: '',
    nameKana: '',
    artist: '',
    series: seriesNames.slice(-1)[0],
    deleted: false,
    charts: [
      { playStyle: 1, difficulty: 0, ..._chart },
      { playStyle: 1, difficulty: 1, ..._chart },
      { playStyle: 1, difficulty: 2, ..._chart },
      { playStyle: 1, difficulty: 3, ..._chart },
      { playStyle: 2, difficulty: 1, ..._chart },
      { playStyle: 2, difficulty: 2, ..._chart },
      { playStyle: 2, difficulty: 3, ..._chart },
    ],
  }),
  immediate: false,
})
if (_id) await execute()

// Methods
/** Add empty chart in charts. */
const addChart = () =>
  song.value.charts.push({
    playStyle: 1,
    difficulty: 0,
    ..._chart,
  })
/** Remove specific chart in charts. */
const removeChart = (index: number) => song.value.charts.splice(index, 1)
/** Set nameKana from upper-cased name. */
const setNameKana = () => (song.value.nameKana = song.value.name.toUpperCase())
/** Save song data. */
const saveSongInfo = async () => {
  const nameIndex = getNameIndex(song.value.nameKana)
  const body = { ...song.value, nameIndex }
  try {
    song.value = await $fetch<(typeof song)['value']>('/api/v2/songs', {
      method: 'POST',
      body,
    })
    _toast.add({ title: 'Success!', color: 'green' })
  } catch (error) {
    _toast.add({ title: String(error), color: 'red' })
  }
}

/** PlayStyle Options */
const playStyles = toSelectOptions(playStyleMap)
/** Difficulty Options */
const difficulties = toSelectOptions(difficultyMap)
/** Table columns */
const columns = [
  { key: 'playStyle', label: 'Style' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'level', label: 'Lv' },
  { key: 'bpm', label: 'BPM' },
  { key: 'notes', label: 'Notes' },
  { key: 'freezeArrow', label: 'FA' },
  { key: 'shockArrow', label: 'SA' },
  { key: 'action' },
]
</script>

<template>
  <UPage>
    <UPageHeader title="Add/Update Song" />
    <UForm :state="song" :schema="songSchema" @submit="saveSongInfo()">
      <UFormGroup label="Song ID" name="id">
        <UInput v-model="song.id" />
        <UButton @click="execute()">Load</UButton>
      </UFormGroup>

      <UFormGroup label="Name" name="name">
        <UInput v-model="song.name" />
      </UFormGroup>

      <UFormGroup label="Furigana" name="nameKana">
        <UInput v-model="song.nameKana" />
        <UButton @click="setNameKana()">Auto Set</UButton>
      </UFormGroup>

      <UFormGroup label="Artist" name="artist">
        <UInput v-model="song.artist" />
      </UFormGroup>

      <UFormGroup label="Series" name="series">
        <USelect v-model="song.series" :options="seriesNames" />
      </UFormGroup>

      <UFormGroup>
        <UCheckbox v-model="song.deleted" name="deleted" label="Deleted" />
      </UFormGroup>

      <UFormGroup label="Charts" name="charts">
        <UTable :rows="song.charts" :columns="columns">
          <template #playStyle-data="{ row }">
            <USelect v-model.number="row.playStyle" :options="playStyles" />
          </template>
          <template #difficulty-data="{ row }">
            <USelect v-model.number="row.difficulty" :options="difficulties" />
          </template>
          <template #level-data="{ row }">
            <UInput v-model.number="row.level" type="number" min="0" max="20" />
          </template>

          <template #bpm-data="{ row }">
            <UInput
              v-model.number="row.bpm[0]"
              type="number"
              placeholder="min"
            />
            <UInput
              v-model.number="row.bpm[1]"
              type="number"
              placeholder="core"
            />
            <UInput
              v-model.number="row.bpm[2]"
              type="number"
              placeholder="max"
            />
          </template>

          <template #notes-data="{ row }">
            <UInput
              v-model.number="row.notes"
              type="number"
              min="0"
              max="9999"
            />
          </template>
          <template #freezeArrow-data="{ row }">
            <UInput
              v-model.number="row.freezeArrow"
              type="number"
              min="0"
              max="9999"
            />
          </template>
          <template #shockArrow-data="{ row }">
            <UInput
              v-model.number="row.shockArrow"
              type="number"
              min="0"
              max="9999"
            />
          </template>

          <template #action-data="{ index }">
            <UButton
              icon="i-heroicons-trash-20-solid"
              color="red"
              @click="removeChart(index)"
            />
          </template>
        </UTable>
        <UButton color="green" @click="addChart">Add Chart</UButton>
      </UFormGroup>

      <UButton type="submit">Save</UButton>
    </UForm>
  </UPage>
</template>
