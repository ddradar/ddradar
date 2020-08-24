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
        <template v-slot:default="props">
          <b-table-column field="icon" label="Icon">
            <b-button :type="props.row.type" :icon-left="props.row.icon" />
          </b-table-column>
          <b-table-column field="title" label="Title">
            {{ props.row.title }}
          </b-table-column>
          <b-table-column field="timeStamp" label="Date">
            {{ props.row.date }}
          </b-table-column>
          <b-table-column :visible="$accessor.isAdmin" label="Edit">
            <nuxt-link :to="`/admin/notification/${props.row.id}`">
              <b-icon icon="pencil-box-outline" />
            </nuxt-link>
          </b-table-column>
        </template>

        <template v-slot:detail="props">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="content" v-html="props.row.body" />
        </template>

        <template v-slot:empty>
          <section v-if="$fetchState.pending" class="section">
            <b-skeleton animated />
            <b-skeleton animated />
            <b-skeleton animated />
          </section>
          <section v-else class="section">
            <div class="content has-text-grey has-text-centered">
              <p>Nothing here.</p>
            </div>
          </section>
        </template>
      </b-table>
    </section>
  </section>
</template>

<script lang="ts">
import marked from 'marked'
import { Component, Vue } from 'nuxt-property-decorator'

import { getNotificationList, Notification } from '~/api/notification'
import TopMessage from '~/components/pages/TopMessage.vue'
import { unixTimeToString } from '~/utils/date'
import * as popup from '~/utils/popup'

@Component({ components: { TopMessage }, fetchOnServer: false })
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

type NotificationDetail = Omit<
  Notification,
  'sender' | 'pinned' | 'timeStamp'
> & {
  date: string
}
</script>
