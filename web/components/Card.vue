<template>
  <o-collapse
    v-if="collapsible"
    v-model:open="openState"
    class="card"
    animation="slide"
    :aria-id="title"
  >
    <template #trigger>
      <header
        class="card-header"
        :class="color"
        role="button"
        :aria-controls="title"
      >
        <div class="card-header-title">{{ title }}</div>
        <a class="card-header-icon"><o-icon :icon="icon" /></a>
      </header>
    </template>
    <slot />
  </o-collapse>
  <div v-else class="card" animation="slide" :aria-id="title">
    <header class="card-header" :class="color" :aria-controls="title">
      <div class="card-header-title">{{ title }}</div>
    </header>
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

export interface CardProps {
  /** Card title */
  title: string
  /** Card color */
  variant: string
  /** Collapsible card or not */
  collapsible?: boolean
  /** Card is opened or not (only affects collapsible card) */
  open?: boolean
}

const props = withDefaults(defineProps<CardProps>(), {
  collapsible: false,
  open: false,
})
const openState = ref(props.open)
const icon = computed(() => (openState.value ? 'menu-up' : 'menu-down'))
const color = computed(() => `is-${props.variant}`)
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
