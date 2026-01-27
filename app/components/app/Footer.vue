<script setup lang="ts">
const { github, x, crowdin } = useRuntimeConfig().public.community
</script>

<template>
  <UFooter>
    <template #left>
      <span class="text-sm text-neutral-500">
        &copy; 2020-{{ new Date().getFullYear() }} DDRadar
      </span>
    </template>

    <template #right>
      <UButton
        v-if="github"
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        :to="github"
        target="_blank"
        aria-label="GitHub"
      />
      <UButton
        v-if="x"
        icon="i-simple-icons-x"
        color="neutral"
        variant="ghost"
        :to="x"
        target="_blank"
        aria-label="X"
      />
      <UButton
        v-if="crowdin"
        icon="i-simple-icons-crowdin"
        color="neutral"
        variant="ghost"
        :to="crowdin"
        target="_blank"
        aria-label="Crowdin"
      />
    </template>
  </UFooter>
</template>
