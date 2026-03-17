import { defineStore } from "pinia";

interface PlanningEntry {
  day: string;
  recipe: { id: string; title: string; image?: string } | null;
}

export const usePlanningStore = defineStore("planning", () => {
  const entries = ref<PlanningEntry[]>([]);
  const loaded = ref(false);
  const pending = ref(false);

  function hydrate(data: PlanningEntry[]) {
    entries.value = data;
    loaded.value = true;
    pending.value = false;
  }

  async function load(force = false) {
    if (loaded.value && !force) return;
    pending.value = true;
    try {
      const data = await $fetch<PlanningEntry[]>("/api/planning");
      entries.value = data;
      loaded.value = true;
    } finally {
      pending.value = false;
    }
  }

  function assign(day: string, recipe: PlanningEntry["recipe"]) {
    const entry = entries.value.find((e) => e.day === day);
    if (entry) entry.recipe = recipe;
    // Fire-and-forget — recompute shopping list in background
    $fetch("/api/planning/assign", { method: "POST", body: { day, id: recipe?.id } }).catch(() => {
      // Rollback on error
      if (entry) entry.recipe = null;
    });
  }

  function remove(day: string) {
    const entry = entries.value.find((e) => e.day === day);
    if (!entry) return;
    const prev = entry.recipe;
    entry.recipe = null;
    $fetch("/api/planning/remove", { method: "POST", body: { day } }).catch(() => {
      if (entry) entry.recipe = prev;
    });
  }

  function move(fromDay: string, toDay: string, recipeId: string) {
    const from = entries.value.find((e) => e.day === fromDay);
    const to = entries.value.find((e) => e.day === toDay);
    if (!from || !to) return;
    const recipe = from.recipe;
    from.recipe = null;
    to.recipe = recipe;
    $fetch("/api/planning/move", { method: "POST", body: { fromDay, toDay, recipeId } }).catch(() => {
      if (from) from.recipe = recipe;
      if (to) to.recipe = null;
    });
  }

  function clear() {
    entries.value.forEach((e) => (e.recipe = null));
    $fetch("/api/planning/clear", { method: "POST" }).catch(() => {
      load(true);
    });
  }

  return { entries, loaded, pending, hydrate, load, assign, remove, move, clear };
});
