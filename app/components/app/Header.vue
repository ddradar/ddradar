<script setup lang="ts">
const { t } = useI18n()
const { user, clear } = useUserSession()

const displayName = computed(() =>
  user.value?.id
    ? user.value?.displayName
    : t('schema.user.unregistered', { name: user.value?.displayName })
)

async function logout() {
  await clear()
  await navigateTo('/')
}
</script>

<template>
  <UHeader>
    <template #title>
      <AppLogo class="w-auto h-6 shrink-0" />
      <span class="font-bold text-lg">DDRadar</span>
    </template>

    <template #right>
      <AuthState>
        <template #default="{ loggedIn }">
          <template v-if="loggedIn">
            <div class="flex items-center gap-3">
              <UButton to="/profile" variant="ghost" icon="i-lucide-user">
                {{ t('schema.user.entity') }}
              </UButton>
              <UAvatar :src="user?.avatarUrl" />
              <span>{{ displayName }}</span>
              <UButton @click="logout">{{ t('actions.logout.label') }}</UButton>
            </div>
          </template>
          <UModal v-else>
            <UButton>{{ t('actions.login.label') }}</UButton>
            <template #content>
              <UCard>
                <AppLoginForm />
              </UCard>
            </template>
          </UModal>
        </template>
      </AuthState>
      <UPopover>
        <UButton variant="ghost" icon="i-lucide-settings" />
        <template #content><FormPreferences /></template>
      </UPopover>
    </template>
  </UHeader>
</template>
