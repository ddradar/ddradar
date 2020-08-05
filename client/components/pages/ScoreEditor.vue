<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <h1 class="modal-card-title">{{ songData.name }}</h1>
    </header>
    <section class="modal-card-body">
      <!-- Select chart -->
      <h2 v-if="selectedChart" class="subtitle is-small">
        {{ chartName }}
      </h2>
      <b-field v-else label="Select chart">
        <b-select :disabled="selectedChart" @input="onChartSelected">
          <option v-for="c in charts" :key="c.label" :value="c">
            {{ c.label }}
          </option>
        </b-select>
      </b-field>

      <!-- Input score -->
      <template v-if="selectedChart">
        <b-loading :active.sync="isLoading" />
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
  UserScore,
} from '~/types/api/score'
import {
  getDifficultyName,
  getPlayStyleName,
  SongInfo,
  StepChart,
} from '~/types/api/song'

@Component({ fetchOnServer: false })
export default class ScoreEditorComponent extends Vue {
  @Prop({ required: true, type: String })
  readonly songId: string

  @Prop({ required: false, type: Number, default: null })
  readonly playStyle: 1 | 2 | null

  @Prop({ required: false, type: Number, default: null })
  readonly difficulty: 0 | 1 | 2 | 3 | 4 | null

  @Prop({ required: true, type: Object })
  readonly songData: SongInfo

  score = 0
  exScore = 0
  clearLamp: ClearLamp = 0
  maxCombo = 0
  isFailed = false

  selectedChart: StepChart | null = null

  isLoading = true

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

  get chartName() {
    if (!this.selectedChart) return null
    const playStyle = getPlayStyleName(this.selectedChart.playStyle)
    const difficulty = getDifficultyName(this.selectedChart.difficulty)
    return `${playStyle}/${difficulty}`
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

  async created() {
    if (this.playStyle !== null && this.difficulty !== null) {
      this.selectedChart =
        this.songData.charts.find(
          c =>
            c.playStyle === this.playStyle && c.difficulty === this.difficulty
        ) ?? null
      await this.fetchScore()
    }
  }

  async onChartSelected({
    playStyle,
    difficulty,
  }: Pick<StepChart, 'playStyle' | 'difficulty'>) {
    this.selectedChart = this.songData.charts.find(
      c => c.playStyle === playStyle && c.difficulty === difficulty
    )
    await this.fetchScore()
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
    if (!this.selectedChart) return
    const playStyle = this.selectedChart.playStyle
    const difficulty = this.selectedChart.difficulty
    try {
      await this.$http.$post(
        `/api/v1/scores/${this.songId}/${playStyle}/${difficulty}`,
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
    // @ts-ignore
    this.$parent.close()
  }

  deleteScore() {
    this.$buefy.dialog.confirm({
      message: 'スコアを削除しますか？',
      type: 'is-warning',
      hasIcon: true,
      onConfirm: async () => {
        await this.callDeleteAPI()
        // @ts-ignore
        this.$parent.close()
      },
    })
  }

  async fetchScore() {
    if (!this.selectedChart) return
    this.isLoading = true
    const playStyle = this.selectedChart.playStyle
    const difficulty = this.selectedChart.difficulty
    try {
      const scores = await this.$http.$get<UserScore[]>(
        `/api/v1/scores/${this.songId}/${playStyle}/${difficulty}?scope=private`
      )
      this.score = scores[0].score
      this.exScore = scores[0].exScore
      this.clearLamp = scores[0].clearLamp
      this.maxCombo = scores[0].maxCombo
      this.isFailed = scores[0].rank === 'E'
    } catch (error) {
      this.isLoading = false
      const message = error.message ?? error
      if (message !== '404') {
        this.$buefy.notification.open({
          message,
          type: 'is-danger',
          position: 'is-top',
          hasIcon: true,
        })
      }
    }
    this.isLoading = false
  }

  async callDeleteAPI() {
    if (!this.selectedChart) return
    const playStyle = this.selectedChart.playStyle
    const difficulty = this.selectedChart.difficulty
    try {
      await this.$http.delete(
        `/api/v1/scores/${this.songId}/${playStyle}/${difficulty}`
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
