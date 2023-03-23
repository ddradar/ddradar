<template>
  <form action="">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head" :class="themeClass">
        <p class="modal-card-title">{{ title }}</p>
        <OButton
          icon="delete"
          :variant="variant"
          @click="emits('close', 'canceled')"
        />
      </header>
      <section class="modal-card-body">
        <p>{{ message }}</p>
      </section>
      <footer class="modal-card-foot">
        <OButton variant="primary" @click="emits('close', 'yes')">Yes</OButton>
        <OButton @click="emits('close', 'no')">No</OButton>
      </footer>
    </div>
  </form>
</template>

<script lang="ts" setup>
interface DialogModalProps {
  title?: string
  message: string
  variant?: string
}

const props = withDefaults(defineProps<DialogModalProps>(), {
  title: '',
  variant: 'primary',
})
const themeClass = computed(() => `is-${props.variant}`)

const emits = defineEmits<{
  (e: 'close', action: string): void
}>()
</script>

<style lang="scss" scoped>
@import '~/assets/css/_colors';
.modal-card {
  .modal-card-head {
    @each $type, $color in $colors {
      &.is-#{$type} {
        background-color: nth($color, 1);
        .modal-card-title,
        .modal-card-icon {
          color: nth($color, 2);
        }
      }
    }
  }
}
</style>
