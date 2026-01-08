<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()
</script>

<template>
  <UApp>
    <AppHeader />
    <UMain>
      <UError :error="error" />
    </UMain>
    <UFooter />
  </UApp>
</template>
