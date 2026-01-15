<spec lang="md">
# Score Input Modal

This component provides a modal dialog for users to input or edit their scores for a specific song chart.
It includes form fields for [ScoreRecord](#shared/schemas/score) attributes such as normal score, EX score, max combo, clear lamp, flare rank, and flare skill.

## Features

- Opens a modal dialog when the trigger button is clicked.
- Form validation using the `scoreRecordSchema`.
- Auto-calculation of EX score, max combo, and flare skill based on the chart data.
- Submits the score data to the server via `POST /api/me/scores/{songId}/{playStyle}/{difficulty}` endpoint.
  - Displays success or error toast notifications based on the submission result.
  - Emits a `refresh` event after successful submission to allow parent components to refresh the score list.

## Props

- `id` (string): The unique identifier for the song.
- `name` (string): The name of the song.
- `chart` (StepChart): The chart data for the song.
- `score` (ScoreRecord): Score record to edit; if null, a new score will be created.
  - default: Record with all fields set to initial values.
    - normalScore: `0`
    - clearLamp: `ClearLamp.Clear`
    - rank: `'D'`
    - flareRank: `FlareRank.None`
    - Other fields: `null`
- `...ButtonProps`: Additional button properties to customize the modal trigger button.

## Events

- `refresh`: Emitted after a successful score submission to refresh the score list.

## Form Fields

- **Score**(required): Numeric input for the normal score (0 - 1000000).
- **Failed**: Checkbox to mark the score as failed (E rank).
- **EX SCORE**: Numeric input for the EX score (0 - max EX score based on chart, set `null` if empty).
- **MAX COMBO**: Numeric input for the max combo (0 - max combo based on chart, set `null` if empty).
- **Clear Lamp**(required): Dropdown to select the clear lamp status.
- **Flare Rank**(required): Dropdown to select the flare rank.
- **Flare Skill**: Numeric input for the flare skill (0 - max flare skill based on chart level and selected flare rank, set `null` if empty).

## Actions

- **Auto Calculate**: Fills in the EX score, max combo, and flare skill based on the chart data.
- **Reset**: Clears the form to its initial state.
- **Save**: Submits the score data to the server. (`POST /api/me/scores/{songId}/{playStyle}/{difficulty}`)
</spec>

<script setup lang="ts">
import type { ButtonProps, SelectItem } from '@nuxt/ui'

import {
  ClearLamp,
  clearLampMap,
  FlareRank,
  getDanceLevel,
  scoreRecordSchema,
} from '#shared/schemas/score'
import { getChartName } from '#shared/schemas/step-chart'

type ScoreInputProps = {
  /** Song ID */
  id: string
  /** Song name */
  name: string
  /** Chart data */
  chart: StepChart
  /** Existing score record (for editing) */
  score?: ScoreRecord | null
}

const emptyScoreRecord: ScoreRecord = {
  normalScore: 0,
  exScore: null,
  maxCombo: null,
  clearLamp: ClearLamp.Clear,
  rank: 'D',
  flareRank: FlareRank.None,
  flareSkill: null,
}

const {
  id,
  name,
  chart,
  score = null,
  ...rest
} = defineProps<ScoreInputProps & ButtonProps>()
const emit = defineEmits<{
  /** Refresh the score list after submission */
  refresh: []
}>()

const toast = useToast()
const { t } = useI18n()

/** Reactive state for the score record form */
const state = ref<ScoreRecord>({ ...(score ?? emptyScoreRecord) })
/** Whether the score is marked as failed (E rank) */
const isFailed = ref(state.value.clearLamp === ClearLamp.Failed)
/** Submission loading state */
const submitting = ref(false)

/** Modal description (chart name and level) */
const description = computed(
  () => `${getChartName(chart)} (Lv.${chart?.level})`
)

/** Maximum possible scores based on the chart (to validate inputs) */
const maxScore = computed(() =>
  hasNotesInfo(chart) ? calcMaxScore(chart) : null
)
/** Maximum flare skill based on chart level and selected flare rank (to validate inputs) */
const maxFlareSkill = computed(() =>
  calcFlareSkill(chart.level, state.value.flareRank)
)
/** Items for clear lamp dropdown */
const clearLampOptions: SelectItem[] = [
  ...clearLampMap.entries().map(([value, label]) => ({ label, value })),
]
/** Items for flare rank dropdown */
const flareRankOptions = getSelectItems(FlareRank)

// Methods
/** Clear the form to its initial state. */
const clearForm = () => {
  state.value = { ...emptyScoreRecord }
}

/** Fill the score record with calculated values. */
const fillScoreRecord = () => {
  state.value.flareSkill = calcFlareSkill(chart.level, state.value.flareRank)
  if (hasNotesInfo(chart))
    state.value = fillScoreRecordFromChart(chart, state.value)
}

/** Submit the score data to the server. */
const onSubmit = async () => {
  const named = { entity: t('schema.score.entity') }
  try {
    submitting.value = true
    await $fetch(
      `/api/me/scores/${id}/${chart.playStyle}/${chart.difficulty}`,
      {
        method: 'POST',
        body: {
          normalScore: state.value.normalScore,
          exScore: state.value.exScore,
          maxCombo: state.value.maxCombo,
          clearLamp: state.value.clearLamp,
          rank: state.value.rank,
          flareRank: state.value.flareRank,
          flareSkill: state.value.flareSkill,
        },
      }
    )
    toast.add({ color: 'success', title: t('actions.save.success', named) })
    emit('refresh')
  } catch (error) {
    const description =
      error instanceof Error ? error.message : t('error.unknown')
    toast.add({
      color: 'error',
      title: t('actions.save.error', named),
      description,
    })
  } finally {
    submitting.value = false
  }
}

/* Update clear lamp and rank when isFailed changes */
watch(isFailed, newVal => {
  if (newVal) {
    state.value.clearLamp = ClearLamp.Failed
    state.value.rank = 'E'
  } else {
    state.value.rank = getDanceLevel(state.value.normalScore)
    // Change Failed -> Clear only to keep user selection
    if (state.value.clearLamp === ClearLamp.Failed)
      state.value.clearLamp = ClearLamp.Clear
  }
})
</script>

<template>
  <UModal
    :title="t('component.score_input.title', { name: name })"
    :description="description"
  >
    <UButton v-bind="rest" />

    <template #body>
      <UForm
        role="form"
        :state="state"
        :schema="scoreRecordSchema"
        @submit="onSubmit"
      >
        <div class="space-y-4">
          <UFormField
            :label="t('schema.score.normalScore.label')"
            name="normalScore"
            required
          >
            <UInput
              v-model.number="state.normalScore"
              type="number"
              :placeholder="t('schema.score.normalScore.placeholder')"
              :min="0"
              :max="1000000"
            />
          </UFormField>

          <UCheckbox
            v-model="isFailed"
            :label="t('schema.score.rank.isFailed')"
            aria-label="Failed"
          />

          <UFormField :label="t('schema.score.exScore.label')" name="exScore">
            <UInput
              v-model.number="state.exScore"
              type="number"
              :placeholder="
                t('schema.score.exScore.placeholder', {
                  max: maxScore?.exScore ?? '',
                })
              "
              :min="0"
              :max="maxScore ? maxScore.exScore : undefined"
            />
          </UFormField>

          <UFormField :label="t('schema.score.maxCombo.label')" name="maxCombo">
            <UInput
              v-model.number="state.maxCombo"
              type="number"
              :placeholder="
                t('schema.score.maxCombo.placeholder', {
                  max: maxScore?.maxCombo ?? '',
                })
              "
              :min="0"
              :max="maxScore ? maxScore.maxCombo : undefined"
            />
          </UFormField>

          <UFormField
            :label="t('schema.score.clearLamp.label')"
            name="clearLamp"
            required
          >
            <USelect v-model="state.clearLamp" :items="clearLampOptions" />
          </UFormField>

          <UFormField
            :label="t('schema.score.flareRank.label')"
            name="flareRank"
          >
            <USelect v-model="state.flareRank" :items="flareRankOptions" />
          </UFormField>

          <UFormField
            :label="t('schema.score.flareSkill.label')"
            name="flareSkill"
          >
            <UInput
              v-model.number="state.flareSkill"
              type="number"
              :placeholder="
                t('schema.score.flareSkill.placeholder', { max: maxFlareSkill })
              "
              :min="0"
              :max="maxFlareSkill"
            />
          </UFormField>
        </div>
        <UButton
          type="button"
          aria-label="Auto-fill score fields"
          @click="fillScoreRecord"
        >
          {{ t('component.score_input.auto') }}
        </UButton>
        <UButton
          type="button"
          aria-label="Reset form to initial state"
          @click="clearForm"
        >
          {{ t('component.score_input.reset') }}
        </UButton>
        <UButton
          type="submit"
          aria-label="Submit score record"
          :loading="submitting"
        >
          {{ t('actions.save.label') }}
        </UButton>
      </UForm>
    </template>
  </UModal>
</template>
