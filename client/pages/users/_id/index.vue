<template>
  <section class="section">
    <template v-if="$fetchState.pending">
      <b-skeleton class="title" animated />
      <b-skeleton class="subtitle" animated />
    </template>
    <template v-else-if="user">
      <h1 class="title">{{ user.name }}</h1>
      <h2 v-if="user" class="subtitle">{{ areaName }} / {{ ddrCode }}</h2>

      <div class="buttons">
        <b-button
          icon-left="magnify"
          type="is-success"
          tag="nuxt-link"
          :to="`/users/${user.id}/scores`"
        >
          {{ $t('button.scores') }}
        </b-button>
        <template v-if="isSelfPage">
          <b-button
            icon-left="import"
            type="is-primary"
            tag="nuxt-link"
            to="/import"
          >
            {{ $t('button.import') }}
          </b-button>
          <b-button
            icon-left="account-cog"
            type="is-info"
            tag="nuxt-link"
            to="/profile"
          >
            {{ $t('button.settings') }}
          </b-button>
        </template>
      </div>

      <section class="section">
        <div class="content columns is-multiline">
          <section
            v-for="(style, i) in ['SP', 'DP']"
            :key="`radar-${style}`"
            class="column is-half-tablet"
          >
            <card
              :title="$t('title.radar', [style])"
              type="is-primary"
              collapsible
            >
              <div class="card-content">
                <b-loading v-if="$fetchState.pending" />
                <groove-radar
                  v-else-if="radars[i]"
                  class="chart"
                  :chart="radars[i]"
                />
                <div v-else class="content has-text-grey has-text-centered">
                  <p>{{ $t('noData') }}</p>
                </div>
              </div>
            </card>
          </section>
        </div>
        <div class="content columns is-multiline">
          <section
            v-for="(style, i) in ['SP', 'DP']"
            :key="`clear-${style}`"
            class="column is-half-widescreen"
          >
            <card
              :title="$t('title.clear', [style])"
              type="is-primary"
              collapsible
            >
              <div class="card-content">
                <clear-status
                  :loading="$fetchState.pending"
                  :statuses="clears[i]"
                />
              </div>
            </card>
          </section>
        </div>
      </section>
    </template>
    <template v-else>{{ $t('empty') }}</template>
  </section>
</template>

<i18n src="../../../i18n/area.json"></i18n>
<i18n>
{
  "ja": {
    "pageTitle": "ユーザー詳細",
    "button": {
      "scores": "スコア一覧",
      "import": "スコアのインポート",
      "settings": "設定"
    },
    "title": {
      "radar": "グルーブレーダー ({0})",
      "clear": "クリア状況 ({0})"
    },
    "empty": "ユーザーが存在しないか、非公開に設定されています。",
    "noData": "データがありません"
  },
  "en": {
    "pageTitle": "User Detail",
    "button": {
      "scores": "Score List",
      "import": "Import Scores",
      "settings": "Settings"
    },
    "title": {
      "radar": "Groove Radar ({0})",
      "clear": "Clear Status ({0})"
    },
    "empty": "User does not exist or is private",
    "noData": "No Data"
  }
}
</i18n>

<script lang="ts">
import type { Api, Song } from '@ddradar/core'
import type { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'
import type { MetaInfo } from 'vue-meta'

import { getClearStatus, getGrooveRadar, getUserInfo } from '~/api/user'
import ClearStatus from '~/components/pages/users/ClearStatus.vue'
import GrooveRadar from '~/components/pages/users/GrooveRadar.vue'
import Card from '~/components/shared/Card.vue'

@Component({
  components: { Card, ClearStatus, GrooveRadar },
  fetchOnServer: false,
})
export default class UserPage extends Vue {
  user: Api.UserInfo | null = null
  radars: [Song.GrooveRadar | null, Song.GrooveRadar | null] = [null, null]
  clears: [
    Omit<Api.ClearStatus, 'playStyle'>[],
    Omit<Api.ClearStatus, 'playStyle'>[]
  ] = [[], []]

  get areaName() {
    return this.user ? this.$t(`area.${this.user.area}`) : ''
  }

  get ddrCode() {
    return this.user?.code
      ? (String(this.user.code).replace(
          /^(\d{4})(\d{4})$/,
          '$1-$2'
        ) as `${number}-${number}`)
      : ''
  }

  get isSelfPage() {
    const loginId = this.$accessor.user?.id
    return !!this.user && this.user.id === loginId
  }

  /* istanbul ignore next */
  head(): MetaInfo {
    return {
      title: this.user?.name ?? (this.$t('pageTitle') as string),
    }
  }

  /** id expected [a-z], [A-Z] [0-9], [-], [_] */
  validate({ params }: Pick<Context, 'params'>) {
    return /^[-a-zA-Z0-9_]+$/.test(params.id)
  }

  /** Fetch User info from API */
  async fetch() {
    const id = this.$route.params.id
    try {
      const [user, spRadar, dpRadar, spClears, dpClears] = await Promise.all([
        getUserInfo(this.$http, id),
        getGrooveRadar(this.$http, id, 1),
        getGrooveRadar(this.$http, id, 2),
        getClearStatus(this.$http, id, 1),
        getClearStatus(this.$http, id, 2),
      ])
      this.user = user
      this.radars = [spRadar[0] ?? null, dpRadar[0] ?? null]
      this.clears = [spClears, dpClears]
    } catch {
      this.user = null
    }
  }
}
</script>

<style scoped>
.chart {
  max-height: 80vh;
}
</style>
