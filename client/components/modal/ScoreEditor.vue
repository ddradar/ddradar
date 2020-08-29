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

import { CourseChart, CourseInfo } from '~/api/course'
import {
  ClearLamp,
  deleteChartScore,
  getChartScore,
  getDanceLevel,
  postChartScore,
  setValidScoreFromChart,
} from '~/api/score'
import {
  getDifficultyName,
  getPlayStyleName,
  SongInfo,
  StepChart,
} from '~/api/song'
import * as popup from '~/utils/popup'

@Component({ fetchOnServer: false })
export default class ScoreEditorComponent extends Vue {
  @Prop({ required: true, type: String })
  readonly songId!: string

  @Prop({ required: false, type: Number, default: null })
  readonly playStyle!: 1 | 2 | null

  @Prop({ required: false, type: Number, default: null })
  readonly difficulty!: 0 | 1 | 2 | 3 | 4 | null

  @Prop({ required: true, type: Object })
  readonly songData!:
    | Pick<SongInfo, 'name' | 'charts'>
    | Pick<CourseInfo, 'name' | 'charts'>

  score = 0
  exScore = 0
  clearLamp: ClearLamp = 0
  maxCombo = 0
  isFailed = false

  selectedChart: StepChart | CourseChart | null = null

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
    return (this.songData.charts as {
      playStyle: number
      difficulty: number
    }[]).map(c => ({
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
        (this.songData.charts as (StepChart | CourseChart)[]).find(
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
    this.selectedChart =
      (this.songData.charts as (StepChart | CourseChart)[]).find(
        c => c.playStyle === playStyle && c.difficulty === difficulty
      ) ?? null
    await this.fetchScore()
  }

  calcScore() {
    if (!this.selectedChart) return
    try {
      const score = setValidScoreFromChart(this.selectedChart, {
        score: this.score,
        exScore: this.exScore,
        maxCombo: this.maxCombo,
        clearLamp: this.clearLamp,
        rank: this.isFailed ? 'E' : undefined,
      })
      this.score = score.score
      this.exScore = score.exScore ?? this.exScore
      this.maxCombo = score.maxCombo ?? this.maxCombo
      this.clearLamp = score.clearLamp
      this.isFailed = score.rank === 'E'
    } catch {
      popup.warning(
        this.$buefy,
        '情報が足りないため、スコアの自動計算ができませんでした。'
      )
    }
  }

  async saveScore() {
    if (!this.selectedChart) return
    const playStyle = this.selectedChart.playStyle
    const difficulty = this.selectedChart.difficulty
    try {
      await postChartScore(this.$http, this.songId, playStyle, difficulty, {
        score: this.score,
        exScore: this.exScore,
        maxCombo: this.maxCombo,
        clearLamp: this.clearLamp,
        rank: this.rank,
      })
      popup.success(this.$buefy, 'Success!')
    } catch (error) {
      popup.danger(this.$buefy, error.message ?? error)
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
      const scores = await getChartScore(
        this.$http,
        this.songId,
        playStyle,
        difficulty,
        'private'
      )
      this.score = scores[0].score
      this.exScore = scores[0].exScore ?? this.exScore
      this.clearLamp = scores[0].clearLamp
      this.maxCombo = scores[0].maxCombo ?? this.maxCombo
      this.isFailed = scores[0].rank === 'E'
    } catch (error) {
      this.isLoading = false
      const message = error.message ?? error
      if (message !== '404') {
        popup.danger(this.$buefy, message)
      }
    }
    this.isLoading = false
  }

  async callDeleteAPI() {
    if (!this.selectedChart) return
    const playStyle = this.selectedChart.playStyle
    const difficulty = this.selectedChart.difficulty
    try {
      await deleteChartScore(this.$http, this.songId, playStyle, difficulty)
      popup.success(this.$buefy, 'Success!')
    } catch (error) {
      popup.danger(this.$buefy, error.message ?? error)
    }
  }
}
</script>
