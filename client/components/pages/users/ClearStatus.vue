<template>
  <b-table
    narrowed
    :data="displayedStatuses"
    :loading="loading"
    :mobile-cards="false"
  >
    <b-table-column v-slot="props" field="level" label="Lv" numeric sticky>
      {{ props.row.level }}
    </b-table-column>
    <b-table-column v-slot="props" field="7" label="MFC" numeric>
      {{ props.row[7] }}
    </b-table-column>
    <b-table-column v-slot="props" field="6" label="PFC" numeric>
      {{ props.row[6] }}
    </b-table-column>
    <b-table-column v-slot="props" field="5" label="GreatFC" numeric>
      {{ props.row[5] }}
    </b-table-column>
    <b-table-column v-slot="props" field="4" label="FC" numeric>
      {{ props.row[4] }}
    </b-table-column>
    <b-table-column v-slot="props" field="3" label="Life4" numeric>
      {{ props.row[3] }}
    </b-table-column>
    <b-table-column v-slot="props" field="2" label="Clear" numeric>
      {{ props.row[2] }}
    </b-table-column>
    <b-table-column v-slot="props" field="1" label="Assisted" numeric>
      {{ props.row[1] }}
    </b-table-column>
    <b-table-column v-slot="props" field="0" label="Failed" numeric>
      {{ props.row[0] }}
    </b-table-column>
    <b-table-column v-slot="props" field="-1" label="NoPlay" numeric>
      {{ props.row[-1] }}
    </b-table-column>
  </b-table>
</template>

<script lang="ts">
import type { Api } from '@ddradar/core'
import { Score } from '@ddradar/core'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

type ClearStatus = Pick<Api.ClearStatus, 'level'> &
  { [key in Score.ClearLamp | -1]: number }

@Component
export default class ClearStatusComponent extends Vue {
  @Prop({ type: Boolean, default: false })
  readonly loading!: boolean

  @Prop({ type: Array, default: () => [] })
  readonly statuses!: Omit<Api.ClearStatus, 'playStyle'>[]

  get displayedStatuses(): ClearStatus[] {
    return this.statuses
      .reduce((p, c) => {
        const matched = p.find(d => d.level === c.level)
        if (matched) {
          matched[c.clearLamp] = c.count
        } else {
          const status: ClearStatus = {
            level: c.level,
            '-1': 0,
            '0': 0,
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0,
            '6': 0,
            '7': 0,
          }
          status[c.clearLamp] = c.count
          p.push(status)
        }
        return p
      }, [] as ClearStatus[])
      .sort((l, r) => l.level - r.level)
  }
}
</script>
