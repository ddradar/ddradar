<script lang="ts" setup>
const _route = useRoute('songs-id')
const { data: song } = await useFetch(`/api/v1/songs/${_route.params.id}`)
if (!song.value) throw createError({ statusCode: 404 })

const { clientPrincipal: _auth } = await useEasyAuth()
const isAdmin = computed(
  () => !!_auth.value?.userRoles.includes('administrator')
)

const displayedBPM = computed(() => getDisplayedBPM(song.value!))
const singleCharts = computed(() =>
  song.value?.charts.filter(c => c.playStyle === 1)
)
const doubleCharts = computed(() =>
  song.value?.charts.filter(c => c.playStyle === 2)
)
const headLink = computed(() =>
  isAdmin.value
    ? [
        {
          icon: 'i-heroicons-pencil-square',
          label: '編集',
          to: `/admin/songs/${song.value!.id}`,
        },
      ]
    : []
)
</script>

<template>
  <UPage>
    <UPageHeader headline="Songs" :title="song!.name" :links="headLink">
      <template #description>
        <div>{{ song!.artist }} / {{ song!.series }}</div>
        <div>BPM {{ displayedBPM }}</div>
      </template>
    </UPageHeader>

    <UPageBody>
      <UPageGrid>
        <SongChartInfo
          v-for="(chart, i) in singleCharts"
          :key="i"
          :chart="chart"
        />
      </UPageGrid>
      <UDivider />
      <UPageGrid>
        <SongChartInfo
          v-for="(chart, i) in doubleCharts"
          :key="i"
          :chart="chart"
        />
      </UPageGrid>
    </UPageBody>
  </UPage>
</template>
