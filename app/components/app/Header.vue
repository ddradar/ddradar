<template>
  <UHeader>
    <template #title>
      <NuxtLink to="/">DDRadar</NuxtLink>
    </template>
    <template #right>
      <AuthState>
        <template #default="{ loggedIn }">
          <template v-if="loggedIn">
            <UAvatar :src="user?.avatarUrl" />
            {{ displayName }}
            <UButton @click="logout">Logout</UButton>
          </template>
          <UModal v-else>
            <UButton>Login</UButton>
            <template #content>
              <UCard>
                <AppLoginForm />
              </UCard>
            </template>
          </UModal>
        </template>
      </AuthState>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
const { user, clear } = useUserSession()
const displayName = computed(
  () => `${user.value?.displayName}${user.value?.id ? '' : ' (未登録)'}`
)

async function logout() {
  await clear()
  navigateTo('/')
}
</script>
