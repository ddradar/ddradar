<template>
  <div>
    <section class="hero is-warning">
      <div class="hero-body">
        <div class="container">
          <h1 v-if="statusCode === 404" class="title">
            <b-icon icon="alert" />
            {{ $t('notFound') }}
          </h1>
          <h1 v-else class="title">{{ $t('otherError') }}{{ statusCode }}</h1>
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
        <nuxt-link to="/"><b-icon icon="home" />{{ $t('home') }}</nuxt-link>
      </div>
    </section>
    <footer class="footer">
      <div class="content has-text-centered">
        <i18n path="content.text" tag="p">
          <template #twitter>
            <a href="https://twitter.com/nogic1008" target="_blank">
              {{ $t('content.text_twitter') }}
            </a>
          </template>
          <template #github>
            <a href="https://github.com/ddradar/ddradar/issues" target="_blank">
              {{ $t('content.text_github') }}
            </a>
          </template>
        </i18n>
      </div>
    </footer>
  </div>
</template>

<i18n>
{
  "ja": {
    "notFound": "ページが見つかりません",
    "otherError": "エラーが発生しました: ",
    "home": "トップページに戻る",
    "content": {
      "text": "このエラーが頻発する場合は、お手数ですが、{twitter}または{github}にてご報告ください。",
      "text_twitter": "作者のTwitter",
      "text_github": "GitHubのissue"
    }
  },
  "en": {
    "notFound": "Not Found",
    "otherError": "Error: ",
    "home": "Back to Home",
    "content": {
      "text": "If this error occurs frequently, please report it on {twitter} or {github}.",
      "text_twitter": "Twitter",
      "text_github": "GitHub"
    }
  }
}
</i18n>

<script lang="ts">
import type { NuxtError } from '@nuxt/types'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component({ layout: 'empty' })
export default class ErrorPage extends Vue {
  @Prop({ type: Object, default: null })
  readonly error!: NuxtError | null

  get statusCode() {
    return this.error?.statusCode ?? 500
  }

  get path() {
    return this.error?.path ?? ''
  }

  get message() {
    return this.error?.message ?? ''
  }
}
</script>
