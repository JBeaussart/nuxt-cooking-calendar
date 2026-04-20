<template>
  <div class="min-h-screen">
    <div class="mx-auto max-w-3xl px-4 py-12">
      <PageHeader
        title="Ma liste"
        description="N'oubliez rien pour vos recettes !"
      />

      <div class="mb-8 space-y-6">
        <!-- Formulaire ajout -->
        <form @submit.prevent="addCustomItem" class="grid grid-cols-[minmax(0,1fr)_88px_auto] gap-2 sm:gap-3 items-stretch">
          <div class="relative flex-1">
            <input v-model="newItem" type="text" placeholder="Ajouter un article..." required
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 shadow-sm" />
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
          <input v-model.number="newQty" type="number" step="any" placeholder="Qté"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 shadow-sm" />
          <button
            type="submit"
            :disabled="isAddingCustomItem"
            class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sage-300 to-sage-500 px-4 sm:px-6 py-3 text-sm font-bold text-white shadow-lg hover:from-sage-300 hover:to-sage-600 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all whitespace-nowrap">
            Ajouter
          </button>
        </form>

        <!-- Actions groupées -->
        <div class="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:justify-center sm:items-center sm:gap-3">
          <button @click="checkAll"
            class="inline-flex w-full sm:w-auto justify-center items-center gap-1 sm:gap-2 rounded-xl bg-white px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-sage-50 hover:text-sage-300 transition">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            Tout cocher
          </button>
          <button @click="uncheckAll"
            class="inline-flex w-full sm:w-auto justify-center items-center gap-1 sm:gap-2 rounded-xl bg-white px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-sage-50 hover:text-sage-300 transition">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            Tout décocher
          </button>
          <button
            @click="clearCustomItems"
            :disabled="custom.length === 0"
            class="inline-flex w-full sm:w-auto justify-center items-center gap-1 sm:gap-2 rounded-xl bg-white px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-rose-500 shadow-sm ring-1 ring-rose-200 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 011-1h4a1 1 0 011 1m-6 0h8" /></svg>
            Effacer ajouts
          </button>
        </div>
      </div>

      <!-- Liste -->
      <div class="rounded-3xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 mb-20 sm:mb-0">
        <!-- Skeleton pendant le chargement initial -->
        <template v-if="pending && !hasAnyDisplayItem">
          <ul class="divide-y divide-slate-100 px-4 py-3">
            <li v-for="n in 4" :key="n" class="rounded-xl border border-slate-100 p-4 mb-3 last:mb-0">
              <div class="h-4 w-40 rounded bg-slate-100 animate-pulse mb-4" />
              <div class="space-y-2">
                <div v-for="i in 3" :key="i" class="h-3 rounded bg-slate-100 animate-pulse" :style="`width: ${55 + i * 10}%`" />
              </div>
            </li>
          </ul>
        </template>

        <div v-else-if="hasAnyDisplayItem" class="divide-y divide-slate-100">
          <section v-for="recipe in recipes" :key="`${recipe.day}-${recipe.recipeId}`" class="px-4 py-4">
            <h3 class="text-sm font-semibold text-slate-900 capitalize">
               {{ recipe.title }}
               <span class="text-slate-500 text-xs">({{ recipe.day }})</span>
            </h3>
            <ul class="mt-2 space-y-1.5">
              <li
                v-for="(ingredient, index) in recipe.ingredients"
                :key="`${recipe.day}-${recipe.recipeId}-${ingredient.item}-${ingredient.unit || ''}-${index}`"
                class="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-slate-50 cursor-pointer"
                @click="toggleRecipeIngredient(ingredient)"
              >
                <div
                  class="flex h-5 w-5 flex-none items-center justify-center rounded border-2 transition"
                  :class="isRecipeIngredientChecked(ingredient) ? 'border-sage-300 bg-sage-300' : 'border-slate-300'"
                >
                  <svg v-if="isRecipeIngredientChecked(ingredient)" class="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span
                  class="text-sm transition"
                  :class="isRecipeIngredientChecked(ingredient) ? 'line-through text-slate-400' : 'text-slate-800'"
                >
                  {{ ingredient.item }}
                  <span v-if="ingredient.quantity" class="text-slate-500 ml-1">
                    × {{ ingredient.quantity }} {{ ingredient.unit || "" }}
                  </span>
                </span>
              </li>
            </ul>
          </section>

          <section v-if="custom.length > 0" class="px-4 py-4">
            <h3 class="text-sm font-semibold text-slate-900">Ajouts manuels</h3>
            <ul class="mt-2 space-y-1.5">
              <li
                v-for="item in custom"
                :key="`custom-${item.id}`"
                class="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-slate-50 group"
              >
                <button
                  type="button"
                  class="flex h-5 w-5 flex-none items-center justify-center rounded border-2 transition"
                  :class="item.checked ? 'border-sage-300 bg-sage-300' : 'border-slate-300'"
                  @click="toggleItem(item)"
                >
                  <svg v-if="item.checked" class="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <span class="flex-1 text-sm transition" :class="item.checked ? 'line-through text-slate-400' : 'text-slate-800'">
                  {{ item.item }}
                  <span v-if="item.quantity" class="text-slate-500 ml-1">× {{ item.quantity }} {{ item.unit || "" }}</span>
                </span>
                <button
                  type="button"
                  class="text-slate-400 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
                  @click="deleteCustomItem(item)"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </li>
            </ul>
          </section>
        </div>

        <!-- État vide -->
        <div v-else class="p-12 text-center">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
            <svg class="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-slate-900">Votre liste est vide</h3>
          <p class="mt-1 text-slate-500">Ajoutez des recettes au planning pour les voir apparaître ici.</p>
        </div>
      </div>

      <AppToast :message="toast.message.value" :visible="toast.visible.value" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  ShoppingCustomItem,
  ShoppingDataResponse,
  ShoppingRecipeIngredient,
  ShoppingTotalItem,
} from "~/types/shopping";

