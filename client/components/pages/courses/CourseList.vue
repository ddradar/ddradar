<template>
  <b-table
    :data="displayedCourses"
    striped
    :loading="loading"
    :mobile-cards="false"
    paginated
    per-page="50"
  >
    <template v-slot="props">
      <b-table-column field="series" label="Series">
        {{ props.row.series }}
      </b-table-column>
      <b-table-column field="name" label="Name">
        <nuxt-link :to="`/courses/${props.row.id}`">
          {{ props.row.name }}
        </nuxt-link>
      </b-table-column>
      <b-table-column field="type" label="Type">
        {{ props.row.type }}
      </b-table-column>
    </template>

    <template v-slot:empty>
      <section v-if="loading" class="section">
        <b-skeleton animated />
        <b-skeleton animated />
        <b-skeleton animated />
      </section>
      <section v-else class="section">
        <div class="content has-text-grey has-text-centered">
          <p>Nothing here.</p>
        </div>
      </section>
    </template>
  </b-table>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { CourseList } from '~/api/course'
import { getPlayStyleName, shortenSeriesName } from '~/api/song'

@Component
export default class CourseListComponent extends Vue {
  @Prop({ type: Array, required: false, default: () => [] })
  readonly courses!: CourseList[]

  @Prop({ type: Boolean, required: false, default: false })
  readonly loading!: boolean

  get displayedCourses() {
    return this.courses.map(c => ({
      id: c.id,
      name:
        c.charts.length > 1
          ? c.name
          : `${c.name}(${getPlayStyleName(c.charts[0].playStyle)})`,
      series: shortenSeriesName(c.series),
      type: c.charts.length > 1 ? 'NONSTOP' : '段位認定',
    }))
  }
}
</script>
