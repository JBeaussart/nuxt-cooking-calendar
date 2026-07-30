<template>
  <div class="min-h-screen w-full overflow-x-hidden">
    <div class="w-full max-w-6xl mx-auto px-4 pt-12 pb-32">
      <PageHeader
        title="Mes recettes"
        description="Découvrez et gérez votre collection"
      >
        <template #after-title>
          <span
            v-if="isFree && recipes.length === 20"
            class="inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
          >
            20/20 recettes – Limite atteinte
          </span>
        </template>
      </PageHeader>

      <!-- Bannière limite -->
      <div
        v-if="isFree && recipes.length === 20 && !bannerDismissed"
        class="mb-6 rounded-xl border p-4 sm:p-5 shadow-sm"
        style="background-color: #FDF3E1; border-color: #F1CD8C;"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">🎉</span>
              <h3 class="text-base sm:text-lg font-semibold text-stone-800">Bravo, vous avez atteint la limite de 20 recettes !</h3>
            </div>
            <p class="text-sm sm:text-base text-stone-700 mb-4">Profitez de recettes illimitées avec le Premium.</p>
            <NuxtLink
              to="/premium"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
              style="background-color: #D98E2B;"
            >
              Découvrir le Premium
            </NuxtLink>
          </div>
          <button @click="bannerDismissed = true" class="p-1.5 rounded-lg text-stone-500 hover:text-stone-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Filtres et actions -->
      <div class="mb-4 flex flex-col gap-4 sm:mb-6">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher une recette ou un ingrédient"
            class="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 dark:text-stone-100 px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-300 shadow-sm"
          />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 dark:text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div class="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div class="flex flex-wrap items-center gap-4 flex-1">
            <div class="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
              <button
                v-for="f in saltFilters"
                :key="f.value"
                @click="saltFilter = f.value"
                class="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg transition-all"
                :class="saltFilter === f.value
                  ? 'bg-white dark:bg-stone-700 font-bold text-saffron-300 shadow-sm'
                  : 'font-medium text-stone-500 dark:text-stone-400 hover:text-saffron-300 hover:bg-saffron-50 dark:hover:bg-saffron-900/30'"
              >
                {{ f.label }}
              </button>
            </div>
            <div v-if="isAdmin" class="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
              <button
                @click="mamanFilter = !mamanFilter"
                class="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg transition-all flex items-center gap-1"
                :class="mamanFilter ? 'bg-white dark:bg-stone-700 font-bold text-pink-600 shadow-sm' : 'font-medium text-stone-500 dark:text-stone-400'"
              >
                <svg class="w-4 h-4 text-pink-400" viewBox="0 0 512 512" fill="currentColor"><path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5.3-86.2 32.6-96.8 70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7.9 78.6 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2-25.8 0-46.7-20.9-46.7-46.7v-1.6c0-10.4 1.6-20.8 5.2-30.5zM324.5 92.9c14.3-42.9 51.7-73.1 84.4-58.5s46.9 53.9 32.6 96.8-51.7 73.1-84.4 58.5-46.9-53.9-32.6-96.8zM400.1 165.3c24.5 14 29.1 51.7 10.2 84.1s-54 48.2-78.5 33.3-29.1-51.7-10.2-84.1 54-48.2 78.5-33.3z"/></svg>
                Ninette
              </button>
            </div>

            <div v-if="recipes.length > 0" class="ml-auto flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
              <button
                @click="exportPdf"
                :disabled="!isPremium"
                class="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg transition-all"
                :class="isPremium ? 'font-medium text-stone-500 dark:text-stone-400 hover:text-saffron-300 hover:bg-saffron-50 dark:hover:bg-saffron-900/30' : 'font-medium text-stone-400 dark:text-stone-500 opacity-60 cursor-not-allowed'"
                :title="!isPremium ? 'Export PDF réservé aux utilisateurs Premium' : ''"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span class="hidden sm:inline">{{ exportLoading ? 'Génération...' : 'Télécharger en PDF' }}</span>
                <span class="sm:hidden">PDF</span>
              </button>
            </div>
          </div>

          <span v-if="isFree && recipes.length < 20" class="text-xs font-medium text-stone-500 dark:text-stone-400 flex-shrink-0">
            {{ recipes.length }}/20 recettes
          </span>
        </div>
      </div>

      <!-- Liste -->
      <div v-if="filteredRecipes.length === 0" class="text-center py-12">
        <p v-if="recipes.length === 0" class="text-lg text-stone-600 dark:text-stone-400 mb-6">La cuisine est encore vide, le chef n'est pas passé par là 😉</p>
        <NuxtLink
          v-if="recipes.length === 0"
          to="/recipes/new"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-saffron-300 to-saffron-500 px-6 py-3 text-sm font-semibold text-white shadow-lg"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Créer ma première recette
        </NuxtLink>
        <p v-else class="text-lg text-stone-600 dark:text-stone-400">Aucune recette trouvée.</p>
      </div>

      <div v-else class="flex flex-col gap-3">
        <div v-for="r in filteredRecipes" :key="r.id" class="relative overflow-hidden rounded-2xl">
          <!-- Action révélée par le glissement (uniquement en navigation libre, hors sélection depuis le planning) -->
          <div
            v-if="!dateParam"
            class="absolute inset-y-0 right-0 flex"
            :style="{ width: SWIPE_MAX + 'px' }"
          >
            <button
              type="button"
              class="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-r from-saffron-300 to-saffron-500 text-white"
              title="Ajouter à un jour"
              @click.stop="openDayPicker(r)"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div
            class="group relative flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-2xl border border-stone-200/90 dark:border-stone-700 bg-white dark:bg-stone-800 p-3 shadow-sm transition-shadow duration-200 hover:shadow-md"
            :style="{
              transform: `translateX(${swipeX[r.id] || 0}px)`,
              transition: dragState && dragState.id === r.id && dragState.dragging ? 'none' : 'transform 200ms ease',
              touchAction: 'pan-y',
            }"
            @click="handleCardClick(r)"
            @pointerdown="!dateParam && onSwipePointerDown($event, r.id)"
            @pointermove="!dateParam && onSwipePointerMove($event)"
            @pointerup="!dateParam && onSwipePointerUp()"
            @pointercancel="!dateParam && onSwipePointerUp()"
          >
            <div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-700 sm:h-[72px] sm:w-[72px]">
              <img
                v-if="!imageLoadFailed[r.id]"
                :src="recipeCardImageSrc(r)"
                :srcset="recipeCardImageSrcset(r)"
                sizes="72px"
                :alt="r.title"
                loading="lazy"
                decoding="async"
                class="h-full w-full object-cover"
                @error="onRecipeCardImageError($event, r)"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center text-2xl select-none"
                :class="r.salt === false ? 'bg-amber-50' : 'bg-emerald-50'"
              >
                {{ r.salt === false ? '🍰' : '🧂' }}
              </div>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1">
                <svg
                  v-if="r.maman"
                  class="h-3 w-3 shrink-0 text-pink-400"
                  viewBox="0 0 512 512" fill="currentColor" aria-hidden="true"
                  title="Recette Ninette"
                >
                  <path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5.3-86.2 32.6-96.8 70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7.9 78.6 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2-25.8 0-46.7-20.9-46.7-46.7v-1.6c0-10.4 1.6-20.8 5.2-30.5zM324.5 92.9c14.3-42.9 51.7-73.1 84.4-58.5s46.9 53.9 32.6 96.8-51.7 73.1-84.4 58.5-46.9-53.9-32.6-96.8zM400.1 165.3c24.5 14 29.1 51.7 10.2 84.1s-54 48.2-78.5 33.3-29.1-51.7-10.2-84.1 54-48.2 78.5-33.3z" />
                </svg>
                <h3 class="min-w-0 line-clamp-2 text-sm font-bold leading-tight text-stone-900 dark:text-stone-100 sm:text-base">
                  {{ r.title }}
                </h3>
              </div>
              <div class="mt-1.5 flex items-center gap-2">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold"
                  :class="r.salt === false ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'"
                >
                  {{ recipeCardSubtitle(r) }}
                </span>
                <span v-if="formatCookTime(r)" class="text-xs font-medium text-stone-500 dark:text-stone-400">
                  {{ formatCookTime(r) }}
                </span>
              </div>
            </div>

            <button
              v-if="dateParam"
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-saffron-600 dark:text-saffron-400 transition hover:bg-saffron-50 dark:hover:bg-saffron-900/30"
              @click.stop="assignRecipe(r)"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16M20 12H4" />
              </svg>
            </button>
            <svg
              v-else
              class="hidden h-4 w-4 shrink-0 text-stone-300 dark:text-stone-600 opacity-0 transition-opacity group-hover:opacity-100 sm:block"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      <AppToast :message="toast.message.value" :visible="toast.visible.value" />

      <!-- Sélecteur de jour (glissement d'une carte recette) -->
      <Teleport to="body">
        <div v-if="dayPickerRecipe" class="fixed inset-0 z-[100]">
          <button type="button" class="absolute inset-0 bg-stone-900/45" aria-label="Fermer" @click="closeDayPicker" />
          <div
            class="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl border border-b-0 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-2xl sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-80 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border-b"
            role="dialog"
            aria-modal="true"
            aria-labelledby="day-picker-title"
          >
            <div class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-3">
              <div class="min-w-0 flex-1">
                <p id="day-picker-title" class="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Ajouter à un jour
                </p>
                <p class="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-400">
                  {{ dayPickerRecipe.title }}
                </p>
              </div>
              <button
                type="button"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-500 dark:text-stone-400 transition hover:bg-stone-100 dark:hover:bg-stone-700"
                aria-label="Fermer"
                @click="closeDayPicker"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="pb-[max(1rem,env(safe-area-inset-bottom))] pt-1">
              <button
                v-for="(d, idx) in dayPickerDates"
                :key="toISODateLocal(d)"
                type="button"
                class="flex w-full items-center px-4 py-3 text-left text-base capitalize text-stone-900 dark:text-stone-100 transition hover:bg-saffron-50 dark:hover:bg-saffron-900/20 active:bg-saffron-100 dark:active:bg-saffron-900/40"
                @click="assignToDay(toISODateLocal(d))"
              >
                {{ dayPickerLabel(d, idx) }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <NuxtLink
        to="/recipes/new"
        class="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-saffron-300 to-saffron-500 text-white shadow-lg shadow-saffron-300/40 transition-all hover:from-saffron-300 hover:to-saffron-600 hover:scale-105 sm:bottom-6 sm:right-6"
        aria-label="Ajouter une recette"
        title="Ajouter une recette"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default", middleware: "auth" });

const route = useRoute();
const { getOptimizedImageUrl, getOptimizedImageSrcset } = useImageOptimizer();
const { isPremium, isAdmin, isFree } = useAuth();
const planning = usePlanningStore();
const toast = useToast();

const dateParam = computed(() => (route.query.date as string) || "");

const searchQuery = useState("recipes_search_query", () => (route.query.q as string) || "");
const debouncedQuery = ref(searchQuery.value);
const saltFilter = useState("recipes_salt_filter", () => (route.query.salt as string) || "all");
const mamanFilter = useState("recipes_maman_filter", () => route.query.maman === "true");
const bannerDismissed = ref(false);
const exportLoading = ref(false);
const DEFAULT_RECIPE_IMAGE = "/images/default-recipe.jpg";
const imageLoadFailed = ref<Record<string, boolean>>({});

const markImageFailed = (id: string) => {
  imageLoadFailed.value = { ...imageLoadFailed.value, [id]: true };
};

const recipeCardImageSrc = (r: { image?: string }) => {
  const u = String(r.image ?? "").trim();
  if (!u) return DEFAULT_RECIPE_IMAGE;
  return getOptimizedImageUrl(u, 144, 78);
};

// Vignette carrée fixe de 64-72px : pas besoin de charger des images larges.
const CARD_IMAGE_WIDTHS = [96, 144, 192];
const recipeCardImageSrcset = (r: { image?: string }) => {
  const u = String(r.image ?? "").trim();
  if (!u) return undefined;
  return getOptimizedImageSrcset(u, CARD_IMAGE_WIDTHS, 78);
};

const onRecipeCardImageError = (e: Event, r: { id: string; image?: string }) => {
  const el = e.target as HTMLImageElement;
  const hadCustom = !!String(r.image ?? "").trim();
  if (hadCustom && el.dataset.fallbackDefault !== "1") {
    el.dataset.fallbackDefault = "1";
    el.removeAttribute("srcset");
    el.src = DEFAULT_RECIPE_IMAGE;
    return;
  }
  markImageFailed(r.id);
};

const formatCookTime = (r: { cook_minutes?: number; duration_minutes?: number; total_time?: number }) => {
  const m = r.cook_minutes ?? r.duration_minutes ?? r.total_time;
  if (typeof m === "number" && Number.isFinite(m) && m > 0) return `${Math.round(m)} min`;
  return "";
};

/** Salé / Sucré (l’icône pastille indique Ninette quand `maman`) */
const recipeCardSubtitle = (r: { salt?: boolean }) => (r.salt === false ? "Sucré" : "Salé");

const saltFilters = [
  { value: "all", label: "Tous" },
  { value: "salty", label: "Salé" },
  { value: "sweet", label: "Sucré" },
];

let debounceTimer: ReturnType<typeof setTimeout>;
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { debouncedQuery.value = val; }, 300);
});

