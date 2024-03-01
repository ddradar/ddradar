<template>
  <section class="section">
    <template v-if="user">
      <h1 class="title">{{ user.name }}</h1>
      <h2 class="subtitle">{{ areaName }} / {{ ddrCode }}</h2>

      <div class="buttons">
        <OButton
          icon-left="magnify"
          variant="success"
          tag="nuxt-link"
          :to="`/users/${user.id}/scores`"
        >
          {{ t('button.scores') }}
        </OButton>
        <template v-if="isSelfPage">
          <OButton
            icon-left="import"
            variant="primary"
            tag="nuxt-link"
            to="/import"
          >
            {{ t('button.import') }}
          </OButton>
          <OButton
            icon-left="account-cog"
            variant="info"
            tag="nuxt-link"
            to="/profile"
          >
            {{ t('button.settings') }}
          </OButton>
        </template>
      </div>

      <section class="section">
        <div class="content columns is-multiline">
          <section
            v-for="(style, i) in ['SP', 'DP']"
            :key="`radar-${style}`"
            class="column is-half-tablet"
          >
            <Card
              :title="t('title.radar', [style])"
              variant="primary"
              collapsible
            >
              <div class="card-content">
                <GrooveRadar
                  v-if="radars && radars[i]"
                  class="chart"
                  :radar="radars[i]"
                />
                <div v-else class="content has-text-grey has-text-centered">
                  <p>{{ t('noData') }}</p>
                </div>
              </div>
            </Card>
          </section>
        </div>
        <div class="content columns is-multiline">
          <section
            v-for="(style, i) in ['SP', 'DP']"
            :key="`clear-${style}`"
            class="column is-half-widescreen"
          >
            <Card
              :title="t('title.clear', [style])"
              variant="primary"
              collapsible
            >
              <div class="card-content">
                <ClearStatus
                  :statuses="clears?.filter(d => d.playStyle === i + 1)"
                />
              </div>
            </Card>
          </section>
        </div>
      </section>
    </template>
    <template v-else>{{ t('empty') }}</template>
  </section>
</template>

<i18n src="~/i18n/area.json"></i18n>
<i18n lang="json">
{
  "ja": {
    "pageTitle": "ユーザー詳細",
    "button": {
      "scores": "スコア一覧",
      "import": "スコアのインポート",
      "settings": "設定"
    },
    "title": {
      "radar": "グルーブレーダー ({0})",
      "clear": "クリア状況 ({0})"
    },
    "empty": "ユーザーが存在しないか、非公開に設定されています。",
    "noData": "データがありません"
  },
  "en": {
    "pageTitle": "User Detail",
    "button": {
      "scores": "Score List",
      "import": "Import Scores",
      "settings": "Settings"
    },
    "title": {
      "radar": "Groove Radar ({0})",
      "clear": "Clear Status ({0})"
    },
    "empty": "User does not exist or is private",
    "noData": "No Data"
  }
}
</i18n>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import Card from '~~/components/CollapsibleCard.vue'
import ClearStatus from '~~/components/users/ClearStatus.vue'
import GrooveRadar from '~~/components/users/GrooveRadar.vue'

const { t } = useI18n()
const _route = useRoute()
const { data: loginUser } = await useFetch('/api/v1/user')
const [{ data: user }, { data: radars }, { data: clears }] = await Promise.all([
  useFetch(`/api/v1/users/${_route.params.id}`),
  useFetch(`/api/v1/users/${_route.params.id}/radar`),
  useFetch(`/api/v1/users/${_route.params.id}/clear`),
])

const areaName = computed(() =>
  user.value ? t(`area.${user.value.area}`) : ''
)
const ddrCode = computed(() =>
  user.value?.code
    ? String(user.value.code).replace(/^(\d{4})(\d{4})$/, '$1-$2')
    : ''
)
const isSelfPage = computed(
  () => !!user.value && user.value.id === loginUser.value?.id
)
</script>

<style scoped>
.chart {
  max-height: 80vh;
}
</style>
