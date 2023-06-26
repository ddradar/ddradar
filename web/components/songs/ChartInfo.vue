<template>
  <section
    class="column is-half-tablet is-one-third-desktop is-one-quarter-widescreen"
  >
    <ScoreBoard :song-id="songId" :is-course="isCourse" :chart="chart" />
    <CollapsibleCard title="Chart Info" :variant="cardType" collapsible>
      <div class="card-content">
        <div class="content">
          <ul>
            <li><em>Notes</em>: {{ chart.notes }}</li>
            <li><em>Freeze Arrow</em>: {{ chart.freezeArrow }}</li>
            <li><em>Shock Arrow</em>: {{ chart.shockArrow }}</li>
          </ul>
          <ol v-if="isCourse">
            <li
              v-for="o in (chart as CourseInfo['charts'][number]).order"
              :key="o.songId"
            >
              <nuxt-link
                :to="`/songs/${o.songId}#${o.playStyle}-${o.difficulty}`"
              >
                {{ o.songName }}
              </nuxt-link>
              {{ getChartTitle(o) }}
            </li>
          </ol>
        </div>
        <div v-if="!isCourse" class="table-container">
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
                <td>{{ (chart as SongInfo['charts'][number]).stream }}</td>
                <td>{{ (chart as SongInfo['charts'][number]).voltage }}</td>
                <td>{{ (chart as SongInfo['charts'][number]).air }}</td>
                <td>{{ (chart as SongInfo['charts'][number]).freeze }}</td>
                <td>{{ (chart as SongInfo['charts'][number]).chaos }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </CollapsibleCard>
  </section>
</template>

<script lang="ts" setup>
import { difficultyMap } from '@ddradar/core'

import CollapsibleCard from '~~/components/CollapsibleCard.vue'
import ScoreBoard from '~~/components/songs/ScoreBoard.vue'
import type { CourseInfo } from '~~/server/api/v1/courses/[id].get'
import type { SongInfo } from '~~/server/api/v1/songs/[id].get'
import { getChartTitle } from '~~/utils/song'

type Chart = SongInfo['charts'][number] | CourseInfo['charts'][number]

interface ChartInfoProps {
  songId: SongInfo['id']
  chart: Chart
}

const props = defineProps<ChartInfoProps>()

const cardType = computed(() =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  difficultyMap.get(props.chart.difficulty)!.toLowerCase()
)
const isCourse = computed(() =>
  Array.isArray((props.chart as CourseInfo['charts'][number]).order)
)
</script>
