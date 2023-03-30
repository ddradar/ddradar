<template>
  <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <NuxtLink class="navbar-item" to="/">
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
          :to="`/users/${user?.id}/scores`"
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
                :to="`/users/${user?.id}`"
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

<script lang="ts" setup>
import useAuth from '~~/composables/useAuth'
import {
  courseSeriesIndexes,
  seriesNames,
  shortenSeriesName,
} from '~~/utils/song'

const { user, isLoggedIn, name, login, logout } = await useAuth()

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
