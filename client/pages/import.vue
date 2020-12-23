<template>
  <section class="section">
    <h1 class="title">{{ $t('title') }}</h1>
    <h2 id="eagate" class="subtitle">{{ $t('subtitle.eagate') }}</h2>
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
        v-if="sourceCode && loading"
        type="is-success"
        :value="doneCount"
        :max="maxCount"
        show-value
      >
        {{ message }}
      </b-progress>
    </div>
    <h2 id="skillAttack" class="subtitle">{{ $t('subtitle.skillAttack') }}</h2>
    <div class="content">
      <i18n path="content.skillAttack.text_1" tag="p">
        <a href="http://skillattack.com/sa4/" target="_blank">Skill Attack</a>
      </i18n>
      <i18n path="content.skillAttack.text_2" tag="p">
        <a v-if="skillAttackUri" :href="skillAttackUri" target="_blank">
          {{ $t('content.skillAttack.text_2_0') }}
        </a>
        <span v-else>
          {{ $t('content.skillAttack.text_2_0') }} (score_00000000.txt)
        </span>
      </i18n>
      <b-field class="file is-primary" :class="{ 'has-name': !!file }">
        <b-upload v-model="file" class="file-label" accept=".txt">
          <span class="file-cta">
            <b-icon class="file-icon" icon="upload" />
            <span class="file-label">
              {{ file ? file.name : $t('upload') }}
            </span>
          </span>
        </b-upload>
        <b-button v-if="file" icon-left="window-close" @click="file = null" />
      </b-field>
      <b-field>
        <b-button
          type="is-success"
          :disabled="!file"
          :loading="loading"
          @click="importSkillAttackScores()"
        >
          {{ $t('submit') }}
        </b-button>
      </b-field>
      <b-progress
        v-if="file && loading"
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
      "eagate": "e-amusementサイトからインポート",
      "skillAttack": "Skill Attackからインポート"
    },
    "content": {
      "eagate": {
        "text_1": "公式サイトの{0}より、スコアを取得します。",
        "text_1_0": "「楽曲データ一覧」ページ",
        "text_2": "公式サイトでのスコア閲覧には、ベーシックコースへの加入が必要です。"
      },
      "skillAttack": {
        "text_1": "{0}より、スコアをインポートします。",
        "text_2": "事前に{0}をダウンロードして、下記よりアップロードを実行してください。",
        "text_2_0": "スコアデータ一覧"
      }
    },
    "field": {
      "eagate": "HTMLソース"
    },
    "submit": "登録",
    "upload": "ファイルを選択",
    "progress": "登録中: {song} ({done}/{max})",
    "popup": {
      "invalidHTML": "HTMLソース文字列が不正です",
      "invalidFile": "ファイルが読み取れないか、正しい形式ではありません",
      "success": "{n}件のスコアを登録しました"
    }
  },
  "en": {
    "title": "Import Scores",
    "subtitle": {
      "eagate": "Import from e-amusement GATE",
      "skillAttack": "Import from Skill Attack"
    },
    "content": {
      "eagate": {
        "text_1": "Get scores from {0}.",
        "text_1_0": "\"Music List\" page",
        "text_2": "You need to subscribe \"e-amusement Basic Course\" to see scores."
      },
      "skillAttack": {
        "text_1": "Import your scores from {0}.",
        "text_2": "Please download {0} in advance, and upload here.",
        "text_2_0": "Score Data"
      }
    },
    "field": {
      "eagate": "HTML Sourse"
    },
    "submit": "Submit",
    "upload": "Select file",
    "progress": "Uploading: {song} ({done}/{max})",
    "popup": {
      "invalidHTML": "Invalid HTML",
      "invalidFile": "Cannot read file or invalid file",
      "success": "Uploaded: {n} song | Uploaded: {n} songs"
    }
  }
}
</i18n>

<script lang="ts">
import { musicDataToScoreList } from '@core/eagate-parser'
import { readTextAsync, scoreTexttoScoreList } from '@core/skill-attack'
import { Component, Vue } from 'nuxt-property-decorator'

import { postSongScores } from '~/api/score'
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

  file: File | null = null

  get message() {
    return this.$t('progress', {
      song: this.currentSong,
      done: this.doneCount,
      max: this.maxCount,
    })
  }

  get skillAttackUri() {
    const code = this.$accessor.user?.code
    return code
      ? `http://skillattack.com/sa4/data/dancer/${code}/score_${code}.txt`
      : ''
  }

  /** Convert sourceCode to Scores and call Post Song Scores API */
  async importEageteScores() {
    this.loading = true
    this.maxCount = 0
    this.doneCount = 0

    try {
      const scoreList = musicDataToScoreList(this.sourceCode)
      await this.callPostAPI(scoreList)
    } catch {
      popup.warning(this.$buefy, this.$t('popup.invalidHTML') as string)
      this.loading = false
    }
  }

  /** Convert file to Scores and call Post Song Scores API */
  async importSkillAttackScores() {
    if (!this.file) return

    this.loading = true
    this.maxCount = 0
    this.doneCount = 0

    try {
      const text = await readTextAsync(this.file)
      const scoreList = scoreTexttoScoreList(text)
      await this.callPostAPI(scoreList)
    } catch {
      popup.warning(this.$buefy, this.$t('popup.invalidFile') as string)
      this.loading = false
    }
  }

  private async callPostAPI(
    scoreList:
      | ReturnType<typeof musicDataToScoreList>
      | ReturnType<typeof scoreTexttoScoreList>
  ) {
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
