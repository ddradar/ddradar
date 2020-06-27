<template>
  <section class="section">
    <h1 class="title">User Profile</h1>

    <b-field label="ID">
      <b-input
        v-model="id"
        required
        pattern="^[-a-z0-9_]+$"
        placeholder="半角英数字, -, _"
        :disabled="!isNewUser"
      />
    </b-field>

    <b-field label="表示名">
      <b-input v-model="name" required :disabled="!isNewUser" />
    </b-field>

    <b-field label="所属地域">
      <b-select v-model="area" placeholder="Select" :disabled="!isNewUser">
        <option v-for="area in areaList" :key="area.key" :value="area.key">
          {{ value }}
        </option>
      </b-select>
    </b-field>

    <b-field label="DDR CODE">
      <b-input
        v-model.number="code"
        type="number"
        placeholder="10000000"
        min="10000000"
        max="99999999"
      />
    </b-field>

    <b-field>
      <b-switch v-model="isPublic">スコアを公開する</b-switch>
    </b-field>

    <b-field>
      <b-button type="is-success">
        保存
      </b-button>
    </b-field>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { AreaCode, areaList, User } from '../types/api/user'

@Component({ fetchOnServer: false })
export default class ProfilePage extends Vue implements User {
  id: string
  name: string
  area: AreaCode
  code: number
  isPublic: boolean

  readonly areaList = Object.entries(areaList).map(v => ({
    key: v[0],
    value: v[1],
  }))

  get isNewUser() {
    return !this.$accessor.user
  }

  /** Load user info */
  async fetch() {
    await this.$accessor.fetchUser()
    this.id = this.$accessor.user?.id ?? this.$accessor.auth.userDetails
    this.name = this.$accessor.user?.name ?? ''
    this.area = this.$accessor.user?.area ?? 0
    this.code = this.$accessor.user?.code
    this.isPublic = this.$accessor.user?.isPublic ?? true
  }
}
</script>
