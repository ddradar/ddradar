<template>
  <div>
    <section class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">DDRadar</h1>
          <p class="subtitle">DDR Score Tracker</p>
        </div>
      </div>
    </section>
    <section class="section"></section>
  </div>
</template>

<script lang="ts">
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class IndexPage extends Vue {
  async asyncData({ redirect }: Context) {
    await this.$accessor.fetchUser()
    if (!this.$accessor.user) redirect('/profile')
  }
}
</script>
