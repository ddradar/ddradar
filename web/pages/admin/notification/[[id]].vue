<template>
  <section class="section">
    <h1 class="title">{{ pageTitle }}</h1>

    <OField label="Title">
      <OInput v-model="notification.title" required />
    </OField>

    <OField label="Body">
      <OInput v-model="notification.body" required type="textarea" />
    </OField>

    <OField>
      <OSwitch v-model="notification.pinned">ピン留めする</OSwitch>
    </OField>

    <OField label="Type">
      <OSelect v-model="notification.type" placeholder="Type">
        <option value="info">情報</option>
        <option value="warning">警告</option>
        <option value="danger">エラー</option>
      </OSelect>
    </OField>

    <OField label="Icon">
      <OField grouped>
        <OInput v-model="notification.icon" :icon-right="notification.icon" />
        <OButton variant="text" tag="a" href="https://materialdesignicons.com/">
          参考ページ
        </OButton>
      </OField>
    </OField>

    <OField>
      <OButton
        variant="success"
        :disabled="hasError"
        @click="saveNotification()"
      >
        Save
      </OButton>
    </OField>
  </section>
</template>

<script lang="ts" setup>
import { useProgrammatic } from '@oruga-ui/oruga-next'

import DialogModal from '~~/components/modal/DialogModal.vue'
import { NotificationBody } from '~~/server/api/v1/notification/index.post'

const _route = useRoute()
const { oruga } = useProgrammatic()

const id = _route.params.id as string
const notification = useState<NotificationBody>(() => ({
  sender: 'SYSTEM',
  pinned: false,
  type: 'info',
  icon: '',
  title: '',
  body: '',
}))
if (id) {
  const _fetchData = await useFetch<NotificationBody>(
    `/api/v1/notification/${id}`
  )
  notification.value = _fetchData.data.value!
}

const pageTitle = computed(() => `${id ? 'Update' : 'Add'} Notification`)
const hasError = computed(
  () => !notification.value.title || !notification.value.body
)

const saveNotification = async () => {
  const instance = oruga.modal.open({
    component: DialogModal,
    props: { message: 'Add or update this?', variant: 'info' },
    trapFocus: true,
  })

  if ((await instance.promise) !== 'yes') return

  notification.value = await $fetch('/api/v1/notification', {
    method: 'POST',
    body: notification.value,
  })

  oruga.notification.open({
    message: 'Saved Successfully!',
    variant: 'success',
    position: 'top',
  })
}
</script>
