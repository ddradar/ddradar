<template>
  <section class="section">
    <b-message v-if="isNewUser" type="is-danger" has-icon>
      ユーザー登録は、まだ完了していません。引き続き、以下の情報を入力してください。
    </b-message>
    <h1 class="title">ユーザー設定</h1>

    <b-field
      label="ID"
      message="あなたの情報をDDRadar上で管理する識別子です。登録後の変更はできません。"
    >
      <b-input
        v-model="id"
        placeholder="半角英数字, ハイフン, アンダーバー"
        :disabled="!isNewUser"
        :loading="loading"
        :type="type"
        :message="message"
        @blur="checkId()"
      />
    </b-field>

    <b-field label="表示名" message="あなたの名前です。">
      <b-input v-model="name" required />
    </b-field>

    <b-field
      label="所属地域"
      message="あなたの所属地域です。登録後の変更はできません。"
    >
      <b-select v-model="area" placeholder="Select" :disabled="!isNewUser">
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

    <b-field
      :message="[
        'ONにすると、ユーザーページが一般公開され、その間に登録されたスコアはランキングに登録されます。',
        'OFFにすると、ユーザーページは本人のみ閲覧可能となり、その間に登録したスコアも非公開となります。',
        '※OFFにしても、すでにランキング登録済みのスコアは非公開になりません。ご注意ください。',
      ]"
    >
      <b-switch v-model="isPublic">公開する</b-switch>
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
  code: number | null
  isPublic: boolean = true

  loading = false
  type: '' | 'is-success' | 'is-error' = ''
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
      this.type === 'is-error' ||
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
      this.type = 'is-error'
      this.message = 'ユーザーIDは必須です'
      return
    }

    // Pattern check
    if (!/^[-a-z0-9_]+$/.test(this.id)) {
      this.type = 'is-error'
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
      this.type = 'is-error'
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
