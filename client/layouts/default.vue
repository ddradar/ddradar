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
        <b-navbar-item tag="nuxt-link" to="/users">
          ユーザーを探す
        </b-navbar-item>
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
          label="曲名"
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
        <b-navbar-dropdown
          v-if="$accessor.isLoggedIn"
          :label="$accessor.name"
          hoverable
          right
        >
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
                :href="`/.auth/login/twitter?post_login_redirect_uri=${$route.path}`"
              >
                Twitterでログイン
              </b-button>
              <b-button
                icon-left="github"
                type="is-dark"
                tag="a"
                :href="`/.auth/login/github?post_login_redirect_uri=${$route.path}`"
              >
                GitHubでログイン
              </b-button>
            </div>
          </b-navbar-item>
        </b-navbar-dropdown>
      </template>
    </b-navbar>

    <div>
      <b-loading :active.sync="$fetchState.pending" />
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

import { NameIndexList, SeriesList, shortenSeriesName } from '~/api/song'

@Component({ fetchOnServer: false })
export default class DefaultLayout extends Vue {
  get userPage() {
    return `/users/${this.$accessor.user?.id}`
  }

  get menuList() {
    return [
      {
        label: 'レベル(SINGLE)',
        items: [...Array(19).keys()].map(i => ({
          name: `LEVEL ${i + 1}`,
          to: `/single/${i + 1}`,
        })),
      },
      {
        label: 'レベル(DOUBLE)',
        items: [...Array(19).keys()].map(i => ({
          name: `LEVEL ${i + 1}`,
          to: `/double/${i + 1}`,
        })),
      },
      {
        label: 'バージョン',
        items: SeriesList.map((name, i) => ({
          name,
          to: `/series/${i}`,
        })).reverse(),
      },
      {
        label: 'コースデータ',
        items: [16, 17]
          .map(i => [
            {
              name: `NONSTOP(${shortenSeriesName(SeriesList[i])})`,
              to: `/nonstop/${i}`,
            },
            {
              name: `段位認定(${shortenSeriesName(SeriesList[i])})`,
              to: `/grade/${i}`,
            },
          ])
          .flat(),
      },
    ]
  }

  get nameIndexList() {
    return NameIndexList
  }

  /** Get Login user info */
  async fetch() {
    await this.$accessor.fetchUser()
    if (this.$accessor.auth && !this.$accessor.isLoggedIn)
      this.$router.push('/profile')
  }
}
</script>
