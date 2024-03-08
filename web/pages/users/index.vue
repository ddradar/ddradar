<script lang="ts" setup>
import { areaCodeSet, userSchema } from '@ddradar/core'
import { z } from 'zod'

// #region Data Fetching
/** Expected queries */
const schema = z.object({
  name: z.ostring(),
  area: z.coerce
    .number()
    .pipe(userSchema.shape.area)
    .optional()
    .catch(undefined),
  code: z.coerce
    .number()
    .pipe(userSchema.shape.code)
    .optional()
    .catch(undefined),
})
/** Search Form conditions */
const query = reactive<z.infer<typeof schema>>({
  name: '',
  area: 0,
  code: undefined,
})
const {
  data: _data,
  execute,
  status: _status,
} = useFetch('/api/v1/users', {
  query,
  immediate: false,
  default: () => [],
  watch: false,
})
/** Loading state */
const loading = computed(() => _status.value === 'pending')
// #endregion

const pageCount = 20
const { page, total, from, to, data: users } = usePaging(pageCount, _data)

// #region I18n
const { t } = useI18n()
/** Area Options */
const areaOptions = computed(() =>
  [...areaCodeSet].map(value => ({ value, label: t(`area.${value}`) }))
)
/** Table Columns */
const columns = computed(() => [
  { key: 'name', label: t('column.name') },
  { key: 'area', label: t('column.area') },
])
// #endregion
</script>

<template>
  <UPage>
    <UPageHeader headline="User" :title="t('title')" />

    <UPageBody>
      <UForm :state="query" :schema="schema" @submit="execute">
        <UPageGrid>
          <UFormGroup :label="t('field.area')" name="area">
            <USelect v-model="query.area" :options="areaOptions" />
          </UFormGroup>
          <UFormGroup :label="t('field.name')" name="name">
            <UInput v-model="query.name" />
          </UFormGroup>
          <UFormGroup :label="t('field.code')" name="code">
            <UInput v-model.number="query.code" placeholder="10000000" />
          </UFormGroup>
        </UPageGrid>

        <UButton
          icon="i-heroicons-magnifying-glass-20-solid"
          color="green"
          type="submit"
        >
          {{ t('search') }}
        </UButton>
      </UForm>

      <UDivider class="my-4" />

      <UTable
        :rows="users"
        :columns="columns"
        :loading="loading"
        :empty-state="{
          icon: 'i-heroicons-circle-stack-20-solid',
          label: t('noData'),
        }"
      >
        <template #name-data="{ row }">
          <ULink :to="`/users/${row.id}`">{{ row.name }}</ULink>
        </template>

        <template #area-data="{ row }">{{ t(`area.${row.area}`) }}</template>
      </UTable>

      <div v-if="total" class="flex flex-wrap justify-between items-center">
        <div>
          <i18n-t keypath="showing" tag="span" class="text-sm leading-5">
            <template #from>
              <span class="font-medium">{{ from }}</span>
            </template>
            <template #to>
              <span class="font-medium">{{ to }}</span>
            </template>
            <template #total>
              <span class="font-medium">{{ total }}</span>
            </template>
          </i18n-t>
        </div>

        <UPagination v-model="page" :page-count="pageCount" :total="total" />
      </div>
    </UPageBody>
  </UPage>
</template>

<i18n src="~/locales/area.json"></i18n>
<i18n lang="json">
{
  "ja": {
    "title": "ユーザーを探す",
    "field": {
      "area": "所属地域",
      "name": "登録名(部分一致)",
      "code": "DDR CODE"
    },
    "column": {
      "name": "登録名",
      "area": "所属地域"
    },
    "showing": "{total} 件中 {from} 件から {to} 件を表示中",
    "noData": "ユーザーが見つかりません",
    "search": "検索"
  },
  "en": {
    "title": "Search User",
    "field": {
      "area": "Area",
      "name": "Name (partial match)",
      "code": "DDR CODE"
    },
    "column": {
      "name": "Name",
      "area": "Area"
    },
    "showing": "Showing {from} to {to} of {total} results",
    "noData": "Not Found User",
    "search": "Search"
  }
}
</i18n>
