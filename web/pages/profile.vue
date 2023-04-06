<template>
  <section class="section">
    <ONotification v-if="isNewUser" type="danger" variant="danger">
      {{ t('newUser') }}
    </ONotification>
    <h1 class="title">{{ t('title') }}</h1>

    <OField :variant="variant" :message="message">
      <template #label>
        {{ t('field.id') }}
        <OTooltip variant="dark" position="right" :label="t('text.id')">
          <OIcon size="small" icon="help-circle-outline" />
        </OTooltip>
      </template>
      <OInput
        v-model="id"
        :placeholder="t('placeholder.id')"
        :disabled="!isNewUser"
        :loading="loading"
        @blur="checkId()"
      />
    </OField>

    <OField :label="t('field.name')">
      <OInput v-model="name" required />
    </OField>

    <OField>
      <template #label>
        {{ t('field.area') }}
        <OTooltip variant="dark" position="right" :label="t('text.area')">
          <OIcon size="small" icon="help-circle-outline" />
        </OTooltip>
      </template>
      <OSelect
        v-model.number="area"
        :placeholder="t('placeholder.area')"
        :disabled="!isNewUser"
      >
        <option v-for="a in areaOptions" :key="a.key" :value="a.key">
          {{ a.value }}
        </option>
      </OSelect>
    </OField>

    <OField :label="t('field.ddrCode')">
      <OInput
        v-model.number="code"
        :placeholder="t('placeholder.ddrCode')"
        minlength="8"
        maxlength="8"
        pattern="^\d{8}$"
      />
    </OField>

    <OField>
      <template #label>
        {{ t('field.password') }}
        <OTooltip variant="dark" position="right" :label="t('text.password')">
          <OIcon size="small" icon="help-circle-outline" />
        </OTooltip>
      </template>
      <OInput v-model="password" type="password" password-reveal />
    </OField>

    <OField grouped group-multiline>
      <OSwitch v-model="isPublic">{{ t('field.isPublic') }}</OSwitch>
      <div class="help">
        <p v-if="isPublic">
          {{ t('text.isPublic.public_0') }}<br />
          {{ t('text.isPublic.public_1') }}
        </p>
        <p v-else>
          {{ t('text.isPublic.private_0') }}<br />
          {{ t('text.isPublic.private_1') }}
        </p>
        <p class="has-text-weight-bold has-text-danger">
          <OIcon size="small" icon="alert" />
          {{ t('text.isPublic.caution') }}
        </p>
      </div>
    </OField>

    <OField>
      <OButton variant="success" :disabled="hasError" @click="save()">
        {{ t('save') }}
      </OButton>
    </OField>
  </section>
</template>

<i18n src="../i18n/area.json"></i18n>
<i18n lang="json">
{
  "ja": {
    "newUser": "ユーザー登録は、まだ完了していません。引き続き、以下の情報を入力してください。",
    "title": "ユーザー設定",
    "field": {
      "id": "ID",
      "name": "表示名",
      "area": "所属地域",
      "ddrCode": "DDR CODE(任意)",
      "password": "インポート用パスワード(任意)",
      "isPublic": "公開する"
    },
    "text": {
      "id": "登録後の変更はできません。",
      "area": "登録後の変更はできません。",
      "password": "外部インポートを利用しない場合は空欄にしてください。",
      "isPublic": {
        "public_0": "ユーザー検索に表示され、ユーザーページは誰でも閲覧できるようになります。",
        "public_1": "これから登録するスコアはランキングに自動登録され、一般公開されます。",
        "private_0": "ユーザー検索に表示されず、ユーザーページはあなたしか閲覧できません。",
        "private_1": "これから登録するスコアは非公開となります。",
        "caution": "ONからOFFにしても、今までに登録したスコアは非公開になりません。ご注意ください。"
      }
    },
    "placeholder": {
      "id": "ID",
      "area": "Select",
      "ddrCode": "10000000"
    },
    "message": {
      "id": {
        "required": "ユーザーIDは必須です",
        "invalid": "ユーザーIDは半角英数字, ハイフン, アンダーバーのみ使用可能です",
        "duplicate": "ユーザーIDはすでに使われています",
        "available": "ユーザーIDは使用可能です"
      },
      "success": "保存しました"
    },
    "save": "保存"
  },
  "en": {
    "newUser": "User registration has not been completed yet. Please continue to enter the following information.",
    "title": "User Settings",
    "field": {
      "id": "ID",
      "name": "Display Name",
      "area": "Area",
      "ddrCode": "DDR CODE(optional)",
      "password": "Password for Import(optional)",
      "isPublic": "Public"
    },
    "text": {
      "id": "can not be changed after registration.",
      "area": "can not be changed after registration.",
      "password": "keep it blank if you do not use external import.",
      "isPublic": {
        "public_0": "You will be shown in the user search and your page will be visible to anyone.",
        "public_1": "Registered scores will be public.",
        "private_0": "You are not shown in the user search and the user page is only visible to you.",
        "private_1": "Registered scores will be private.",
        "caution": "Note: Even if you turn off, the scores so far will not be private."
      }
    },
    "placeholder": {
      "id": "ID",
      "area": "Select",
      "ddrCode": "10000000"
    },
    "message": {
      "id": {
        "required": "ID is required",
        "invalid": "Only alphanumeric characters, hyphens, and underbars can be used for ID",
        "duplicate": "User ID is already in use",
        "available": "This ID is available"
      },
      "success": "Saved"
    },
    "save": "Save"
  }
}
</i18n>

