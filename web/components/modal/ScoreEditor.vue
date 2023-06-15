<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <h1 class="modal-card-title">{{ info.name }}</h1>
    </header>
    <section class="modal-card-body">
      <!-- Select chart -->
      <h2 v-if="selectedChart" class="subtitle is-small">
        {{ getChartTitle(selectedChart) }}
      </h2>
      <OField v-else :label="t('label.selectChart')">
        <OSelect :disabled="selectedChart" @input="onChartSelected">
          <option v-for="c in charts" :key="c.label" :value="c">
            {{ c.label }}
          </option>
        </OSelect>
      </OField>

      <!-- Input score -->
      <template v-if="selectedChart">
        <OLoading v-model:active="pending" />
        <OField grouped>
          <OField :label="t('label.score')">
            <OInput
              v-model.number="score"
              type="number"
              required
              placeholder="0-1000000"
              min="0"
              max="1000000"
              step="10"
            />
          </OField>
          <OCheckBox v-model="isFailed">{{ t('label.rankE') }}</OCheckBox>
        </OField>

        <OField :label="t('label.clear')">
          <OSelect v-model.number="clearLamp" :placeholder="t('label.clear')">
            <option v-for="[i, label] in clearLampMap" :key="i" :value="i">
              {{ label }}
            </option>
          </OSelect>
        </OField>

        <OField :label="t('label.exScore')">
          <OInput
            v-model.number="exScore"
            type="number"
            min="0"
            :max="maxScore.exScore"
            :placeholder="`0-${maxScore.exScore}`"
          />
        </OField>

        <OField :label="t('label.maxCombo')">
          <OInput
            v-model.number="maxCombo"
            type="number"
            min="0"
            :max="maxScore.maxCombo"
            :placeholder="`0-${maxScore.maxCombo}`"
          />
        </OField>

        <OField>
          <OButton variant="info" icon-left="calculator" @click="calcScore()">
            {{ t('button.calc') }}
          </OButton>
        </OField>
      </template>
    </section>

    <footer v-if="selectedChart" class="modal-card-foot">
      <OButton variant="success" icon-left="content-save" @click="saveAsync()">
        {{ t('button.save') }}
      </OButton>
      <OButton variant="danger" icon-left="delete" @click="deleteAsync()">
        {{ t('button.delete') }}
      </OButton>
      <OButton variant="warning" @click="emits('close')">
        {{ t('button.close') }}
      </OButton>
    </footer>
  </div>
</template>

<i18n lang="json">
{
  "ja": {
    "label": {
      "selectChart": "譜面を選択",
      "score": "ハイスコア",
      "rankE": "E判定",
      "clear": "クリア種別",
      "exScore": "EXスコア",
      "maxCombo": "最大コンボ数"
    },
    "button": {
      "calc": "自動計算",
      "save": "保存",
      "delete": "削除",
      "close": "閉じる"
    },
    "message": {
      "cannotCalc": "情報が足りないため、スコアの自動計算ができませんでした。",
      "saved": "保存しました",
      "confirmDelete": "スコアを削除しますか？",
      "deleted": "削除しました"
    }
  },
  "en": {
    "label": {
      "selectChart": "Select Chart",
      "score": "Score",
      "rankE": "Rank E",
      "clear": "Clear Lamp",
      "exScore": "EX SCORE",
      "maxCombo": "MAX COMBO"
    },
    "button": {
      "calc": "Auto Calc",
      "save": "Save",
      "delete": "Delete",
      "close": "Close"
    },
    "message": {
      "cannotCalc": "Cannot guess score due to lack of information.",
      "saved": "Saved",
      "confirmDelete": "Do you delete this score?",
      "deleted": "Deleted"
    }
  }
}
</i18n>

<script lang="ts" setup>
import type { Score } from '@ddradar/core'
import {
  calcMaxScore,
  clearLampMap,
  getDanceLevel,
  mergeScore,
  setValidScoreFromChart,
} from '@ddradar/core'
import { useProgrammatic } from '@oruga-ui/oruga-next'
import { useI18n } from 'vue-i18n'

import DialogModal from '~~/components/modal/DialogModal.vue'
import type { CourseInfo } from '~~/server/api/v1/courses/[id].get'
import type { ScoreInfo } from '~~/server/api/v1/scores/[id]/[style]/[diff].get'
import type { SongInfo } from '~~/server/api/v1/songs/[id].get'

type ChartSchema = SongInfo['charts'][number] | CourseInfo['charts'][number]

interface ScoreEditorProps {
  info: SongInfo | CourseInfo
  playStyle?: SongInfo['charts'][number]['playStyle']
  difficulty?: SongInfo['charts'][number]['difficulty']
}

