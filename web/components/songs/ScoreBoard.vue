<template>
  <CollapsibleCard
    :title="getChartTitle(chart)"
    :variant="cardType"
    collapsible
  >
    <div class="card-content">
      <div class="table-container">
        <OTable
          :data="scores!"
          :loading="loading"
          :mobile-cards="false"
          :selected="userScore"
        >
          <OTableColumn v-slot="r" field="name" :label="t('list.name')">
            <NuxtLink
              v-if="!r.row.isArea"
              :to="`/users/${r.row.userId}`"
              class="is-size-7"
            >
              {{ r.row.userName }}
            </NuxtLink>
            <span v-else class="is-size-7">
              {{ t(`area.${r.row.userId}`) }}
            </span>
          </OTableColumn>
          <OTableColumn
            v-slot="r"
            field="score"
            :label="t('list.score')"
            centered
          >
            <ScoreBadge :lamp="r.row.clearLamp" :score="r.row.score" />
          </OTableColumn>
          <OTableColumn
            v-slot="r"
            field="exScore"
            :label="t('list.exScore')"
            numeric
          >
            <span class="is-size-7">{{ r.row.exScore }}</span>
          </OTableColumn>

          <template #empty>
            <section class="section">
              <div class="content has-text-grey has-text-centered">
                <p>{{ t('list.noData') }}</p>
              </div>
            </section>
          </template>
        </OTable>
      </div>
    </div>
    <footer class="card-footer">
      <a v-if="user" class="card-footer-item" @click="editScore()">
        {{ t('button.edit') }}
      </a>
      <a v-if="user && !isPageDeletedOnGate(songId)" class="card-footer-item">
        {{ t('button.import') }}
      </a>
      <a class="card-footer-item" @click="reloadAll()">
        {{ t('button.all') }}
      </a>
    </footer>
  </CollapsibleCard>
</template>

<i18n src="../../i18n/area.json"></i18n>
<i18n lang="json">
{
  "ja": {
    "list": {
      "name": "ユーザー名",
      "score": "スコア",
      "exScore": "EX",
      "noData": "データがありません",
      "top": "{area}トップ"
    },
    "button": {
      "edit": "編集",
      "import": "インポート",
      "all": "全件表示"
    },
    "area": {
      "0": "全国"
    }
  },
  "en": {
    "list": {
      "name": "Name",
      "score": "Score",
      "exScore": "EX",
      "noData": "No Data",
      "top": "{area} Top"
    },
    "button": {
      "edit": "Edit",
      "import": "Import",
      "all": "Show All"
    },
    "area": {
      "0": "World"
    }
  }
}
</i18n>

<script lang="ts" setup>
import { difficultyMap, isAreaUser, isPageDeletedOnGate } from '@ddradar/core'
import { useProgrammatic } from '@oruga-ui/oruga-next'

import CollapsibleCard from '~~/components/CollapsibleCard.vue'
import ScoreEditor from '~~/components/modal/ScoreEditor.vue'
import ScoreBadge from '~~/components/songs/ScoreBadge.vue'
import type { SongInfo } from '~~/server/api/v1/songs/[id].get'
import { getChartTitle } from '~~/utils/song'

interface ScoreBoardProps {
  songId: SongInfo['id']
  isCourse: boolean
  chart: Pick<SongInfo['charts'][number], 'playStyle' | 'difficulty' | 'level'>
}

const { oruga } = useProgrammatic()

const props = defineProps<ScoreBoardProps>()
const { t } = useI18n()
const { data: user } = await useFetch('/api/v1/user')
const fetchAllData = useState(() => false)
const {
  data: scores,
  pending: loading,
  refresh,
} = await useFetch(
  `/api/v1/scores/${props.songId}/${props.chart.playStyle}/${props.chart.difficulty}`,
  {
    query: computed(() => ({ scope: fetchAllData.value ? 'full' : 'medium' })),
    transform: rawScores =>
      rawScores.map(s =>
        isAreaUser({ id: s.userId }) ? { ...s, isArea: true } : s
      ),
  }
)

const cardType = computed(() =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  difficultyMap.get(props.chart.difficulty)!.toLowerCase()
)
const userScore = computed(() =>
  scores.value?.find(s => s.userId === user.value?.id)
)

/** Open ScoreEditor modal. */
const editScore = async () => {
  const instance = oruga.modal.open({
    component: ScoreEditor,
    props: {
      songId: props.songId,
      isCourse: props.isCourse,
      playStyle: props.chart.playStyle,
      difficulty: props.chart.difficulty,
    },
    trapFocus: true,
  })
  await instance.promise
  await refresh()
}
/** Reload scores with scope=full option. */
const reloadAll = async () => {
  fetchAllData.value = true
  await refresh()
}
</script>
