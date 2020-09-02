<template>
  <span>
    <span
      v-if="iso"
      class="flag-icon"
      :class="flagIconClass"
      :title="title"
    />&nbsp;{{ title }}
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class FlagComponent extends Vue {
  @Prop({ type: String, required: true })
  readonly iso!: string

  @Prop({ type: String, required: true })
  readonly title!: string

  get flagIconClass() {
    return `flag-icon-${this.iso.toLowerCase()}`
  }
}
</script>

<style scoped src="flag-icon-css/css/flag-icon.min.css"></style>
