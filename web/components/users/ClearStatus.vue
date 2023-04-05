<template>
  <OTable
    narrowed
    :data="displayedStatuses"
    :loading="loading"
    :mobile-cards="false"
  >
    <OTableColumn v-slot="props" field="level" label="Lv" numeric sticky>
      {{ props.row.level }}
    </OTableColumn>
    <OTableColumn v-slot="props" field="7" label="MFC" numeric>
      {{ props.row[7] }}
    </OTableColumn>
    <OTableColumn v-slot="props" field="6" label="PFC" numeric>
      {{ props.row[6] }}
    </OTableColumn>
    <OTableColumn v-slot="props" field="5" label="GreatFC" numeric>
      {{ props.row[5] }}
    </OTableColumn>
    <OTableColumn v-slot="props" field="4" label="FC" numeric>
      {{ props.row[4] }}
    </OTableColumn>
    <OTableColumn v-slot="props" field="3" label="Life4" numeric>
      {{ props.row[3] }}
    </OTableColumn>
    <OTableColumn v-slot="props" field="2" label="Clear" numeric>
      {{ props.row[2] }}
    </OTableColumn>
    <OTableColumn v-slot="props" field="1" label="Assisted" numeric>
      {{ props.row[1] }}
    </OTableColumn>
    <OTableColumn v-slot="props" field="0" label="Failed" numeric>
      {{ props.row[0] }}
    </OTableColumn>
    <OTableColumn v-slot="props" field="-1" label="NoPlay" numeric>
      {{ props.row[-1] }}
    </OTableColumn>
  </OTable>
</template>

<script lang="ts" setup>
import type { ClearStatus } from '~~/server/api/v1/users/[id]/clear.get'

interface ClearStatusProps {
  loading?: boolean
  statuses?: Omit<ClearStatus, 'playStyle'>[]
}
type ClearStatusSummary = Pick<ClearStatus, 'level'> & {
  [key in ClearStatus['clearLamp']]: number
}

const prop = withDefaults(defineProps<ClearStatusProps>(), {
  loading: false,
  statuses: () => [],
})
const displayedStatuses = prop.statuses
  .reduce((p, c) => {
    const matched = p.find(d => d.level === c.level)
    if (matched) {
      matched[c.clearLamp] = c.count
    } else {
      const status = {
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
  }, [] as ClearStatusSummary[])
  .sort((l, r) => l.level - r.level)
</script>
