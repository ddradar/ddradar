<template>
  <section class="section">
    <h1 class="title">{{ t('pageTitle') }}</h1>
    <section>
      <OTable
        :data="messages!"
        paginated
        :per-page="20"
        striped
        :loading="pending"
        detailed
        detail-key="id"
        show-detail-icon
      >
        <OTableColumn v-slot="props" field="icon">
          <OButton :variant="props.row.type" :icon-left="props.row.icon" />
        </OTableColumn>
        <OTableColumn v-slot="props" field="title" :label="t('title')">
          {{ props.row.title }}
        </OTableColumn>
        <OTableColumn v-slot="props" field="timeStamp" :label="t('date')">
          {{ unixTimeToString(props.row.timeStamp) }}
        </OTableColumn>
        <OTableColumn v-slot="props" :visible="isAdmin" label="Edit">
          <NuxtLink :to="`/admin/notification/${props.row.id}`">
            <OIcon icon="pencil-box-outline" />
          </NuxtLink>
        </OTableColumn>

        <template #detail="props">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="content" v-html="markdownToHTML(props.row.body)"></div>
        </template>

        <template #empty>
          <section v-if="loading" class="section">
            <OSkeleton animated />
            <OSkeleton animated />
            <OSkeleton animated />
          </section>
          <section v-else class="section">
            <div class="content has-text-grey has-text-centered">
              <p>{{ t('noData') }}</p>
            </div>
          </section>
        </template>
      </OTable>
    </section>
  </section>
</template>

<i18n lang="json">
{
  "ja": {
    "pageTitle": "お知らせ一覧",
    "title": "タイトル",
    "date": "投稿日時",
    "noData": "データがありません"
  },
  "en": {
    "pageTitle": "All Notification List",
    "title": "Title",
    "date": "Date",
    "noData": "No data"
  }
}
</i18n>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import useAuth from '~~/composables/useAuth'
import { markdownToHTML, unixTimeToString } from '~~/utils/format'

// Data & Hook
const { t } = useI18n()
const { isAdmin } = await useAuth()
const { data: messages, pending } = await useLazyFetch('/api/v1/notification')
</script>
