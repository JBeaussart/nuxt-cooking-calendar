<template>
  <div class="min-h-screen pb-20">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div v-if="pending" class="flex min-h-[50vh] items-center justify-center text-stone-400 dark:text-stone-500">
        Chargement...
      </div>

      <div v-else-if="recipe">
        <!-- Navigation -->
        <div class="mb-4 flex items-center justify-between">
          <NuxtLink :to="recipesIndexHref" class="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-stone-800 px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 shadow-sm ring-1 ring-stone-200 dark:ring-stone-700 hover:bg-saffron-50 dark:hover:bg-saffron-900/30 hover:text-saffron-300 transition">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Retour
          </NuxtLink>
          <div class="flex items-center gap-2">
            <button v-if="dateParam" @click="assignToPlanning"
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-stone-800 text-green-600 dark:text-green-400 shadow-sm ring-1 ring-stone-200 dark:ring-stone-700 hover:bg-green-50 dark:hover:bg-green-950/30 transition">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16M20 12H4" /></svg>
            </button>
            <NuxtLink :to="`/recipes/${recipe.id}/edit`"
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 shadow-sm ring-1 ring-stone-200 dark:ring-stone-700 hover:bg-saffron-50 dark:hover:bg-saffron-900/30 hover:text-saffron-300 transition">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </NuxtLink>
            <button @click="deleteRecipe"
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-stone-800 text-rose-600 dark:text-rose-400 shadow-sm ring-1 ring-stone-200 dark:ring-stone-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m1 0H8m8 0l-1-3H9L8 7" /></svg>
            </button>
          </div>
        </div>

        <!-- Carte principale -->
        <div class="overflow-hidden rounded-3xl bg-white dark:bg-stone-800 shadow-xl shadow-stone-200/50 dark:shadow-black/20 ring-1 ring-stone-100 dark:ring-stone-700">
          <!-- Bannière -->
          <div class="relative h-32 w-full sm:h-40">
            <img
              :src="getOptimizedImageUrl(recipe.image, 800, 80)"
              :alt="recipe.title"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              class="h-full w-full object-cover"
              @error="(e: Event) => (e.target as HTMLImageElement).src = '/images/default-recipe.jpg'"
            />
            <div
              v-if="recipe.prep_minutes"
              class="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-stone-900/70 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
            >
              ⏱️ {{ formatDuration(recipe.prep_minutes) }}
            </div>
          </div>

          <div class="p-5 sm:p-8">
            <!-- Titre + badges -->
            <h1 class="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-3xl">
              {{ recipe.title }}
            </h1>
            <div class="mt-2.5 flex flex-wrap gap-2">
              <span v-if="recipe.maman" class="inline-flex items-center gap-1 rounded-full bg-pink-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                <svg class="w-3 h-3" viewBox="0 0 512 512" fill="currentColor"><path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5.3-86.2 32.6-96.8 70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7.9 78.6 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2-25.8 0-46.7-20.9-46.7-46.7v-1.6c0-10.4 1.6-20.8 5.2-30.5zM324.5 92.9c14.3-42.9 51.7-73.1 84.4-58.5s46.9 53.9 32.6 96.8-51.7 73.1-84.4 58.5-46.9-53.9-32.6-96.8zM400.1 165.3c24.5 14 29.1 51.7 10.2 84.1s-54 48.2-78.5 33.3-29.1-51.7-10.2-84.1 54-48.2 78.5-33.3z"/></svg>
                Recette de maman
              </span>
              <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
                :class="recipe.salt ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'">
                {{ recipe.salt ? 'Salé' : 'Sucré' }}
              </span>
            </div>

            <!-- Nombre de personnes -->
            <div class="mt-4 inline-flex items-center gap-3 rounded-xl bg-stone-50 dark:bg-stone-700/60 px-3 py-2 ring-1 ring-stone-100 dark:ring-stone-700">
              <span class="text-sm font-medium text-stone-600 dark:text-stone-300">Pour</span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  :disabled="servingsUpdating || recipe.servings <= 1"
                  @click="changeServings(-1)"
                  class="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 shadow-sm ring-1 ring-stone-200 dark:ring-stone-600 hover:bg-saffron-50 dark:hover:bg-saffron-900/30 hover:text-saffron-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4" /></svg>
                </button>
                <span class="w-6 text-center text-sm font-bold text-stone-900 dark:text-stone-100">{{ recipe.servings }}</span>
                <button
                  type="button"
                  :disabled="servingsUpdating || recipe.servings >= 50"
                  @click="changeServings(1)"
                  class="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 shadow-sm ring-1 ring-stone-200 dark:ring-stone-600 hover:bg-saffron-50 dark:hover:bg-saffron-900/30 hover:text-saffron-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
              <span class="text-sm font-medium text-stone-600 dark:text-stone-300">personne{{ recipe.servings > 1 ? 's' : '' }}</span>
            </div>

            <!-- Onglets (mobile) -->
            <div class="mt-5 flex gap-2 md:hidden">
              <button
                type="button"
                class="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition"
                :class="activeTab === 'ingredients'
                  ? 'bg-gradient-to-r from-saffron-300 to-saffron-500 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400'"
                @click="activeTab = 'ingredients'"
              >
                Ingrédients
              </button>
              <button
                type="button"
                class="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition"
                :class="activeTab === 'steps'
                  ? 'bg-gradient-to-r from-saffron-300 to-saffron-500 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400'"
                @click="activeTab = 'steps'"
              >
                Préparation
              </button>
            </div>

            <!-- Contenu : onglets sur mobile, côte à côte à partir de md -->
            <div class="mt-6 grid gap-10 md:mt-8 md:grid-cols-[1fr_1.5fr] md:gap-12">
              <!-- Ingrédients -->
              <section :class="activeTab === 'ingredients' ? 'block' : 'hidden md:block'">
                <h2 class="mb-6 hidden items-center gap-3 text-lg font-bold text-stone-900 dark:text-stone-100 md:flex">
                  <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-700">🧂</span>
                  Ingrédients
                </h2>
                <ul class="space-y-3 pl-2">
                  <li v-for="(ing, i) in recipeIngredients" :key="i" class="flex items-start gap-3 text-stone-700 dark:text-stone-300">
                    <div class="mt-0.5 h-3.5 w-3.5 flex-none rounded-[4px] border-2 border-stone-300 dark:border-stone-600" />
                    <span class="text-sm font-medium leading-relaxed">
                      <template v-if="typeof ing === 'object' && ing.quantity">
                        {{ ing.item }}: {{ displayIngredientQuantity(ing) }} {{ ing.unit || '' }}
                      </template>
                      <template v-else-if="typeof ing === 'object'">{{ ing.item }}</template>
                      <template v-else>{{ ing }}</template>
                    </span>
                  </li>
                </ul>
              </section>

              <!-- Préparation -->
              <section :class="activeTab === 'steps' ? 'block' : 'hidden md:block'">
                <h2 class="mb-6 hidden items-center gap-3 text-lg font-bold text-stone-900 dark:text-stone-100 md:flex">
                  <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-stone-700 shadow-sm ring-1 ring-stone-200 dark:ring-stone-600">🍳</span>
                  Préparation
                </h2>
                <div class="space-y-8">
                  <div v-for="(step, i) in recipeSteps" :key="i" class="relative pl-8">
                    <div v-if="i !== recipeSteps.length - 1" class="absolute left-[11px] top-8 bottom-[-32px] w-px bg-stone-200 dark:bg-stone-700" />
                    <span class="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-700 text-xs font-bold text-stone-600 dark:text-stone-300 ring-4 ring-white dark:ring-stone-800">
                      {{ i + 1 }}
                    </span>
                    <p class="text-stone-600 dark:text-stone-300 leading-relaxed">{{ step }}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <!-- Échec de chargement (réseau, timeout...) : à ne pas confondre avec une suppression -->
      <div v-else-if="loadError" class="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100">Erreur de chargement</h2>
        <p class="mt-2 text-stone-500 dark:text-stone-400">Impossible de charger cette recette pour le moment. Vérifiez votre connexion.</p>
        <button
          type="button"
          @click="refresh"
          class="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-saffron-300 to-saffron-500 px-6 py-3 text-sm font-bold text-white shadow-lg"
        >
          Réessayer
        </button>
      </div>

      <!-- Recette introuvable -->
      <div v-else class="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100">Recette introuvable</h2>
        <p class="mt-2 text-stone-500 dark:text-stone-400">Cette recette n'existe pas ou a été supprimée.</p>
        <NuxtLink to="/recipes" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-saffron-300 to-saffron-500 px-6 py-3 text-sm font-bold text-white shadow-lg">
          Retour aux recettes
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getIngredientQuantityType,
  formatRecipeQuantity,
  formatQuantityLabel,
} from "~/shared/utils/ingredientQuantity";
import { formatDuration } from "~/shared/utils/duration";

