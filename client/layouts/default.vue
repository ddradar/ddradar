<template>
  <div>
    <b-navbar type="is-primary">
      <template v-slot:brand>
        <b-navbar-item tag="nuxt-link" :to="{ path: '/' }">
          <img src="~assets/logo.svg" alt="DDRadar Logo" />
          <b>DDRadar</b>
        </b-navbar-item>
      </template>

      <template v-slot:start>
        <b-navbar-dropdown
          v-for="m in menuList"
          :key="m.label"
          class="is-hidden-touch"
          :label="m.label"
          hoverable
          collapsible
        >
          <b-navbar-item
            v-for="i in m.items"
            :key="i.name"
            tag="nuxt-link"
            :to="i.to"
          >
            {{ i.name }}
          </b-navbar-item>
        </b-navbar-dropdown>
        <b-navbar-dropdown
          class="is-hidden-touch"
          label="曲名から探す"
          hoverable
          collapsible
        >
          <b-navbar-item tag="div" class="buttons are-small">
            <b-button
              v-for="(label, i) in nameIndexList"
              :key="label"
              type="is-text"
              tag="nuxt-link"
              :to="`/name/${i}`"
            >
              {{ label }}
            </b-button>
          </b-navbar-item>
        </b-navbar-dropdown>
      </template>

      <template v-slot:end>
        <b-navbar-dropdown v-if="isLoggedIn" :label="name" hoverable right>
          <b-navbar-item tag="div">
            <div class="buttons">
              <b-button
                icon-left="account"
                type="is-info"
                tag="nuxt-link"
                :to="userPage"
              >
                マイページ
              </b-button>
              <b-button type="is-warning" tag="a" href="/.auth/logout">
                ログアウト
              </b-button>
            </div>
          </b-navbar-item>
        </b-navbar-dropdown>
        <b-navbar-dropdown v-else label="ログイン" hoverable right>
          <b-navbar-item tag="div">
            <div class="buttons">
              <b-button
                icon-left="twitter"
                type="is-info"
                tag="a"
                href="/.auth/login/twitter"
              >
                Twitterでログイン
              </b-button>
              <b-button
                icon-left="github"
                type="is-dark"
                tag="a"
                href="/.auth/login/github"
              >
                GitHubでログイン
              </b-button>
            </div>
          </b-navbar-item>
        </b-navbar-dropdown>
      </template>
    </b-navbar>

    <div>
      <b-loading :active.sync="isLoading" />
      <nuxt />
    </div>

    <footer class="footer">
      <div class="content has-text-centered">
        <p>
          不具合を発見した、または新機能の要望がある場合には、
          <a href="https://twitter.com/nogic1008" target="_blank">
            作者のTwitter
          </a>
          または
          <a href="https://github.com/ddradar/ddradar/issues" target="_blank">
            Githubのissue
          </a>
          にてご報告ください。
        </p>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { NameIndexList, SeriesList } from '~/types/api/song'

@Component({ fetchOnServer: false })
export default class DefaultLayout extends Vue {
  isLoading = true

  get isLoggedIn() {
    return !!this.$accessor.auth
  }

  get name() {
    return this.$accessor.user?.name
  }

  get userPage() {
    return `/users/${this.$accessor.user?.id}`
  }

  get menuList() {
    return [
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
          name,
          to: `/series/${i}`,
        })).reverse(),
      },
    ]
  }

  get nameIndexList() {
    return NameIndexList
  }

  async fetch() {
    await this.$accessor.fetchUser()
    if (this.$accessor.auth && !this.$accessor.user)
      this.$router.push('/profile')
    this.isLoading = false
  }
}
</script>