// Pas de await → page s'affiche immédiatement.
// L'endpoint ne renvoie plus les ingrédients (payload trop lourd à charger à
// chaque visite) : on les récupère seulement pendant une recherche active,
// via /api/recipes/search.
const { data: recipesData } = useFetch<any[]>("/api/recipes", { default: () => [] });
const recipes = computed(() => recipesData.value || []);

// IDs des recettes dont un ingrédient matche la recherche en cours.
const ingredientMatchIds = ref<Set<string>>(new Set());
let searchToken = 0;
watch(debouncedQuery, async (val) => {
  const q = val.trim();
  if (!q) {
    ingredientMatchIds.value = new Set();
    return;
  }
  const token = ++searchToken;
  const ids = await $fetch<string[]>("/api/recipes/search", { query: { q } }).catch(() => []);
  if (token === searchToken) ingredientMatchIds.value = new Set(ids);
}, { immediate: true });

const normalize = (s: string) =>
  String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const filteredRecipes = computed(() => {
  let list = recipes.value || [];
  const q = normalize(debouncedQuery.value);

  if (q) {
    list = list.filter((r) => normalize(r.title).includes(q) || ingredientMatchIds.value.has(r.id));
  }

  if (mamanFilter.value) list = list.filter((r) => r.maman === true);
  if (saltFilter.value === "salty") list = list.filter((r) => r.salt === true);
  else if (saltFilter.value === "sweet") list = list.filter((r) => r.salt === false);

  return list;
});

