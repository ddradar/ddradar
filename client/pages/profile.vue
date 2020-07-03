<template>
  <section class="section">
    <b-message v-if="isNewUser" type="is-danger" has-icon>
      ユーザー登録は、まだ完了していません。引き続き、以下の情報を入力してください。
    </b-message>
    <h1 class="title">ユーザー設定</h1>

    <b-field :type="type" :message="message">
      <template slot="label">
        ID
        <b-tooltip
          type="is-dark"
          position="is-right"
          label="登録後の変更はできません。"
        >
          <b-icon size="is-small" icon="help-circle-outline" />
        </b-tooltip>
      </template>
      <b-input
        v-model="id"
        placeholder="半角英数字, ハイフン, アンダーバー"
        :disabled="!isNewUser"
        :loading="loading"
        @blur="checkId()"
      />
    </b-field>

    <b-field label="表示名">
      <b-input v-model="name" required />
    </b-field>

    <b-field>
      <template slot="label">
        所属地域
        <b-tooltip
          type="is-dark"
          position="is-right"
          label="登録後の変更はできません。"
        >
          <b-icon size="is-small" icon="help-circle-outline" />
        </b-tooltip>
      </template>
      <b-select
        v-model.number="area"
        placeholder="Select"
        :disabled="!isNewUser"
      >
        <option v-for="area in areaOptions" :key="area.key" :value="area.key">
          {{ area.value }}
        </option>
      </b-select>
    </b-field>

    <b-field label="DDR CODE(任意)">
      <b-input
        v-model.number="code"
        placeholder="10000000"
        minlength="8"
        maxlength="8"
        pattern="^\d{8}$"
      />
    </b-field>

    <b-field grouped group-multiline>
      <b-switch v-model="isPublic">公開する</b-switch>
      <div class="help">
        <p v-if="isPublic">
          ユーザー検索に表示され、ユーザーページは誰でも閲覧できるようになります。<br />
          これから登録するスコアはランキングに自動登録され、一般公開されます。
        </p>
        <p v-else>
          ユーザー検索に表示されず、ユーザーページはあなたしか閲覧できません。<br />
          これから登録するスコアは非公開となります。
        </p>
        <p class="has-text-weight-bold has-text-danger">
          <b-icon size="is-small" icon="alert" />
          ONからOFFにしても、今までに登録したスコアは非公開になりません。ご注意ください。
        </p>
      </div>
    </b-field>

    <b-field>
      <b-button type="is-success" :disabled="hasError" @click="save()">
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
  code: number | null = null
  isPublic: boolean = true

  loading = false
  type: '' | 'is-success' | 'is-danger' = ''
  message = ''

  readonly areaOptions = Object.entries(areaList).map(v => ({
    key: v[0],
    value: v[1],
  }))

  get isNewUser() {
    return !this.$accessor.user
  }

  get hasError() {
    return (
      this.type === 'is-danger' ||
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

  async checkId() {
    // Requred check
    if (!this.id) {
      this.type = 'is-danger'
      this.message = 'ユーザーIDは必須です'
      return
    }

    // Pattern check
    if (!/^[-a-z0-9_]+$/.test(this.id)) {
      this.type = 'is-danger'
      this.message =
        'ユーザーIDは半角英数字, ハイフン, アンダーバーのみ使用可能です'
      return
    }

    // Duplicate check from API
    this.loading = true
    const { exists } = await this.$http.$get<{ exists: boolean }>(
      `/api/v1/users/exists/${this.id}`
    )
    this.loading = false

    if (exists) {
      this.type = 'is-danger'
      this.message = 'ユーザーIDはすでに使われています'
    } else {
      this.type = 'is-success'
      this.message = 'ユーザーIDは使用可能です'
    }
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
    this.type = ''
    this.message = ''
  }
}
</script>
