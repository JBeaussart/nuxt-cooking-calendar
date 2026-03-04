<template>
  <div class="min-h-screen bg-gradient-to-br from-sage-50/30 via-sage-50/20 to-slate-50 flex items-center justify-center px-4">
    <div class="text-center max-w-lg">
      <div class="mb-8">
        <span class="text-6xl">🍽️</span>
      </div>
      <h1 class="text-4xl font-bold text-slate-900 mb-4">Cooking Calendar</h1>
      <p class="text-lg text-slate-600 mb-10">
        Planifiez vos repas, gérez vos recettes et générez vos listes de courses automatiquement.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink
          to="/login"
          class="px-8 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-sage-300 to-sage-500 text-white shadow-lg hover:from-sage-300 hover:to-sage-600 transition hover:scale-105"
        >
          Se connecter
        </NuxtLink>
        <NuxtLink
          to="/signup"
          class="px-8 py-3 rounded-xl text-sm font-semibold border border-sage-300 text-sage-700 hover:bg-sage-50 transition"
        >
          Créer un compte
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

const user = useSupabaseUser();
if (user.value) {
  await navigateTo("/planning");
}
</script>
