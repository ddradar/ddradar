<template>
  <section class="section">
    <h1 class="title">Edit Score</h1>
    <template v-if="songData">
      <h2 class="subtitle">{{ songData.name }}</h2>

      <!-- Select chart -->
      <template v-if="playStyle === null || difficulty === null">
        <b-field label="Select chart">
          <b-select @input="onChartSelected">
            <option
              v-for="chart in songData.charts"
              :key="`${chart.playStyle}-${chart.difficulty}`"
              :value="chart"
            >
              {{ getChartName(chart) }}
            </option>
          </b-select>
        </b-field>
      </template>

      <!-- Input score -->
      <template v-else>
        <b-field label="Score">
          <b-input
            v-model.number="score"
            type="number"
            required
            placeholder="0-1000000"
            min="0"
            max="1000000"
            step="10"
          />
        </b-field>

        <b-field label="Clear Lamp">
          <b-select v-model.number="clearLamp" placeholder="Clear Lamp">
            <option value="0">Failed</option>
            <option value="1">Assisted Clear</option>
            <option value="2">Clear</option>
            <option value="3">Life4 Clear</option>
            <option value="4">Good Full Combo</option>
            <option value="5">Great Full Combo</option>
            <option value="6">Perfect Full Combo</option>
            <option value="7">Marvelous Full Combo</option>
          </b-select>
        </b-field>

        <b-field label="EX SCORE">
          <b-input
            v-model.number="exScore"
            type="number"
            min="0"
            :max="exScoreMax"
          />
        </b-field>

        <b-field label="MAX COMBO">
          <b-input
            v-model.number="maxCombo"
            type="number"
            min="0"
            :max="maxComboMax"
          />
        </b-field>

        <b-field>
          <b-button type="is-success" icon-left="save" @click="saveScore()">
            Save
          </b-button>
          <b-button type="is-success" icon-left="delete" @click="deleteScore()">
            Delete
          </b-button>
        </b-field>
      </template>
    </template>

    <b-loading v-else />
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { ClearLamp } from '~/types/api/score'
import {
  getDifficultyName,
  getPlayStyleName,
  SongInfo,
  StepChart,
} from '~/types/api/song'

type ChartKey = Pick<StepChart, 'playStyle' | 'difficulty'>

@Component({ fetchOnServer: false })
export default class ScoreEditorComponent extends Vue {
  @Prop({ required: true, type: String })
  songId: string

  @Prop({ required: false, type: Number, default: null })
  playStyle: 1 | 2 | null

  @Prop({ required: false, type: Number, default: null })
  difficulty: 0 | 1 | 2 | 3 | 4 | null

  songData: SongInfo

  private chart?: StepChart
  get selectedChart() {
    if (this.playStyle === null || this.difficulty === null) return undefined
    if (!this.chart) {
      this.chart = this.songData.charts.find(
        c => c.playStyle === this.playStyle && c.difficulty === this.difficulty
      )
    }
    return this.chart
  }

  score: number
  exScore: number
  clearLamp: ClearLamp
  maxCombo: number

  get exScoreMax() {
    if (!this.selectedChart) return 0
    return (
      (this.selectedChart.notes +
        this.selectedChart.freezeArrow +
        this.selectedChart.shockArrow) *
      3
    )
  }

  get maxComboMax() {
    if (!this.selectedChart) return 0
    return this.selectedChart.notes + this.selectedChart.shockArrow
  }

  /** Get SongInfo from API */
  async fetch() {
    const song = await this.$http.$get<SongInfo>(`/api/v1/songs/${this.songId}`)
    this.songData = song
  }

  getChartName({ playStyle, difficulty }: ChartKey) {
    return `${getPlayStyleName(playStyle)}/${getDifficultyName(difficulty)}`
  }

  onChartSelected({ playStyle, difficulty }: ChartKey) {
    this.playStyle = playStyle
    this.difficulty = difficulty
  }

  async saveScore() {
    try {
      await this.$http.$post(
        `/api/v1/scores/${this.songId}/${this.playStyle}/${this.difficulty}`,
        {
          score: this.score,
          exScore: this.exScore,
          maxCombo: this.maxCombo,
          clearLamp: this.clearLamp,
        }
      )
      this.$buefy.notification.open({
        message: 'Success!',
        type: 'is-success',
        position: 'is-top',
        hasIcon: true,
      })
    } catch (error) {
      this.$buefy.notification.open({
        message: error.message ?? error,
        type: 'is-danger',
        position: 'is-top',
        hasIcon: true,
      })
    }
  }

  async deleteScore() {
    try {
      await this.$http.delete(
        `/api/v1/scores/${this.songId}/${this.playStyle}/${this.difficulty}`
      )
      this.$buefy.notification.open({
        message: 'Success!',
        type: 'is-success',
        position: 'is-top',
        hasIcon: true,
      })
    } catch (error) {
      this.$buefy.notification.open({
        message: error.message ?? error,
        type: 'is-danger',
        position: 'is-top',
        hasIcon: true,
      })
    }
  }
}
</script>
