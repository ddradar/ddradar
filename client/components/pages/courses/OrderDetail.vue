<template>
  <section>
    <card :title="chartTitle" :type="cardType" collapsible>
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
            <b-table-column
              v-slot="props"
              field="name"
              :label="$t('list.name')"
            >
              <nuxt-link
                v-if="!props.row.isArea"
                :to="`/users/${props.row.userId}`"
                class="is-size-7"
              >
                {{ props.row.userName }}
              </nuxt-link>
              <span v-else class="is-size-7">{{ props.row.userName }}</span>
            </b-table-column>
            <b-table-column
              v-slot="props"
              field="score"
              :label="$t('list.score')"
              centered
            >
              <score-badge
                :lamp="props.row.clearLamp"
                :score="props.row.score"
              />
            </b-table-column>
            <b-table-column
              v-slot="props"
              field="exScore"
              :label="$t('list.exScore')"
              numeric
            >
              <span class="is-size-7">{{ props.row.exScore }}</span>
            </b-table-column>

            <template #empty>
              <section class="section">
                <div class="content has-text-grey has-text-centered">
                  <p>{{ $t('list.noData') }}</p>
                </div>
              </section>
            </template>
          </b-table>
        </div>
      </div>
      <footer class="card-footer">
        <a
          v-if="this.$accessor.isLoggedIn"
          class="card-footer-item"
          @click="launchScoreEditor"
        >
          {{ $t('button.edit') }}
        </a>
        <a
          v-if="this.$accessor.isLoggedIn"
          class="card-footer-item"
          @click="launchScoreImporter"
        >
          {{ $t('button.import') }}
        </a>
        <a class="card-footer-item" @click="fetchScores(true)">
          {{ $t('button.all') }}
        </a>
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
          <ol>
            <li v-for="o in orders" :key="o.id">
              <nuxt-link :to="o.to">{{ o.name }}</nuxt-link>
              {{ o.chartName }}
            </li>
          </ol>
        </div>
      </div>
    </card>
  </section>
</template>

<i18n src="../../../i18n/area.json"></i18n>
<i18n>
{
  "ja": {
    "list": {
      "name": "ユーザー名",
      "score": "スコア",
      "exScore": "EX",
      "noData": "データがありません",
      "top": "{area}トップ"
    },
    "button": {
      "edit": "編集",
      "import": "インポート",
      "all": "全件表示"
    },
    "area": {
      "0": "全国"
    }
  },
  "en": {
    "list": {
      "name": "Name",
      "score": "Score",
      "exScore": "EX",
      "noData": "No Data",
      "top": "{area} Top"
    },
    "button": {
      "edit": "Edit",
      "import": "Import",
      "all": "Show All"
    },
    "area": {
      "0": "World"
    }
  }
}
</i18n>

<script lang="ts">
import type { CourseInfo } from '@core/api/course'
import type { CourseChartSchema } from '@core/db/songs'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { getChartScore, UserScore } from '~/api/score'
import { getDifficultyName, getPlayStyleName } from '~/api/song'
import { areaList } from '~/api/user'
import ScoreEditor from '~/components/modal/ScoreEditor.vue'
import ScoreImporter from '~/components/modal/ScoreImporter.vue'
import Card from '~/components/shared/Card.vue'
import ScoreBadge from '~/components/shared/ScoreBadge.vue'

type RankingScore = UserScore & { isArea?: true }

@Component({ components: { Card, ScoreBadge } })
export default class OrderDetailComponent extends Vue {
  @Prop({ required: true, type: Object })
  readonly course!: CourseInfo

  @Prop({ required: true, type: Object })
  readonly chart!: CourseChartSchema

  loading = true
  scores: RankingScore[] = []

  get userScore() {
    return this.scores.find(s => s.userId === this.$accessor.user?.id)
  }

  get chartTitle() {
    return this.getChartTitle(
      this.chart.playStyle,
      this.chart.difficulty,
      this.chart.level
    )
  }

  get cardType() {
    return `is-${getDifficultyName(this.chart.difficulty).toLowerCase()}`
  }

  get orders() {
    return this.chart.order.map(s => ({
      id: s.songId,
      name: s.songName,
      chartName: this.getChartTitle(s.playStyle, s.difficulty, s.level),
      to: `/songs/${s.songId}/${s.playStyle}${s.difficulty}`,
    }))
  }

  get isLoggedIn() {
    return !!this.$accessor.user
  }

  private getChartTitle(playStyle: number, difficulty: number, level: number) {
    const shortPlayStyle = getPlayStyleName(playStyle)[0] + 'P' // 'SP' or 'DP'
    const difficultyName = getDifficultyName(difficulty)
    return `${shortPlayStyle}-${difficultyName} (${level})`
  }

  async fetch() {
    await this.fetchScores()
  }

  launchScoreEditor() {
    this.$buefy.modal
      .open({
        parent: this,
        component: ScoreEditor,
        props: {
          songId: this.course.id,
          playStyle: this.chart.playStyle,
          difficulty: this.chart.difficulty,
          songData: this.course,
        },
        hasModalCard: true,
        trapFocus: true,
      })
      .$on('close', async () => await this.fetchScores())
  }

  launchScoreImporter() {
    this.$buefy.modal
      .open({
        parent: this,
        component: ScoreImporter,
        props: {
          songId: this.course.id,
          playStyle: this.chart.playStyle,
          difficulty: this.chart.difficulty,
          isCourse: true,
        },
        hasModalCard: true,
        trapFocus: true,
      })
      .$on('close', async () => await this.fetchScores())
  }

  /** Call Get Chart Score API */
  async fetchScores(fetchAllData: boolean = false) {
    this.loading = true
    try {
      const scores = await getChartScore(
        this.$http,
        this.course.id,
        this.chart.playStyle,
        this.chart.difficulty,
        fetchAllData ? 'full' : 'medium'
      )
      this.scores = scores.map(s => {
        const id = parseInt(s.userId, 10)
        if (!isNaN(id) && (areaList as number[]).includes(id)) {
          return {
            ...s,
            isArea: true,
            userName: this.$t('list.top', {
              area: this.$t(`area.${id}`),
            }) as string,
          }
        }
        return s
      })
    } catch {}
    this.loading = false
  }
}
</script>
