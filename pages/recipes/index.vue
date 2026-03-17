<template>
  <div class="min-h-screen bg-gradient-to-br from-sage-50/30 via-sage-50/20 to-slate-50 w-full overflow-x-hidden">
    <div class="w-full max-w-6xl mx-auto px-4 pt-12 pb-32">
      <!-- Header -->
      <div class="mb-8 text-center">
        <div class="flex items-center justify-center gap-3 mb-2">
          <h1 class="text-4xl font-bold text-slate-900">Mes recettes</h1>
          <span
            v-if="isFree && recipes.length === 20"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
          >
            20/20 recettes – Limite atteinte
          </span>
        </div>
        <p class="text-slate-600">Découvrez et gérez votre collection</p>
      </div>

      <!-- Bannière limite -->
      <div
        v-if="isFree && recipes.length === 20 && !bannerDismissed"
        class="mb-6 rounded-xl border p-4 sm:p-5 shadow-sm"
        style="background-color: #E0F7FA; border-color: #B2EBF2;"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">🎉</span>
              <h3 class="text-base sm:text-lg font-semibold text-slate-800">Bravo, vous avez atteint la limite de 20 recettes !</h3>
            </div>
            <p class="text-sm sm:text-base text-slate-700 mb-4">Profitez de recettes illimitées avec le Premium.</p>
            <NuxtLink
              to="/premium"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
              style="background-color: #00ACC1;"
            >
              Découvrir le Premium
            </NuxtLink>
          </div>
          <button @click="bannerDismissed = true" class="p-1.5 rounded-lg text-slate-500 hover:text-slate-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Filtres et actions -->
      <div class="mb-8 flex flex-col gap-4 pb-12 sm:pb-8">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher une recette ou un ingrédient"
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 shadow-sm"
          />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div class="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div class="flex flex-wrap items-center gap-4 flex-1">
            <div class="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                v-for="f in saltFilters"
                :key="f.value"
                @click="saltFilter = f.value"
                class="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg transition-all"
                :class="saltFilter === f.value
                  ? 'bg-white font-bold text-sage-300 shadow-sm'
                  : 'font-medium text-slate-500 hover:text-sage-300 hover:bg-sage-50'"
              >
                {{ f.label }}
              </button>
            </div>
            <div v-if="isAdmin" class="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                @click="mamanFilter = !mamanFilter"
                class="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg transition-all flex items-center gap-1"
                :class="mamanFilter ? 'bg-white font-bold text-pink-600 shadow-sm' : 'font-medium text-slate-500'"
              >
                <svg class="w-4 h-4 text-pink-400" viewBox="0 0 512 512" fill="currentColor"><path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5.3-86.2 32.6-96.8 70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7.9 78.6 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2-25.8 0-46.7-20.9-46.7-46.7v-1.6c0-10.4 1.6-20.8 5.2-30.5zM324.5 92.9c14.3-42.9 51.7-73.1 84.4-58.5s46.9 53.9 32.6 96.8-51.7 73.1-84.4 58.5-46.9-53.9-32.6-96.8zM400.1 165.3c24.5 14 29.1 51.7 10.2 84.1s-54 48.2-78.5 33.3-29.1-51.7-10.2-84.1 54-48.2 78.5-33.3z"/></svg>
                Ninette
              </button>
            </div>
          </div>

          <div class="flex flex-row gap-3 items-center flex-shrink-0">
            <div class="relative">
              <NuxtLink
                to="/recipes/new"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sage-300 to-sage-500 px-4 sm:px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sage-300/30 transition-all hover:from-sage-300 hover:to-sage-600 hover:scale-105"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Ajouter
              </NuxtLink>
              <span v-if="isFree && recipes.length < 20" class="absolute top-full left-0 mt-2 text-xs font-medium text-slate-500">
                {{ recipes.length }}/20 recettes
              </span>
            </div>

            <button
              v-if="recipes.length > 0"
              @click="exportPdf"
              :disabled="!isPremium"
              class="inline-flex items-center justify-center gap-2 rounded-xl px-4 sm:px-6 py-3 text-sm font-semibold shadow-lg transition-all"
              :class="isPremium ? 'bg-slate-700 text-white hover:bg-slate-800 hover:scale-105' : 'bg-slate-300 text-slate-500 opacity-50 cursor-not-allowed'"
              :title="!isPremium ? 'Export PDF réservé aux utilisateurs Premium' : ''"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span class="hidden sm:inline">{{ exportLoading ? 'Génération...' : 'Télécharger en PDF' }}</span>
              <span class="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Grille -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <template v-if="filteredRecipes.length === 0">
          <div class="col-span-full text-center py-12">
            <p v-if="recipes.length === 0" class="text-lg text-slate-600 mb-6">La cuisine est encore vide, le chef n'est pas passé par là 😉</p>
            <NuxtLink
              v-if="recipes.length === 0"
              to="/recipes/new"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sage-300 to-sage-500 px-6 py-3 text-sm font-semibold text-white shadow-lg"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Créer ma première recette
            </NuxtLink>
            <p v-else class="text-lg text-slate-600">Aucune recette trouvée.</p>
          </div>
        </template>

        <div
          v-for="r in filteredRecipes"
          :key="r.id"
          class="group relative flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-sm border border-slate-100 transition-all duration-200 hover:shadow-md hover:border-slate-200 hover:-translate-y-px cursor-pointer"
          @click="handleCardClick(r)"
        >
          <!-- Icône type -->
          <div
            class="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl select-none"
            :class="r.salt === false ? 'bg-amber-50' : 'bg-sage-50'"
          >
            {{ r.salt === false ? '🍰' : '🧂' }}
          </div>

          <!-- Contenu -->
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-semibold text-slate-800 leading-snug truncate" :class="{'pr-8': dayParam || slotParam}">
              {{ r.title }}
            </h3>
            <div class="flex items-center gap-1.5 mt-1 flex-wrap">
              <span
                class="text-xs font-medium"
                :class="r.salt === false ? 'text-amber-500' : 'text-sage-400'"
              >
                {{ r.salt === false ? 'Sucré' : 'Salé' }}
              </span>
              <span v-if="r.maman" class="inline-flex items-center gap-0.5 text-xs text-pink-400" title="Recette de maman">
                <svg class="w-3 h-3" viewBox="0 0 512 512" fill="currentColor"><path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5.3-86.2 32.6-96.8 70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7.9 78.6 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2-25.8 0-46.7-20.9-46.7-46.7v-1.6c0-10.4 1.6-20.8 5.2-30.5zM324.5 92.9c14.3-42.9 51.7-73.1 84.4-58.5s46.9 53.9 32.6 96.8-51.7 73.1-84.4 58.5-46.9-53.9-32.6-96.8zM400.1 165.3c24.5 14 29.1 51.7 10.2 84.1s-54 48.2-78.5 33.3-29.1-51.7-10.2-84.1 54-48.2 78.5-33.3z"/></svg>
                Ninette
              </span>
            </div>
          </div>

          <!-- Bouton assigner -->
          <button
            v-if="dayParam || slotParam"
            type="button"
            class="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-sage-50 text-sage-400 transition-all hover:bg-sage-300 hover:text-white"
            @click.stop="assignRecipe(r)"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16M20 12H4" />
            </svg>
          </button>

          <!-- Flèche hover -->
          <svg
            v-else
            class="shrink-0 h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <AppToast :message="toast.message.value" :visible="toast.visible.value" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default", middleware: "auth" });

