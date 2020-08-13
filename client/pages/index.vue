<template>
  <div>
    <top-message
      v-for="m in messages"
      :key="m.id"
      :type="m.type"
      :icon="m.icon"
      :title="m.title"
      :body="m.body"
      :time="m._ts"
    />
    <section class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">DDRadar</h1>
          <p class="subtitle">DDR Score Tracker</p>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="columns is-multiline">
        <section
          v-for="m in menuList"
          :key="m.label"
          class="column is-half-tablet is-one-third-desktop is-one-quarter-widescreen"
        >
          <card :title="m.label" type="is-primary" collapsible>
            <div class="card-content">
              <div class="buttons">
                <b-button
                  v-for="i in m.items"
                  :key="i.name"
                  type="is-text"
                  tag="nuxt-link"
                  :to="i.to"
                >
                  {{ i.name }}
                </b-button>
              </div>
            </div>
          </card>
        </section>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { getNotificationList, Notification } from '~/api/notification'
import { NameIndexList, SeriesList, shortenSeriesName } from '~/api/song'
import TopMessage from '~/components/pages/TopMessage.vue'
import Card from '~/components/shared/Card.vue'
import * as notification from '~/utils/notification'

@Component({ components: { Card, TopMessage }, fetchOnServer: false })
export default class IndexPage extends Vue {
  messages: Omit<Notification, 'sender' | 'pinned'>[] = []
  get menuList() {
    return [
      {
        label: '曲名から探す',
        items: NameIndexList.map((s, i) => ({
          name: s,
          to: `/name/${i}`,
        })),
      },
      {
        label: 'SINGLEのレベルから探す',
        items: [...Array(19).keys()].map(i => ({
          name: `${i + 1}`,
          to: `/single/${i + 1}`,
        })),
      },
      {
        label: 'DOUBLEのレベルから探す',
        items: [...Array(19).keys()].map(i => ({
          name: `${i + 1}`,
          to: `/double/${i + 1}`,
        })),
      },
      {
        label: 'シリーズから探す',
        items: SeriesList.map((name, i) => ({
          name: shortenSeriesName(name),
          to: `/series/${i}`,
        })).reverse(),
      },
    ]
  }

  async fetch() {
    try {
      this.messages = await getNotificationList(this.$http, true)
    } catch (error) {
      const message = error.message ?? error
      if (message !== '404') {
        notification.danger(this.$buefy, message)
      }
    }
  }
}
</script>
