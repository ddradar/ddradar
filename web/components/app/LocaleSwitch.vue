<script setup lang="ts">
import type { DropdownItem } from '#ui/types'

const { locale, locales } = useI18n()

const items = computed<DropdownItem[][]>(() => [
  locales.value.map<DropdownItem>(l => ({
    label: l.name!,
    icon: `i-flag-${l.flag}-4x3`,
    click: () => (locale.value = l.code),
  })),
])
</script>

<template>
  <UDropdown :items="items">
    <UButton
      icon="i-heroicons-language-20-solid"
      color="gray"
      variant="ghost"
    />
  </UDropdown>
</template>
