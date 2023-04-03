<template>
  <section class="section">
    <h1 class="title">ユーザーを探す</h1>
    <section>
      <OField grouped group-multiline>
        <OField label="所属地域">
          <OSelect v-model="area" placeholder="Select">
            <option v-for="a in areaOptions" :key="a.key" :value="a.value">
              {{ a.key }}
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
        <OButton variant="success">{{ t('search') }}</OButton>
      </OField>
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

import { useI18n } from '#i18n'

const { t } = useI18n()

const area = ref<AreaCode>(0)
const name = ref('')
const code = ref<number>()

const areaOptions = computed(() =>
  [...areaCodeSet].map(key => ({ key, value: t(`area.${key}`) }))
)
</script>
