<spec lang="md">
# LoginForm Component

This component provides a login form with multiple authentication providers.
It utilizes the `UAuthForm` component to display buttons for GitHub, X (Twitter), and LINE login options.

## Providers

- **GitHub**: Redirects to `/auth/github` (handler by nuxt-auth-utils) for GitHub authentication.
- **X (Twitter)**: Redirects to `/auth/x` (handler by nuxt-auth-utils) for X (Twitter) authentication.
- **LINE**: Redirects to `/auth/line` (handler by nuxt-auth-utils) for LINE authentication.
</spec>

<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

const { t } = useI18n()
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

<template>
  <UAuthForm
    :title="t('actions.login.label')"
    icon="i-lucide-user"
    :providers="providers"
  />
</template>
