<script lang="ts" setup>
import { notificationSchema } from '@ddradar/core'
import { z } from 'zod'

definePageMeta({ allowedRoles: 'administrator' })

const _route = useRoute('admin-notification-id')
const schema = notificationSchema
  .omit({ timeStamp: true })
  .extend({ timeStamp: z.onumber() })

const id = _route.params.id
const { data: notification, execute } = useFetch(`/api/v1/notification/${id}`, {
  default: () => ({
    sender: 'SYSTEM',
    pinned: false,
    type: 'info',
    icon: '',
    title: '',
    body: '',
  }),
  immediate: false,
})
if (id) await execute()

const pageTitle = computed(() => `${id ? 'Update' : 'Add'} Notification`)

const saveNotification = async () => {
  notification.value = await $fetch<(typeof notification)['value']>(
    '/api/v1/notification',
    {
      method: 'POST',
      body: notification.value,
    }
  )
}
</script>

<template>
  <UPage>
    <UPageHeader :title="pageTitle" />

    <UPageBody>
      <UForm
        :state="notification"
        :schema="schema"
        @submit="saveNotification()"
      >
        <UFormGroup label="Title" name="title">
          <UInput v-model="notification.title" />
        </UFormGroup>

        <UFormGroup label="Body" name="body">
          <UTextarea v-model="notification.body" />
        </UFormGroup>

        <UFormGroup name="pinned">
          <UCheckbox v-model="notification.pinned" label="ピン留めする" />
        </UFormGroup>

        <UFormGroup label="Type" name="type">
          <UInput v-model="notification.type" />
        </UFormGroup>

        <UFormGroup label="Icon" name="icon">
          <template #hint>
            <ULink to="https://icon-sets.iconify.design/heroicons/">
              参考ページ
            </ULink>
          </template>
          <UInput v-model="notification.icon" :icon="notification.icon" />
        </UFormGroup>

        <UButton type="submit">Save</UButton>
      </UForm>
    </UPageBody>
  </UPage>
</template>
