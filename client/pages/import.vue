<template>
  <section class="section">
    <h1 class="title">スコアのインポート</h1>
    <h2 class="subtitle">e-amusementサイトからインポート</h2>
    <div class="content">
      <p>
        公式サイトの
        <a
          href="https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_single.html"
          target="_blank"
        >
          「楽曲データ一覧」ページ
        </a>
        より、スコアを取得します。<wbr />
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
      <b-progress
        v-if="loading"
        type="is-success"
        :value="doneCount"
        :max="maxCount"
        show-value
      >
        {{ message }}
      </b-progress>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { postSongScores } from '~/api/score'
import { musicDataToScoreList } from '~/utils/eagate-parser'
import * as popup from '~/utils/popup'

@Component
export default class ImportPage extends Vue {
  /**
   * HTML source for e-amusement GATE site as below
   * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_single.html
   * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_double.html
   */
  sourceCode = ''

  loading = false

  maxCount = 0

  doneCount = 0

  currentSong = ''

  get message() {
    return `Uploading: ${this.currentSong} (${this.doneCount}/${this.maxCount})`
  }

  /** Call Import Scores from e-amusement GATE API */
  async importEageteScores() {
    this.loading = true
    this.maxCount = 0
    this.doneCount = 0

    let scoreList: ReturnType<typeof musicDataToScoreList>
    try {
      scoreList = musicDataToScoreList(this.sourceCode)
    } catch {
      popup.warning(this.$buefy, 'HTMLソース文字列が不正です')
      this.loading = false
      return
    }

    this.maxCount = Object.keys(scoreList).length

    for (const songId in scoreList) {
      const scores = scoreList[songId]
      try {
        if (scores && scores.length > 0) {
          this.currentSong = scores[0].songName
          await postSongScores(this.$http, songId, scores)
        }
        this.doneCount++
      } catch (error) {
        popup.danger(this.$buefy, error.message ?? error)
        this.maxCount = 0
        this.doneCount = 0
        this.currentSong = ''
        this.loading = false
        return
      }
    }

    popup.success(this.$buefy, `${this.doneCount}件のスコアを登録しました`)
    this.maxCount = 0
    this.doneCount = 0
    this.currentSong = ''
    this.loading = false
  }
}
</script>
