import { defineStore } from "pinia";

interface PlanningRecipe {
  id: string;
  title: string;
  image?: string;
}

interface PlanningEntry {
  id: string;
  date: string;
  recipe: PlanningRecipe;
}

function enumerateDates(start: string, end: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  while (cursor <= endDate) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const d = String(cursor.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export const usePlanningStore = defineStore("planning", () => {
  const entriesByDate = ref<Record<string, PlanningEntry[]>>({});
  const loadedRanges = ref<Set<string>>(new Set());
  const pending = ref(false);

  async function loadWeek(start: string, end: string, force = false) {
    const key = `${start}_${end}`;
    if (loadedRanges.value.has(key) && !force) return;
    pending.value = true;
    try {
      const data = await $fetch<PlanningEntry[]>("/api/planning", { query: { start, end } });
      for (const d of enumerateDates(start, end)) entriesByDate.value[d] = [];
      for (const e of data) (entriesByDate.value[e.date] ??= []).push(e);
      loadedRanges.value.add(key);
    } finally {
      pending.value = false;
    }
  }

  async function assign(date: string, recipe: PlanningRecipe) {
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const entry: PlanningEntry = { id: tempId, date, recipe };
    (entriesByDate.value[date] ??= []).push(entry);
    try {
      const { id } = await $fetch<{ ok: true; id: string }>("/api/planning/assign", {
        method: "POST",
        body: { date, recipeId: recipe.id },
      });
      entry.id = id;
    } catch (e) {
      entriesByDate.value[date] = (entriesByDate.value[date] || []).filter((x) => x.id !== tempId);
      throw e;
    }
  }

  async function remove(date: string, id: string) {
    const list = entriesByDate.value[date] || [];
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) return;
    const [removed] = list.splice(idx, 1);
    try {
      await $fetch("/api/planning/remove", { method: "POST", body: { id } });
    } catch (e) {
      list.splice(idx, 0, removed);
      throw e;
    }
  }

  async function move(id: string, fromDate: string, toDate: string) {
    const fromList = entriesByDate.value[fromDate] || [];
    const idx = fromList.findIndex((e) => e.id === id);
    if (idx === -1) return;
    const [entry] = fromList.splice(idx, 1);
    entry.date = toDate;
    (entriesByDate.value[toDate] ??= []).push(entry);
    try {
      await $fetch("/api/planning/move", { method: "POST", body: { id, date: toDate } });
    } catch (e) {
      entriesByDate.value[toDate] = (entriesByDate.value[toDate] || []).filter((x) => x.id !== id);
      entry.date = fromDate;
      fromList.splice(idx, 0, entry);
      throw e;
    }
  }

  async function clearRange(start: string, end: string) {
    const backup = JSON.parse(JSON.stringify(entriesByDate.value));
    for (const d of enumerateDates(start, end)) entriesByDate.value[d] = [];
    try {
      await $fetch("/api/planning/clear", { method: "POST", body: { start, end } });
    } catch (e) {
      entriesByDate.value = backup;
      throw e;
    }
  }

  return { entriesByDate, pending, loadedRanges, loadWeek, assign, remove, move, clearRange };
});
