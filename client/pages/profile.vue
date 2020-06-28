<template>
  <section class="section">
    <h1 class="title">User Profile</h1>

    <b-field label="ID">
      <b-input
        v-model="id"
        required
        pattern="^[-a-z0-9_]+$"
        placeholder="半角英数字, ハイフン, アンダーバー"
        :disabled="!isNewUser"
      />
    </b-field>

    <b-field label="表示名">
      <b-input v-model="name" required :disabled="!isNewUser" />
    </b-field>

    <b-field label="所属地域">
      <b-select v-model="area" placeholder="Select" :disabled="!isNewUser">
        <option v-for="area in areaOptions" :key="area.key" :value="area.key">
          {{ area.value }}
        </option>
      </b-select>
    </b-field>

    <b-field label="DDR CODE">
      <b-input
        v-model.number="code"
        placeholder="10000000"
        minlength="8"
        maxlength="8"
        pattern="^\d{8}$"
      />
    </b-field>

    <b-field>
      <b-switch v-model="isPublic">スコアを公開する</b-switch>
    </b-field>

    <b-field>
      <b-button type="is-success" :disabled="hasError">
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
  id: string = ''
  name: string = ''
  area: AreaCode = 0
  code: number | null
  isPublic: boolean = true

  readonly areaOptions = Object.entries(areaList).map(v => ({
    key: v[0],
    value: v[1],
  }))

  get isNewUser() {
    return !this.$accessor.user
  }

  get hasError() {
    return (
      !/^[-a-z0-9_]+$/.test(this.id) ||
      !this.name ||
      !Object.keys(areaList).includes(`${this.area}`) ||
      (this.code &&
        (!Number.isInteger(this.code) ||
          this.code < 10000000 ||
          this.code > 99999999))
    )
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

  async save() {
    const user: User = {
      id: this.id,
      name: this.name,
      area: this.area,
      isPublic: this.isPublic,
    }
    if (this.code) user.code = this.code
    try {
      await this.$accessor.saveUser(user)
      this.$buefy.notification.open({
        message: 'Success!',
        type: 'is-success',
        position: 'is-top',
        hasIcon: true,
      })
    } catch (error) {
      this.$buefy.notification.open({
        message: error.message ?? error,
        type: 'is-danger',
        position: 'is-top',
        hasIcon: true,
      })
    }
  }
}
</script>
