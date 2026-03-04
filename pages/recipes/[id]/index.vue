<template>
  <div class="min-h-screen bg-gradient-to-br from-sage-50/30 via-sage-50/20 to-slate-50 pb-20">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div v-if="recipe">
        <!-- Navigation -->
        <div class="mb-6 flex items-center justify-between">
          <NuxtLink to="/recipes" class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-sage-50 hover:text-sage-300 transition">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Retour
          </NuxtLink>
          <div class="flex items-center gap-2">
            <NuxtLink :to="`/recipes/${recipe.id}/edit`"
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-sage-50 hover:text-sage-300 transition">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </NuxtLink>
            <button @click="deleteRecipe"
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm ring-1 ring-slate-200 hover:bg-rose-50 transition">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m1 0H8m8 0l-1-3H9L8 7" /></svg>
            </button>
          </div>
        </div>

        <!-- Carte principale -->
        <div class="overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
          <!-- Image header -->
          <div class="relative h-64 sm:h-80 w-full">
            <img
              :src="recipe.image || '/images/default-recipe.jpg'"
              :alt="recipe.title"
              loading="eager"
              class="h-full w-full object-cover"
              @error="(e: Event) => (e.target as HTMLImageElement).src = '/images/default-recipe.jpg'"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <!-- Badges -->
            <div class="absolute top-4 left-4 flex flex-wrap gap-2">
              <span v-if="recipe.maman" class="inline-flex items-center gap-1 rounded-full bg-pink-500/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white shadow-sm">
                <svg class="w-3 h-3" viewBox="0 0 512 512" fill="currentColor"><path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5.3-86.2 32.6-96.8 70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7.9 78.6 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2-25.8 0-46.7-20.9-46.7-46.7v-1.6c0-10.4 1.6-20.8 5.2-30.5zM324.5 92.9c14.3-42.9 51.7-73.1 84.4-58.5s46.9 53.9 32.6 96.8-51.7 73.1-84.4 58.5-46.9-53.9-32.6-96.8zM400.1 165.3c24.5 14 29.1 51.7 10.2 84.1s-54 48.2-78.5 33.3-29.1-51.7-10.2-84.1 54-48.2 78.5-33.3z"/></svg>
                Recette de maman
              </span>
              <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm"
                :class="recipe.salt ? 'bg-sage-300/90' : 'bg-sage-500/90'">
                {{ recipe.salt ? 'Salé' : 'Sucré' }}
              </span>
            </div>

            <!-- Bouton ajouter au planning (si on vient du planning) -->
            <div class="absolute right-4 top-4">
              <button v-if="dayParam" @click="assignToPlanning"
                class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-green-600 ring-1 ring-green-200 shadow hover:bg-white hover:text-green-700 transition">
                <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16M20 12H4" /></svg>
              </button>
            </div>

            <!-- Titre -->
            <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <h1 class="text-3xl sm:text-4xl font-bold text-white drop-shadow-md">{{ recipe.title }}</h1>
            </div>
          </div>

          <!-- Contenu -->
          <div class="grid gap-12 p-6 sm:p-10 md:grid-cols-[1fr_1.5fr]">
            <!-- Ingrédients -->
            <section>
              <h2 class="mb-6 flex items-center gap-3 text-lg font-bold text-slate-900">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">🧂</span>
                Ingrédients
              </h2>
              <ul class="space-y-3 pl-2">
                <li v-for="(ing, i) in recipe.ingredients" :key="i" class="flex items-start gap-3 text-slate-700">
                  <div class="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-slate-400" />
                  <span class="text-sm font-medium leading-relaxed">
                    <template v-if="typeof ing === 'object' && ing.quantity">
                      {{ ing.item }}: {{ ing.quantity }} {{ ing.unit || '' }}
                    </template>
                    <template v-else-if="typeof ing === 'object'">{{ ing.item }}</template>
                    <template v-else>{{ ing }}</template>
                  </span>
                </li>
              </ul>
            </section>

            <!-- Préparation -->
            <section>
              <h2 class="mb-6 flex items-center gap-3 text-lg font-bold text-slate-900">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200">🍳</span>
                Préparation
              </h2>
              <div class="space-y-8">
                <div v-for="(step, i) in recipe.steps" :key="i" class="relative pl-8">
                  <div v-if="i !== recipe.steps.length - 1" class="absolute left-[11px] top-8 bottom-[-32px] w-px bg-slate-200" />
                  <span class="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 ring-4 ring-white">
                    {{ i + 1 }}
                  </span>
                  <p class="text-slate-600 leading-relaxed">{{ step }}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <!-- Recette introuvable -->
      <div v-else class="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h2 class="text-xl font-semibold text-slate-900">Recette introuvable</h2>
        <p class="mt-2 text-slate-500">Cette recette n'existe pas ou a été supprimée.</p>
        <NuxtLink to="/recipes" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sage-300 to-sage-500 px-6 py-3 text-sm font-bold text-white shadow-lg">
          Retour aux recettes
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default", middleware: "auth" });

const route = useRoute();
const id = route.params.id as string;
const dayParam = computed(() => (route.query.day as string || "").toLowerCase());

const { data: recipe } = await useFetch<any>(`/api/recipes/${id}`).catch(() => ({ data: ref(null) }));

const deleteRecipe = async () => {
  if (!confirm("Supprimer définitivement cette recette ?")) return;
  try {
    await $fetch(`/api/recipes/${id}`, { method: "DELETE" });
    await navigateTo("/recipes");
  } catch {
    alert("Impossible de supprimer la recette.");
  }
};

const assignToPlanning = async () => {
  try {
    await $fetch("/api/planning/assign", { method: "POST", body: { day: dayParam.value, id } });
    await navigateTo("/planning");
  } catch {
    alert("Impossible d'ajouter la recette au planning.");
  }
};

useHead({ title: computed(() => recipe.value?.title || "Recette") });
</script>
