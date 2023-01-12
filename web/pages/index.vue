<template>
  <section class="section">
    <h2 class="subtitle">曲/譜面を探す</h2>
    <div class="columns is-multiline">
      <section
        v-for="m in menuList"
        :key="m.title"
        class="column is-half-tablet is-one-third-desktop is-one-quarter-widescreen"
      >
        <CollapsibleCard :title="m.title" variant="primary" collapsible>
          <div class="card-content">
            <div class="buttons">
              <NuxtLink
                v-for="i in m.items"
                :key="i.name"
                class="button is-text"
                :to="i.to"
              >
                {{ i.name }}
              </NuxtLink>
            </div>
          </div>
        </CollapsibleCard>
      </section>
    </div>
  </section>
</template>

<script lang="ts" setup>
import CollapsibleCard from '~/components/CollapsibleCard.vue'
import {
  courseSeriesIndexes,
  levels,
  nameIndexMap,
  seriesNames,
  shortenSeriesName,
} from '~/src/song'

const menuList = [
  {
    title: '曲名から探す',
    items: [...nameIndexMap.entries()].map(([i, name]) => ({
      name,
      to: `/songs?name=${i}`,
    })),
  },
  {
    title: 'シリーズから探す',
    items: seriesNames.map((s, i) => ({
      name: shortenSeriesName(s),
      to: `/songs?series=${i}`,
    })),
  },
  {
    title: 'レベルから探す(SINGLE)',
    items: levels.map(name => ({
      name,
      to: `/charts?style=1&level=${name}`,
    })),
  },
  {
    title: 'レベルから探す(DOUBLE)',
    items: levels.map(name => ({
      name,
      to: `/charts?style=2&level=${name}`,
    })),
  },
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
