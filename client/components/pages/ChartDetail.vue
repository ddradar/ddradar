<template>
  <section>
    <card :title="chartTitle" :type="cardType">
      <div class="card-content">
        <div class="table-container">
          <b-table
            :data="scores"
            :loading="loading"
            :mobile-cards="false"
            :selected="userScore"
          >
            <template v-slot="props">
              <b-table-column field="name" label="Name">
                <nuxt-link :to="`/users/${props.row.userId}`">
                  {{ props.row.userName }}
                </nuxt-link>
              </b-table-column>
              <b-table-column field="score" label="Score">
                <score-badge
                  :lamp="props.row.clearLamp"
                  :rank="props.row.rank"
                  :score="props.row.score"
                />
              </b-table-column>
              <b-table-column field="exScore" label="EX SCORE">
                {{ props.row.exScore }}
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
    <card title="譜面情報" :type="cardType" collapsible>
      <div class="card-content">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Notes</th>
                <th><abbr title="Freeze Arrow">FA</abbr></th>
                <th><abbr title="Shock Arrow">SA</abbr></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ chart.notes }}</td>
                <td>{{ chart.freezeArrow }}</td>
                <td>{{ chart.shockArrow }}</td>
              </tr>
            </tbody>
          </table>
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

@Component({ components: { Card, ScoreBadge } })
export default class ChartDetailComponent extends Vue {
  @Prop({ required: true, type: Object })
  readonly song!: Omit<SongInfo, 'charts'>

  @Prop({ required: true, type: Object })
  readonly chart!: StepChart

  loading = true
  scores: UserScore[] = []

  get userScore() {
    return this.scores.find(s => s.userId === this.$accessor.user?.id)
  }

  get chartTitle() {
    const shortPlayStyle = getPlayStyleName(this.chart.playStyle)[0] + 'P' // 'SP' or 'DP'
    return `${shortPlayStyle}-${getDifficultyName(this.chart.difficulty)}`
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
      this.scores = await this.$http.$get<UserScore[]>(
        `/api/v1/scores/${this.song.id}/${playStyle}/${difficulty}${query}`
      )
    } catch {}
    this.loading = false
  }
}
</script>
