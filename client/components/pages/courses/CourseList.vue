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
      <b-table-column field="series" :label="$t('series')">
        {{ props.row.series }}
      </b-table-column>
      <b-table-column field="name" :label="$t('name')">
        <nuxt-link :to="`/courses/${props.row.id}`">
          {{ props.row.name }}
        </nuxt-link>
      </b-table-column>
      <b-table-column field="type" :label="$t('type')">
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
          <p>{{ $t('noData') }}</p>
        </div>
      </section>
    </template>
  </b-table>
</template>

<i18n>
{
  "ja": {
    "series": "バージョン",
    "name": "名称",
    "type": "タイプ",
    "nonstop": "NONSTOP",
    "grade": "段位認定",
    "noData": "データがありません"
  },
  "en": {
    "series": "Series",
    "name": "Name",
    "type": "Type",
    "nonstop": "NONSTOP",
    "grade": "GRADE",
    "noData": "No Data"
  }
}
</i18n>

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
      type: c.charts.length > 1 ? this.$t('nonstop') : this.$t('grade'),
    }))
  }
}
</script>
