<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-lg text-center">
      <div class="bg-white rounded-3xl shadow-xl p-8 sm:p-12">
        <span class="mb-6 block text-5xl">⭐</span>
        <PageHeader
          no-margin
          class="mb-8"
          title="Passez à Premium"
          description="Débloquez toutes les fonctionnalités pour profiter pleinement de Cooking Calendar."
        />

        <div class="space-y-4 text-left mb-8">
          <div class="flex items-center gap-3">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-sage-100 text-sage-600 font-bold text-sm">✓</span>
            <span class="text-slate-700">Recettes illimitées (vs 20 en gratuit)</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-sage-100 text-sage-600 font-bold text-sm">✓</span>
            <span class="text-slate-700">Menu de réception</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-sage-100 text-sage-600 font-bold text-sm">✓</span>
            <span class="text-slate-700">Export PDF de vos recettes</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-sage-100 text-sage-600 font-bold text-sm">✓</span>
            <span class="text-slate-700">Support prioritaire</span>
          </div>
        </div>

        <div class="text-center mb-8">
          <span class="text-4xl font-bold text-slate-900">2,99 €</span>
          <span class="text-slate-500">/mois</span>
        </div>

        <button
          class="w-full py-4 rounded-xl bg-gradient-to-r from-sage-300 to-sage-500 text-white font-semibold text-lg shadow-lg hover:from-sage-300 hover:to-sage-600 transition hover:scale-105"
        >
          Obtenir Premium
        </button>

        <p class="text-xs text-slate-400 mt-4">Annulez à tout moment. Paiement sécurisé.</p>

        <NuxtLink to="/planning" class="block mt-6 text-sm text-slate-500 hover:text-slate-700">
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
