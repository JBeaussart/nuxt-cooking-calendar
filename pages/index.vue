<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="text-center max-w-lg">
      <div class="mb-6">
        <span class="text-6xl">🍽️</span>
      </div>
      <div class="mb-10">
        <PageHeader no-margin title="Cooking Calendar">
          <template #description>
            <p class="mx-auto mt-1.5 max-w-lg text-base text-slate-600 sm:text-lg">
              Planifiez vos repas, gérez vos recettes et générez vos listes de courses automatiquement.
            </p>
          </template>
        </PageHeader>
      </div>
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
