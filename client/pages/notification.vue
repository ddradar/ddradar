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
          <b-table-column field="_ts" label="Date">
            {{ dateString(props.row._ts) }}
          </b-table-column>
          <b-table-column :visible="$accessor.isAdmin" label="Edit">
            <nuxt-link :to="`/admin/notification/${props.row.id}`">
              <b-icon icon="pencil-box-outline" />
            </nuxt-link>
          </b-table-column>
        </template>

        <template v-slot:detail="props">
          <top-message
            :type="props.row.type"
            :icon="props.row.icon"
            :title="props.row.title"
            :body="props.row.body"
            :time="props.row._ts"
          />
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
import { Component, Vue } from 'nuxt-property-decorator'

import { getNotificationList, Notification } from '~/api/notification'
import TopMessage from '~/components/pages/TopMessage.vue'
import { unixTimeToString } from '~/utils/date'
import * as popup from '~/utils/popup'

@Component({ components: { TopMessage }, fetchOnServer: false })
export default class UserListPage extends Vue {
  messages: Omit<Notification, 'sender' | 'pinned'>[] = []

  /** Call "Get Notification API" once. */
  async fetch() {
    try {
      this.messages = await getNotificationList(this.$http)
    } catch (error) {
      popup.danger(this.$buefy, error.message ?? error)
    }
  }

  dateString(unixTime: number) {
    return unixTimeToString(unixTime)
  }
}
</script>
