<template>
  <div>
    <section class="hero is-warning">
      <div class="hero-body">
        <div class="container">
          <h1 v-if="statusCode === 404" class="title">
            <b-icon icon="alert" />
            ページが見つかりません
          </h1>
          <h1 v-else class="title">エラーが発生しました: {{ statusCode }}</h1>
          <h2 class="subtitle">{{ path }}</h2>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container content">
        <blockquote>{{ message }}</blockquote>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <nuxt-link to="/"><b-icon icon="home" />Back to Home</nuxt-link>
      </div>
    </section>
    <footer class="footer">
      <div class="content has-text-centered">
        <p>
          このエラーが頻発する場合は、お手数ですが、
          <a href="https://twitter.com/nogic1008" target="_blank">
            作者のTwitter
          </a>
          または
          <a href="https://github.com/ddradar/ddradar/issues" target="_blank">
            Githubのissue
          </a>
          にてご報告ください。
        </p>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { NuxtError } from '@nuxt/types'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component({ layout: 'empty' })
export default class ErrorPage extends Vue {
  @Prop({ type: Object, default: null })
  readonly error!: NuxtError | null

  get statusCode() {
    return this.error ? this.error.statusCode : 500
  }

  get path() {
    return this.error ? this.error.path : ''
  }

  get message() {
    return this.error ? this.error.message : ''
  }
}
</script>