const route = useRoute();
const { isPremium, isAdmin, isFree } = useAuth();

const dayParam = computed(() => (route.query.day as string || "").toLowerCase());
const slotParam = computed(() => (route.query.slot as string || "").toLowerCase());

const searchQuery = ref("");
const debouncedQuery = ref("");
const saltFilter = ref("all");
const mamanFilter = ref(false);
const bannerDismissed = ref(false);
const exportLoading = ref(false);

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

const { data: recipes, pending } = await useFetch<any[]>("/api/recipes");

const normalize = (s: string) =>
  String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const filteredRecipes = computed(() => {
  let list = recipes.value || [];
  const q = normalize(debouncedQuery.value);

  if (q) {
    list = list.filter((r) => {
      if (normalize(r.title).includes(q)) return true;
      const ing = Array.isArray(r.ingredients) ? r.ingredients : [];
      return ing.some((i: any) => normalize(typeof i === "string" ? i : i?.item || "").includes(q));
    });
  }

  if (mamanFilter.value) list = list.filter((r) => r.maman === true);
  if (saltFilter.value === "salty") list = list.filter((r) => r.salt === true);
  else if (saltFilter.value === "sweet") list = list.filter((r) => r.salt === false);

  return list;
});

const handleCardClick = (r: any) => {
  const q = dayParam.value ? `?day=${encodeURIComponent(dayParam.value)}` : "";
  navigateTo(`/recipes/${r.id}${q}`);
};

const toast = useToast();

const assignRecipe = async (r: any) => {
  try {
    if (dayParam.value) {
      await $fetch("/api/planning/assign", { method: "POST", body: { day: dayParam.value, id: r.id } });
      await navigateTo("/planning");
    } else if (slotParam.value) {
      await $fetch("/api/reception/assign", { method: "POST", body: { slot: slotParam.value, id: r.id } });
      await navigateTo("/reception");
    }
  } catch {
    toast.show("Impossible d'assigner la recette");
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
