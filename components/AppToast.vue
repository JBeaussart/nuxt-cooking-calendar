<template>
  <Transition
    enter-active-class="transition-all duration-300"
    enter-from-class="opacity-0 transtone-y-4"
    enter-to-class="opacity-100 transtone-y-0"
    leave-active-class="transition-all duration-300"
    leave-from-class="opacity-100 transtone-y-0"
    leave-to-class="opacity-0 transtone-y-4"
  >
    <div
      v-if="visible"
      class="fixed bottom-20 sm:bottom-4 left-1/2 -transtone-x-1/2 bg-stone-900 text-white px-6 py-4 rounded-xl shadow-2xl z-50"
      role="alert"
      aria-live="polite"
    >
      {{ message }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{ message: string; visible: boolean }>();
</script>
