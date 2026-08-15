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
      <!-- Zones de changement de semaine : n'apparaissent que pendant un
           glissement, pour ne pas encombrer la page au repos. Deposer y place
           le repas au meme jour de la semaine voisine. -->
      <div
        v-show="isDragging"
        data-week-drop="prev"
        class="mb-2 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-saffron-300 dark:border-saffron-700 bg-saffron-50/60 dark:bg-saffron-900/20 py-3 text-xs font-bold text-saffron-700 dark:text-saffron-300"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
        Semaine précédente
      </div>

      <div>
        <div
          v-for="date in weekDates"
          :key="toISODateLocal(date)"
          class="flex gap-3 border-b border-stone-200/80 dark:border-stone-700/60 py-2.5 last:border-b-0"
        >
          <!-- Colonne date : le jour courant porte une pastille pleine, seul
               repere visuel fort de la page (les jours vides restent discrets). -->
          <div class="w-11 shrink-0 text-center">
            <div
              class="text-[10px] font-extrabold uppercase tracking-[0.08em]"
              :class="toISODateLocal(date) === todayStr ? 'text-saffron-700 dark:text-saffron-400' : 'text-stone-400 dark:text-stone-500'"
            >
              {{ shortWeekdayLabel(date) }}
            </div>
            <div
              v-if="toISODateLocal(date) === todayStr"
              class="mx-auto mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-saffron-500 text-base font-extrabold text-white shadow-sm"
            >
              {{ date.getDate() }}
            </div>
            <div v-else class="text-xl font-extrabold leading-snug text-stone-600 dark:text-stone-300">
              {{ date.getDate() }}
            </div>
          </div>

          <!-- Repas du jour + ajout -->
          <div class="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
            <!-- Conteneur de depot : pendant un glissement, meme vide il doit
                 offrir une cible visible et assez haute pour le doigt. -->
            <div
              :data-day-list="toISODateLocal(date)"
              class="flex flex-col gap-1.5 transition-all"
              :class="isDragging ? 'min-h-[44px] rounded-xl border border-dashed border-saffron-300 dark:border-saffron-700 p-1' : ''"
            >
            <div
              v-for="entry in entriesFor(date)"
              :key="entry.id"
              :data-entry-id="entry.id"
              class="relative flex items-center gap-2.5 rounded-xl border border-stone-200/80 dark:border-stone-700 bg-white dark:bg-stone-800 p-1.5 shadow-sm"
            >
              <NuxtLink :to="`/recipes/${entry.recipe.id}`" class="flex min-w-0 flex-1 items-center gap-2.5">
                <img
                  :src="getOptimizedImageUrl(entry.recipe.image, 96, 75)"
                  :alt="entry.recipe.title"
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                  class="h-10 w-10 shrink-0 rounded-lg bg-stone-200 dark:bg-stone-700 object-cover"
                  @error="(e: Event) => ((e.target as HTMLImageElement).src = '/images/default-recipe.jpg')"
                />
                <span class="line-clamp-2 min-w-0 text-[13px] font-bold leading-snug text-stone-800 dark:text-stone-200">
                  {{ entry.recipe.title }}
                </span>
              </NuxtLink>

              <!-- Cibles tactiles de 44px (minimum recommande) et separees :
                   a 28px et collees, rater le deplacement revenait souvent a
                   declencher la suppression, qui est destructrice. -->
              <div class="relative flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  title="Déplacer vers un autre jour"
                  aria-label="Déplacer vers un autre jour"
                  class="inline-flex h-11 w-11 items-center justify-center rounded-xl text-stone-500 dark:text-stone-400 transition hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-saffron-700 dark:hover:text-saffron-300 active:bg-saffron-100 dark:active:bg-saffron-900/40"
                  aria-haspopup="true"
                  :aria-expanded="activeMoveEntryId === entry.id"
                  @click.stop="toggleMoveMenu(entry.id)"
                >
                  <svg class="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  title="Retirer"
                  aria-label="Retirer du planning"
                  class="inline-flex h-11 w-11 items-center justify-center rounded-xl text-stone-400 dark:text-stone-500 transition hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 active:bg-red-100 dark:active:bg-red-950/50"
                  @click.stop="removeEntry(entry.date, entry.id)"
                >
                  <svg class="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <!-- Popover déplacer (desktop) -->
                <div
                  v-if="activeMoveEntryId === entry.id"
                  class="absolute right-0 top-full z-[100] mt-1 hidden w-48 max-h-72 overflow-y-auto rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-0.5 shadow-xl md:block"
                  role="menu"
                  @click.stop
                >
                  <template v-for="group in moveGroups" :key="group.title">
                    <p class="sticky top-0 bg-white dark:bg-stone-800 px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
                      {{ group.title }}
                    </p>
                    <button
                      v-for="opt in group.days"
                      :key="opt.iso"
                      type="button"
                      role="menuitem"
                      class="flex w-full items-center justify-between gap-2 px-2 py-2 text-left text-sm transition"
                      :class="opt.iso === entry.date
                        ? 'cursor-not-allowed bg-stone-50 dark:bg-stone-900/40 text-stone-400 dark:text-stone-600'
                        : 'text-stone-800 dark:text-stone-200 hover:bg-saffron-50 dark:hover:bg-saffron-900/30'"
                      :disabled="opt.iso === entry.date"
                      @click="moveEntry(entry, opt.iso)"
                    >
                      <span class="capitalize">{{ opt.label }}</span>
                      <span v-if="opt.isToday" class="shrink-0 rounded-full bg-saffron-100 dark:bg-saffron-900/40 px-1.5 py-0.5 text-[9px] font-bold uppercase text-saffron-700 dark:text-saffron-300">
                        Auj.
                      </span>
                    </button>
                  </template>
                </div>
              </div>
            </div>

            </div>

            <!-- Ajout volontairement discret : un jour vide ne doit pas crier
                 plus fort qu'un repas reellement planifie. -->
            <NuxtLink
              :to="`/recipes?date=${toISODateLocal(date)}`"
              class="inline-flex w-fit items-center gap-1.5 rounded-lg py-1 pr-2 text-xs font-semibold text-stone-400 dark:text-stone-500 transition hover:text-saffron-700 dark:hover:text-saffron-300"
            >
              <span class="flex h-5 w-5 items-center justify-center rounded-md border border-stone-300 dark:border-stone-600">
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </span>
              Ajouter un repas
            </NuxtLink>
          </div>
        </div>
      </div>

      <div
        v-show="isDragging"
        data-week-drop="next"
        class="mt-2 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-saffron-300 dark:border-saffron-700 bg-saffron-50/60 dark:bg-saffron-900/20 py-3 text-xs font-bold text-saffron-700 dark:text-saffron-300"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
        Semaine suivante
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
              <template v-for="group in moveGroups" :key="group.title">
                <p class="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                  {{ group.title }}
                </p>
                <button
                  v-for="opt in group.days"
                  :key="opt.iso"
                  type="button"
                  class="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-base transition"
                  :class="opt.iso === activeMoveEntry.date
                    ? 'cursor-not-allowed bg-stone-50 dark:bg-stone-900/40 text-stone-400 dark:text-stone-600'
                    : 'text-stone-900 dark:text-stone-100 active:bg-saffron-100 dark:active:bg-saffron-900/40'"
                  :disabled="opt.iso === activeMoveEntry.date"
                  @click="moveEntry(activeMoveEntry, opt.iso)"
                >
                  <span class="capitalize">{{ opt.label }}</span>
                  <span v-if="opt.isToday" class="shrink-0 rounded-full bg-saffron-100 dark:bg-saffron-900/40 px-2 py-0.5 text-[10px] font-bold uppercase text-saffron-700 dark:text-saffron-300">
                    Auj.
                  </span>
                </button>
              </template>
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
// Abreviation pour la colonne date de la vue semaine, ou la place est
// contrainte : "Lun", "Mar"... Le libelle complet reste utilise par le menu
// de deplacement, plus large.
function shortWeekdayLabel(d: Date): string {
  return weekdayLabel(d).slice(0, 3);
}