definePageMeta({ layout: "default", middleware: "auth" });

const newItem = ref("");
const newQty = ref<number | "">("");
const isAddingCustomItem = ref(false);
const toast = useToast();
const user = useSupabaseUser();
const supabase = useSupabaseClient();
let shoppingRealtimeChannel: ReturnType<typeof supabase.channel> | null = null;
const pendingCustomToggleIds = new Set<string>();

// Pas de await → la page s'affiche immédiatement avec un skeleton
const { data: shoppingData, pending, refresh } = useFetch<ShoppingDataResponse>("/api/shopping/data");

const totals = computed(() => shoppingData.value?.totals || []);
const custom = computed(() => shoppingData.value?.custom || []);
const recipes = computed(() => shoppingData.value?.recipes || []);
const hasAnyDisplayItem = computed(() => recipes.value.length > 0 || custom.value.length > 0);

const sameId = (a: unknown, b: unknown) => String(a) === String(b);

const upsertCustomItem = (incoming: ShoppingCustomItem) => {
  if (!shoppingData.value) return;
  const idx = shoppingData.value.custom.findIndex((c: ShoppingCustomItem) => sameId(c.id, incoming.id));
  if (idx === -1) shoppingData.value.custom.push(incoming);
  else shoppingData.value.custom[idx] = incoming;
};

const removeCustomItemById = (id: unknown) => {
  if (!shoppingData.value) return;
  const idx = shoppingData.value.custom.findIndex((c: ShoppingCustomItem) => sameId(c.id, id));
  if (idx !== -1) shoppingData.value.custom.splice(idx, 1);
};

const totalIdentity = (item: Pick<ShoppingTotalItem, "item" | "unit">) =>
  `${String(item.item || "").trim().toLowerCase()}__${String(item.unit || "").trim().toLowerCase()}`;

const totalsByIdentity = computed(() => {
  const map = new Map<string, ShoppingTotalItem>();
  for (const item of totals.value) map.set(totalIdentity(item), item);
  return map;
});

const isRecipeIngredientChecked = (ingredient: ShoppingRecipeIngredient) =>
  !!totalsByIdentity.value.get(totalIdentity({
    item: ingredient.item,
    unit: ingredient.unit || "",
  }))?.checked;

const addCustomItem = async () => {
  if (!newItem.value.trim() || isAddingCustomItem.value) return;
  isAddingCustomItem.value = true;
  const itemName = newItem.value.trim();
  const qty = newQty.value || 0;
  newItem.value = "";
  newQty.value = "";
  try {
    const { item } = await $fetch<{ ok: boolean; item: ShoppingCustomItem }>("/api/shopping/custom", {
      method: "POST",
      body: { action: "add", item: itemName, quantity: qty },
    });
    // Realtime and HTTP response may arrive in any order: upsert avoids duplicates.
    upsertCustomItem(item);
  } catch { toast.show("Erreur lors de l'ajout"); }
  finally { isAddingCustomItem.value = false; }
};