// Glissement d'une carte pour révéler l'action "Ajouter à un jour" (hors
// contexte planning, où le bouton dédié assigne déjà directement).
const SWIPE_MAX = 72;
const swipeX = ref<Record<string, number>>({});
const openSwipeId = ref<string | null>(null);
const dragState = ref<{ id: string; startX: number; startY: number; base: number; dragging: boolean } | null>(null);
let suppressNextClick = false;

const closeSwipe = (id?: string) => {
  const target = id ?? openSwipeId.value;
  if (target) swipeX.value[target] = 0;
  if (!id || id === openSwipeId.value) openSwipeId.value = null;
};

const onSwipePointerDown = (e: PointerEvent, id: string) => {
  if (openSwipeId.value && openSwipeId.value !== id) closeSwipe(openSwipeId.value);
  dragState.value = { id, startX: e.clientX, startY: e.clientY, base: swipeX.value[id] || 0, dragging: false };
};

const onSwipePointerMove = (e: PointerEvent) => {
  const st = dragState.value;
  if (!st) return;
  const dx = e.clientX - st.startX;
  const dy = e.clientY - st.startY;
  if (!st.dragging) {
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    if (Math.abs(dy) > Math.abs(dx)) {
      dragState.value = null;
      return;
    }
    st.dragging = true;
  }
  swipeX.value[st.id] = Math.min(0, Math.max(-SWIPE_MAX, st.base + dx));
};

