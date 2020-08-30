<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <h1 class="modal-card-title">スコアのインポート</h1>
    </header>
    <section class="modal-card-body">
      <div class="content">
        <ol>
          <li>e-amusement GATEにログインしてください。</li>
          <li>
            <a target="_blank" :href="musicDetailUri">楽曲データ詳細</a>
            のソースコードを取得し、コピーしてください。
          </li>
          <li>
            下のテキストボックスに、コピーしたソースコードを貼り付けてください。
          </li>
        </ol>
      </div>
      <b-field>
        <b-input v-model="sourceCode" type="textarea" required />
      </b-field>
    </section>
    <footer class="modal-card-foot">
      <b-button
        :disabled="!sourceCode"
        :loading="loading"
        type="is-success"
        @click="importScore()"
      >
        登録
      </b-button>
    </footer>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { postSongScores } from '~/api/score'
import { musicDetailToScore } from '~/utils/eagate-parser'
import * as popup from '~/utils/popup'

@Component
export default class ScoreImporterComponent extends Vue {
  @Prop({ required: true, type: String })
  readonly songId!: string

  @Prop({ required: true, type: Number })
  readonly playStyle!: 1 | 2

  @Prop({ required: true, type: Number })
  readonly difficulty!: 0 | 1 | 2 | 3 | 4

  @Prop({ required: false, type: Boolean, default: false })
  readonly isCourse!: boolean

  sourceCode: string | null = null
  loading: boolean = false

  get musicDetailUri() {
    /** 0 - 9 */
    const diff = (this.playStyle - 1) * 4 + this.difficulty
    return `https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/${
      this.isCourse ? 'course' : 'music'
    }_detail.html?index=${this.songId}&diff=${diff}`
  }

  async importScore() {
    if (!this.sourceCode) return

    this.loading = true

    // Convert sourceCode to Score
    let score: ReturnType<typeof musicDetailToScore>
    try {
      score = musicDetailToScore(this.sourceCode)
    } catch (error) {
      popup.warning(this.$buefy, error.message ?? error)
      this.loading = false
      return
    }

    try {
      await postSongScores(this.$http, this.songId, [score])
      popup.success(this.$buefy, 'Success!')
    } catch (error) {
      popup.danger(this.$buefy, error.message ?? error)
      this.loading = false
      return
    }

    this.loading = false
    // @ts-ignore
    this.$parent.close()
  }
}
</script>
