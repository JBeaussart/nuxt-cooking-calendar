<template>
  <div class="min-h-screen pb-20">
    <div class="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div class="mb-6 flex items-center justify-between">
        <NuxtLink to="/recipes" class="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-stone-800 px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 shadow-sm ring-1 ring-stone-200 dark:ring-stone-700 hover:bg-saffron-50 dark:hover:bg-saffron-900/30 hover:text-saffron-300 transition">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </NuxtLink>
      </div>

      <PageHeader
        align="left"
        title="Nouvelle recette"
      />

      <div v-if="countPending" class="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-5 text-center text-sm text-stone-500 dark:text-stone-400">
        Chargement...
      </div>

      <!-- Limite atteinte -->
      <div v-else-if="limitReached" class="rounded-xl border p-5 text-center" style="background-color: #FDF3E1; border-color: #F1CD8C;">
        <span class="text-2xl block mb-2">🎉</span>
        <h3 class="text-lg font-semibold text-stone-800 mb-2">Limite de 20 recettes atteinte</h3>
        <p class="text-sm text-stone-700 mb-4">Passez à Premium pour créer des recettes illimitées.</p>
        <NuxtLink to="/premium" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style="background-color: #D98E2B;">
          Découvrir le Premium
        </NuxtLink>
      </div>

      <template v-else>
        <!-- Statut -->
        <div v-if="statusMsg" class="mb-6 rounded-xl border-2 p-4 text-sm font-medium text-center" :class="statusClass">
          {{ statusMsg }}
        </div>

        <!-- Mode formulaire / import JSON -->
        <div class="mb-6 flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 w-fit">
          <button type="button" @click="mode = 'form'"
            class="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg transition-all"
            :class="mode === 'form' ? 'bg-white dark:bg-stone-700 font-bold text-saffron-300 shadow-sm' : 'font-medium text-stone-500 dark:text-stone-400'">
            Formulaire
          </button>
          <button type="button" @click="mode = 'json'"
            class="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg transition-all"
            :class="mode === 'json' ? 'bg-white dark:bg-stone-700 font-bold text-saffron-300 shadow-sm' : 'font-medium text-stone-500 dark:text-stone-400'">
            Importer JSON
          </button>
        </div>

        <!-- Import JSON -->
        <div v-if="mode === 'json'" class="rounded-2xl bg-stone-50 dark:bg-stone-800/60 p-5 ring-1 ring-stone-100 dark:ring-stone-700">
          <label class="block text-sm font-bold text-stone-900 dark:text-stone-100 mb-2">Coller le JSON de la recette</label>
          <textarea v-model="jsonInput" rows="14" placeholder="Collez ici le JSON de la recette..."
            class="w-full rounded-lg border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 dark:text-stone-100 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:bg-white dark:focus:bg-stone-900 focus:ring-2 focus:ring-blue-200" />
          <p v-if="jsonError" class="mt-2 text-sm font-medium text-rose-600 dark:text-rose-400">{{ jsonError }}</p>
          <details class="mt-3 text-xs text-stone-500 dark:text-stone-400">
            <summary class="cursor-pointer font-medium text-stone-600 dark:text-stone-300">Format attendu</summary>
            <pre class="mt-2 overflow-x-auto whitespace-pre rounded-lg bg-white dark:bg-stone-900 dark:text-stone-300 p-3 ring-1 ring-stone-100 dark:ring-stone-700">{{ jsonExample }}</pre>
          </details>
          <div class="mt-4 flex justify-end">
            <button type="button" @click="loadJson"
              class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-saffron-300 to-saffron-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:from-saffron-300 hover:to-saffron-600 hover:scale-105 transition-all">
              Charger dans le formulaire
            </button>
          </div>
        </div>

      <form v-else @submit.prevent="submit" class="space-y-6">
        <!-- Infos générales -->
        <div class="grid gap-6 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Titre de la recette</label>
            <input v-model="form.title" type="text" placeholder="Ex: Lasagnes à la bolognaise" required
              class="w-full rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 dark:text-stone-100 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white dark:focus:bg-stone-900 focus:ring-2 focus:ring-blue-200 transition-all" />
          </div>

          <div class="sm:col-span-2">
            <label class="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Image (URL)</label>
            <input v-model="form.image" type="url" placeholder="https://exemple.com/image.jpg"
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
                <button type="button" @click="form.salt = true"
                  class="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg transition-all"
                  :class="form.salt ? 'bg-white dark:bg-stone-700 font-bold text-saffron-300 shadow-sm' : 'font-medium text-stone-500 dark:text-stone-400'">
                  🧂 Salé
                </button>
                <button type="button" @click="form.salt = false"
                  class="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg transition-all"
                  :class="!form.salt ? 'bg-white dark:bg-stone-700 font-bold text-saffron-600 shadow-sm' : 'font-medium text-stone-500 dark:text-stone-400'">
                  🍰 Sucré
                </button>
              </div>
            </div>

            <div v-if="isAdmin" class="flex items-center pb-0">
              <div class="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                <button type="button" @click="form.maman = !form.maman"
                  class="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg transition-all flex items-center gap-1"
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
            <button type="button" @click="addIngredient" class="text-xs font-bold text-saffron-300 hover:bg-saffron-50 dark:hover:bg-saffron-900/30 px-3 py-1.5 rounded-lg transition-colors">
              + Ajouter
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="(ing, i) in form.ingredients" :key="i" class="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-start">
              <input v-model="ing.item" type="text" placeholder="Ingrédient (ex: Farine)" required
                class="w-full rounded-lg border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 dark:text-stone-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
              <input v-model.number="ing.quantity" type="number" step="any" placeholder="Qté"
                class="w-20 rounded-lg border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 dark:text-stone-100 px-3 py-2 text-sm" />
              <select v-model="ing.unit" class="w-24 rounded-lg border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 dark:text-stone-100 px-2 py-2 text-sm">
                <option value="">Unité</option>
                <option v-for="unit in ingredientUnits" :key="unit" :value="unit">
                  {{ unit }}
                </option>
              </select>
              <button type="button" @click="form.ingredients.splice(i, 1)" class="p-2 text-stone-400 dark:text-stone-500 hover:text-rose-500">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m1 0H8m8 0l-1-3H9L8 7" /></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Étapes -->
        <div class="rounded-2xl bg-stone-50 dark:bg-stone-800/60 p-5 ring-1 ring-stone-100 dark:ring-stone-700">
          <div class="flex items-center justify-between mb-4">
            <label class="text-sm font-bold text-stone-900 dark:text-stone-100">🍳 Étapes de préparation</label>
            <button type="button" @click="addStep" class="text-xs font-bold text-saffron-300 hover:bg-saffron-50 dark:hover:bg-saffron-900/30 px-3 py-1.5 rounded-lg transition-colors">
              + Ajouter
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="(step, i) in form.steps" :key="i" class="flex items-start gap-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-3 shadow-sm">
              <div class="flex flex-col items-center gap-1 mt-1">
                <button type="button" @click="moveStep(i, -1)" :disabled="i === 0" class="p-1 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 disabled:opacity-30">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                </button>
                <button type="button" @click="moveStep(i, 1)" :disabled="i === form.steps.length - 1" class="p-1 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 disabled:opacity-30">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
              <textarea v-model="form.steps[i]" placeholder="Décrivez l'étape..." rows="3"
                class="flex-1 rounded-lg border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 dark:text-stone-100 px-3 py-2 text-sm focus:bg-white dark:focus:bg-stone-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-y min-h-[80px]" />
              <button type="button" @click="form.steps.splice(i, 1)" class="mt-2 text-stone-400 dark:text-stone-500 hover:text-rose-500">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <p class="text-xs text-stone-400 dark:text-stone-500 mt-2 text-center">Utilisez les flèches pour réordonner les étapes</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-700">
          <NuxtLink to="/recipes" class="rounded-xl px-5 py-2.5 text-sm font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
            Annuler
          </NuxtLink>
          <button type="submit" :disabled="submitting"
            class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-saffron-300 to-saffron-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:from-saffron-300 hover:to-saffron-600 hover:scale-105 transition-all disabled:opacity-60">
            {{ submitting ? 'Enregistrement...' : 'Enregistrer la recette' }}
          </button>
        </div>
      </form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default", middleware: "auth" });

