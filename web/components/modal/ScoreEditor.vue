<script setup lang="ts">
import type { Score, ScoreSchema } from '@ddradar/core'
import {
  calcMaxScore,
  clearLampMap,
  danceLevelSet,
  difficultyMap,
  playStyleMap,
  score as schema,
} from '@ddradar/core'

import type { FormError } from '#ui/types'

interface ScoreEditorProps {
  songId: string
  playStyle?: ScoreSchema['playStyle']
  difficulty?: ScoreSchema['difficulty']
  isCourse?: boolean
}

const isOpen = defineModel<boolean>({ required: true })
const props = withDefaults(defineProps<ScoreEditorProps>(), {
  playStyle: undefined,
  difficulty: undefined,
  isCourse: false,
})
const _style = ref(props.playStyle)
const _diff = ref(props.difficulty)
const style = computed({
  get: () => props.playStyle ?? _style.value,
  set: v => (_style.value = v),
})
const diff = computed({
  get: () => props.difficulty ?? _diff.value,
  set: v => (_diff.value = v),
})
const _toast = useToast()
const { t } = useI18n()

const _songUri = computed(
  () =>
    `/api/v1/${props.isCourse ? 'courses' : 'songs'}/${props.songId}` as const
)
const { data: song, execute: fetchSong } = useFetch(_songUri, {
  immediate: false,
})
if (props.songId) await fetchSong()
const _default: Score = {
  score: 0,
  clearLamp: 0,
  rank: 'E',
}
const _scoreUri = computed(
  () => `/api/v1/scores/${props.songId}/${style.value}/${diff.value}` as const
)
const { data: score, execute: fetchScore } = useFetch(_scoreUri, {
  query: { scope: 'private' },
  transform: d => d[0] ?? _default,
  default: () => _default,
  immediate: false,
  deep: false,
})
if (style.value !== undefined && diff.value !== undefined) await fetchScore()

const selectedChart = computed(() =>
  song.value?.charts.find(
    d => d.playStyle === style.value && d.difficulty === diff.value
  )
)
const maxScore = computed(() =>
  selectedChart.value ? calcMaxScore(selectedChart.value) : null
)

const playStyles = [...playStyleMap.entries()].map(([value, label]) => ({
  value,
  label,
}))
const difficulties = [...difficultyMap.entries()].map(([value, label]) => ({
  value,
  label,
}))
const clearLamps = [...clearLampMap.entries()].map(([value, label]) => ({
  value,
  label,
}))
/** Validate input score (compare max score) */
const validate = () => {
  const errors: FormError[] = []
  if (!maxScore.value) return errors

  if (score.value.exScore && score.value.exScore > maxScore.value.exScore)
    errors.push({
      path: 'exScore',
      message: t('message.tooBig', { maximum: maxScore.value.exScore }),
    })
  if (score.value.maxCombo && score.value.maxCombo > maxScore.value.maxCombo)
    errors.push({
      path: 'maxCombo',
      message: t('message.tooBig', { maximum: maxScore.value.maxCombo }),
    })

  return errors
}
const save = async () => {
  try {
    score.value = await $fetch<(typeof score)['value']>(_scoreUri.value, {
      method: 'POST',
      body: score.value,
    })
    _toast.add({
      id: 'notification-updated',
      title: 'Success!',
      color: 'green',
    })
  } catch (error: any) {
    _toast.add({ id: 'notification-update-error', title: error, color: 'red' })
  }
}
</script>

<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        {{ song?.name }}
        <div
          v-if="style === undefined || diff === undefined"
          class="grid grid-cols-2"
        >
          <USelect v-model="style" :options="playStyles" />
          <USelect v-model="diff" :options="difficulties" />
        </div>
        <span v-else>
          ({{ `${playStyleMap.get(style)}-${difficultyMap.get(diff)}` }})
        </span>
      </template>
      <UForm
        id="scoreForm"
        :schema="schema"
        :state="score"
        :validate="validate"
        class="space-y-4"
        @submit="save()"
      >
        <UFormGroup name="score" :label="t('field.score')">
          <UInput v-model.number="score.score" type="number" />
        </UFormGroup>
        <UFormGroup name="exScore" :label="t('field.exScore')">
          <UInput v-model.number="score.exScore" type="number" />
        </UFormGroup>
        <UFormGroup name="maxCombo" :label="t('field.maxCombo')">
          <UInput v-model.number="score.maxCombo" type="number" />
        </UFormGroup>
        <UFormGroup name="clearLamp" :label="t('field.clearLamp')">
          <USelect v-model.number="score.clearLamp" :options="clearLamps" />
        </UFormGroup>
        <UFormGroup name="rank" :label="t('field.rank')">
          <USelect v-model="score.rank" :options="[...danceLevelSet]" />
        </UFormGroup>
      </UForm>
      <template #footer>
        <UButton type="submit" form="scoreForm">{{ t('save') }}</UButton>
        <UButton>{{ t('delete') }}</UButton>
        <UButton>{{ t('close') }}</UButton>
      </template>
    </UCard>
  </UModal>
</template>

<i18n lang="json">
{
  "ja": {
    "field": {
      "score": "通常スコア",
      "exScore": "EXスコア",
      "maxCombo": "最大コンボ数",
      "clearLamp": "クリアランプ",
      "rank": "ダンスレベル"
    },
    "message": {
      "tooBig": "{maximum} 以下の数値を入力してください"
    },
    "save": "保存",
    "delete": "スコア削除",
    "close": "閉じる"
  },
  "en": {
    "field": {
      "score": "Normal Score",
      "exScore": "EX SCORE",
      "maxCombo": "Max Combo",
      "clearLamp": "Clear lamp",
      "rank": "Dance Level"
    },
    "message": {
      "tooBig": "Number must be less than or equal to {maximum}"
    },
    "save": "Save",
    "delete": "Delete Score",
    "close": "Close"
  }
}
</i18n>
