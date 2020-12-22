<template>
  <section class="section">
    <template v-if="!user && !$fetchState.pending">{{ $t('empty') }}</template>
    <template v-else>
      <h1 v-if="user" class="title">{{ user.name }}</h1>
      <b-skeleton v-else class="title" animated />

      <h2 v-if="user" class="subtitle">{{ areaName }} / {{ ddrCode }}</h2>
      <b-skeleton v-else class="subtitle" animated />

      <div v-if="isSelfPage" class="buttons">
        <b-button
          icon-left="import"
          type="is-primary"
          tag="nuxt-link"
          to="/import"
        >
          {{ $t('import') }}
        </b-button>
        <b-button
          icon-left="account-cog"
          type="is-info"
          tag="nuxt-link"
          to="/profile"
        >
          {{ $t('settings') }}
        </b-button>
      </div>

      <section v-if="user" class="section">
        <div class="content columns is-multiline">
          <play-status
            :play-style="1"
            :user-id="user.id"
            class="column is-half-tablet"
          />
          <play-status
            :play-style="2"
            :user-id="user.id"
            class="column is-half-tablet"
          />
        </div>
      </section>
    </template>
  </section>
</template>

<i18n src="../../i18n/area.json"></i18n>
<i18n>
{
  "ja": {
    "empty": "ユーザーが存在しないか、非公開に設定されています。",
    "import": "スコアのインポート",
    "settings": "設定"
  },
  "en": {
    "empty": "User does not exist or is private",
    "import": "Import Scores",
    "settings": "Settings"
  }
}
</i18n>

<script lang="ts">
import type { UserInfo } from '@ddradar/core/api/user'
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import { getUserInfo } from '~/api/user'
import PlayStatus from '~/components/pages/users/PlayStatus.vue'

@Component({ components: { PlayStatus }, fetchOnServer: false })
export default class UserPage extends Vue {
  user: UserInfo | null = null

  get areaName() {
    return this.user ? this.$t(`area.${this.user.area}`) : ''
  }

  get ddrCode() {
    return this.user?.code
      ? String(this.user.code).replace(/^(\d{4})(\d{4})$/, '$1-$2')
      : ''
  }

  get isSelfPage() {
    const loginId = this.$accessor.user?.id
    return !!this.user && this.user.id === loginId
  }

  /** id expected [a-z], [A-Z] [0-9], [-], [_] */
  validate({ params }: Pick<Context, 'params'>) {
    return /^[-a-zA-Z0-9_]+$/.test(params.id)
  }

  /** Fetch User info from API */
  async fetch() {
    const id = this.$route.params.id
    try {
      this.user = await getUserInfo(this.$http, id)
    } catch {
      this.user = null
    }
  }
}
</script>
