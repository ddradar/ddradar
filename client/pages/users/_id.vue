<template>
  <section class="section">
    <template v-if="!user && !loading">
      ユーザーは存在しないか、非公開に設定されています。
    </template>
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
          スコアのインポート
        </b-button>
        <b-button
          icon-left="account-cog"
          type="is-info"
          tag="nuxt-link"
          to="/profile"
        >
          設定
        </b-button>
      </div>
    </template>
  </section>
</template>

<script lang="ts">
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import { areaList, UserListData } from '~/types/api/user'

@Component({ fetchOnServer: false })
export default class UserDetailPage extends Vue {
  user: UserListData | null
  loading = true

  get areaName() {
    return this.user ? areaList[this.user.area] : ''
  }

  get ddrCode() {
    return this.user?.code
      ? String(this.user.code).replace(/^(\d{4})(\d{4})$/, '$1-$2')
      : ''
  }

  get isSelfPage() {
    const loginId = this.$accessor.user?.id
    return this.user && this.user.id === loginId
  }

  /** id expected [a-z], [0-9], [-], [_] */
  validate({ params }: Pick<Context, 'params'>) {
    return /^[-a-z0-9_]+$/.test(params.id)
  }

  /** Get User info from API */
  async fetch() {
    const id = this.$route.params.id
    try {
      const user = await this.$http.$get<UserListData>(`/api/v1/users/${id}`)
      this.user = user
    } catch {
      this.user = null
    }
    this.loading = false
  }
}
</script>
