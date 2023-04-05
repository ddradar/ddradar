<template>
  <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <NuxtLink class="navbar-item" to="/">
        <img src="~/assets/logo.svg" alt="DDRadar Logo" />
        <b>DDRadar</b>
      </NuxtLink>
      <a
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasic"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbarBasic" class="navbar-menu">
      <div class="navbar-start">
        <NuxtLink class="navbar-item" to="/users">ユーザーを探す</NuxtLink>
        <NuxtLink
          v-if="isLoggedIn"
          class="navbar-item"
          :to="`/users/${id}/scores`"
        >
          スコア一覧
        </NuxtLink>
        <div
          v-for="m in dropdownMenuList"
          :key="m.title"
          class="navbar-item has-dropdown is-hoverable"
        >
          <a class="navbar-link">{{ m.title }}</a>
          <div class="navbar-dropdown">
            <NuxtLink
              v-for="c in m.menu"
              :key="c.name"
              class="navbar-item"
              :to="c.to"
            >
              {{ c.name }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="navbar-end">
        <div v-if="isLoggedIn" class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">{{ name }}</a>
          <div class="navbar-dropdown is-right">
            <div class="buttons">
              <OButton
                icon-left="account"
                variant="info"
                tag="NuxtLink"
                :to="`/users/${id}`"
              >
                マイページ
              </OButton>
              <OButton variant="warning" @click="logout()">
                ログアウト
              </OButton>
            </div>
          </div>
        </div>
        <div v-else class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">ログイン</a>
          <div class="navbar-dropdown is-right">
            <div class="buttons">
              <OButton
                icon-left="twitter"
                variant="info"
                @click="login('twitter')"
              >
                Twitterでログイン
              </OButton>
              <OButton
                icon-left="github"
                variant="dark"
                @click="login('github')"
              >
                GitHubでログイン
              </OButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<i18n lang="json">
{
  "ja": {
    "menu": {
      "user": "ユーザーを探す",
      "scores": "スコア一覧",
      "single": "レベル(SP)",
      "double": "レベル(DP)",
      "series": "バージョン",
      "course": "コース",
      "nonstop": "NONSTOP({series})",
      "grade": "段位認定({series})",
      "mypage": "マイページ",
      "logout": "ログアウト",
      "login": "ログイン"
    },
    "login": {
      "twitter": "Twitterでログイン",
      "github": "GitHubでログイン"
    },
    "footer": {
      "help": "ヘルプ",
      "text": "{help} | 不具合を発見した、または新機能の要望がある場合には、{twitter}または{github}にてご報告ください。",
      "twitter": "作者のTwitter",
      "github": "Githubのissue"
    }
  },
  "en": {
    "menu": {
      "user": "Find User",
      "scores": "Score List",
      "single": "Level(SP)",
      "double": "Level(DP)",
      "series": "Version",
      "course": "Courses",
      "nonstop": "NONSTOP({series})",
      "grade": "GRADE({series})",
      "mypage": "MyPage",
      "logout": "Logout",
      "login": "Login"
    },
    "login": {
      "twitter": "Login via Twitter",
      "github": "Login via GitHub"
    },
    "footer": {
      "help": "Help",
      "text": "{help} | Did you find a bug or have an idea? Please report on {twitter} or {github}.",
      "twitter": "Twitter",
      "github": "GitHub"
    }
  }
}
</i18n>
<script lang="ts" setup>
import useAuth from '~~/composables/useAuth'
import {
  courseSeriesIndexes,
  seriesNames,
  shortenSeriesName,
} from '~~/utils/song'

const { id, isLoggedIn, name, login, logout } = await useAuth()

const dropdownMenuList = [
  {
    title: 'レベル(SP)',
    menu: [...Array(19).keys()].map(i => ({
      name: `LEVEL ${i + 1}`,
      to: `/charts?style=1&level=${i + 1}`,
    })),
  },
  {
    title: 'レベル(DP)',
    menu: [...Array(19).keys()].map(i => ({
      name: `LEVEL ${i + 1}`,
      to: `/charts?style=2&level=${i + 1}`,
    })),
  },
  {
    title: 'シリーズ',
    menu: seriesNames.map((name, i) => ({ name, to: `/songs?series=${i}` })),
  },
  {
    title: 'コース',
    menu: courseSeriesIndexes.flatMap(i => [
      {
        name: `NONSTOP(${shortenSeriesName(seriesNames[i])})`,
        to: `/courses?type=1&series=${i}`,
      },
      {
        name: `段位認定(${shortenSeriesName(seriesNames[i])})`,
        to: `/courses?type=2&series=${i}`,
      },
    ]),
  },
]
</script>
