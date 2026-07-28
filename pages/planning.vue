<template>
  <div class="min-h-screen w-full">
    <div class="mx-auto max-w-7xl overflow-x-clip px-3 pb-24 pt-8 sm:px-4 sm:pb-16 sm:pt-10">
      <PageHeader
        title="Ma semaine"
        description="Naviguez de semaine en semaine et organisez vos repas jour par jour."
      />

      <!-- Navigation semaine -->
      <div class="mb-4 flex items-center justify-between gap-2 sm:mb-6">
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 shadow-sm transition hover:bg-saffron-50 dark:hover:bg-saffron-900/30 hover:text-saffron-700 dark:hover:text-saffron-300"
          aria-label="Semaine précédente"
          @click="goPrevWeek"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div class="flex flex-col items-center">
          <p class="text-sm font-bold capitalize text-stone-900 dark:text-stone-100 sm:text-base">
            {{ weekRangeLabel }}
          </p>
          <button
            v-if="!isCurrentWeek"
            type="button"
            class="mt-0.5 text-xs font-semibold text-saffron-700 dark:text-saffron-400 hover:underline"
            @click="goToday"
          >
            Revenir à aujourd'hui
          </button>
        </div>

        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 shadow-sm transition hover:bg-saffron-50 dark:hover:bg-saffron-900/30 hover:text-saffron-700 dark:hover:text-saffron-300"
          aria-label="Semaine suivante"
          @click="goNextWeek"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div
        v-if="isLoadingWeek"
        class="flex min-h-[32vh] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-200 dark:border-stone-700 bg-white/60 dark:bg-stone-800/60 py-12 text-stone-500 dark:text-stone-400"
      >
        <span class="inline-flex h-8 w-8 animate-pulse rounded-full bg-saffron-200/60" />
        <p class="text-xs font-medium sm:text-sm">Chargement de votre semaine…</p>
      </div>

      <template v-else>
      <div class="grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-3 md:gap-3">
        <article
          v-for="date in weekDates"
          :key="toISODateLocal(date)"
          class="group relative flex min-h-0 flex-col rounded-xl border bg-white dark:bg-stone-800 shadow-sm transition-shadow duration-200 hover:shadow-md"
          :class="toISODateLocal(date) === todayStr ? 'border-saffron-300 dark:border-saffron-700 ring-1 ring-saffron-200 dark:ring-saffron-800' : 'border-stone-200/90 dark:border-stone-700'"
        >
          <!-- Bandeau jour -->
          <div class="flex items-baseline justify-between gap-1 rounded-t-xl border-b border-stone-100 dark:border-stone-700 bg-gradient-to-r from-stone-50 to-white dark:from-stone-800 dark:to-stone-800 px-2.5 py-2 sm:px-3 sm:py-2.5">
            <p class="truncate text-sm font-bold uppercase tracking-[0.1em] text-saffron-700 dark:text-saffron-400 sm:text-base">
              {{ weekdayLabel(date) }}
            </p>
            <span class="shrink-0 text-xs font-semibold text-stone-400 dark:text-stone-500 sm:text-sm">
              {{ date.getDate() }}
            </span>
          </div>

          <div class="flex flex-1 flex-col gap-1.5 p-1.5 sm:p-2">
            <div
              v-for="entry in entriesFor(date)"
              :key="entry.id"
              class="flex items-center gap-1.5 rounded-lg bg-stone-50 dark:bg-stone-900/40 py-1 pl-1 pr-0.5 sm:gap-2 sm:py-1.5 sm:pl-1.5"
            >
              <NuxtLink :to="`/recipes/${entry.recipe.id}`" class="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                <img
                  :src="getOptimizedImageUrl(entry.recipe.image, 80, 70)"
                  :alt="entry.recipe.title"
                  loading="lazy"
                  decoding="async"
                  class="h-7 w-7 shrink-0 rounded-md bg-stone-200 dark:bg-stone-700 object-cover sm:h-8 sm:w-8"
                  @error="(e: Event) => ((e.target as HTMLImageElement).src = '/images/default-recipe.jpg')"
                />
                <span class="truncate text-[11px] font-semibold leading-tight text-stone-800 dark:text-stone-200 sm:text-xs">
                  {{ entry.recipe.title }}
                </span>
              </NuxtLink>

              <div class="relative flex shrink-0 items-center">
                <button
                  type="button"
                  title="Déplacer vers un autre jour"
                  class="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-500 dark:text-stone-400 transition hover:bg-white dark:hover:bg-stone-700 hover:text-saffron-700 dark:hover:text-saffron-300"
                  aria-haspopup="true"
                  :aria-expanded="activeMoveEntryId === entry.id"
                  @click.stop="toggleMoveMenu(entry.id)"
                >
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  title="Retirer"
                  class="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-500 dark:text-stone-400 transition hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400"
                  @click.stop="removeEntry(entry.date, entry.id)"
                >
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <!-- Popover déplacer (desktop) -->
                <div
                  v-if="activeMoveEntryId === entry.id"
                  class="absolute right-0 top-full z-[100] mt-0.5 hidden w-40 max-h-56 overflow-y-auto rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-0.5 shadow-xl md:block"
                  role="menu"
                  @click.stop
                >
                  <p class="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
                    Déplacer vers
                  </p>
                  <button
                    v-for="targetDate in weekDates"
                    :key="toISODateLocal(targetDate)"
                    type="button"
                    role="menuitem"
                    class="flex w-full items-center px-2 py-2 text-left text-sm capitalize transition"
                    :class="toISODateLocal(targetDate) === entry.date
                      ? 'cursor-not-allowed bg-stone-50 dark:bg-stone-900/40 text-stone-400 dark:text-stone-600'
                      : 'text-stone-800 dark:text-stone-200 hover:bg-saffron-50 dark:hover:bg-saffron-900/30'"
                    :disabled="toISODateLocal(targetDate) === entry.date"
                    @click="moveEntry(entry, toISODateLocal(targetDate))"
                  >
                    {{ weekdayLabel(targetDate) }} {{ targetDate.getDate() }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Case vide -->
            <NuxtLink
              v-if="entriesFor(date).length === 0"
              :to="`/recipes?date=${toISODateLocal(date)}`"
              class="flex flex-1 flex-col items-stretch justify-center gap-2 rounded-lg px-3 py-3 text-center outline-none transition hover:bg-saffron-50/40 dark:hover:bg-saffron-900/20 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-saffron-300"
            >
              <div class="mx-auto flex h-9 w-9 items-center justify-center rounded-xl border-2 border-dashed border-saffron-300/70 dark:border-saffron-700 bg-white dark:bg-stone-800 text-saffron-600 dark:text-saffron-400 transition group-hover:border-saffron-400 group-hover:bg-saffron-50 dark:group-hover:bg-saffron-900/30">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p class="text-[11px] font-semibold text-stone-800 dark:text-stone-200 sm:text-xs">Choisir une recette</p>
            </NuxtLink>

            <!-- Ajouter un repas de plus -->
            <NuxtLink
              v-else
              :to="`/recipes?date=${toISODateLocal(date)}`"
              class="mt-auto inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-saffron-700 dark:text-saffron-400 transition hover:bg-saffron-50 dark:hover:bg-saffron-900/30 sm:text-xs"
            >
              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter
            </NuxtLink>
          </div>
        </article>
      </div>

      <div class="mt-6 flex justify-center pb-4 sm:mt-8 sm:pb-0">
        <button
          type="button"
          class="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 shadow-sm transition hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400 sm:text-sm"
          @click="confirmClearWeek"
        >
          Réinitialiser cette semaine
        </button>
      </div>
      </template>

      <Teleport to="body">
        <div
          v-if="activeMoveEntryId && activeMoveEntry"
          class="fixed inset-0 z-[100] md:hidden"
        >
          <button
            type="button"
            class="absolute inset-0 bg-stone-900/45"
            aria-label="Fermer"
            @click="closeMoveMenu"
          />
          <div
            class="absolute bottom-16 left-0 right-0 max-h-[min(70vh,28rem)] overflow-y-auto rounded-t-2xl border border-stone-200 dark:border-stone-700 border-b-0 bg-white dark:bg-stone-800 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="move-sheet-title"
            @click.stop
          >
            <div class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-3">
              <div class="min-w-0 flex-1">
                <p id="move-sheet-title" class="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Déplacer vers un jour
                </p>
                <p class="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-400">
                  {{ activeMoveEntry.recipe.title }}
                </p>
              </div>
              <button
                type="button"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-500 dark:text-stone-400 transition hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-800 dark:hover:text-stone-200"
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
                v-for="targetDate in weekDates"
                :key="toISODateLocal(targetDate)"
                type="button"
                class="flex w-full px-4 py-3 text-left text-base capitalize transition"
                :class="toISODateLocal(targetDate) === activeMoveEntry.date
                  ? 'cursor-not-allowed bg-stone-50 dark:bg-stone-900/40 text-stone-400 dark:text-stone-600'
                  : 'text-stone-900 dark:text-stone-100 active:bg-saffron-100 dark:active:bg-saffron-900/40'"
                :disabled="toISODateLocal(targetDate) === activeMoveEntry.date"
                @click="moveEntry(activeMoveEntry, toISODateLocal(targetDate))"
              >
                {{ weekdayLabel(targetDate) }} {{ targetDate.getDate() }}
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
const toast = useToast();

const WEEKDAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function mondayOf(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}
function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}
// Toujours getFullYear/getMonth/getDate ici, jamais toISOString() : cette
// dernière convertit en UTC et décale la date pour les fuseaux horaires
// en avance sur UTC (ex. Europe/Paris) autour de minuit.
function toISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function weekdayLabel(d: Date): string {
  const idx = (d.getDay() + 6) % 7; // getDay(): 0=dimanche -> réindexe sur lundi=0
  return WEEKDAY_LABELS[idx];
}

