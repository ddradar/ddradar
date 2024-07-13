<script setup lang="ts">
import type { NotificationListData } from '~~/schemas/notification'

defineProps<{ data: NotificationListData }>()
</script>

<template>
  <UAccordion
    :items="[
      {
        label: data.title,
        icon: data.icon,
        description: data.body,
        color: data.type,
      },
    ]"
  >
    <template #item="{ item }">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p v-html="markdownToHTML(item.description)"></p>
    </template>
  </UAccordion>
</template>
