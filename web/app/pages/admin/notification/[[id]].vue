<script lang="ts" setup>
import { postBodySchema } from '~~/schemas/notification'

definePageMeta({ allowedRoles: 'administrator' })

const _toast = useToast()
const _route = useRoute('admin-notification-id')
const { id: _id } = _route.params

const title = computed(() => `${_id ? 'Update' : 'Add'} Notification`)
useHeadSafe({ title })

const pinned = ref(false)
// #region Data Fetching
const { data: notification, execute } = useFetch(
  `/api/v2/notification/${_id}`,
  {
    default: () => ({
      color: 'blue',
      icon: '',
      title: '',
      body: '',
    }),
    immediate: false,
  }
)
if (_id) await execute()
// #endregion

// #region Form
/** Save current notification. */
const save = async () => {
  try {
    notification.value = await $fetch<(typeof notification)['value']>(
      '/api/v2/notification',
      { method: 'POST', body: { ...notification.value, pinned: pinned.value } }
    )
    _toast.add({
      id: 'notification-updated',
      title: 'Success!',
      color: 'green',
    })
  } catch (error: unknown) {
    _toast.add({
      id: 'notification-update-error',
      title: error as string,
      color: 'red',
    })
  }
}
// #endregion
</script>

<template>
  <UPage>
    <UPageHeader :title="title" />

    <UPageBody>
      <UForm :state="notification" :schema="postBodySchema" @submit="save()">
        <UFormGroup label="Title" name="title">
          <UInput v-model="notification.title" />
        </UFormGroup>

        <UFormGroup label="Body" name="body">
          <UTextarea v-model="notification.body" />
        </UFormGroup>

        <UFormGroup name="pinned">
          <UCheckbox v-model="pinned" label="ピン留めする" />
        </UFormGroup>

        <UFormGroup label="Type" name="type">
          <UInput v-model="notification.color" />
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
