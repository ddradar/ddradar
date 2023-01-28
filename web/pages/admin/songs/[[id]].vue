<template>
  <section class="section">
    <h1 class="title">Add/Update Song</h1>
    <OField label="Song ID">
      <OField grouped>
        <OInput
          v-model="id"
          maxlength="32"
          required
          pattern="^[01689bdiloqDIOPQ]{32}$"
        />
        <OButton
          variant="primary"
          :disabled="!isValidSongId"
          @click="fetchSongInfo()"
        >
          Load
        </OButton>
        <OButton
          tag="a"
          variant="info"
          :disabled="!isValidSongId"
          :href="`https://p.eagate.573.jp/game/ddr/ddra3/p/images/binary_jk.html?img=${id}`"
          target="_blank"
        >
          See Thumbnail
        </OButton>
      </OField>
    </OField>

    <OField label="Name">
      <OInput v-model="name" required />
    </OField>

    <OField label="Furigana">
      <OInput
        v-model="nameKana"
        required
        pattern="^[A-Z0-9 .ぁ-んー]+$"
        placeholder="A-Z 0-9 . あ-ん ー"
      />
      <OButton icon-left="pencil" @click="setNameKana()">Auto Set</OButton>
    </OField>

    <OField label="Artist">
      <OInput v-model="artist" />
    </OField>

    <OField label="Series">
      <OSelect v-model="series" placeholder="Series">
        <option v-for="n in seriesNames" :key="n" :value="n">
          {{ n }}
        </option>
      </OSelect>
    </OField>

    <OField label="BPM">
      <OField grouped>
        <OInput v-model.number="minBPM" type="number" placeholder="min" />
        <span class="control">-</span>
        <OInput v-model.number="maxBPM" type="number" placeholder="max" />
      </OField>
    </OField>

    <OField>
      <OCheckbox v-model="deleted">Deleted</OCheckbox>
    </OField>

    <OField v-for="(chart, i) in charts" :key="i" grouped group-multiline>
      <OField
        :variant="{ danger: hasDuplicatedChart(chart) }"
        :message="{
          'Already Exists': hasDuplicatedChart(chart),
        }"
      >
        <OSelect v-model.number="chart.playStyle" placeholder="PlayStyle">
          <option value="1">SINGLE</option>
          <option value="2">DOUBLE</option>
        </OSelect>
        <OSelect v-model.number="chart.difficulty" placeholder="Difficulty">
          <option
            v-for="[value, label] in difficultyMap"
            :key="value"
            :value="value"
          >
            {{ label }}
          </option>
        </OSelect>
        <OInput
          v-model.number="chart.level"
          placeholder="Level"
          type="number"
          min="1"
          max="20"
          required
        />
      </OField>
      <OField>
        <OInput
          v-model.number="chart.notes"
          placeholder="Notes"
          type="number"
          min="0"
          max="9999"
          required
        />
        <OInput
          v-model.number="chart.freezeArrow"
          placeholder="FA"
          type="number"
          min="0"
          max="9999"
          required
        />
        <OInput
          v-model.number="chart.shockArrow"
          placeholder="SA"
          type="number"
          min="0"
          max="9999"
          required
        />
      </OField>
      <OField>
        <OInput
          v-model.number="chart.stream"
          placeholder="Str"
          type="number"
          min="0"
          max="300"
          required
        />
        <OInput
          v-model.number="chart.voltage"
          placeholder="Vol"
          type="number"
          min="0"
          max="300"
          required
        />
        <OInput
          v-model.number="chart.air"
          placeholder="Air"
          type="number"
          min="0"
          max="300"
          required
        />
        <OInput
          v-model.number="chart.freeze"
          placeholder="Fre"
          type="number"
          min="0"
          max="300"
          required
        />
        <OInput
          v-model.number="chart.chaos"
          placeholder="Cha"
          type="number"
          min="0"
          max="300"
          required
        />
      </OField>
      <OButton variant="danger" icon-left="delete" @click="removeChart(i)" />
    </OField>
    <OField>
      <OButton variant="info" icon-left="plus" @click="addChart()">
        Add Chart
      </OButton>
    </OField>

    <OField>
      <OButton variant="success" :disabled="hasError" @click="saveSongInfo()">
        Save
      </OButton>
    </OField>
  </section>
