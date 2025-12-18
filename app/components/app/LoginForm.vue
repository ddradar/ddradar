<template>
  <UAuthForm title="ログイン" icon="i-lucide-user" :providers="providers" />
</template>

<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

const providers: ButtonProps[] = [
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    to: '/auth/github',
    external: true,
  },
  {
    label: 'X (Twitter)',
    icon: 'i-simple-icons-x',
    to: '/auth/x',
    external: true,
  },
  {
    label: 'LINE',
    icon: 'i-simple-icons-line',
    color: 'success',
    to: '/auth/line',
    external: true,
  },
]
</script>
