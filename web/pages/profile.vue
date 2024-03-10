<script lang="ts" setup>
import { areaCodeSet, userSchema } from '@ddradar/core'

import type { FormError, FormSubmitEvent } from '#ui/types'
import type { CurrentUserInfo } from '~/schemas/user'

definePageMeta({ allowedRoles: 'authenticated' })

const _default: CurrentUserInfo = {
  id: '',
  name: '',
  area: 0,
  code: undefined,
  password: '',
  isPublic: true,
}
const _toast = useToast()
const { t } = useI18n()

const isNewUser = useState(() => false)
const { data: user, refresh } = await useFetch('/api/v1/user', {
  default: () => _default,
  transform: d => {
    isNewUser.value = !d
    return d || _default
  },
  deep: false,
})
const _uri = computed(() => `/api/v1/users/${user.value.id}/exists` as const)
const {
  data: _duplicated,
  execute: _checkDuplicatedId,
  status: _status,
} = useFetch(_uri, {
  immediate: false,
  transform: u => u.exists,
  default: () => false,
  watch: false,
})

/** Loading state (/api/v1/users/{id}/exists) */
const loading = computed(() => _status.value === 'pending')
/** Area Options */
const areaOptions = computed(() =>
  [...areaCodeSet].map(value => ({ value, label: t(`area.${value}`) }))
)

/** Validate form data. */
const validate = async (_state: CurrentUserInfo) => {
  const errors: FormError[] = []
  if (!isNewUser.value || !userSchema.shape.id.safeParse(user.value.id).success)
    return errors
  await _checkDuplicatedId()
  if (_duplicated.value)
    errors.push({ path: 'id', message: t('message.id.duplicate') })

  return errors
}
/** Save current user profile. */
const onSubmit = async (event: FormSubmitEvent<CurrentUserInfo>) => {
  try {
    await $fetch('/api/v1/user', { method: 'POST', body: event.data })
    await refresh()
    _toast.add({
      id: 'user-updated',
      title: t('message.success'),
      color: 'green',
    })
  } catch (error: any) {
    _toast.add({ id: 'user-update-error', title: error.message, color: 'red' })
  }
}
</script>

<template>
  <UPage>
    <UPageHeader :title="t('title')" />

    <UPageBody>
      <UForm
        :state="user"
        :schema="userSchema"
        :validate="validate"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormGroup
          :label="t('field.id')"
          name="id"
          :description="t('text.id')"
        >
          <UInput
            v-model="user!.id"
            :placeholder="t('placeholder.id')"
            :disabled="!isNewUser"
            :loading="loading"
          />
        </UFormGroup>

        <UFormGroup :label="t('field.name')" name="name">
          <UInput v-model="user!.name" />
        </UFormGroup>

        <UFormGroup
          :label="t('field.area')"
          name="area"
          :disabled="!isNewUser"
          :description="t('text.area')"
        >
          <USelect v-model="user!.area" :options="areaOptions" />
        </UFormGroup>

        <UFormGroup :label="t('field.ddrCode')" name="code">
          <UInput
            v-model.number="user!.code"
            :placeholder="t('placeholder.ddrCode')"
          />
        </UFormGroup>

        <UFormGroup
          :label="t('field.isPublic')"
          name="isPublic"
          :help="t('text.isPublic.caution')"
        >
          <template #description>
            <p v-if="user!.isPublic">
              {{ t('text.isPublic.public_0') }}<br />
              {{ t('text.isPublic.public_1') }}
            </p>
            <p v-else>
              {{ t('text.isPublic.private_0') }}<br />
              {{ t('text.isPublic.private_1') }}
            </p>
          </template>
          <UToggle v-model="user!.isPublic" />
        </UFormGroup>

        <UButton>{{ t('save') }}</UButton>
      </UForm>
    </UPageBody>
  </UPage>
</template>

<i18n src="~/locales/area.json"></i18n>
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
      "id": "半角英数字, ハイフンまたはアンダーバー",
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
      "id": "Alphabets, Digits, Hyphen or Underbar",
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
