<template>
  <b-collapse
    v-if="collapsible"
    class="card"
    animation="slide"
    :aria-id="title"
  >
    <template v-slot:trigger="props">
      <header
        class="card-header"
        :class="type"
        role="button"
        :aria-controls="title"
      >
        <h2 class="card-header-title">{{ title }}</h2>
        <a class="card-header-icon">
          <b-icon :icon="props.open ? 'menu-down' : 'menu-up'" />
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
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class CardComponent extends Vue {
  @Prop({ required: true, type: String })
  readonly title!: string

  @Prop({ required: true, type: String })
  readonly type!: string

  @Prop({ required: false, type: Boolean, default: false })
  readonly collapsible!: boolean
}
</script>

<style lang="scss" scoped>
@import '~/assets/css/styles.scss';

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
