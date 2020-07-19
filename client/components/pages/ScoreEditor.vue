<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <h1 class="modal-card-title">Edit Score</h1>
    </header>
    <section class="modal-card-body">
      <!-- Select chart -->
      <template v-if="playStyle === null || difficulty === null">
        <b-field label="Select chart">
          <b-select @input="onChartSelected">
            <option v-for="chart in charts" :key="chart.label" :value="chart">
              {{ chart.label }}
            </option>
          </b-select>
        </b-field>
      </template>

      <!-- Input score -->
      <template v-else>
        <b-field grouped>
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
          <b-checkbox v-model="isFailed">E判定</b-checkbox>
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
            :placeholder="`0-${exScoreMax}`"
          />
        </b-field>

        <b-field label="MAX COMBO">
          <b-input
            v-model.number="maxCombo"
            type="number"
            min="0"
            :max="maxComboMax"
            :placeholder="`0-${maxComboMax}`"
          />
        </b-field>

        <b-field>
          <b-button type="is-info" icon-left="calculator" @click="calcScore()">
            自動計算
          </b-button>
        </b-field>
      </template>
    </section>

    <footer
      v-if="playStyle !== null && difficulty !== null"
      class="modal-card-foot"
    >
      <b-button type="is-success" icon-left="content-save" @click="saveScore()">
        Save
      </b-button>
      <b-button type="is-danger" icon-left="delete" @click="deleteScore()">
        Delete
      </b-button>
    </footer>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import {
  ClearLamp,
  getDanceLevel,
  setValidScoreFromChart,
} from '~/types/api/score'
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

  @Prop({ required: true, type: Object })
  songData: SongInfo

  get selectedChart() {
    if (this.playStyle === null || this.difficulty === null) return undefined
    return this.songData.charts.find(
      c => c.playStyle === this.playStyle && c.difficulty === this.difficulty
    )
  }

  score: number
  exScore: number
  clearLamp: ClearLamp
  maxCombo: number
  isFailed: boolean

  get rank() {
    return this.isFailed ? 'E' : getDanceLevel(this.score)
  }

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

  get charts() {
    return this.songData.charts.map(c => ({
      playStyle: c.playStyle,
      difficulty: c.difficulty,
      label: `${getPlayStyleName(c.playStyle)}/${getDifficultyName(
        c.difficulty
      )}`,
    }))
  }

  getChartName({ playStyle, difficulty }: ChartKey) {
    return `${getPlayStyleName(playStyle)}/${getDifficultyName(difficulty)}`
  }

  onChartSelected({ playStyle, difficulty }: ChartKey) {
    this.playStyle = playStyle
    this.difficulty = difficulty
  }

  calcScore() {
    try {
      const score = setValidScoreFromChart(this.selectedChart, {
        score: this.score,
        exScore: this.exScore,
        maxCombo: this.maxCombo,
        clearLamp: this.clearLamp,
        rank: this.isFailed ? 'E' : undefined,
      })
      this.score = score.score
      this.exScore = score.exScore
      this.maxCombo = score.maxCombo
      this.clearLamp = score.clearLamp
      this.isFailed = score.rank === 'E'
    } catch {
      this.$buefy.notification.open({
        message: '情報が足りないため、スコアの自動計算ができませんでした。',
        type: 'is-warning',
        position: 'is-top',
        hasIcon: true,
      })
    }
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
          rank: this.rank,
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

  deleteScore() {
    this.$buefy.dialog.confirm({
      message: 'スコアを削除しますか？',
      type: 'is-warning',
      hasIcon: true,
      onConfirm: async () => await this.callDeleteAPI(),
    })
  }

  async callDeleteAPI() {
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
