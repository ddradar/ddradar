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
        <OButton variant="primary" :disabled="!isValidId" @click="refresh()">
          Load
        </OButton>
        <OButton
          tag="a"
          variant="info"
          :disabled="!isValidId"
          :href="`https://p.eagate.573.jp/game/ddr/ddra3/p/images/binary_jk.html?img=${id}`"
          target="_blank"
        >
          See Thumbnail
        </OButton>
      </OField>
    </OField>

    <OField label="Name">
      <OInput v-model="song!.name" required />
    </OField>

    <OField label="Furigana">
      <OInput
        v-model="song!.nameKana"
        required
        pattern="^[A-Z0-9 .ぁ-んー]+$"
        placeholder="A-Z 0-9 . あ-ん ー"
      />
      <OButton icon-left="pencil" @click="setNameKana()">Auto Set</OButton>
    </OField>

    <OField label="Artist">
      <OInput v-model="song!.artist" />
    </OField>

    <OField label="Series">
      <OSelect v-model="song!.series" placeholder="Series">
        <option v-for="n in seriesNames" :key="n" :value="n">
          {{ n }}
        </option>
      </OSelect>
    </OField>

    <OField label="BPM">
      <OField grouped>
        <OInput v-model.number="song!.minBPM" type="number" placeholder="min" />
        <span class="control">-</span>
        <OInput v-model.number="song!.maxBPM" type="number" placeholder="max" />
      </OField>
    </OField>

    <OField>
      <OCheckbox v-model="song!.deleted">Deleted</OCheckbox>
    </OField>

    <OField v-for="(chart, i) in song!.charts" :key="i" grouped group-multiline>
      <OField
        :variant="hasDuplicatedChart(chart) ? 'danger' : ''"
        :message="hasDuplicatedChart(chart) ? 'Already Exists' : ''"
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
import { difficultyMap, getNameIndex, isValidSongId } from '@ddradar/core'
import { useProgrammatic } from '@oruga-ui/oruga-next'

import DialogModal from '~~/components/DialogModal.vue'
import type { SongInfo } from '~~/server/api/v1/songs/[id].get'
import { seriesNames } from '~~/utils/song'

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
const id = useState(() => (_route.params.id as string) ?? '')
const { data: song, refresh } = await useFetch<SongInfo>(
  `/api/v1/songs/${id.value}`
)
song.value ??= {
  id: id.value,
  name: '',
  nameKana: '',
  nameIndex: 0,
  artist: '',
  series: seriesNames.slice(-1)[0],
  minBPM: null,
  maxBPM: null,
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
}

// Validator
const isValidId = computed(() => isValidSongId(id.value))
const hasDuplicatedChart = (chart: SongInfo['charts'][number]) =>
  song.value!.charts.filter(
    c => c.playStyle === chart.playStyle && c.difficulty === chart.difficulty
  ).length !== 1
const hasError = computed(
  () =>
    !isValidId.value ||
    !song.value!.name ||
    !/^[A-Z0-9 .ぁ-んー]+$/.test(song.value!.nameKana) ||
    !song.value!.series ||
    !song.value!.minBPM !== !song.value!.maxBPM ||
    song.value!.charts.length === 0 ||
    song.value!.charts.some(c => hasDuplicatedChart(c))
)

// Methods
/** Add empty chart in charts. */
const addChart = () =>
  (song.value!.charts as SongInfo['charts'][0][]).push({
    playStyle: 1,
    difficulty: 0,
    ..._chart,
  })
/** Remove specific chart in charts. */
const removeChart = (index: number) =>
  (song.value!.charts as SongInfo['charts'][0][]).splice(index, 1)
/** Set nameKana from upper-cased name. */
const setNameKana = () =>
  (song.value!.nameKana = song.value!.name.toUpperCase())

/** Save song data. */
const saveSongInfo = async () => {
  const instance = oruga.modal.open({
    component: DialogModal,
    props: { message: 'Add or update this?', variant: 'info' },
    trapFocus: true,
  })

  if ((await instance.promise) !== 'yes') return

  const nameIndex = getNameIndex(song.value!.nameKana)
  const body: SongInfo = { ...song.value!, id: id.value, nameIndex }
  song.value = await $fetch<SongInfo>('/api/v1/songs', { method: 'POST', body })

  oruga.notification.open({
    message: 'Saved Successfully!',
    variant: 'success',
    position: 'top',
  })
}
</script>