const onSwipePointerUp = () => {
  const st = dragState.value;
  dragState.value = null;
  if (!st || !st.dragging) return;
  suppressNextClick = true;
  const val = swipeX.value[st.id] || 0;
  if (val < -SWIPE_MAX / 2) {
    swipeX.value[st.id] = -SWIPE_MAX;
    openSwipeId.value = st.id;
  } else {
    closeSwipe(st.id);
  }
};

const handleCardClick = (r: any) => {
  if (suppressNextClick) {
    suppressNextClick = false;
    return;
  }
  if (openSwipeId.value === r.id) {
    closeSwipe(r.id);
    return;
  }
  const q = dateParam.value ? `?date=${encodeURIComponent(dateParam.value)}` : "";
  navigateTo(`/recipes/${r.id}${q}`);
};

const assignRecipe = async (r: any) => {
  if (!dateParam.value) return;
  try {
    await planning.assign(dateParam.value, { id: r.id, title: r.title, image: r.image });
    navigateTo("/planning");
  } catch {
    toast.show("Impossible d'assigner la recette");
  }
};

// Sélecteur de jour ouvert par l'action révélée au glissement.
const WEEKDAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const toISODateLocal = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const addDays = (d: Date, n: number): Date => {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
};
const dayPickerDates = computed(() => Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)));
const dayPickerLabel = (d: Date, idx: number) => {
  if (idx === 0) return "Aujourd'hui";
  if (idx === 1) return "Demain";
  const wIdx = (d.getDay() + 6) % 7;
  return `${WEEKDAY_LABELS[wIdx]} ${d.getDate()}`;
};

const dayPickerRecipe = ref<any | null>(null);
const openDayPicker = (r: any) => {
  closeSwipe(r.id);
  dayPickerRecipe.value = r;
};
const closeDayPicker = () => {
  dayPickerRecipe.value = null;
};
const assignToDay = async (dateStr: string) => {
  const r = dayPickerRecipe.value;
  if (!r) return;
  closeDayPicker();
  try {
    await planning.assign(dateStr, { id: r.id, title: r.title, image: r.image });
    toast.show("✅ Recette ajoutée au planning");
  } catch {
    toast.show("Impossible d'ajouter la recette");
  }
};

const exportPdf = async () => {
  if (!isPremium.value) {
    toast.show("🔒 Export PDF réservé aux utilisateurs Premium");
    return;
  }
  exportLoading.value = true;
  try {
    const response = await fetch("/api/recipes/export-pdf", { credentials: "include" });
    if (!response.ok) throw new Error();
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mes-recettes-${new Date().toISOString().split("T")[0]}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.show("✅ PDF téléchargé");
  } catch {
    toast.show("❌ Erreur lors de l'export PDF");
  } finally {
    exportLoading.value = false;
  }
};
</script>
