<template>
  <section class="section">
    <h1 class="title">スコアのインポート</h1>
    <h2 class="subtitle">e-amusementサイトからインポート</h2>
    <div class="content">
      <p>
        公式サイトの「楽曲データ一覧」ページより、スコアを取得します。<wbr />
        <strong>
          公式サイトでのスコア閲覧には、ベーシックコースへの加入が必要です。
        </strong>
      </p>
      <b-field label="HTMLソース">
        <b-input v-model="sourceCode" type="textarea" required />
      </b-field>
      <b-field>
        <b-button
          type="is-success"
          :disabled="!sourceCode"
          :loading="loading"
          @click="importEageteScores()"
        >
          登録
        </b-button>
      </b-field>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { importEagateScoreList } from '~/api/score'
import * as notification from '~/utils/notification'

@Component
export default class ImportPage extends Vue {
  /**
   * HTML source for e-amusement GATE site as below
   * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_single.html
   * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_double.html
   */
  sourceCode = ''

  loading = false

  /** Call Import Scores from e-amusement GATE API */
  async importEageteScores() {
    this.loading = true
    try {
      const res = await importEagateScoreList(this.$http, this.sourceCode)
      notification.success(this.$buefy, `${res.count}件のスコアを登録しました`)
    } catch (error) {
      const message = error.message ?? error
      if (message === '400') {
        notification.warning(this.$buefy, 'HTMLソース文字列が不正です')
      } else {
        notification.danger(this.$buefy, message)
      }
    }
    this.loading = false
  }
}
</script>
