<script setup lang="ts">
import type { NotificationListData } from '~/schemas/notification'

defineProps<{ data: NotificationListData }>()
const closed = ref(false)
</script>

<template>
  <UAlert
    v-if="!closed"
    :close-button="{
      icon: 'i-heroicons-x-mark-20-solid',
      color: 'gray',
      variant: 'link',
      padded: false,
    }"
    :icon="data.icon"
    :title="data.title"
    :color="data.type"
    :ui="{ wrapper: 'my-2' }"
    @close="closed = true"
  >
    <template #description>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p v-html="markdownToHTML(data.body)"></p>
      <div class="text-right opacity-70">
        <time>{{ unixTimeToString(data.timeStamp) }}</time>
      </div>
    </template>
  </UAlert>
</template>
