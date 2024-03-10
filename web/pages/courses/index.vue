<script lang="ts" setup>
import { getListQuerySchema } from '~/schemas/course'

definePageMeta({ key: route => route.fullPath })

// Data & Hook
const _route = useRoute()
const { type, series } = getListQuerySchema.parse(_route.query)
const { t } = useI18n()
const { data: user } = await useFetch('/api/v1/user')
const { data: _data, pending: loading } = await useFetch('/api/v1/courses', {
  query: { type, series },
  watch: [_route.query],
  default: () => [],
})

// #region Paging
/** Current Page */
const page = ref(1)
/** Data count per page */
const pageCount = 50
/** Total data count */
const pageTotal = computed(() => _data.value.length)
const pageFrom = computed(() => (page.value - 1) * pageCount + 1)
const pageTo = computed(() => Math.min(page.value * pageCount, pageTotal.value))
const courses = computed(() =>
  _data.value.slice(pageFrom.value - 1, pageTo.value)
)
// #endregion

/** Page Title */
const title = computed(
  () =>
    `${type === 1 ? t('nonstop') : type === 2 ? t('grade') : t('course')}${typeof series === 'number' ? ` (${shortenSeriesName(seriesNames[series])})` : ''}`
)
/** Button Links to other courses */
const links = computed(() =>
  courseSeriesIndexes.flatMap(series => [
    {
      label: `${t('nonstop')} (${shortenSeriesName(seriesNames[series])})`,
      query: { type: 1, series },
    },
    {
      label: `${t('grade')} (${shortenSeriesName(seriesNames[series])})`,
      query: { type: 2, series },
    },
  ])
)
/** Table Columns */
const columns = computed(() => [
  { key: 'series', label: t('column.series') },
  { key: 'name', label: t('column.name') },
  ...(user.value ? [{ key: 'score', label: t('column.score') }] : []),
])

/** Open ScoreEditor modal. */
const editScore = async (_songId: string) => {}
</script>

<template>
  <UPage>
    <UPageHeader :title="title">
      <template #description>
        <UButton
          v-for="l in links"
          :key="l.query"
          :to="{ path: '/courses', query: l.query }"
          exact-query
          variant="ghost"
          color="blue"
        >
          {{ l.label }}
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <UTable
        :rows="courses"
        :columns="columns"
        :loading="loading"
        :empty-state="{
          icon: 'i-heroicons-circle-stack-20-solid',
          label: t('noData'),
        }"
      >
        <template #series-data="{ row }">
          {{ shortenSeriesName(row.series) }}
        </template>
        <template #name-data="{ row }">
          <ULink class="blue" :to="`/courses/${row.id}`">{{ row.name }}</ULink>
        </template>
        <template v-if="user" #score-data="{ row }">
          <UButton
            icon="i-heroicons-pencil-square"
            @click="editScore(row.id)"
          />
        </template>
      </UTable>

      <div v-if="pageTotal" class="flex flex-wrap justify-between items-center">
        <div>
          <i18n-t keypath="showing" tag="span" class="text-sm leading-5">
            <template #from>
              <span class="font-medium">{{ pageFrom }}</span>
            </template>
            <template #to>
              <span class="font-medium">{{ pageTo }}</span>
            </template>
            <template #total>
              <span class="font-medium">{{ pageTotal }}</span>
            </template>
          </i18n-t>
        </div>

        <UPagination
          v-model="page"
          :page-count="pageCount"
          :total="pageTotal"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<i18n lang="json">
{
  "ja": {
    "nonstop": "NONSTOP",
    "grade": "段位認定",
    "course": "コース一覧",
    "column": {
      "series": "シリーズ",
      "name": "コース名",
      "score": "スコア編集"
    },
    "showing": "{total} 件中 {from} 件から {to} 件を表示中",
    "noData": "データがありません"
  },
  "en": {
    "nonstop": "NONSTOP",
    "grade": "GRADE",
    "course": "COURSES",
    "column": {
      "series": "Series",
      "name": "Name",
      "score": "Edit Score"
    },
    "showing": "Showing {from} to {to} of {total} results",
    "noData": "No Data"
  }
}
</i18n>
