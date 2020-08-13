<template>
  <section>
    <b-message
      :type="type"
      :title="title"
      has-icon
      :icon="icon"
      aria-close-label="Close message"
    >
      <p>{{ body }}</p>
      <div class="content is-italic has-text-weight-light has-text-right">
        {{ date }}
      </div>
    </b-message>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class TopMessageComponent extends Vue {
  @Prop({ required: true, type: String })
  type!: string

  @Prop({ required: false, type: String, default: null })
  icon!: string | null

  @Prop({ required: true, type: String })
  title!: string

  @Prop({ required: true, type: String })
  body!: string

  @Prop({ required: true, type: Number })
  time!: number

  get date() {
    const d = new Date(this.time * 1000)
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
  }
}
</script>

<style scoped>
section {
  padding: 0.75rem 0.75rem 0 0.75rem;
}
</style>
