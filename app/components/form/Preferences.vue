<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import { en, ja } from '@nuxt/ui/locale'

import { PlayStyle } from '~~/shared/schemas/step-chart'

const { locale, setLocale, t } = useI18n()

const style = useStyleVisibility()
const items = computed<SelectItem[]>(() => [
  { label: t('component.preference.playStyle.both'), value: 0 },
  {
    label: t('component.preference.playStyle.single'),
    value: PlayStyle.SINGLE,
  },
  {
    label: t('component.preference.playStyle.double'),
    value: PlayStyle.DOUBLE,
  },
])
</script>

<template>
  <div class="p-2">
    <fieldset class="mb-2">
      <legend
        class="leading-none font-semibold mb-2 select-none flex items-center gap-1"
      >
        {{ t('component.preference.language') }}
      </legend>
      <ULocaleSelect
        :model-value="locale"
        :locales="[en, ja]"
        @update:model-value="setLocale($event as typeof locale)"
      />
    </fieldset>
    <fieldset class="mb-2">
      <legend
        class="leading-none font-semibold mb-2 select-none flex items-center gap-1"
      >
        {{ t('component.preference.colorMode') }}
      </legend>
      <UColorModeSelect />
    </fieldset>
    <fieldset class="mb-2">
      <legend
        class="leading-none font-semibold mb-2 select-none flex items-center gap-1"
      >
        {{ t('component.preference.playStyle.legend') }}
      </legend>
      <USelect v-model="style" :items="items" />
    </fieldset>
  </div>
</template>
