<script lang="ts" setup>
const _route = useRoute('courses-id')
const { data: course } = await useFetch(`/api/v1/courses/${_route.params.id}`)
if (!course.value) throw createError({ statusCode: 404 })

const displayedBPM = computed(() => getDisplayedBPM(course.value!))
const singleCharts = computed(() =>
  course.value!.charts.filter(c => c.playStyle === 1)
)
const doubleCharts = computed(() =>
  course.value!.charts.filter(c => c.playStyle === 2)
)
</script>

<template>
  <UPage>
    <UPageHeader headline="Courses" :title="course!.name">
      <template #description>
        <div>{{ course!.series }}</div>
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
