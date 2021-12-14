<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>
    <div class="buttons">
      <b-button
        v-for="level in 19"
        :key="level"
        :to="`/${style}/${level}`"
        type="is-info"
        tag="nuxt-link"
        :disabled="level === selected"
        :outlined="level === selected"
      >
        {{ level }}
      </b-button>
    </div>
    <chart-list :charts="charts" :loading="$fetchState.pending" />
  </section>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  useContext,
  useMeta,
} from '@nuxtjs/composition-api'

import ChartList from '~/components/pages/charts/ChartList.vue'
import { useChartList } from '~/composables/useSongApi'

export default defineComponent({
  name: 'ChartLevelPage',
  fetchOnServer: false,
  components: { ChartList },
  validate({ params }) {
    const level = parseInt(params.level, 10)
    return (
      ['single', 'double'].includes(params.style) &&
      /^\d{1,2}$/.test(params.level) &&
      level >= 1 &&
      level <= 20
    )
  },
  setup() {
    const { params } = useContext()

    // Computed
    const style = computed(() => params.value.style as 'single' | 'double')
    const selected = computed(() => parseInt(params.value.level, 10))
    const title = computed(
      () => `${style.value.toUpperCase()} ${selected.value}`
    )

    // Data
    const { charts } = useChartList(
      style.value === 'double' ? 2 : 1,
      selected.value
    )

    // Lifecycle
    useMeta(() => ({ title: title.value }))

    return { charts, selected, style, title }
  },
  head: {},
})
</script>
