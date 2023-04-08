<template>
  <section class="section">
    <h1 class="title">{{ t('title') }}</h1>
    <section>
      <OField grouped group-multiline>
        <OField :label="t('field.area')">
          <OSelect v-model.number="area" placeholder="Select">
            <option v-for="a in areaOptions" :key="a.key" :value="a.key">
              {{ a.value }}
            </option>
          </OSelect>
        </OField>
        <OField :label="t('field.name')">
          <OInput v-model="name" />
        </OField>
        <OField :label="t('field.code')">
          <OInput
            v-model.number="code"
            placeholder="10000000"
            minlength="8"
            maxlength="8"
            pattern="^\d{8}$"
          />
        </OField>
      </OField>
      <OField>
        <OButton variant="success" icon-left="magnify" @click="search()">
          {{ t('search') }}
        </OButton>
      </OField>
    </section>

    <section>
      <OTable
        :data="users"
        striped
        :loading="loading"
        :mobile-cards="false"
        paginated
        per-page="50"
      >
        <OTableColumn v-slot="props" field="name" :label="t('list.name')">
          <NuxtLink :to="`/users/${props.row.id}`">
            {{ props.row.name }}
          </NuxtLink>
        </OTableColumn>
        <OTableColumn v-slot="props" field="area" :label="t('list.area')">
          {{ t(`area.${props.row.area}`) }}
        </OTableColumn>

        <template #empty>
          <section v-if="loading" class="section">
            <OSkeleton animated />
            <OSkeleton animated />
            <OSkeleton animated />
          </section>
          <section v-else class="section">
            <div class="content has-text-grey has-text-centered">
              <p>{{ t('list.empty') }}</p>
            </div>
          </section>
        </template>
      </OTable>
    </section>
  </section>
</template>

<i18n src="../../i18n/area.json"></i18n>
<i18n lang="json">
{
  "ja": {
    "title": "ユーザーを探す",
    "field": {
      "area": "所属地域",
      "name": "登録名(部分一致)",
      "code": "DDR CODE"
    },
    "list": {
      "name": "登録名",
      "area": "所属地域",
      "empty": "ユーザーが見つかりません"
    },
    "search": "検索"
  },
  "en": {
    "title": "Search User",
    "field": {
      "area": "Area",
      "name": "Name (partial match)",
      "code": "DDR CODE"
    },
    "list": {
      "name": "Name",
      "area": "Area",
      "empty": "Not Found User"
    },
    "search": "Search"
  }
}
</i18n>

<script lang="ts" setup>
import type { AreaCode } from '@ddradar/core'
import { areaCodeSet } from '@ddradar/core'
import { useI18n } from 'vue-i18n'

import type { UserInfo } from '~~/server/api/v1/users/index.get'

const { t } = useI18n()

const area = useState(() => 0 as AreaCode)
const name = useState(() => '')
const code = useState(() => undefined as number | undefined)
const loading = useState(() => false)
const users = useState(() => [] as UserInfo[])

const areaOptions = computed(() =>
  [...areaCodeSet].map(key => ({ key, value: t(`area.${key}`) }))
)

const search = async () => {
  loading.value = true
  users.value = await $fetch<UserInfo[]>('/api/v1/users', {
    query: { area: area.value, name: name.value, code: code.value },
  })
  loading.value = false
}
</script>