definePageMeta({ layout: "default", middleware: "auth" });

const route = useRoute();
const { getOptimizedImageUrl } = useImageOptimizer();
const planning = usePlanningStore();
const id = route.params.id as string;
const dateParam = computed(() => (route.query.date as string) || "");

/** Conserve ?date= pour retrouver le mode « assigner » sur la liste des recettes */
const recipesIndexHref = computed(() => {
  if (!dateParam.value) return "/recipes";
  return `/recipes?date=${encodeURIComponent(dateParam.value)}`;
});

const { data: recipe, pending, error, refresh } = useFetch<any>(`/api/recipes/${id}`, {
  default: () => null,
  // Un cold start / aléa réseau ne doit pas afficher "recette introuvable".
  retry: 2,
  retryDelay: 400,
});
// Un vrai 404 (recette supprimée) n'est pas une erreur de chargement à réessayer.
const loadError = computed(() => !!error.value && (error.value as any)?.statusCode !== 404);
const recipeIngredients = computed(() => recipe.value?.ingredients ?? []);
const recipeSteps = computed(() => recipe.value?.steps ?? []);
const activeTab = ref<"ingredients" | "steps">("ingredients");

// Vue recette : une demi-unite est un usage de cuisine courant (1.5 avocat),
// contrairement a la liste de courses qui doit arrondir au superieur pour
// garantir un achat suffisant (voir shared/utils/ingredientQuantity.ts).
const displayIngredientQuantity = (ing: { item?: string; unit?: string; quantity?: number }) => {
  const type = getIngredientQuantityType(ing);
  return formatQuantityLabel(formatRecipeQuantity(Number(ing.quantity), type));
};

const servingsUpdating = ref(false);
const changeServings = async (delta: number) => {
  if (!recipe.value || servingsUpdating.value) return;
  const next = recipe.value.servings + delta;
  if (next < 1 || next > 50) return;
  servingsUpdating.value = true;
  try {
    const result = await $fetch<{ servings: number; ingredients: any[] }>(`/api/recipes/${id}/servings`, {
      method: "PATCH",
      body: { servings: next },
    });
    recipe.value.servings = result.servings;
    recipe.value.ingredients = result.ingredients;
  } catch {
    // Pas de toast ici : l'affichage ne change simplement pas si ca echoue.
  } finally {
    servingsUpdating.value = false;
  }
};

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
  if (!recipe.value || !dateParam.value) return;
  try {
    await planning.assign(dateParam.value, { id, title: recipe.value.title, image: recipe.value.image });
    navigateTo("/planning");
  } catch {
    alert("Impossible d'assigner la recette.");
  }
};

useHead({ title: computed(() => recipe.value?.title || "Recette") });
</script>
