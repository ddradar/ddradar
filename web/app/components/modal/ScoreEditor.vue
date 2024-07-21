<script setup lang="ts">
import type { ScoreRecord, ScoreSchema } from '@ddradar/core'
import {
  calcMaxScore,
  clearLampMap,
  danceLevelSet,
  difficultyMap,
  playStyleMap,
  scoreRecordSchema as schema,
} from '@ddradar/core'

import type { FormError } from '#ui/types'

interface ScoreEditorProps {
  songId: string
  playStyle?: ScoreSchema['playStyle']
  difficulty?: ScoreSchema['difficulty']
}

const isOpen = defineModel<boolean>({ required: true })
const props = withDefaults(defineProps<ScoreEditorProps>(), {
  playStyle: undefined,
  difficulty: undefined,
})
const style = ref(props.playStyle)
const diff = ref(props.difficulty)
const _toast = useToast()
const { t } = useI18n()

const _songUri = computed(() => `/api/v1/songs/${props.songId}` as const)
const { data: song, execute: fetchSong } = useFetch(_songUri, {
  immediate: false,
})
if (props.songId) await fetchSong()
const _default: ScoreRecord = {
  score: 0,
  clearLamp: 0,
  rank: 'E',
}
const _scoreUri = computed(
  () =>
    `/api/v1/scores/${props.songId}/${style.value ?? 1}/${diff.value ?? 0}` as const
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

const playStyles = toSelectOptions(playStyleMap)
const difficulties = toSelectOptions(difficultyMap)
const clearLamps = toSelectOptions(clearLampMap)
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
/** Save current score. */
const saveScore = async () => {
  try {
    score.value = await $fetch<(typeof score)['value']>(_scoreUri.value, {
      method: 'POST',
      body: score.value,
    })
    _toast.add({
      id: 'score-updated',
      title: 'Success!',
      color: 'green',
    })
  } catch (error: unknown) {
    _toast.add({
      id: 'score-update-error',
      title: error as string,
      color: 'red',
    })
  }
}
/** Confirm and delete score data. */
const deleteScore = async () => {
  _toast.add({
    id: 'score-delete-confirm',
    title: t('message.confirmDelete'),
    icon: 'i-heroicons-exclamation-triangle-20-solid',
    timeout: 0,
    actions: [
      {
        label: t('field.yes'),
        click: async () => {
          try {
            await $fetch<(typeof score)['value']>(_scoreUri.value, {
              method: 'DELETE',
            })
            _toast.add({
              id: 'score-deleted',
              title: 'Success!',
              color: 'green',
            })
          } catch (error) {
            _toast.add({
              id: 'score-delete-error',
              title: String(error),
              color: 'red',
            })
          }
        },
      },
      { label: t('field.no') },
    ],
  })
}
</script>

<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <span class="text-lg">{{ song?.name }}</span>
        <div class="grid grid-cols-2 space-x-2 m-1">
          <USelect
            v-model.number="style"
            :options="playStyles"
            :placeholder="t('field.playStyle')"
          />
          <USelect
            v-model.number="diff"
            :options="difficulties"
            :placeholder="t('field.difficulty')"
          />
        </div>
        <span v-if="selectedChart">
          Lv.{{ selectedChart.level }} Notes:
          {{ selectedChart.notes }} FreezeArrow:
          {{ selectedChart.freezeArrow }} ShockArrow:
          {{ selectedChart.shockArrow }}
        </span>
      </template>
      <UForm
        id="scoreForm"
        :schema="schema"
        :state="score"
        :validate="validate"
        class="space-y-4"
        @submit="saveScore()"
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
        <div class="grid grid-cols-3">
          <UButton
            type="submit"
            form="scoreForm"
            block
            icon="i-heroicons-circle-stack-20-solid"
            color="green"
            :disabled="!selectedChart"
          >
            {{ t('save') }}
          </UButton>
          <UButton
            block
            icon="i-heroicons-trash-20-solid"
            color="red"
            :disabled="!selectedChart"
            @click="deleteScore()"
          >
            {{ t('delete') }}
          </UButton>
          <UButton
            block
            icon="i-heroicons-x-mark-20-solid"
            color="gray"
            @click="isOpen = false"
          >
            {{ t('close') }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<i18n lang="json">
{
  "ja": {
    "field": {
      "playStyle": "SP/DP",
      "difficulty": "難易度",
      "score": "通常スコア",
      "exScore": "EXスコア",
      "maxCombo": "最大コンボ数",
      "clearLamp": "クリアランプ",
      "rank": "ダンスレベル",
      "yes": "はい",
      "no": "いいえ"
    },
    "message": {
      "tooBig": "{maximum} 以下の数値を入力してください",
      "confirmDelete": "スコアを削除してもよろしいですか？"
    },
    "save": "保存",
    "delete": "スコア削除",
    "close": "閉じる"
  },
  "en": {
    "field": {
      "playStyle": "SP/DP",
      "difficulty": "Difficulty",
      "score": "Normal Score",
      "exScore": "EX SCORE",
      "maxCombo": "Max Combo",
      "clearLamp": "Clear lamp",
      "rank": "Dance Level",
      "yes": "Yes",
      "no": "No"
    },
    "message": {
      "tooBig": "Number must be less than or equal to {maximum}",
      "confirmDelete": "Are you sure you want to delete the score?"
    },
    "save": "Save",
    "delete": "Delete Score",
    "close": "Close"
  }
}
</i18n>
