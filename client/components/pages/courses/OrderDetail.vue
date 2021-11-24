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
import type { Api, Database } from '@ddradar/core'
import { Song } from '@ddradar/core'
import type { PropType } from '@nuxtjs/composition-api'
import { computed, defineComponent } from '@nuxtjs/composition-api'

import { getChartTitle } from '~/api/song'
import Card from '~/components/shared/Card.vue'
import ScoreBoard from '~/components/shared/ScoreBoard.vue'

const toOrder = (song: Database.ChartOrder) => ({
  id: song.songId,
  name: song.songName,
  chartName: getChartTitle(song),
  to: `/songs/${song.songId}#${song.playStyle}${song.difficulty}` as const,
})

export default defineComponent({
  components: { Card, ScoreBoard },
  props: {
    course: { type: Object as PropType<Api.CourseInfo>, required: true },
    chart: {
      type: Object as PropType<Database.CourseChartSchema>,
      required: true,
    },
  },
  setup(props) {
    // Computed
    const difficultyName = Song.difficultyMap
      .get(props.chart.difficulty)!
      .toLowerCase() as Lowercase<Song.DifficultyName>

    const cardType = computed(() => `is-${difficultyName}` as const)
    const orders = computed(() => props.chart.order.map(toOrder))

    return { cardType, orders }
  },
})
</script>
