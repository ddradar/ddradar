<template>
  <div>
    <b-navbar type="is-primary">
      <template slot="brand">
        <b-navbar-item tag="nuxt-link" :to="{ path: '/' }">
          <b>DDRadar</b>
        </b-navbar-item>
      </template>

      <template slot="start">
        <b-navbar-dropdown label="曲名から探す" hoverable collapsible>
          <b-navbar-item tag="div" class="buttons are-small">
            <b-button type="is-text" tag="nuxt-link" to="/name/0">
              あ
            </b-button>
            <b-button type="is-text" tag="nuxt-link" to="/name/1">
              か
            </b-button>
            <b-button type="is-text" tag="nuxt-link" to="/name/2">
              さ
            </b-button>
          </b-navbar-item>
        </b-navbar-dropdown>
      </template>

      <template slot="end">
        <b-navbar-item v-if="isLoggedIn" href="/.auth/logout">
          ログアウト
        </b-navbar-item>
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

@Component
export default class DefaultLayout extends Vue {
  isLoggedIn = false
}
</script>
