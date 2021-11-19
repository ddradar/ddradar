<template>
  <section>
    <score-board :chart="chart" :info="song" :open="open" />
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
import type { Api, Database } from '@ddradar/core'
import { Song } from '@ddradar/core'
import type { PropType } from '@nuxtjs/composition-api'
import { computed, defineComponent } from '@nuxtjs/composition-api'

import Card from '~/components/shared/Card.vue'
import ScoreBoard from '~/components/shared/ScoreBoard.vue'

export default defineComponent({
  components: { Card, ScoreBoard },
  props: {
    song: {
      type: Object as PropType<Omit<Api.SongInfo, 'charts'>>,
      required: true,
    },
    chart: {
      type: Object as PropType<Database.StepChartSchema>,
      required: true,
    },
    open: { type: Boolean, default: false },
  },
  setup(props) {
    // Computed
    const cardType = computed(
      () =>
        `is-${
          Song.difficultyMap
            .get(props.chart.difficulty)!
            .toLowerCase() as Lowercase<Song.DifficultyName>
        }` as const
    )

    return { cardType }
  },
})
</script>
