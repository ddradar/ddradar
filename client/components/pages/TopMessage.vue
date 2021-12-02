<template>
  <section>
    <b-message
      :type="type"
      :title="title"
      has-icon
      :icon="icon"
      aria-close-label="Close message"
    >
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="content" v-html="markedContent" />
      <div class="content is-italic has-text-weight-light has-text-right">
        {{ date }}
      </div>
    </b-message>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'
import { marked } from 'marked'

import { unixTimeToString } from '~/utils/date'

export default defineComponent({
  props: {
    type: { type: String, required: true },
    icon: { type: String, default: null },
    title: { type: String, required: true },
    body: { type: String, required: true },
    time: { type: Number, required: true },
  },
  setup(props) {
    // Computed
    const date = computed(() => unixTimeToString(props.time))
    const markedContent = computed(() => marked.parse(props.body))

    return { date, markedContent }
  },
})
</script>

<style scoped>
section {
  padding: 0.75rem 0.75rem 0 0.75rem;
}
</style>
