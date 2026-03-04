<template>
  <div class="min-h-screen bg-gradient-to-br from-sage-50/30 via-sage-50/20 to-slate-50">
    <div class="mx-auto max-w-5xl px-4 py-12">
      <div class="mb-12 text-center">
        <h1 class="text-4xl font-bold text-slate-900 mb-2">Ma semaine</h1>
        <p class="text-slate-600">Planifiez vos repas en un clin d'œil</p>
      </div>

      <div v-if="pending" class="text-center py-20 text-slate-400">Chargement...</div>
      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="entry in entries"
          :key="entry.day"
          class="group relative rounded-3xl bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-300/50 hover:scale-[1.02]"
        >
          <!-- Avec recette -->
          <template v-if="entry.recipe">
            <div class="relative h-28 overflow-hidden rounded-t-3xl">
              <img
                :src="getOptimizedImageUrl(entry.recipe.image, 400, 75)"
                :alt="entry.recipe.title"
                loading="lazy"
                decoding="async"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                @error="(e: Event) => (e.target as HTMLImageElement).src = '/images/default-recipe.jpg'"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div class="absolute top-2 left-2">
                <div class="rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 shadow-lg">
                  <span class="text-xs font-bold capitalize text-slate-900">{{ entry.day }}</span>
                </div>
              </div>
              <div class="absolute bottom-0 left-0 right-0 p-3">
                <NuxtLink
                  :to="`/recipes/${entry.recipe.id}`"
                  class="block text-base font-bold text-white drop-shadow-lg hover:text-sage-200 transition line-clamp-2"
                >
                  {{ entry.recipe.title }}
                </NuxtLink>
              </div>
            </div>

            <div class="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-3 py-2">
              <NuxtLink
                :to="`/recipes/${entry.recipe.id}`"
                class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sage-300 transition"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Voir
              </NuxtLink>
              <div class="flex items-center gap-1">
                <!-- Bouton déplacer -->
                <div class="relative">
                  <button
                    type="button"
                    title="Déplacer"
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/50 transition"
                    @click.stop="toggleMoveMenu(entry.day)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                  </button>
                  <!-- Dropdown déplacer -->
                  <div
                    v-if="activeMoveDay === entry.day"
                    class="absolute right-0 bottom-full mb-1 w-40 rounded-xl border border-slate-200 bg-white shadow-2xl z-50 py-1.5"
                  >
                    <button
                      v-for="targetDay in days"
                      :key="targetDay"
                      type="button"
                      class="w-full px-3 py-2 text-left text-sm transition capitalize"
                      :class="targetDay === entry.day || hasRecipeOnDay(targetDay)
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-slate-700 hover:bg-slate-100'"
                      :disabled="targetDay === entry.day || hasRecipeOnDay(targetDay)"
                      @click="moveRecipe(entry.day, targetDay, entry.recipe!.id)"
                    >
                      {{ targetDay }}
                      <span v-if="targetDay === entry.day" class="ml-1 text-xs text-slate-400">(actuel)</span>
                      <span v-else-if="hasRecipeOnDay(targetDay)" class="ml-1 text-xs text-slate-400">(occupé)</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  title="Retirer"
                  class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
                  @click="removeRecipe(entry.day)"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </template>

          <!-- Slot vide -->
          <template v-else>
            <NuxtLink :to="`/recipes?day=${entry.day}`" class="block">
              <div class="relative h-28 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 transition hover:from-slate-200 hover:to-slate-300">
                <div class="absolute top-2 left-2">
                  <div class="rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 shadow-lg">
                    <span class="text-xs font-bold capitalize text-slate-900">{{ entry.day }}</span>
                  </div>
                </div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-sage-300 to-sage-500 text-white shadow-lg shadow-sage-300/30 transition-all hover:scale-110">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </template>
        </div>
      </div>

      <div class="mt-12 pb-16 sm:pb-0 text-center">
        <button
          type="button"
          @click="clearPlanning"
          class="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 hover:shadow-xl"
        >
          Réinitialiser le planning
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default", middleware: "auth" });

const { getOptimizedImageUrl } = useImageOptimizer();

const days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

const { data: entries, pending, refresh } = await useFetch<{ day: string; recipe: any }[]>("/api/planning");

const activeMoveDay = ref<string | null>(null);

const toggleMoveMenu = (day: string) => {
  activeMoveDay.value = activeMoveDay.value === day ? null : day;
};

const hasRecipeOnDay = (day: string) => {
  return entries.value?.some((e) => e.day === day && e.recipe) ?? false;
};

const removeRecipe = async (day: string) => {
  await $fetch("/api/planning/remove", { method: "POST", body: { day } });
  await refresh();
};

const moveRecipe = async (fromDay: string, toDay: string, recipeId: string) => {
  activeMoveDay.value = null;
  await $fetch("/api/planning/move", { method: "POST", body: { fromDay, toDay, recipeId } });
  await refresh();
};

const clearPlanning = async () => {
  if (!confirm("Réinitialiser tout le planning ?")) return;
  await $fetch("/api/planning/clear", { method: "POST" });
  await refresh();
};

// Fermer le menu déplacer au clic extérieur
onMounted(() => {
  document.addEventListener("click", () => { activeMoveDay.value = null; });
});
</script>
