<template>
  <b-collapse
    v-if="collapsible"
    class="card"
    animation="slide"
    :aria-id="title"
    :open="open"
  >
    <template #trigger>
      <header
        class="card-header"
        :class="type"
        role="button"
        :aria-controls="title"
      >
        <div class="card-header-title">{{ title }}</div>
        <a class="card-header-icon">
          <b-icon :icon="icon" />
        </a>
      </header>
    </template>
    <slot />
  </b-collapse>
  <div v-else class="card" animation="slide" :aria-id="title">
    <header class="card-header" :class="type" :aria-controls="title">
      <div class="card-header-title">{{ title }}</div>
    </header>
    <slot />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'CardComponent',
  props: {
    title: { type: String, required: true },
    type: { type: String, required: true },
    collapsible: { type: Boolean, default: false },
    open: { type: Boolean, default: false },
  },
  setup(props) {
    // Computed
    const icon = computed(() => (props.open ? 'menu-down' : 'menu-up'))

    return { icon }
  },
})
</script>

<style lang="scss" scoped>
@import '~/assets/css/_colors';

.card {
  .card-header {
    @each $type, $color in $colors {
      &.is-#{$type} {
        background-color: nth($color, 1);
        .card-header-title,
        .card-header-icon {
          color: nth($color, 2);
        }
      }
    }
  }
}
</style>
