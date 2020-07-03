<template>
  <div>
    <b-navbar type="is-primary">
      <template slot="brand">
        <b-navbar-item tag="nuxt-link" :to="{ path: '/' }">
          <img src="~assets/logo.svg" alt="DDRadar Logo" />
          <b>DDRadar</b>
        </b-navbar-item>
      </template>

      <template slot="start">
        <b-navbar-dropdown label="SINGLEのレベルから探す" hoverable collapsible>
          <b-navbar-item
            v-for="level in levelList"
            :key="level"
            tag="nuxt-link"
            :to="`/single/${level}`"
          >
            {{ level }}
          </b-navbar-item>
        </b-navbar-dropdown>
        <b-navbar-dropdown label="DOUBLEのレベルから探す" hoverable collapsible>
          <b-navbar-item
            v-for="level in levelList"
            :key="level"
            tag="nuxt-link"
            :to="`/double/${level}`"
          >
            {{ level }}
          </b-navbar-item>
        </b-navbar-dropdown>
        <b-navbar-dropdown label="曲名から探す" hoverable collapsible>
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
        <b-navbar-dropdown label="シリーズから探す" hoverable collapsible>
          <b-navbar-item
            v-for="(label, i) in seriesList"
            :key="label"
            tag="nuxt-link"
            :to="`/series/${i}`"
          >
            {{ label }}
          </b-navbar-item>
        </b-navbar-dropdown>
      </template>

      <template slot="end">
        <b-navbar-dropdown v-if="isLoggedIn" :label="name" hoverable right>
          <b-navbar-item tag="div">
            <div class="buttons">
              <b-button
                icon-left="account-cog"
                type="is-info"
                tag="nuxt-link"
                to="/profile"
              >
                設定
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

    <nuxt />

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

@Component
export default class DefaultLayout extends Vue {
  nameIndexList = NameIndexList
  seriesList = SeriesList
  levelList = [...Array(19).keys()].map(n => n + 1)

  get isLoggedIn() {
    return !!this.$accessor.auth
  }

  get name() {
    return this.$accessor.user?.name
  }
}
</script>
