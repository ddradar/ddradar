<template>
  <UPage>
    <UContainer>
      <UAlert
        v-if="!isRegistered"
        color="warning"
        title="新規登録"
        description="アプリの利用には追加のユーザー情報の登録が必要です。下記のフォームに必要事項を入力してください。"
        icon="i-lucide-user"
        class="mt-2"
        close
      />
      <UCard class="mt-4">
        <UForm :schema="userSchema" :state="state" @submit="onSubmit">
          <UFormField
            label="ユーザーID"
            name="id"
            description="このアプリで使用するユーザーIDです。一度登録すると変更できません。"
            :disabled="isRegistered"
            required
            class="mt-4 mb-4"
          >
            <UInput
              v-model="state.id"
              :disabled="isRegistered"
              class="w-full"
            />
          </UFormField>
          <UFormField label="ユーザー名" name="name" required class="mt-4 mb-4">
            <UInput v-model="state.name" class="w-full" />
          </UFormField>
          <UFormField label="所属エリア" name="area" required class="mt-4 mb-4">
            <USelect v-model="state.area" :items="areaOptions" class="w-full" />
          </UFormField>
          <UFormField label="DDRコード" name="ddrCode" class="mt-4 mb-4">
            <UInput
              v-model.number="state.ddrCode"
              type="number"
              placeholder="00000000"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="プロフィール公開設定"
            name="isPublic"
            description="他のユーザーがあなたのプロフィール・スコアを閲覧できるようにします。"
            class="mt-4 mb-4"
          >
            <USwitch v-model="state.isPublic" class="w-full" />
          </UFormField>
          <UButton type="submit">保存</UButton>
        </UForm>
      </UCard>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'

import { Area, type User, userSchema } from '~~/shared/types/user'

definePageMeta({ middleware: ['auth'] })

const areaOptions = ref<SelectItem[]>(
  Object.entries(Area).map(([label, value]) => ({ label, value }))
)
const { user, fetch: updateSession } = useUserSession()
const toast = useToast()

const isRegistered = computed(() => !!user.value?.id)
const uri = computed(() => `/api/users/${user.value?.id}` as const)
const { data: state, execute } = useFetch<User>(uri, {
  method: 'GET',
  immediate: false,
  default: (): User => ({
    id: '',
    name: user.value?.displayName ?? '',
    area: Area.東京都,
    ddrCode: null,
    isPublic: false,
  }),
})
if (isRegistered.value) await execute()

async function onSubmit() {
  try {
    await $fetch('/api/me', { method: 'POST', body: state.value })
    toast.add({ color: 'success', title: 'プロフィールを更新しました。' })
    await updateSession()
  } catch {
    toast.add({ color: 'error', title: 'プロフィールの更新に失敗しました。' })
  }
}
</script>
