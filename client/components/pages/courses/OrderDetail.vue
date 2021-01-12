<template>
  <section>
    <score-board :chart="chart" :info="course" />
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

<script lang="ts">
import type { CourseInfo } from '@core/api/course'
import { CourseChartSchema, difficultyMap } from '@core/db/songs'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { getChartTitle } from '~/api/song'
import Card from '~/components/shared/Card.vue'
import ScoreBoard from '~/components/shared/ScoreBoard.vue'

@Component({ components: { Card, ScoreBoard } })
export default class OrderDetailComponent extends Vue {
  @Prop({ required: true, type: Object })
  readonly course!: CourseInfo

  @Prop({ required: true, type: Object })
  readonly chart!: CourseChartSchema

  get cardType() {
    return `is-${difficultyMap.get(this.chart.difficulty)!.toLowerCase()}`
  }

  get orders() {
    return this.chart.order.map(s => ({
      id: s.songId,
      name: s.songName,
      chartName: getChartTitle(s),
      to: `/songs/${s.songId}/${s.playStyle}${s.difficulty}`,
    }))
  }
}
</script>
