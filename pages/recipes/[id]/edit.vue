<template>
  <div class="min-h-screen pb-20">
    <div class="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div class="mb-6 flex items-center justify-between">
        <NuxtLink :to="`/recipes/${id}`" class="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-stone-800 px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 shadow-sm ring-1 ring-stone-200 dark:ring-stone-700 hover:bg-saffron-50 dark:hover:bg-saffron-900/30 hover:text-saffron-300 transition">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Retour
        </NuxtLink>
      </div>

      <PageHeader
        align="left"
        title="Modifier la recette"
      />

      <div v-if="pending" class="text-center py-10 text-stone-400 dark:text-stone-500">Chargement...</div>

      <form v-else-if="form.title !== undefined" @submit.prevent="submit" class="space-y-6">
        <div v-if="statusMsg" class="rounded-xl border-2 p-4 text-sm font-medium text-center" :class="statusClass">
          {{ statusMsg }}
        </div>

        <div class="grid gap-6 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Titre de la recette</label>
            <input v-model="form.title" type="text" required
              class="w-full rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 dark:text-stone-100 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white dark:focus:bg-stone-900 focus:ring-2 focus:ring-blue-200 transition-all" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Image (URL)</label>
            <input v-model="form.image" type="url"
              class="w-full rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 dark:text-stone-100 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white dark:focus:bg-stone-900 focus:ring-2 focus:ring-blue-200 transition-all" />
          </div>
          <div>
            <label class="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Nombre de personnes</label>
            <input v-model.number="form.servings" type="number" min="1" max="50" step="1"
              class="w-24 rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 dark:text-stone-100 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white dark:focus:bg-stone-900 focus:ring-2 focus:ring-blue-200 transition-all" />
          </div>

          <div class="flex gap-4">
            <div>
              <label class="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Préparation (min)</label>
              <input v-model.number="form.prepMinutes" type="number" min="0" max="1440" step="1"
                class="w-24 rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 dark:text-stone-100 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white dark:focus:bg-stone-900 focus:ring-2 focus:ring-blue-200 transition-all" />
            </div>
            <div>
              <label class="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Cuisson (min)</label>
              <input v-model.number="form.cookMinutes" type="number" min="0" max="1440" step="1"
                class="w-24 rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 dark:text-stone-100 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white dark:focus:bg-stone-900 focus:ring-2 focus:ring-blue-200 transition-all" />
            </div>
          </div>

          <div class="sm:col-span-2 flex flex-row items-end justify-between gap-4">
            <div>
              <label class="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Type de plat</label>
              <div class="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 w-fit">
                <button type="button" @click="form.salt = true" class="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg transition-all"
                  :class="form.salt ? 'bg-white dark:bg-stone-700 font-bold text-saffron-300 shadow-sm' : 'font-medium text-stone-500 dark:text-stone-400'">🧂 Salé</button>
                <button type="button" @click="form.salt = false" class="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg transition-all"
                  :class="!form.salt ? 'bg-white dark:bg-stone-700 font-bold text-saffron-600 shadow-sm' : 'font-medium text-stone-500 dark:text-stone-400'">🍰 Sucré</button>
              </div>
            </div>
            <div v-if="isAdmin" class="flex items-center">
              <div class="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                <button type="button" @click="form.maman = !form.maman" class="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg transition-all flex items-center gap-1"
                  :class="form.maman ? 'bg-white dark:bg-stone-700 font-bold text-pink-600 shadow-sm' : 'font-medium text-stone-500 dark:text-stone-400'">
                  <svg class="w-4 h-4 text-pink-400" viewBox="0 0 512 512" fill="currentColor"><path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5.3-86.2 32.6-96.8 70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7.9 78.6 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2-25.8 0-46.7-20.9-46.7-46.7v-1.6c0-10.4 1.6-20.8 5.2-30.5zM324.5 92.9c14.3-42.9 51.7-73.1 84.4-58.5s46.9 53.9 32.6 96.8-51.7 73.1-84.4 58.5-46.9-53.9-32.6-96.8zM400.1 165.3c24.5 14 29.1 51.7 10.2 84.1s-54 48.2-78.5 33.3-29.1-51.7-10.2-84.1 54-48.2 78.5-33.3z"/></svg>
                  Ninette
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Ingrédients -->
        <div class="rounded-2xl bg-stone-50 dark:bg-stone-800/60 p-5 ring-1 ring-stone-100 dark:ring-stone-700">
          <div class="flex items-center justify-between mb-4">
            <label class="text-sm font-bold text-stone-900 dark:text-stone-100">🧂 Ingrédients</label>
            <button type="button" @click="addIngredient" class="text-xs font-bold text-saffron-300 hover:bg-saffron-50 dark:hover:bg-saffron-900/30 px-3 py-1.5 rounded-lg">+ Ajouter</button>
          </div>
          <div class="space-y-3">
            <div v-for="(ing, i) in form.ingredients" :key="i" class="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-start">
              <input v-model="ing.item" type="text" placeholder="Ingrédient" required class="w-full rounded-lg border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 dark:text-stone-100 px-3 py-2 text-sm" />
              <input v-model.number="ing.quantity" type="number" step="any" placeholder="Qté" class="w-20 rounded-lg border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 dark:text-stone-100 px-3 py-2 text-sm" />
              <input v-model="ing.unit" type="text" placeholder="Unité" class="w-20 rounded-lg border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 dark:text-stone-100 px-3 py-2 text-sm" />
              <button type="button" @click="form.ingredients.splice(i, 1)" class="p-2 text-stone-400 dark:text-stone-500 hover:text-rose-500">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m1 0H8m8 0l-1-3H9L8 7" /></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Étapes -->
        <div class="rounded-2xl bg-stone-50 dark:bg-stone-800/60 p-5 ring-1 ring-stone-100 dark:ring-stone-700">
          <div class="flex items-center justify-between mb-4">
            <label class="text-sm font-bold text-stone-900 dark:text-stone-100">🍳 Étapes</label>
            <button type="button" @click="addStep" class="text-xs font-bold text-saffron-300 hover:bg-saffron-50 dark:hover:bg-saffron-900/30 px-3 py-1.5 rounded-lg">+ Ajouter</button>
          </div>
          <div class="space-y-3">
            <div v-for="(step, i) in form.steps" :key="i" class="flex items-start gap-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-3 shadow-sm">
              <div class="flex flex-col gap-1 mt-1">
                <button type="button" @click="moveStep(i, -1)" :disabled="i === 0" class="p-1 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 disabled:opacity-30">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                </button>
                <button type="button" @click="moveStep(i, 1)" :disabled="i === form.steps.length - 1" class="p-1 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 disabled:opacity-30">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
              <textarea v-model="form.steps[i]" placeholder="Décrivez l'étape..." rows="3"
                class="flex-1 rounded-lg border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 dark:text-stone-100 px-3 py-2 text-sm focus:bg-white dark:focus:bg-stone-900 resize-y min-h-[80px]" />
              <button type="button" @click="form.steps.splice(i, 1)" class="mt-2 text-stone-400 dark:text-stone-500 hover:text-rose-500">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-700">
          <button type="button" @click="deleteRecipe"
            class="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m1 0H8m8 0l-1-3H9L8 7" /></svg>
            Supprimer
          </button>
          <div class="flex items-center gap-3">
            <NuxtLink :to="`/recipes/${id}`" class="rounded-xl px-5 py-2.5 text-sm font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800">Annuler</NuxtLink>
            <button type="submit" :disabled="submitting"
              class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-saffron-300 to-saffron-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:scale-105 transition-all disabled:opacity-60">
              {{ submitting ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default", middleware: "auth" });

const route = useRoute();
const id = route.params.id as string;
const { isAdmin } = useAuth();

const { data: recipe, pending } = useFetch<any>(`/api/recipes/${id}`);

const form = reactive<{
  title: string;
  image: string;
  salt: boolean;
  maman: boolean;
  servings: number;
  prepMinutes: number | "";
  cookMinutes: number | "";
  ingredients: { item: string; quantity: any; unit: string }[];
  steps: string[];
}>({ title: "", image: "", salt: true, maman: false, servings: 4, prepMinutes: "", cookMinutes: "", ingredients: [], steps: [] });

watch(recipe, (r) => {
  if (!r) return;
  form.title = r.title || "";
  form.image = r.image || "";
  form.salt = r.salt !== false;
  form.maman = !!r.maman;
  form.servings = r.servings || 4;
  form.prepMinutes = r.prep_minutes ?? "";
  form.cookMinutes = r.cook_minutes ?? "";
  form.ingredients = (r.ingredients || []).map((i: any) =>
    typeof i === "string" ? { item: i, quantity: "", unit: "" } : { item: i.item || "", quantity: i.quantity ?? "", unit: i.unit || "" }
  );
  form.steps = [...(r.steps || [])];
}, { immediate: true });

const statusMsg = ref("");
const statusClass = ref("");
const submitting = ref(false);

const { addIngredient, addStep, moveStep, cleanIngredients, cleanSteps } = useRecipeFormHelpers(form);

const submit = async () => {
  submitting.value = true;
  statusMsg.value = "Enregistrement…";
  statusClass.value = "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300";

  const ingredients = cleanIngredients();
  const steps = cleanSteps();

  try {
    await $fetch(`/api/recipes/${id}`, {
      method: "PATCH",
      body: {
        title: form.title,
        image: form.image,
        salt: form.salt,
        maman: form.maman,
        servings: form.servings,
        prepMinutes: form.prepMinutes,
        cookMinutes: form.cookMinutes,
        ingredients,
        steps,
      },
    });
    statusMsg.value = "Recette mise à jour !";
    statusClass.value = "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300";
    setTimeout(() => navigateTo(`/recipes/${id}`), 700);
  } catch (err: any) {
    statusMsg.value = err.data?.statusMessage || "Erreur lors de la mise à jour";
    statusClass.value = "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300";
  } finally {
    submitting.value = false;
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
</script>