</template>

<script lang="ts" setup>
import { Song } from '@ddradar/core'
import { useProgrammatic } from '@oruga-ui/oruga-next'

import DialogModal from '~/components/DialogModal.vue'
import type { SongInfo } from '~/server/api/v1/songs/[id].get'
import { difficultyMap, seriesNames } from '~/src/song'

const _chart = {
  level: 1,
  notes: 1,
  freezeArrow: 0,
  shockArrow: 0,
  stream: 0,
  voltage: 0,
  air: 0,
  freeze: 0,
  chaos: 0,
} as const

const _route = useRoute()
const { oruga } = useProgrammatic()

// SongInfo properties
const id = ref<SongInfo['id']>(_route.params.id as string)
const name = ref<SongInfo['name']>('')
const nameKana = ref<SongInfo['nameKana']>('')
const nameIndex = computed<SongInfo['nameIndex']>(() =>
  Song.getNameIndex(nameKana.value)
)
const artist = ref<SongInfo['artist']>('')
const series = ref<SongInfo['series']>(seriesNames.slice(-1)[0])
const minBPM = ref<SongInfo['minBPM']>(null)
const maxBPM = ref<SongInfo['maxBPM']>(null)
const deleted = ref<SongInfo['deleted']>(false)
const charts = ref<SongInfo['charts'][0][]>([
  { playStyle: 1, difficulty: 0, ..._chart },
  { playStyle: 1, difficulty: 1, ..._chart },
  { playStyle: 1, difficulty: 2, ..._chart },
  { playStyle: 1, difficulty: 3, ..._chart },
  { playStyle: 2, difficulty: 1, ..._chart },
  { playStyle: 2, difficulty: 2, ..._chart },
  { playStyle: 2, difficulty: 3, ..._chart },
])

// Validator
const isValidSongId = computed(() => Song.isValidSongId(id.value))
const hasDuplicatedChart = (chart: SongInfo['charts'][number]) =>
  charts.value.filter(
    c => c.playStyle === chart.playStyle && c.difficulty === chart.difficulty
  ).length !== 1
const hasError = computed(
  () =>
    !isValidSongId.value ||
    !name.value ||
    !/^[A-Z0-9 .ぁ-んー]+$/.test(nameKana.value) ||
    !series.value ||
    !minBPM.value !== !maxBPM.value ||
    charts.value.length === 0 ||
    charts.value.some(c => hasDuplicatedChart(c))
)

/** Add empty chart in charts. */
const addChart = () =>
  charts.value.push({ playStyle: 1, difficulty: 0, ..._chart })
/** Remove specific chart in charts. */
const removeChart = (index: number) => charts.value.splice(index, 1)
/** Set nameKana from upper-cased name. */
const setNameKana = () => (nameKana.value = name.value.toUpperCase())

const _setSongData = (song: SongInfo) => {
  name.value = song.name
  nameKana.value = song.nameKana
  artist.value = song.artist
  series.value = song.series
  minBPM.value = song.minBPM
  maxBPM.value = song.maxBPM
  deleted.value = song.deleted
  charts.value = [...song.charts]
}

/** GET /api/v1/songs/:id */
const fetchSongInfo = async () => {
  if (!id.value) return
  const song = await $fetch(`/api/v1/songs/${id.value}`)
  if (song) _setSongData(song)
}
/** POST /api/v1/songs/:id */
const saveSongInfo = async () => {
  const instance = oruga.modal.open({
    component: DialogModal,
    props: { message: 'Add or update this?', variant: 'info' },
    trapFocus: true,
  })

  if ((await instance.promise) !== 'yes') return
  const body: SongInfo = {
    id: id.value,
    name: name.value,
    nameKana: nameKana.value,
    nameIndex: nameIndex.value,
    artist: artist.value,
    series: series.value,
    minBPM: minBPM.value,
    maxBPM: maxBPM.value,
    deleted: deleted.value,
    charts: charts.value,
  }
  const song = await $fetch('/api/v1/songs', { method: 'POST', body })
  _setSongData(song as SongInfo)
  oruga.notification.open({
    message: 'Saved Successfully!',
    variant: 'success',
    position: 'top',
  })
}
</script>
