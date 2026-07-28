<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-lg text-center">
      <div class="bg-white dark:bg-stone-800 rounded-3xl shadow-xl p-8 sm:p-12">
        <span class="mb-6 block text-5xl">⭐</span>
        <PageHeader
          no-margin
          class="mb-8"
          title="Passez à Premium"
          description="Débloquez toutes les fonctionnalités pour profiter pleinement de Cooking Calendar."
        />

        <div class="space-y-4 text-left mb-8">
          <div class="flex items-center gap-3">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-saffron-100 dark:bg-saffron-900/40 text-saffron-600 dark:text-saffron-300 font-bold text-sm">✓</span>
            <span class="text-stone-700 dark:text-stone-300">Recettes illimitées (vs 20 en gratuit)</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-saffron-100 dark:bg-saffron-900/40 text-saffron-600 dark:text-saffron-300 font-bold text-sm">✓</span>
            <span class="text-stone-700 dark:text-stone-300">Menu de réception</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-saffron-100 dark:bg-saffron-900/40 text-saffron-600 dark:text-saffron-300 font-bold text-sm">✓</span>
            <span class="text-stone-700 dark:text-stone-300">Export PDF de vos recettes</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-saffron-100 dark:bg-saffron-900/40 text-saffron-600 dark:text-saffron-300 font-bold text-sm">✓</span>
            <span class="text-stone-700 dark:text-stone-300">Support prioritaire</span>
          </div>
        </div>

        <div class="text-center mb-8">
          <span class="text-4xl font-bold text-stone-900 dark:text-stone-100">2,99 €</span>
          <span class="text-stone-500 dark:text-stone-400">/mois</span>
        </div>

        <button
          class="w-full py-4 rounded-xl bg-gradient-to-r from-saffron-300 to-saffron-500 text-white font-semibold text-lg shadow-lg hover:from-saffron-300 hover:to-saffron-600 transition hover:scale-105"
        >
          Obtenir Premium
        </button>

        <p class="text-xs text-stone-400 dark:text-stone-500 mt-4">Annulez à tout moment. Paiement sécurisé.</p>

        <NuxtLink to="/planning" class="block mt-6 text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200">
          Retour au planning
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });
useHead({ title: "Premium – Cooking Calendar" });
</script>
