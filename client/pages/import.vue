<template>
  <section class="section">
    <h1 class="title">{{ $t('title') }}</h1>
    <h2 class="subtitle">{{ $t('subtitle.eagate') }}</h2>
    <div class="content">
      <p>
        <i18n path="content.eagate.text_1">
          <a
            href="https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_single.html"
            target="_blank"
          >
            {{ $t('content.eagate.text_1_0') }}
          </a>
        </i18n>
        <wbr />
        <strong>{{ $t('content.eagate.text_2') }}</strong>
      </p>
      <b-field :label="$t('field.eagate')">
        <b-input v-model="sourceCode" type="textarea" required />
      </b-field>
      <b-field>
        <b-button
          type="is-success"
          :disabled="!sourceCode"
          :loading="loading"
          @click="importEageteScores()"
        >
          {{ $t('submit') }}
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

<i18n>
{
  "ja": {
    "title": "スコアのインポート",
    "subtitle": {
      "eagate": "e-amusementサイトからインポート"
    },
    "content": {
      "eagate": {
        "text_1": "公式サイトの{0}より、スコアを取得します。",
        "text_1_0": "「楽曲データ一覧」ページ",
        "text_2": "公式サイトでのスコア閲覧には、ベーシックコースへの加入が必要です。"
      }
    },
    "field": {
      "eagate": "HTMLソース"
    },
    "submit": "登録",
    "progress": "登録中: {song} ({done}/{max})",
    "popup": {
      "invalidHTML": "HTMLソース文字列が不正です",
      "success": "{n}件のスコアを登録しました"
    }
  },
  "en": {
    "title": "Import Scores",
    "subtitle": {
      "eagate": "Import from e-amusement GATE"
    },
    "content": {
      "eagate": {
        "text_1": "Get scores from {0}.",
        "text_1_0": "\"Music List\" page",
        "text_2": "You need to subscribe \"e-amusement Basic Course\" to see scores."
      }
    },
    "field": {
      "eagate": "HTML Sourse"
    },
    "submit": "Submit",
    "progress": "Uploading: {song} ({done}/{max})",
    "popup": {
      "invalidHTML": "Invalid HTML",
      "success": "Uploaded: {n} song | Uploaded: {n} songs"
    }
  }
}
</i18n>

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
    return this.$t('progress', {
      song: this.currentSong,
      done: this.doneCount,
      max: this.maxCount,
    })
  }

  /** Convert sourseCode to Scores and call Post Song Scores API */
  async importEageteScores() {
    this.loading = true
    this.maxCount = 0
    this.doneCount = 0

    let scoreList: ReturnType<typeof musicDataToScoreList>
    try {
      scoreList = musicDataToScoreList(this.sourceCode)
    } catch {
      popup.warning(this.$buefy, this.$t('popup.invalidHTML') as string)
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

    popup.success(
      this.$buefy,
      this.$tc('popup.success', this.doneCount) as string
    )
    this.maxCount = 0
    this.doneCount = 0
    this.currentSong = ''
    this.loading = false
    this.sourceCode = ''
  }
}
</script>