const props = defineProps<ScoreEditorProps>()
const emits = defineEmits<{ (e: 'close'): void }>()

const score = useState<ScoreInfo['score']>(() => 0)
const exScore = useState<ScoreInfo['exScore']>(() => 0)
const clearLamp = useState<ScoreInfo['clearLamp']>(() => 0 as const)
const maxCombo = useState<ScoreInfo['maxCombo']>(() => 0)
const isFailed = useState(() => false)
const playStyle = useState(() => props.playStyle)
const difficulty = useState(() => props.difficulty)

const { t } = useI18n()
const { oruga } = useProgrammatic()
const { pending, refresh } = await useFetch(
  `/api/v1/scores/${props.info.id}/${playStyle.value ?? 0}/${
    difficulty.value ?? 0
  }`,
  {
    query: { scope: 'private' },
    onResponse({ response }) {
      const [userScore] = response._data as ScoreInfo[]
      if (userScore) {
        score.value = userScore.score
        exScore.value ??= userScore.exScore
        clearLamp.value = userScore.clearLamp
        maxCombo.value ??= userScore.maxCombo
        isFailed.value = userScore.rank === 'E'
      }
    },
    onResponseError({ error }) {
      oruga.notification.open({
        message: error?.message,
        variant: 'danger',
        position: 'top',
      })
    },
  }
)

const rank = computed<ScoreInfo['rank']>(() =>
  isFailed.value ? 'E' : getDanceLevel(score.value)
)
const selectedChart = computed(() =>
  (props.info.charts as ChartSchema[]).find(
    c => c.playStyle === playStyle.value && c.difficulty === difficulty.value
  )
)
const charts = computed(() =>
  (props.info.charts as ChartSchema[]).map(c => ({
    playStyle: c.playStyle,
    difficulty: c.difficulty,
    label: getChartTitle(c),
  }))
)
const maxScore = computed(() =>
  calcMaxScore(
    selectedChart.value ?? /* c8 ignore next */ {
      notes: 0,
      freezeArrow: 0,
      shockArrow: 0,
    }
  )
)

const onChartSelected = async (c: (typeof charts)['value'][number]) => {
  playStyle.value = c.playStyle
  difficulty.value = c.difficulty
  await refresh()
}
const calcScore = () => {
  /* c8 ignore if */
  if (!selectedChart.value) return

  const currentScore = {
    score: score.value,
    exScore: exScore.value,
    maxCombo: maxCombo.value,
    clearLamp: clearLamp.value,
    rank: rank.value,
  }
  try {
    const calcedScore = mergeScore(
      currentScore,
      setValidScoreFromChart(selectedChart.value, currentScore)
    )
    score.value = calcedScore.score
    exScore.value = calcedScore.exScore
    maxCombo.value = calcedScore.maxCombo
    clearLamp.value = calcedScore.clearLamp
    isFailed.value = calcedScore.rank === 'E'
  } catch {
    oruga.notification.open({
      message: t('message.cannotCalc'),
      variant: 'warning',
      position: 'top',
    })
  }
}
const saveAsync = async () => {
  /* c8 ignore if */
  if (playStyle.value == null || difficulty.value == null) return
  const body: Score = {
    score: score.value,
    exScore: exScore.value,
    clearLamp: clearLamp.value,
    rank: rank.value,
    maxCombo: maxCombo.value,
  }

  try {
    await $fetch(
      `/api/v1/scores/${props.info.id}/${playStyle.value}/${difficulty.value}`,
      { method: 'POST', body }
    )
    oruga.notification.open({
      message: t('message.saved'),
      variant: 'success',
      position: 'top',
    })
  } catch (message) {
    oruga.notification.open({ message, variant: 'danger', position: 'top' })
  }

  emits('close')
}
const deleteAsync = async () => {
  /* c8 ignore if */
  if (playStyle.value == null || difficulty.value == null) return

  const instance = oruga.modal.open({
    component: DialogModal,
    props: { message: t('message.confirmDelete'), variant: 'warning' },
    trapFocus: true,
  })
  if ((await instance.promise) !== 'yes') return

  try {
    await $fetch(
      `/api/v1/scores/${props.info.id}/${playStyle.value}/${difficulty.value}`,
      { method: 'DELETE' }
    )
    oruga.notification.open({
      message: t('message.deleted'),
      variant: 'success',
      position: 'top',
    })
  } catch (message) {
    oruga.notification.open({ message, variant: 'danger', position: 'top' })
  }

  emits('close')
}
</script>
