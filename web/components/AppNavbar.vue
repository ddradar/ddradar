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
        :class="{ 'is-active': isActive }"
        aria-label="menu"
        aria-expanded="false"
        @click="isActive = !isActive"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div class="navbar-menu" :class="{ 'is-active': isActive }">
      <div class="navbar-start">
        <NuxtLink class="navbar-item" to="/users">
          {{ t('menu.user') }}
        </NuxtLink>
        <NuxtLink
          v-if="isLoggedIn"
          class="navbar-item"
          :to="`/users/${id}/scores`"
        >
          {{ t('menu.scores') }}
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
            <div class="navbar-item">
              <div class="field">
                <div class="control">
                  <OButton
                    icon-left="account"
                    variant="info"
                    tag="NuxtLink"
                    :to="`/users/${id}`"
                  >
                    {{ t('menu.mypage') }}
                  </OButton>
                </div>
              </div>
            </div>
            <div class="navbar-item">
              <div class="field">
                <div class="control">
                  <OButton variant="warning" @click="logout()">
                    {{ t('menu.logout') }}
                  </OButton>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">{{ t('menu.login') }}</a>
          <div class="navbar-dropdown is-right">
            <div class="navbar-item">
              <div class="field">
                <div class="control">
                  <OButton
                    icon-left="twitter"
                    variant="info"
                    @click="login('twitter')"
                  >
                    {{ t('menu.login_via', { provider: 'Twitter' }) }}
                  </OButton>
                </div>
              </div>
            </div>
            <div class="navbar-item">
              <div class="field">
                <div class="control">
                  <OButton
                    icon-left="github"
                    variant="dark"
                    @click="login('github')"
                  >
                    {{ t('menu.login_via', { provider: 'GitHub' }) }}
                  </OButton>
                </div>
              </div>
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
      "level": "レベル({style})",
      "series": "バージョン",
      "course": "コース",
      "nonstop": "NONSTOP({series})",
      "grade": "段位認定({series})",
      "mypage": "マイページ",
      "logout": "ログアウト",
      "login": "ログイン",
      "login_via": "{provider}でログイン"
    }
  },
  "en": {
    "menu": {
      "user": "Find User",
      "scores": "Score List",
      "level": "Level({style})",
      "series": "Version",
      "course": "Courses",
      "nonstop": "NONSTOP({series})",
      "grade": "GRADE({series})",
      "mypage": "MyPage",
      "logout": "Logout",
      "login": "Login",
      "login_via": "Login via {provider}"
    }
  }
}
</i18n>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import useAuth from '~~/composables/useAuth'
import {
  courseSeriesIndexes,
  seriesNames,
  shortenSeriesName,
} from '~~/utils/song'

const { t } = useI18n()
const { auth, id, isLoggedIn, name, login, logout } = await useAuth()
if (auth.value && !isLoggedIn.value) await navigateTo('/profile')

const isActive = useState(() => false)

const dropdownMenuList = [
  {
    title: t('menu.level', { style: 'SP' }),
    menu: [...Array(19).keys()].map(i => ({
      name: `LEVEL ${i + 1}`,
      to: `/charts?style=1&level=${i + 1}`,
    })),
  },
  {
    title: t('menu.level', { style: 'DP' }),
    menu: [...Array(19).keys()].map(i => ({
      name: `LEVEL ${i + 1}`,
      to: `/charts?style=2&level=${i + 1}`,
    })),
  },
  {
    title: t('menu.series'),
    menu: seriesNames.map((name, i) => ({ name, to: `/songs?series=${i}` })),
  },
  {
    title: t('menu.course'),
    menu: courseSeriesIndexes.flatMap(i => [
      {
        name: t('menu.nonstop', { series: shortenSeriesName(seriesNames[i]) }),
        to: `/courses?type=1&series=${i}`,
      },
      {
        name: t('menu.grade', { series: shortenSeriesName(seriesNames[i]) }),
        to: `/courses?type=2&series=${i}`,
      },
    ]),
  },
]
</script>
