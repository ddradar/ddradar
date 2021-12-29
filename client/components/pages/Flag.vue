<template>
  <span>
    <span class="fi" :class="flagIconClass" :title="title" />
    &nbsp;{{ title }}
  </span>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'FlagComponent',
  props: {
    iso: { type: String, required: true },
    title: { type: String, required: true },
  },
  setup(props) {
    // Computed
    const flagIconClass = computed(() => `fi-${props.iso.toLowerCase()}`)

    return { flagIconClass }
  },
})
</script>

<style scoped lang="scss">
$flag-icons-path: '~flag-icons/flags';
$include: jp, us;
@import '~flag-icons/sass/flag-icons';
</style>
