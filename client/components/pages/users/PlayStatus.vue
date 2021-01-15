<template>
  <section>
    <card :title="$t('title.radar')" type="is-primary" collapsible>
      <div class="card-content">
        <b-loading v-if="$fetchState.pending" />
        <groove-radar v-else-if="radar" class="radar" :chart="radar" />
        <div v-else class="content has-text-grey has-text-centered">
          <p>{{ $t('noData') }}</p>
        </div>
      </div>
    </card>
    <card :title="$t('title.clear')" type="is-primary" collapsible>
      <div class="card-content">
        <b-loading v-if="$fetchState.pending" />
        <b-carousel
          v-if="clears && clears.length"
          v-model="selected"
          :autoplay="false"
          :arrow-hover="false"
          :indicator-inside="false"
        >
          <b-carousel-item v-for="c in clears" :key="c.level">
            <clear-status :title="c.title" :statuses="c.statuses" />
          </b-carousel-item>
          <template #indicators="props">
            <b-button
              v-if="clears"
              size="is-small"
              :disabled="props.i === selected"
            >
              {{ clears[props.i].title }}
            </b-button>
          </template>
        </b-carousel>
        <div v-else class="content has-text-grey has-text-centered">
          <p>{{ $t('noData') }}</p>
        </div>
      </div>
    </card>
    <card :title="$t('title.score')" type="is-primary" collapsible>
      <div class="card-content">
        <b-loading v-if="$fetchState.pending" />
        <b-carousel
          v-if="scores && scores.length"
          v-model="selected"
          :autoplay="false"
          :arrow-hover="false"
          :indicator-inside="false"
        >
          <b-carousel-item v-for="c in scores" :key="c.level">
            <score-status :title="c.title" :statuses="c.statuses" />
          </b-carousel-item>
          <template #indicators="props">
            <b-button
              v-if="scores"
              size="is-small"
              :disabled="props.i === selected"
            >
              {{ scores[props.i].title }}
            </b-button>
          </template>
        </b-carousel>
        <div v-else class="content has-text-grey has-text-centered">
          <p>{{ $t('noData') }}</p>
        </div>
      </div>
    </card>
  </section>
</template>

<i18n>
{
  "ja": {
    "title": {
      "radar": "グルーブレーダー",
      "clear": "クリア状況",
      "score": "スコア状況"
    },
    "noData": "データがありません"
  },
  "en": {
    "title": {
      "radar": "Groove Radar",
      "clear": "Clear Status",
      "score": "Score Status"
    },
    "noData": "No Data"
  }
}
</i18n>

<script lang="ts">
import type {
  ClearStatus as ClearInfo,
  ScoreStatus as ScoreInfo,
} from '@core/api/user'
import type { GrooveRadar as GrooveRadarInfo } from '@core/db/songs'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { getClearStatus, getGrooveRadar, getScoreStatus } from '~/api/user'
import ClearStatus from '~/components/pages/users/ClearStatus.vue'
import GrooveRadar from '~/components/pages/users/GrooveRadar.vue'
import ScoreStatus from '~/components/pages/users/ScoreStatus.vue'
import Card from '~/components/shared/Card.vue'

type ScoreDoughnutProp = {
  level: number
  title: string
  statuses: Pick<ScoreInfo, 'rank' | 'count'>[]
}
type ClearDoughnutProp = {
  level: number
  title: string
  statuses: Pick<ClearInfo, 'clearLamp' | 'count'>[]
}

@Component({
  components: { Card, ClearStatus, GrooveRadar, ScoreStatus },
  fetchOnServer: false,
})
export default class PlayStatusComponent extends Vue {
  @Prop({ required: true, type: Number })
  readonly playStyle!: 1 | 2

  @Prop({ required: true, type: String })
  readonly userId!: string

  radar: GrooveRadarInfo | null = null
  clears: ClearDoughnutProp[] | null = null
  scores: ScoreDoughnutProp[] | null = null
  selected: number = 0

  async fetch() {
    try {
      const [grooveRadar, clearStatuses, scoreStatuses] = await Promise.all([
        getGrooveRadar(this.$http, this.userId, this.playStyle),
        getClearStatus(this.$http, this.userId, this.playStyle),
        getScoreStatus(this.$http, this.userId, this.playStyle),
      ])

      this.radar = grooveRadar[0] ?? null

      // Summery all level
      const totalClear = clearStatuses.reduce((p, c) => {
        const matched = p.find(d => d.clearLamp === c.clearLamp)
        if (matched) {
          matched.count += c.count
        } else {
          p.push({ ...c, level: 0 })
        }
        return p
      }, [] as ClearInfo[])
      const totalScore = scoreStatuses.reduce((p, c) => {
        const matched = p.find(d => d.rank === c.rank)
        if (matched) {
          matched.count += c.count
        } else {
          p.push({ ...c, level: 0 })
        }
        return p
      }, [] as ScoreInfo[])

      // Group by level
      this.clears = [
        {
          level: 0,
          title: 'ALL',
          statuses: totalClear,
        },
        ...clearStatuses
          .reduce((p, c) => {
            const matched = p.find(d => d.level === c.level)
            if (matched) {
              matched.statuses.push({ clearLamp: c.clearLamp, count: c.count })
            } else {
              p.push({
                level: c.level,
                title: `${c.level}`,
                statuses: [{ clearLamp: c.clearLamp, count: c.count }],
              })
            }
            return p
          }, [] as ClearDoughnutProp[])
          .sort((l, r) => l.level - r.level),
      ]
      this.scores = [
        {
          level: 0,
          title: 'ALL',
          statuses: totalScore,
        },
        ...scoreStatuses
          .reduce((p, c) => {
            const matched = p.find(d => d.level === c.level)
            if (matched) {
              matched.statuses.push({ rank: c.rank, count: c.count })
            } else {
              p.push({
                level: c.level,
                title: `${c.level}`,
                statuses: [{ rank: c.rank, count: c.count }],
              })
            }
            return p
          }, [] as ScoreDoughnutProp[])
          .sort((l, r) => l.level - r.level),
      ]
    } catch {
      this.radar = null
      this.clears = []
      this.scores = []
    }
  }
}
</script>

<style scoped>
.radar {
  max-height: 80vh;
}
</style>
