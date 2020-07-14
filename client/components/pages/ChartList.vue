<template>
  <b-table
    :data="charts"
    striped
    :loading="loading"
    :mobile-cards="false"
    paginated
    per-page="50"
  >
    <template slot-scope="props">
      <b-table-column field="series" label="Series">
        {{ shortenSeries(props.row.series) }}
      </b-table-column>
      <b-table-column field="name" label="Name">
        <nuxt-link
          :to="`/songs/${props.row.id}/${props.row.playStyle}${props.row.difficulty}`"
        >
          {{ props.row.name }}
        </nuxt-link>
      </b-table-column>
      <b-table-column field="difficulty" label="Difficulty">
        <b-taglist attached>
          <b-tag type="is-dark" size="is-medium">
            {{ getPlayStyle(props.row.playStyle) }}
          </b-tag>
          <b-tag :type="getTagClass(props.row.difficulty)" size="is-medium">
            {{ getDifficulty(props.row.difficulty) }}
          </b-tag>
        </b-taglist>
      </b-table-column>
      <b-table-column field="level" label="Lv" numeric>
        {{ props.row.level }}
      </b-table-column>
      <b-table-column field="level" label="Edit">
        <a
          @click="
            scoreEditorModal(
              props.row.id,
              props.row.playStyle,
              props.row.difficulty
            )
          "
        >
          <b-icon icon="pencil-box-outline" />
        </a>
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
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import ScoreEditor from '~/components/pages/ScoreEditor.vue'
import {
  ChartInfo,
  getDifficultyName,
  getPlayStyleName,
  shortenSeriesName,
} from '~/types/api/song'

@Component
export default class ChartListComponent extends Vue {
  @Prop({ required: false, type: Array, default: () => [] })
  charts!: ChartInfo[]

  @Prop({ required: false, type: Boolean, default: false })
  loading!: boolean

  shortenSeries(series: string) {
    return shortenSeriesName(series)
  }

  getPlayStyle(playStyle: number) {
    return getPlayStyleName(playStyle)
  }

  getDifficulty(difficulty: number) {
    return getDifficultyName(difficulty)
  }

  getTagClass(difficulty: number) {
    return `is-${getDifficultyName(difficulty).toLowerCase()}`
  }

  scoreEditorModal(songId: string, playStyle: number, difficulty: number) {
    this.$buefy.modal.open({
      parent: this,
      component: ScoreEditor,
      props: { songId, playStyle, difficulty },
      trapFocus: true,
    })
  }
}
</script>