let saveTimer: ReturnType<typeof setTimeout>;
const saveTotals = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    await $fetch("/api/shopping/save", { method: "POST", body: { items: totals.value } });
  }, 800);
};

const toggleItem = (item: any) => {
  if (!shoppingData.value) return;
  const id = String(item.id || "");
  if (!id || pendingCustomToggleIds.has(id)) return;
  const original = shoppingData.value.custom.find((c: ShoppingCustomItem) => sameId(c.id, id));
  if (!original) return;
  pendingCustomToggleIds.add(id);
  original.checked = !original.checked;
  $fetch("/api/shopping/custom", { method: "POST", body: { action: "toggle", id: original.id, checked: original.checked } })
    .catch(() => { original.checked = !original.checked; })
    .finally(() => { pendingCustomToggleIds.delete(id); });
};

const toggleRecipeIngredient = (ingredient: ShoppingRecipeIngredient) => {
  if (!shoppingData.value) return;
  const identity = totalIdentity({ item: ingredient.item, unit: ingredient.unit || "" });
  const original = shoppingData.value.totals.find((t: ShoppingTotalItem) => totalIdentity(t) === identity);
  if (!original) return;
  original.checked = !original.checked;
  saveTotals();
};

const deleteCustomItem = (item: any) => {
  if (!shoppingData.value) return;
  const i = shoppingData.value.custom.findIndex((c: ShoppingCustomItem) => sameId(c.id, item.id));
  if (i === -1) return;
  const [removed] = shoppingData.value.custom.splice(i, 1);
  $fetch("/api/shopping/custom", { method: "POST", body: { action: "delete", id: removed.id } })
    .catch(() => { if (shoppingData.value) shoppingData.value.custom.splice(i, 0, removed); });
};

const clearCustomItems = () => {
  if (!shoppingData.value || shoppingData.value.custom.length === 0) return;
  const backup = [...shoppingData.value.custom];
  shoppingData.value.custom = [];
  $fetch("/api/shopping/custom", { method: "POST", body: { action: "clear" } })
    .catch(() => {
      if (!shoppingData.value) return;
      shoppingData.value.custom = backup;
      toast.show("Erreur lors de la suppression des ajouts");
    });
};

const checkAll = () => {
  if (!shoppingData.value) return;
  shoppingData.value.totals.forEach((t: ShoppingTotalItem) => (t.checked = true));
  saveTotals();
};

const uncheckAll = () => {
  if (!shoppingData.value) return;
  shoppingData.value.totals.forEach((t: ShoppingTotalItem) => (t.checked = false));
  saveTotals();
};

const teardownShoppingRealtime = () => {
  if (!shoppingRealtimeChannel) return;
  supabase.removeChannel(shoppingRealtimeChannel);
  shoppingRealtimeChannel = null;
};

const setupShoppingRealtime = () => {
  if (!user.value?.id || shoppingRealtimeChannel) return;

  const userId = user.value.id;
  shoppingRealtimeChannel = supabase
    .channel(`shopping-list-${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "shopping_custom", filter: `user_id=eq.${userId}` },
      (payload: any) => {
        if (!shoppingData.value) return;

        const incoming = payload.new || payload.old;
        if (!incoming?.id) {
          refresh();
          return;
        }

        if (payload.eventType === "DELETE") {
          removeCustomItemById(incoming.id);
          return;
        }

        if (payload.eventType === "INSERT") {
          upsertCustomItem(incoming as ShoppingCustomItem);
          return;
        }

        if (payload.eventType === "UPDATE") {
          upsertCustomItem(incoming as ShoppingCustomItem);
          return;
        }

        refresh();
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "shopping_totals", filter: `user_id=eq.${userId}` },
      (payload: any) => {
        if (!shoppingData.value) return;

        if (payload.eventType === "DELETE") {
          shoppingData.value.totals = [];
          return;
        }

        const items = payload.new?.data?.items;
        if (Array.isArray(items)) {
          shoppingData.value.totals = items;
          return;
        }

        refresh();
      },
    )
    .subscribe();
};

watch(
  () => user.value?.id,
  (id) => {
    teardownShoppingRealtime();
    if (id) setupShoppingRealtime();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  teardownShoppingRealtime();
});
</script>

<style scoped>
.list-move {
  transition: transform 0.35s ease;
}
</style>