<script lang="ts" setup>
import { areaCodeSet } from '@ddradar/core'
import { useProgrammatic } from '@oruga-ui/oruga-next'
import { useI18n } from 'vue-i18n'

import useAuth from '~~/composables/useAuth'
import type { CurrentUserInfo } from '~~/server/api/v1/user/index.get'

const { t } = useI18n()
const { oruga } = useProgrammatic()
const { user, saveUser } = await useAuth()

const id = useState(() => user.value?.id ?? '')
const name = useState(() => user.value?.name ?? '')
const area = useState(() => user.value?.area ?? 0)
const code = useState(() => user.value?.code)
const password = useState(() => user.value?.password ?? '')
const isPublic = useState(() => user.value?.isPublic ?? true)
const loading = useState(() => false)
const variant = useState((): '' | 'success' | 'danger' => '')
const message = useState(() => '')

const isNewUser = computed(() => !!user.value)
const areaOptions = computed(() =>
  [...areaCodeSet].map(key => ({ key, value: t(`area.${key}`) }))
)
const hasError = computed(
  () =>
    variant.value === 'danger' ||
    !/^[-a-zA-Z0-9_]+$/.test(id.value) ||
    !name.value ||
    !areaCodeSet.has(area.value) ||
    (!!code.value &&
      (!Number.isInteger(code.value) ||
        code.value < 10000000 ||
        code.value > 99999999))
)

const checkId = async () => {
  variant.value = ''

  // Required check
  if (!id.value) {
    variant.value = 'danger'
    message.value = t('message.id.required').toString()
    return
  }

  // Pattern check
  if (!/^[-a-zA-Z0-9_]+$/.test(id.value)) {
    variant.value = 'danger'
    message.value = t('message.id.invalid').toString()
    return
  }

  // Duplicate check from API
  loading.value = true
  try {
    const user = await $fetch(`/api/v1/users/${id.value}/exists`)
    if (user?.exists) {
      variant.value = 'danger'
      message.value = t('message.id.duplicate').toString()
    } else {
      variant.value = 'success'
      message.value = t('message.id.available').toString()
    }
  } catch (error) {
    variant.value = ''
  }
  loading.value = false
}
const save = async () => {
  const user: CurrentUserInfo = {
    id: id.value,
    name: name.value,
    area: area.value,
    isPublic: isPublic.value,
  }
  if (code.value) user.code = code.value
  if (password.value) user.password = password.value
  try {
    await saveUser(user)
    oruga.notification.open({
      message: t('message.success'),
      variant: 'success',
      position: 'top',
    })
  } catch (error) {
    oruga.notification.open({
      message: error,
      variant: 'danger',
      position: 'top',
    })
  }
  variant.value = ''
  message.value = ''
}
</script>
