<template>
  <section>
    <card :title="chartTitle" :type="cardType" collapsible :open="open">
      <div class="card-content">
        <div class="table-container">
          <b-table
            :data="scores"
            :loading="loading"
            :mobile-cards="false"
            :selected="userScore"
            narrowed
            striped
          >
            <template v-slot="props">
              <b-table-column field="name" label="Name">
                <nuxt-link
                  v-if="!props.row.isArea"
                  :to="`/users/${props.row.userId}`"
                  class="is-size-7"
                >
                  {{ props.row.userName }}
                </nuxt-link>
                <span v-else class="is-size-7">{{ props.row.userName }}</span>
              </b-table-column>
              <b-table-column field="score" label="Score" centered>
                <score-badge
                  :lamp="props.row.clearLamp"
                  :score="props.row.score"
                />
              </b-table-column>
              <b-table-column field="exScore" label="EX" numeric>
                <span class="is-size-7">{{ props.row.exScore }}</span>
              </b-table-column>
            </template>

            <template v-slot:empty>
              <section class="section">
                <div class="content has-text-grey has-text-centered">
                  <p>Nothing here.</p>
                </div>
              </section>
            </template>
          </b-table>
        </div>
      </div>
      <footer class="card-footer">
        <a class="card-footer-item" @click="launchScoreEditor()">スコア編集</a>
        <a class="card-footer-item" @click="fetchScores(true)">全件表示</a>
      </footer>
    </card>
    <card title="Chart Info" :type="cardType" collapsible>
      <div class="card-content">
        <div class="content">
          <ul>
            <li><em>Notes</em>: {{ chart.notes }}</li>
            <li><em>Freeze Arrow</em>: {{ chart.freezeArrow }}</li>
            <li><em>Shock Arrow</em>: {{ chart.shockArrow }}</li>
          </ul>
        </div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th><abbr title="STREAM">STR</abbr></th>
                <th><abbr title="VOLTAGE">VOL</abbr></th>
                <th>AIR</th>
                <th><abbr title="FREEZE">FRE</abbr></th>
                <th><abbr title="CHAOS">CHA</abbr></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ chart.stream }}</td>
                <td>{{ chart.voltage }}</td>
                <td>{{ chart.air }}</td>
                <td>{{ chart.freeze }}</td>
                <td>{{ chart.chaos }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </card>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import ScoreBadge from '~/components/pages/ScoreBadge.vue'
import ScoreEditor from '~/components/pages/ScoreEditor.vue'
import Card from '~/components/shared/Card.vue'
import { UserScore } from '~/types/api/score'
import {
  getDifficultyName,
  getPlayStyleName,
  SongInfo,
  StepChart,
} from '~/types/api/song'
import { areaList } from '~/types/api/user'

type RankingScore = UserScore & { isArea?: true }

@Component({ components: { Card, ScoreBadge } })
export default class ChartDetailComponent extends Vue {
  @Prop({ required: true, type: Object })
  readonly song!: Omit<SongInfo, 'charts'>

  @Prop({ required: true, type: Object })
  readonly chart!: StepChart

  @Prop({ required: false, type: Boolean, default: false })
  readonly open!: boolean

  loading = true
  scores: RankingScore[] = []

  get userScore() {
    return this.scores.find(s => s.userId === this.$accessor.user?.id)
  }

  get chartTitle() {
    const shortPlayStyle = getPlayStyleName(this.chart.playStyle)[0] + 'P' // 'SP' or 'DP'
    const difficulty = getDifficultyName(this.chart.difficulty)
    return `${shortPlayStyle}-${difficulty} (${this.chart.level})`
  }

  get cardType() {
    return `is-${getDifficultyName(this.chart.difficulty).toLowerCase()}`
  }

  async fetch() {
    await this.fetchScores()
  }

  launchScoreEditor() {
    this.$buefy.modal.open({
      parent: this,
      component: ScoreEditor,
      props: {
        songId: this.song.id,
        playStyle: this.chart.playStyle,
        difficulty: this.chart.difficulty,
        songData: this.song,
      },
      hasModalCard: true,
      trapFocus: true,
    })
  }

  /** Call Get Chart Score API */
  async fetchScores(fetchAllData: boolean = false) {
    this.loading = true
    const playStyle = this.chart.playStyle
    const difficulty = this.chart.difficulty
    const query = fetchAllData ? '?scope=full' : ''
    try {
      const scores = await this.$http.$get<UserScore[]>(
        `/api/v1/scores/${this.song.id}/${playStyle}/${difficulty}${query}`
      )
      this.scores = scores.map(s => {
        if (areaList[s.userId]) {
          return {
            ...s,
            isArea: true,
            userName:
              (s.userId === '0' ? '全国' : areaList[s.userId]) + 'トップ',
          }
        }
        return s
      })
    } catch {}
    this.loading = false
  }
}
</script>