const weekStart = ref(mondayOf(new Date()));
const weekDates = computed(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart.value, i)));
const startStr = computed(() => toISODateLocal(weekStart.value));
const endStr = computed(() => toISODateLocal(weekDates.value[6]));
const todayStr = toISODateLocal(new Date());
const isCurrentWeek = computed(() => startStr.value === toISODateLocal(mondayOf(new Date())));

// Le menu "deplacer" couvre deux semaines et non la seule semaine affichee :
// depuis dimanche, la cible la plus naturelle est souvent le lundi suivant,
// qui etait jusqu'ici hors de portee. La semaine affichee + les 7 jours
// suivants sont donc toujours proposes, sans rien retirer de ce qui existait.
const moveDayFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
const moveGroups = computed(() => {
  const build = (offset: number) =>
    Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart.value, offset + i);
      const iso = toISODateLocal(d);
      return { iso, label: `${weekdayLabel(d)} ${moveDayFmt.format(d)}`, isToday: iso === todayStr };
    });
  return [
    { title: isCurrentWeek.value ? "Cette semaine" : "Semaine affichée", days: build(0) },
    { title: "Semaine suivante", days: build(7) },
  ];
});

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

// ---------------------------------------------------------------- glisser-deposer
const isDragging = ref(false);
let sortables: any[] = [];

