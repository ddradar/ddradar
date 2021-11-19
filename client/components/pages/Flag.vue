<template>
  <span>
    <span class="flag-icon" :class="flagIconClass" :title="title" />
    &nbsp;{{ title }}
  </span>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    iso: { type: String, required: true },
    title: { type: String, required: true },
  },
  setup(props) {
    // Computed
    const flagIconClass = computed(() => `flag-icon-${props.iso.toLowerCase()}`)

    return { flagIconClass }
  },
})
</script>

<style scoped lang="scss">
$flag-icons-path: '~flag-icon-css/flags';
$include: jp, us;
@import '~flag-icon-css/sass/flag-icons';
</style>
