<script setup lang="ts">
const { locale, locales } = useI18n()

const items = computed(() => [
  locales.value.map(l => ({
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
