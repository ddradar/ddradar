<script setup lang="ts">
const { t } = useI18n()
const { user, clear } = useUserSession()
const displayName = computed(
  () => `${user.value?.displayName}${user.value?.id ? '' : ' (未登録)'}`
)

async function logout() {
  await clear()
  navigateTo('/')
}
</script>

<template>
  <UHeader>
    <template #title>
      <NuxtLink to="/">DDRadar</NuxtLink>
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
      <AppPreferences />
    </template>
  </UHeader>
</template>
