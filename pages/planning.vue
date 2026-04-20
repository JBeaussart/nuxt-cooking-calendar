<template>
  <div class="min-h-screen w-full">
    <div class="mx-auto max-w-7xl overflow-x-clip px-3 pb-24 pt-8 sm:px-4 sm:pb-16 sm:pt-10">
      <PageHeader
        title="Ma semaine"
        description="Organisez vos repas jour par jour. Touchez une case vide pour choisir une recette."
      />

      <div
        v-if="isPlanningLoading"
        class="flex min-h-[32vh] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white/60 py-12 text-slate-500"
      >
        <span class="inline-flex h-8 w-8 animate-pulse rounded-full bg-sage-200/60" />
        <p class="text-xs font-medium sm:text-sm">Chargement de votre semaine…</p>
      </div>

      <template v-else>
      <div
        class="grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-3 md:gap-3"
      >
        <article
          v-for="entry in planning.entries"
          :key="entry.day"
          class="group relative flex min-h-0 flex-col rounded-xl border border-slate-200/90 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
        >
          <!-- Bandeau jour -->
          <div
            class="rounded-t-xl border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-2.5 py-2 sm:px-3 sm:py-2.5"
          >
            <p
              class="truncate text-base font-bold uppercase tracking-[0.12em] text-sage-700 sm:text-lg md:text-xl"
            >
              {{ entry.day }}
            </p>
          </div>

          <!-- Avec recette -->
          <template v-if="entry.recipe">
            <NuxtLink
              :to="`/recipes/${entry.recipe.id}`"
              class="relative block aspect-[2/1] w-full overflow-hidden bg-slate-100 outline-none ring-inset ring-sage-300/0 transition focus-visible:ring-2"
            >
              <img
                :src="getOptimizedImageUrl(entry.recipe.image, 360, 75)"
                :alt="entry.recipe.title"
                loading="lazy"
                decoding="async"
                class="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
                @error="(e: Event) => ((e.target as HTMLImageElement).src = '/images/default-recipe.jpg')"
              />
              <div
                class="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/15 to-transparent"
              />
              <div class="pointer-events-none absolute inset-x-0 bottom-0 p-2 sm:p-2.5">
                <p class="line-clamp-2 text-xs font-semibold leading-snug text-white drop-shadow sm:text-[13px]">
                  {{ entry.recipe.title }}
                </p>
              </div>
            </NuxtLink>

            <div class="mt-auto flex flex-wrap items-center gap-1 rounded-b-xl border-t border-slate-100 bg-slate-50/40 px-1.5 py-1 sm:px-2">
              <NuxtLink
                :to="`/recipes/${entry.recipe.id}`"
                class="inline-flex min-h-[40px] min-w-0 items-center justify-start gap-1.5 rounded-lg px-2 text-xs font-semibold text-slate-700 transition hover:bg-white hover:text-sage-700 sm:text-[13px]"
              >
                <svg class="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span class="hidden sm:inline">Voir la recette</span>
                <span class="sm:hidden">Voir</span>
              </NuxtLink>

              <div class="ml-auto flex shrink-0 items-center gap-1">
                <div class="relative">
                  <button
                    type="button"
                    title="Déplacer vers un autre jour"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-sage-700 sm:h-10 sm:w-10"
                    aria-haspopup="true"
                    :aria-expanded="activeMoveDay === entry.day"
                    @click.stop="toggleMoveMenu(entry.day)"
                  >
                    <svg class="h-4 w-4 sm:h-[18px] sm:w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                  </button>
                  <div
                    v-if="activeMoveDay === entry.day"
                    class="absolute right-0 top-full z-[100] mt-0.5 hidden w-40 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white py-0.5 shadow-xl md:block"
                    role="menu"
                    @click.stop
                  >
                    <p class="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Déplacer vers
                    </p>
                    <button
                      v-for="targetDay in days"
                      :key="targetDay"
                      type="button"
                      role="menuitem"
                      class="flex w-full items-center px-2 py-2 text-left text-sm capitalize transition"
                      :class="targetDay === entry.day || hasRecipeOnDay(targetDay)
                        ? 'cursor-not-allowed bg-slate-50 text-slate-400'
                        : 'text-slate-800 hover:bg-sage-50'"
                      :disabled="targetDay === entry.day || hasRecipeOnDay(targetDay)"
                      @click="moveRecipe(entry.day, targetDay, entry.recipe!.id)"
                    >
                      {{ targetDay }}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  title="Retirer du planning"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-50 hover:text-red-600 sm:h-10 sm:w-10"
                  @click="planning.remove(entry.day)"
                >
                  <svg class="h-4 w-4 sm:h-[18px] sm:w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </template>

          <!-- Slot vide -->
          <NuxtLink
            v-else
            :to="`/recipes?day=${entry.day}`"
            class="flex flex-1 flex-col items-stretch justify-center gap-2 rounded-b-xl px-3 py-3 text-center outline-none transition hover:bg-sage-50/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sage-300 sm:py-3.5"
          >
            <div
              class="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed border-sage-300/70 bg-white text-sage-600 transition group-hover:border-sage-400 group-hover:bg-sage-50 sm:h-11 sm:w-11"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-800 sm:text-sm">Choisir une recette</p>
              <p class="mt-0.5 text-[11px] leading-snug text-slate-500 sm:text-xs">
                Parcourir vos recettes et assigner à {{ entry.day }}
              </p>
            </div>
          </NuxtLink>
        </article>
      </div>

      <div class="mt-6 flex justify-center pb-4 sm:mt-8 sm:pb-0">
        <button
          type="button"
          class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 sm:text-sm"
          @click="confirmClear"
        >
          Réinitialiser le planning
        </button>
      </div>
      </template>

      <Teleport to="body">
        <div
          v-if="activeMoveDay && moveMenuEntry"
          class="fixed inset-0 z-[100] md:hidden"
        >
          <button
            type="button"
            class="absolute inset-0 bg-slate-900/45"
            aria-label="Fermer"
            @click="closeMoveMenu"
          />
          <div
            class="absolute bottom-16 left-0 right-0 max-h-[min(70vh,28rem)] overflow-y-auto rounded-t-2xl border border-slate-200 border-b-0 bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="move-sheet-title"
            @click.stop
          >
            <div class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3">
              <div class="min-w-0 flex-1">
                <p id="move-sheet-title" class="text-sm font-semibold text-slate-900">
                  Déplacer vers un jour
                </p>
                <p v-if="moveMenuEntry.recipe" class="mt-0.5 truncate text-xs text-slate-500">
                  {{ moveMenuEntry.recipe.title }}
                </p>
              </div>
              <button
                type="button"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Fermer"
                @click="closeMoveMenu"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="pb-[max(1rem,env(safe-area-inset-bottom))] pt-1">
              <button
                v-for="targetDay in days"
                :key="targetDay"
                type="button"
                class="flex w-full px-4 py-3 text-left text-base capitalize transition"
                :class="targetDay === activeMoveDay || hasRecipeOnDay(targetDay)
                  ? 'cursor-not-allowed bg-slate-50 text-slate-400'
                  : 'text-slate-900 active:bg-sage-100'"
                :disabled="targetDay === activeMoveDay || hasRecipeOnDay(targetDay)"
                @click="moveRecipe(activeMoveDay!, targetDay, moveMenuEntry.recipe!.id)"
              >
                {{ targetDay }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default", middleware: "auth" });

const { getOptimizedImageUrl } = useImageOptimizer();
const planning = usePlanningStore();

const days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

const { data: planningData, pending: planningFetchPending } = useFetch<
  { day: string; recipe: { id: string; title: string; image?: string } | null }[]
>("/api/planning", {
  default: () => [],
});

watch(
  planningData,
  (value) => {
    if (!planning.loaded && value.length > 0) {
      planning.hydrate(value);
    }
  },
  { immediate: true },
);

const isPlanningLoading = computed(
  () => planningFetchPending.value && !planning.loaded,
);

const activeMoveDay = ref<string | null>(null);

const moveMenuEntry = computed(() => {
  const d = activeMoveDay.value;
  if (!d) return null;
  const e = planning.entries.find((entry) => entry.day === d);
  return e?.recipe ? e : null;
});

const toggleMoveMenu = (day: string) => {
  activeMoveDay.value = activeMoveDay.value === day ? null : day;
};

const hasRecipeOnDay = (day: string) =>
  planning.entries.some((e) => e.day === day && e.recipe);

const moveRecipe = (fromDay: string, toDay: string, recipeId: string) => {
  activeMoveDay.value = null;
  planning.move(fromDay, toDay, recipeId);
};

const confirmClear = () => {
  if (!confirm("Réinitialiser tout le planning ?")) return;
  planning.clear();
};

const closeMoveMenu = () => {
  activeMoveDay.value = null;
};
onMounted(() => {
  document.addEventListener("click", closeMoveMenu);
});
onUnmounted(() => {
  document.removeEventListener("click", closeMoveMenu);
});
</script>
