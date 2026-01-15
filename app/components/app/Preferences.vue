<script setup lang="ts">
import { en, ja } from '@nuxt/ui/locale'

const { locale, setLocale } = useI18n()
</script>

<template>
  <UPopover>
    <UButton variant="ghost" icon="i-lucide-settings" />

    <template #content>
      <fieldset>
        <ULocaleSelect
          :model-value="locale"
          :locales="[en, ja]"
          @update:model-value="setLocale($event as typeof locale)"
        />
      </fieldset>
      <fieldset><UColorModeSelect /></fieldset>
    </template>
  </UPopover>
</template>

<i18n lang="json">
{
  "en": {
    "language": "Language",
    "colorMode": "Color Mode",
    "login": "Login"
  },
  "ja": {
    "language": "言語",
    "colorMode": "カラーモード",
    "login": "ログイン"
  }
}
</i18n>