function shiftISODate(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return toISODateLocal(addDays(new Date(y, m - 1, d), days));
}

function onDragEnd(evt: any) {
  isDragging.value = false;
  const { from, to, item, oldIndex } = evt;
  if (!from || !to || from === to) return;

  // Sortable a deja deplace le noeud dans le DOM, or c'est Vue qui possede
  // cette liste : on remet le noeud a sa place et on laisse l'etat (le store)
  // provoquer le vrai re-rendu. Sans ca, le vdom et le DOM divergent.
  from.insertBefore(item, from.children[oldIndex] ?? null);

  const entryId = item?.dataset?.entryId;
  const fromDate = from.dataset?.dayList;
  if (!entryId || !fromDate) return;

  const weekDrop = to.dataset?.weekDrop;
  const toDate = weekDrop
    ? shiftISODate(fromDate, weekDrop === "next" ? 7 : -7)
    : to.dataset?.dayList;
  if (!toDate || toDate === fromDate) return;

  // Un depot vers une autre semaine fait disparaitre le repas de l'ecran :
  // sans retour explicite, on peut croire a une suppression.
  if (weekDrop) {
    const [y, m, d] = toDate.split("-").map(Number);
    const target = new Date(y, m - 1, d);
    toast.show(`Déplacé au ${weekdayLabel(target).toLowerCase()} ${moveDayFmt.format(target)}`);
  }

  moveEntry({ id: entryId, date: fromDate }, toDate);
}

async function initSortables() {
  const Sortable = (await import("sortablejs")).default;
  sortables.forEach((s) => s.destroy());
  sortables = [];
  await nextTick();

  const common = {
    group: "planning-meals",
    animation: 150,
    // Au doigt, un appui bref doit rester un clic (ouvrir la recette) et la
    // page doit pouvoir defiler : seul un appui maintenu leve le repas.
    delay: 250,
    delayOnTouchOnly: true,
    touchStartThreshold: 6,
    draggable: "[data-entry-id]",
    filter: "button",           // les actions du repas ne declenchent pas un glissement
    // iOS Safari n'implemente pas l'API HTML5 de drag & drop. On force le mode
    // de repli de Sortable (son propre rendu du deplacement) pour avoir le meme
    // comportement partout plutot que deux chemins de code selon le navigateur.
    forceFallback: true,
    fallbackTolerance: 3,       // evite qu'un micro-tremblement du doigt ne leve la carte
    ghostClass: "planning-drag-ghost",
    chosenClass: "planning-drag-chosen",
    onStart: () => { isDragging.value = true; },
    onEnd: onDragEnd,
  };

  document.querySelectorAll<HTMLElement>("[data-day-list]").forEach((el) => {
    sortables.push(new Sortable(el, common));
  });
  // Les barres de semaine accueillent un repas mais n'en fournissent jamais.
  document.querySelectorAll<HTMLElement>("[data-week-drop]").forEach((el) => {
    sortables.push(new Sortable(el, {
      ...common,
      group: { name: "planning-meals", pull: false, put: true },
    }));
  });
}

onMounted(() => { initSortables(); });
// Changer de semaine recree les conteneurs : il faut rebrancher Sortable.
watch([startStr, isLoadingWeek], () => { if (!isLoadingWeek.value) initSortables(); });
onBeforeUnmount(() => { sortables.forEach((s) => s.destroy()); sortables = []; });

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

<style>
/* Non scoped : Sortable deplace/clone les noeuds hors de la portee du composant. */

/* Sur iOS, un appui long sur un lien ouvre l'apercu de page et sur une image
   le menu "Enregistrer l'image" : les deux annulent le geste avant que le
   glissement ne demarre. La carte etant un <a> contenant un <img>, il faut
   desactiver explicitement ces comportements natifs, sinon le glisser-deposer
   est simplement impossible sur iPhone. */
[data-entry-id],
[data-entry-id] * {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
/* manipulation (et non none) : le defilement de la page reste possible en
   partant d'une carte, seul le double-tap-zoom est neutralise. */
[data-entry-id] {
  touch-action: manipulation;
}

.planning-drag-ghost {
  opacity: 0.35;
}
.planning-drag-chosen {
  cursor: grabbing;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.16);
  transform: scale(1.02);
}
</style>
