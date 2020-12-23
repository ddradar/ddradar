<template>
  <section class="section">
    <section>
      <b-table
        :data="messages"
        paginated
        per-page="20"
        striped
        :loading="$fetchState.pending"
        detailed
        detail-key="id"
        show-detail-icon
      >
        <b-table-column v-slot="props" field="icon">
          <b-button :type="props.row.type" :icon-left="props.row.icon" />
        </b-table-column>
        <b-table-column v-slot="props" field="title" :label="$t('title')">
          {{ props.row.title }}
        </b-table-column>
        <b-table-column v-slot="props" field="timeStamp" :label="$t('date')">
          {{ props.row.date }}
        </b-table-column>
        <b-table-column
          v-slot="props"
          :visible="$accessor.isAdmin"
          label="Edit"
        >
          <nuxt-link :to="`/admin/notification/${props.row.id}`">
            <b-icon icon="pencil-box-outline" />
          </nuxt-link>
        </b-table-column>

        <template #detail="props">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="content" v-html="props.row.body" />
        </template>

        <template #empty>
          <section v-if="$fetchState.pending" class="section">
            <b-skeleton animated />
            <b-skeleton animated />
            <b-skeleton animated />
          </section>
          <section v-else class="section">
            <div class="content has-text-grey has-text-centered">
              <p>{{ $t('noData') }}</p>
            </div>
          </section>
        </template>
      </b-table>
    </section>
  </section>
</template>

<i18n>
{
  "ja": {
    "title": "タイトル",
    "date": "投稿日時",
    "noData": "データがありません"
  },
  "en": {
    "title": "Title",
    "date": "Date",
    "noData": "No data"
  }
}
</i18n>

<script lang="ts">
import type { NotificationListData } from '@core/api/notification'
import marked from 'marked'
import { Component, Vue } from 'nuxt-property-decorator'

import { getNotificationList } from '~/api/notification'
import { unixTimeToString } from '~/utils/date'
import * as popup from '~/utils/popup'

type NotificationDetail = Omit<NotificationListData, 'timeStamp'> & {
  date: string
}

@Component({ fetchOnServer: false })
export default class UserListPage extends Vue {
  messages: NotificationDetail[] = []

  /** Call "Get Notification API" once. */
  async fetch() {
    try {
      const messages = await getNotificationList(this.$http)
      this.messages = messages.map(d => ({
        id: d.id,
        type: d.type,
        icon: d.icon,
        title: d.title,
        body: marked(d.body),
        date: unixTimeToString(d.timeStamp),
      }))
    } catch (error) {
      popup.danger(this.$buefy, error.message ?? error)
    }
  }
}
</script>
