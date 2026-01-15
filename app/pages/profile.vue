<spec lang="md">
# User Profile Page

This page allows users to view and edit their profile information.

## Prequisites

- User must be authenticated to access this page. (use [`auth`](../middleware/auth.ts) middleware)

## Features

- Displays an alert if the user is not registered, prompting them to complete their profile.
  - The "Not Registered" pattern occurs the first social login. Registration is required to link social account with DDRadar information.
- A form to edit user details such as ID, name, area, DDR code, and profile visibility.
- Add or update user information via `POST /api/me` endpoint.
- After successful submission, the user session is updated to reflect changes.

## Fields

- **ID**(required): Unique identifier for the user.
  - Cannot change if already registered.
- **Name**(required): Display name of the user.
  - If new user, social account name is set as default.
- **Area**(required): User's geographical area.
- **DDR Code**(optional): User's DDR code on arcade.
- **Profile Visibility**(required): Whether the user's profile is public or private.
  - Public: Profile and score records can be viewed by others.
  - Private: Profile and score records are hidden from others.

## Actions

- **Save**: Submits the form to save user profile information.
</spec>

<script setup lang="ts">
import { Area, userSchema } from '#shared/schemas/user'

definePageMeta({ middleware: ['auth'] })

const { t } = useI18n()
const { user, fetch: updateSession } = useUserSession()
const toast = useToast()

/** Whether the user is already registered */
const isRegistered = computed(() => !!user.value?.id)
/** User profile state */
let state: Ref<UserInfo>
{
  // Use block to hide variables from template scope
  const uri = computed(() => `/api/users/${user.value?.id}` as const)
  const fetchRes = useFetch<UserInfo>(uri, {
    method: 'GET',
    immediate: false,
    default: (): UserInfo => ({
      id: '',
      name: user.value?.displayName ?? '',
      area: Area.東京都,
      ddrCode: null,
      isPublic: false,
    }),
  })
  state = fetchRes.data
  if (isRegistered.value) await fetchRes.execute()
}
/** Select items for area field */
const areas = computed(() =>
  Object.values(Area).map(area => ({
    label: t(`schema.user.area.values.area_${area}`),
    value: area,
  }))
)

/** Update user profile and reload user session */
async function onSubmit() {
  const named = { entity: t('schema.user.entity') }
  try {
    await $fetch('/api/me', { method: 'POST', body: state.value })
    toast.add({ color: 'success', title: t('actions.save.success', named) })
    await updateSession()
  } catch {
    toast.add({ color: 'error', title: t('actions.save.error', named) })
  }
}
</script>

<template>
  <UPage>
    <UContainer>
      <UAlert
        v-if="!isRegistered"
        color="warning"
        :title="t('page.profile.alert.title')"
        :description="t('page.profile.alert.description')"
        icon="i-lucide-user"
        class="mt-2"
        close
      />
      <UCard class="mt-4">
        <UForm
          role="form"
          :schema="userSchema"
          :state="state"
          @submit="onSubmit"
        >
          <UFormField
            :label="t('schema.user.id.label')"
            name="id"
            :description="t('schema.user.id.description')"
            :disabled="isRegistered"
            required
            class="mt-4 mb-4"
          >
            <UInput
              v-model="state.id"
              :disabled="isRegistered"
              :placeholder="t('schema.user.id.placeholder')"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="t('schema.user.name.label')"
            name="name"
            required
            class="mt-4 mb-4"
          >
            <UInput
              v-model="state.name"
              :placeholder="t('schema.user.name.placeholder')"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="t('schema.user.area.label')"
            name="area"
            required
            class="mt-4 mb-4"
          >
            <USelect v-model="state.area" :items="areas" class="w-full" />
          </UFormField>
          <UFormField
            :label="t('schema.user.ddrCode.label')"
            name="ddrCode"
            class="mt-4 mb-4"
          >
            <UInput
              v-model.number="state.ddrCode"
              type="number"
              placeholder="00000000"
              class="w-full"
            />
          </UFormField>
          <UFormField
            :label="t('schema.user.isPublic.label')"
            name="isPublic"
            :description="t('schema.user.isPublic.description')"
            class="mt-4 mb-4"
          >
            <USwitch v-model="state.isPublic" class="w-full" />
          </UFormField>
          <UButton type="submit">{{ t('actions.save.label') }}</UButton>
        </UForm>
      </UCard>
    </UContainer>
  </UPage>
</template>
