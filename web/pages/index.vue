<template>
  <section class="section">
    <h2 class="subtitle">曲/譜面を探す</h2>
    <div class="columns is-multiline">
      <section
        v-for="m in menuList"
        :key="m.title"
        class="column is-half-tablet is-one-third-desktop is-one-quarter-widescreen"
      >
        <Card :title="m.title" variant="primary" collapsible>
          <div class="card-content">
            <div class="buttons">
              <NuxtLink
                v-for="i in m.items"
                :key="i.name"
                class="button"
                type="is-text"
                :to="i.to"
              >
                {{ i.name }}
              </NuxtLink>
            </div>
          </div>
        </Card>
      </section>
    </div>
  </section>
</template>

<script lang="ts" setup>
import Card from '~/components/Card.vue'
import { courseSeriesIndexes, seriesNames, shortenSeriesName } from '~/src/song'

const menuList = [
  {
    title: 'コースから探す',
    items: courseSeriesIndexes.flatMap(series =>
      ['NONSTOP', '段位認定'].map((s, i) => ({
        name: `${s} (${shortenSeriesName(seriesNames[series])})`,
        to: `/courses?type=${i + 1}&series=${series}`,
      }))
    ),
  },
]
</script>
