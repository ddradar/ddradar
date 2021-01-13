<template>
  <section>
    <card :title="$t('title.radar')" type="is-primary" collapsible>
      <div class="card-content">
        <groove-radar v-if="radar" class="radar" :chart="radar" />
        <div v-else class="content has-text-grey has-text-centered">
          <p>{{ $t('noData') }}</p>
        </div>
      </div>
    </card>
    <card :title="$t('title.clear')" type="is-primary" collapsible>
      <div class="card-content">
        <div class="table-container">
          <b-table
            :data="clear"
            :loading="$fetchState.pending"
            :mobile-cards="false"
            narrowed
            striped
          >
            <b-table-column v-slot="props" label="Lv">
              {{ props.index + 1 }}
            </b-table-column>
            <b-table-column
              v-for="clear in clearList"
              :key="clear.lamp"
              v-slot="props"
              :label="clear.label"
            >
              {{ props.row[clear.lamp] ? props.row[clear.lamp] : 0 }}
            </b-table-column>

            <template #empty>
              <section class="section">
                <div class="content has-text-grey has-text-centered">
                  <p>{{ $t('noData') }}</p>
                </div>
              </section>
            </template>
          </b-table>
        </div>
      </div>
    </card>
    <card :title="$t('title.score')" type="is-primary" collapsible>
      <div class="card-content">
        <div class="table-container">
          <b-table
            :data="score"
            :loading="$fetchState.pending"
            :mobile-cards="false"
            narrowed
            striped
          >
            <b-table-column v-slot="props" label="Lv">
              {{ props.index + 1 }}
            </b-table-column>
            <b-table-column
              v-for="rank in rankList"
              :key="rank"
              v-slot="props"
              :label="rank"
            >
              {{ props.row[rank] ? props.row[rank] : 0 }}
            </b-table-column>

            <template #empty>
              <section class="section">
                <div class="content has-text-grey has-text-centered">
                  <p>{{ $t('noData') }}</p>
                </div>
              </section>
            </template>
          </b-table>
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
import type { ClearLamp } from '@core/db/scores'
import type { GrooveRadar as GrooveRadarInfo } from '@core/db/songs'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { getClearStatus, getGrooveRadar, getScoreStatus } from '~/api/user'
import GrooveRadar from '~/components/pages/users/GrooveRadar.vue'
import Card from '~/components/shared/Card.vue'

@Component({ components: { Card, GrooveRadar }, fetchOnServer: false })
export default class PlayStatusComponent extends Vue {
  @Prop({ required: true, type: Number })
  readonly playStyle!: 1 | 2

  @Prop({ required: true, type: String })
  readonly userId!: string

  radar: GrooveRadarInfo | null = null
  clear: Record<ClearLamp | -1, number>[] = []
  score: Record<string, number>[] = []

  get clearList() {
    return [
      'MFC',
      'PFC',
      'GreatFC',
      'FC',
      'Life4',
      'Clear',
      'Assisted',
      'Failed',
    ].map((label, i) => ({ label, lamp: 7 - i }))
  }

  get rankList() {
    const arr = ['AA', 'A', 'B', 'C'].flatMap(s => [`${s}+`, s, `${s}-`])
    return ['AAA', ...arr, 'D+', 'D', 'E']
  }

  async fetch() {
    try {
      const [grooveRadar, clearStatuses, scoreStatuses] = await Promise.all([
        getGrooveRadar(this.$http, this.userId, this.playStyle),
        getClearStatus(this.$http, this.userId, this.playStyle),
        getScoreStatus(this.$http, this.userId, this.playStyle),
      ])

      const levels = [...Array(19).keys()] // 0 - 18
      this.radar = grooveRadar[0] ?? null
      this.clear = levels.map(i =>
        clearStatuses
          .filter(c => c.level === i + 1)
          .reduce((prev, curr) => {
            prev[curr.clearLamp] = curr.count
            return prev
          }, {} as Record<ClearLamp | -1, number>)
      )
      this.score = levels.map(i =>
        scoreStatuses
          .filter(c => c.level === i + 1)
          .reduce((prev, curr) => {
            prev[curr.rank] = curr.count
            return prev
          }, {} as Record<string, number>)
      )
    } catch {
      this.radar = null
      this.clear = []
      this.score = []
    }
  }
}
</script>

<style scoped>
.radar {
  max-height: 80vh;
}
</style>
