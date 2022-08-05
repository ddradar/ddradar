<template>
  <section
    class="column is-half-tablet is-one-third-desktop is-one-quarter-widescreen"
  >
    <Card title="Chart Info" :variant="cardType" collapsible>
      <div class="card-content">
        <div class="content">
          <ul>
            <li><em>Notes</em>: {{ chart.notes }}</li>
            <li><em>Freeze Arrow</em>: {{ chart.freezeArrow }}</li>
            <li><em>Shock Arrow</em>: {{ chart.shockArrow }}</li>
          </ul>
          <ol v-if="isCourse(chart)">
            <li v-for="o in chart.order" :key="o.songId">
              <nuxt-link
                :to="`/songs/${o.songId}#${o.playStyle}-${o.difficulty}`"
              >
                {{ o.songName }}
              </nuxt-link>
              {{ getChartTitle(o) }}
            </li>
          </ol>
        </div>
        <div v-if="!isCourse(chart)" class="table-container">
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
    </Card>
  </section>
</template>

<script lang="ts" setup>
import { Song } from '@ddradar/core'
import { computed } from 'vue'

import Card from '~/components/Card.vue'
import type { CourseInfo } from '~/server/api/v1/courses/[id].get'
import type { SongInfo } from '~/server/api/v1/songs/[id].get'
import { difficultyMap, getChartTitle } from '~/src/song'

type CourseChart = CourseInfo['charts'][number]
type Chart = SongInfo['charts'][number] | CourseChart

interface ChartInfoProps {
  chart: Chart
}

const props = defineProps<ChartInfoProps>()

const cardType = computed(
  () =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    difficultyMap
      .get(props.chart.difficulty)!
      .toLowerCase() as Lowercase<Song.DifficultyName>
)

const isCourse = (chart: Chart): chart is CourseChart =>
  Array.isArray((chart as CourseChart).order)
</script>
