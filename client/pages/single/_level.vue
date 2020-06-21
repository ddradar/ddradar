<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>
    <b-table
      :data="charts"
      striped
      hoverable
      focusable
      :mobile-cards="false"
      paginated
      per-page="50"
    >
      <template slot-scope="props">
        <b-table-column field="series" label="Series">
          {{ props.row.series }}
        </b-table-column>
        <b-table-column field="name" label="Name">
          <nuxt-link
            :to="`/songs/${props.row.id}/${props.row.playStyle}${props.row.difficulty}`"
          >
            {{ props.row.name }}
          </nuxt-link>
        </b-table-column>
        <b-table-column field="difficulty" label="Difficulty">
          {{ props.row.difficulty }}
        </b-table-column>
      </template>

      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>Nothing here.</p>
          </div>
        </section>
      </template>
    </b-table>
  </section>
</template>

<script lang="ts">
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import { ChartInfo } from '~/types/api/song'

@Component
export default class SingleLevelPage extends Vue {
  /** Chart list */
  charts: ChartInfo[] = []

  /** level expected [1-20] */
  validate({ params }: Pick<Context, 'params'>) {
    const level = parseInt(params.level, 10)
    return /^\d{1,2}$/.test(params.level) && level >= 1 && level <= 20
  }

  /** Get chart list from API */
  async fetch() {
    const i = this.$route.params.level
    const charts = await this.$http.$get<ChartInfo[]>(`/charts/1/${i}`)
    this.charts = charts
  }

  /** Page title */
  get title() {
    return `SINGLE ${this.$route.params.level}`
  }
}
</script>