const { isAdmin, isFree } = useAuth();

// Vérifier la limite (count seulement, sans charger toutes les recettes)
const { data: recipesCount, pending: countPending } = useFetch<{ count: number }>("/api/recipes/count");
const limitReached = computed(() => isFree.value && (recipesCount.value?.count || 0) >= 20);

const form = reactive({
  title: "",
  image: "",
  salt: true,
  maman: false,
  servings: 4,
  prepMinutes: "" as number | "",
  cookMinutes: "" as number | "",
  ingredients: [{ item: "", quantity: "", unit: "" }] as { item: string; quantity: any; unit: string }[],
  steps: [""] as string[],
});

const statusMsg = ref("");
const statusClass = ref("");
const submitting = ref(false);

const mode = ref<"form" | "json">("form");
const jsonInput = ref("");
const jsonError = ref("");
const jsonExample = JSON.stringify(
  {
    title: "Lasagnes à la bolognaise",
    image: "https://exemple.com/image.jpg",
    salt: true,
    servings: 4,
    ingredients: [
      { item: "Farine", quantity: 200, unit: "g" },
      { item: "Sel" },
    ],
    steps: ["Préchauffer le four à 200°C", "Mélanger les ingrédients..."],
  },
  null,
  2
);

const loadJson = () => {
  jsonError.value = "";
  let parsed: any;
  try {
    parsed = JSON.parse(jsonInput.value);
  } catch {
    jsonError.value = "JSON invalide : vérifiez la syntaxe.";
    return;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    jsonError.value = "Le JSON doit être un objet.";
    return;
  }

  const title = String(parsed.title || "").trim();
  if (!title) {
    jsonError.value = 'Le champ "title" est requis.';
    return;
  }

  const ingredients = (Array.isArray(parsed.ingredients) ? parsed.ingredients : [])
    .map((i: any) => {
      if (typeof i === "string") {
        const item = i.trim();
        return item ? { item, quantity: "", unit: "" } : null;
      }
      const item = String(i?.item || "").trim();
      if (!item) return null;
      return {
        item,
        quantity: i?.quantity === undefined || i?.quantity === null ? "" : i.quantity,
        unit: String(i?.unit || ""),
      };
    })
    .filter(Boolean);
  if (!ingredients.length) {
    jsonError.value = "Au moins un ingrédient est requis.";
    return;
  }

  const steps = (Array.isArray(parsed.steps) ? parsed.steps : []).map((s: any) => String(s || ""));

  const parsedServings = Math.round(Number(parsed.servings));
  form.title = title;
  form.image = String(parsed.image || "");
  form.salt = parsed.salt !== false;
  form.maman = isAdmin.value ? !!parsed.maman : false;
  form.servings = Number.isFinite(parsedServings) && parsedServings >= 1 ? parsedServings : 4;
  form.ingredients = ingredients;
  form.steps = steps.length ? steps : [""];

  mode.value = "form";
  statusMsg.value = "JSON chargé : vérifiez la recette puis enregistrez.";
  statusClass.value = "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300";
};
const ingredientUnits = [
  "g",
  "kg",
  "ml",
  "cl",
  "l",
  "c. a cafe",
  "c. a soupe",
  "pincée",
  "tranche",
  "botte",
  "sachet",
  "verre",
  "zeste",
  "boîte",
  "gousse",
  "feuille",
  "poignée",
];

const { addIngredient, addStep, moveStep, cleanIngredients, cleanSteps } = useRecipeFormHelpers(form);

const submit = async () => {
  submitting.value = true;
  statusMsg.value = "Enregistrement…";
  statusClass.value = "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300";

  const ingredients = cleanIngredients();
  const steps = cleanSteps();

  try {
    const result = await $fetch<{ id: string }>("/api/recipes", {
      method: "POST",
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
    statusMsg.value = "Recette ajoutée avec succès !";
    statusClass.value = "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300";
    setTimeout(() => navigateTo(`/recipes/${result.id}`), 800);
  } catch (err: any) {
    statusMsg.value = err.data?.statusMessage || "Erreur lors de l'ajout";
    statusClass.value = "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300";
  } finally {
    submitting.value = false;
  }
};
</script>
