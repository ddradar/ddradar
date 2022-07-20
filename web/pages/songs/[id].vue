<template>
  <section v-if="song" class="section">
    <h1 class="title">{{ song.name }}</h1>
    <h2 class="subtitle">{{ song.artist }} / {{ song.series }}</h2>
    <h2 class="subtitle">BPM {{ displayedBPM }}</h2>
    <div v-if="isAdmin" class="buttons">
      <o-button
        variant="info"
        icon-left="pencil-box"
        tag="nuxt-link"
        :to="`/admin/song/${song.id}`"
      >
        編集
      </o-button>
    </div>
    <div class="content columns is-multiline">
      <ChartInfo v-for="(chart, i) in singleCharts" :key="i" :chart="chart" />
    </div>
    <div class="content columns is-multiline">
      <ChartInfo v-for="(chart, i) in doubleCharts" :key="i" :chart="chart" />
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useFetch, useRoute } from '#app'
import useAuth from '~/composables/useAuth'
import type { SongInfo } from '~/server/api/v1/songs/[id].get'
import { getDisplayedBPM } from '~/src/song'

const route = useRoute()
const { isAdmin } = await useAuth()
const { data: song } = await useFetch<SongInfo>(
  `/api/v1/songs/${route.params.id}`
)

const displayedBPM = computed(() => getDisplayedBPM(song.value))
const singleCharts = computed(() =>
  song.value.charts.filter(c => c.playStyle === 1)
)
const doubleCharts = computed(() =>
  song.value.charts.filter(c => c.playStyle === 2)
)
</script>
