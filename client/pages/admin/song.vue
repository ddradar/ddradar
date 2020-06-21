<template>
  <section class="section">
    <h1 class="title">Add/Update Song</h1>
    <b-field label="Song ID">
      <b-field grouped>
        <b-input
          v-model="id"
          maxlength="32"
          required
          pattern="^[01689bdiloqDIOPQ]{32}$"
        />
        <b-button
          type="is-primary"
          :disabled="!isValidSongId"
          @click="loadSongInfo()"
        >
          Load
        </b-button>
      </b-field>
    </b-field>

    <b-field label="Name">
      <b-input v-model="name" required />
    </b-field>

    <b-field label="Furigana">
      <b-input
        v-model="nameKana"
        required
        pattern="^([A-Z0-9 .ぁ-んー]*)$"
        placeholder="A-Z 0-9 . あ-ん ー"
      />
    </b-field>

    <b-field label="Artist">
      <b-input v-model="artist" />
    </b-field>

    <b-field label="BPM">
      <b-field grouped>
        <b-input v-model.number="minBPM" type="number" placeholder="min" />
        <span class="control">-</span>
        <b-input v-model.number="maxBPM" type="number" placeholder="max" />
      </b-field>
    </b-field>

    <b-field v-for="(chart, i) in charts" :key="i" :label="`Chart ${i + 1}`">
      <b-field grouped group-multiline>
        <b-select placeholder="PlayStyle"></b-select>
        <b-select placeholder="Difficulty"></b-select>
        <b-input placeholder="Level" type="number" min="1" max="20" />
        <b-field>
          <b-input placeholder="Notes" type="number" min="0" max="9999" />
          <b-input placeholder="FA" type="number" min="0" max="9999" />
          <b-input placeholder="SA" type="number" min="0" max="9999" />
        </b-field>
        <b-field>
          <b-input placeholder="Str" type="number" min="0" max="300" />
          <b-input placeholder="Vol" type="number" min="0" max="300" />
          <b-input placeholder="Air" type="number" min="0" max="300" />
          <b-input placeholder="Fre" type="number" min="0" max="300" />
          <b-input placeholder="Cha" type="number" min="0" max="300" />
        </b-field>
      </b-field>
    </b-field>
    <b-field>
      <b-button icon-left="plus">Add Chart</b-button>
    </b-field>

    <b-field>
      <b-button type="is-success">Save</b-button>
    </b-field>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { SongInfo, StepChart } from '~/types/api/song'

@Component
export default class SongEditorPage extends Vue implements SongInfo {
  id: string = ''
  name: string = ''
  nameKana: string = ''
  nameIndex: number = 0
  artist: string = ''
  series: string = ''
  minBPM: number | null = null
  maxBPM: number | null = null
  charts: StepChart[] = [
    {
      playStyle: 1,
      difficulty: 0,
      level: 3,
      notes: 67,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 14,
      voltage: 14,
      air: 9,
      freeze: 0,
      chaos: 0,
    },
    {
      playStyle: 1,
      difficulty: 1,
      level: 7,
      notes: 143,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 31,
      voltage: 29,
      air: 47,
      freeze: 0,
      chaos: 3,
    },
    {
      playStyle: 1,
      difficulty: 2,
      level: 9,
      notes: 188,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 41,
      voltage: 39,
      air: 27,
      freeze: 0,
      chaos: 13,
    },
    {
      playStyle: 1,
      difficulty: 3,
      level: 12,
      notes: 212,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 46,
      voltage: 39,
      air: 54,
      freeze: 0,
      chaos: 19,
    },
    {
      playStyle: 2,
      difficulty: 1,
      level: 7,
      notes: 130,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 28,
      voltage: 29,
      air: 61,
      freeze: 0,
      chaos: 1,
    },
    {
      playStyle: 2,
      difficulty: 2,
      level: 9,
      notes: 181,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 40,
      voltage: 39,
      air: 30,
      freeze: 0,
      chaos: 11,
    },
    {
      playStyle: 2,
      difficulty: 3,
      level: 11,
      notes: 220,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 48,
      voltage: 54,
      air: 27,
      freeze: 0,
      chaos: 41,
    },
  ]

  chartIndex: number = 0

  get isValidSongId() {
    return /^[01689bdiloqDIOPQ]{32}$/.test(this.id)
  }

  async loadSongInfo() {
    if (!this.isValidSongId) return
    try {
      const songInfo = await this.$http.$get<SongInfo>(`/songs/${this.id}`)

      this.name = songInfo.name
      this.nameKana = songInfo.nameKana
      this.nameIndex = songInfo.nameIndex
      this.artist = songInfo.artist
      this.series = songInfo.series
      this.minBPM = songInfo.minBPM
      this.maxBPM = songInfo.maxBPM
    } catch {}
  }
}
</script>