const weekStart = ref(mondayOf(new Date()));
const weekDates = computed(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart.value, i)));
const startStr = computed(() => toISODateLocal(weekStart.value));
const endStr = computed(() => toISODateLocal(weekDates.value[6]));
const todayStr = toISODateLocal(new Date());
const isCurrentWeek = computed(() => startStr.value === toISODateLocal(mondayOf(new Date())));

const weekRangeLabel = computed(() => {
  const start = weekStart.value;
  const end = weekDates.value[6];
  const monthYearFmt = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} – ${end.getDate()} ${monthYearFmt.format(start)}`;
  }
  const shortFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
  return `${shortFmt.format(start)} – ${shortFmt.format(end)} ${end.getFullYear()}`;
});

const currentRangeKey = computed(() => `${startStr.value}_${endStr.value}`);
const isLoadingWeek = computed(() => planning.pending && !planning.loadedRanges.has(currentRangeKey.value));

watch([startStr, endStr], async ([start, end]) => {
  await planning.loadWeek(start, end);
}, { immediate: true });

function goPrevWeek() { weekStart.value = addDays(weekStart.value, -7); }
function goNextWeek() { weekStart.value = addDays(weekStart.value, 7); }
function goToday() { weekStart.value = mondayOf(new Date()); }

function entriesFor(date: Date) {
  return planning.entriesByDate[toISODateLocal(date)] || [];
}

const activeMoveEntryId = ref<string | null>(null);
const activeMoveEntry = computed(() => {
  if (!activeMoveEntryId.value) return null;
  for (const d of weekDates.value) {
    const found = entriesFor(d).find((e) => e.id === activeMoveEntryId.value);
    if (found) return found;
  }
  return null;
});

function toggleMoveMenu(id: string) {
  activeMoveEntryId.value = activeMoveEntryId.value === id ? null : id;
}
function closeMoveMenu() {
  activeMoveEntryId.value = null;
}

async function moveEntry(entry: { id: string; date: string }, toDate: string) {
  if (toDate === entry.date) return;
  activeMoveEntryId.value = null;
  try {
    await planning.move(entry.id, entry.date, toDate);
  } catch {
    toast.show("Impossible de déplacer la recette");
  }
}

async function removeEntry(date: string, id: string) {
  try {
    await planning.remove(date, id);
  } catch {
    toast.show("Impossible de retirer la recette");
  }
}

const confirmClearWeek = async () => {
  if (!confirm("Réinitialiser le planning de cette semaine ?")) return;
  try {
    await planning.clearRange(startStr.value, endStr.value);
  } catch {
    toast.show("Erreur lors de la réinitialisation");
  }
};

onMounted(() => {
  document.addEventListener("click", closeMoveMenu);
});
onUnmounted(() => {
  document.removeEventListener("click", closeMoveMenu);
});
</script>
