<template>
  <section>
    <section class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">DDRadar</h1>
          <p class="subtitle">{{ t('subtitle') }}</p>
        </div>
      </div>
    </section>

    <section class="section">
      <template v-if="loading">
        <OSkeleton animated />
        <OSkeleton animated />
        <OSkeleton animated />
      </template>
      <template v-else-if="messages">
        <ONotification
          v-for="(m, i) in messages"
          :key="i"
          closable
          :icon="m.icon"
          :variant="m.type"
        >
          <h2>{{ m.title }}</h2>
          <!--eslint-disable-next-line vue/no-v-html-->
          <div v-html="markdownToHTML(m.body)"></div>
          <div>{{ unixTimeToString(m.timeStamp) }}</div>
        </ONotification>
      </template>
    </section>

    <section class="section">
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
  </section>
</template>

<i18n lang="json">
{
  "ja": {
    "old_notification": "過去のお知らせ一覧",
    "subtitle": "DDR Score Tracker",
    "search": {
      "name": "曲名から探す",
      "series": "バージョンから探す",
      "level": "レベルから探す({style})",
      "course": "コースから探す"
    },
    "grade": "段位認定({series})",
    "nonstop": "NONSTOP({series})"
  },
  "en": {
    "old_notification": "Old Notification",
    "subtitle": "DDR Score Tracker",
    "search": {
      "name": "Choose by Name",
      "series": "Choose by Version",
      "level": "Choose by LV ({style})",
      "course": "Choose by Courses"
    },
    "grade": "GRADE({series})",
    "nonstop": "NONSTOP({series})"
  }
}
</i18n>

<script lang="ts" setup>
import { nameIndexMap } from '@ddradar/core'
import { useI18n } from 'vue-i18n'

import CollapsibleCard from '~~/components/CollapsibleCard.vue'
import { markdownToHTML, unixTimeToString } from '~~/utils/format'
import {
  courseSeriesIndexes,
  levels,
  seriesNames,
  shortenSeriesName,
} from '~~/utils/song'

const { t } = useI18n()
const { data: messages, pending: loading } = await useLazyFetch(
  '/api/v1/notification',
  { query: { scope: 'top' } }
)

const menuList = [
  {
    title: t('search.name'),
    items: [...nameIndexMap.entries()].map(([i, name]) => ({
      name,
      to: `/songs?name=${i}`,
    })),
  },
  {
    title: t('search.series'),
    items: seriesNames.map((s, i) => ({
      name: shortenSeriesName(s),
      to: `/songs?series=${i}`,
    })),
  },
  ...['SINGLE', 'DOUBLE'].map((style, i) => ({
    title: t('search.level', { style }),
    items: levels.map(name => ({
      name,
      to: `/charts?style=${i + 1}&level=${name}`,
    })),
  })),
  {
    title: t('search.course'),
    items: courseSeriesIndexes.flatMap(series =>
      ['nonstop', 'grade'].map((s, i) => ({
        name: t(s, { series: shortenSeriesName(seriesNames[series]) }),
        to: `/courses?type=${i + 1}&series=${series}`,
      }))
    ),
  },
]
</script>
