<template>
  <div class="min-h-screen bg-gradient-to-br from-sage-50/30 via-sage-50/20 to-slate-50 pb-20">
    <div class="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div class="mb-6 flex items-center justify-between">
        <NuxtLink to="/recipes" class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-sage-50 hover:text-sage-300 transition">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </NuxtLink>
      </div>

      <h1 class="text-2xl font-bold text-slate-900 mb-6">Nouvelle recette</h1>

      <!-- Limite atteinte -->
      <div v-if="limitReached" class="rounded-xl border p-5 text-center" style="background-color: #E0F7FA; border-color: #B2EBF2;">
        <span class="text-2xl block mb-2">🎉</span>
        <h3 class="text-lg font-semibold text-slate-800 mb-2">Limite de 20 recettes atteinte</h3>
        <p class="text-sm text-slate-700 mb-4">Passez à Premium pour créer des recettes illimitées.</p>
        <NuxtLink to="/premium" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style="background-color: #00ACC1;">
          Découvrir le Premium
        </NuxtLink>
      </div>

      <form v-else @submit.prevent="submit" class="space-y-6">
        <!-- Statut -->
        <div v-if="statusMsg" class="rounded-xl border-2 p-4 text-sm font-medium text-center" :class="statusClass">
          {{ statusMsg }}
        </div>

        <!-- Infos générales -->
        <div class="grid gap-6 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="block text-sm font-bold text-slate-700 mb-2">Titre de la recette</label>
            <input v-model="form.title" type="text" placeholder="Ex: Lasagnes à la bolognaise" required
              class="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all" />
          </div>

          <div class="sm:col-span-2">
            <label class="block text-sm font-bold text-slate-700 mb-2">Image (URL)</label>
            <input v-model="form.image" type="url" placeholder="https://exemple.com/image.jpg"
              class="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all" />
          </div>

          <div class="sm:col-span-2 flex flex-row items-end justify-between gap-4">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Type de plat</label>
              <div class="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit">
                <button type="button" @click="form.salt = true"
                  class="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg transition-all"
                  :class="form.salt ? 'bg-white font-bold text-sage-300 shadow-sm' : 'font-medium text-slate-500'">
                  🧂 Salé
                </button>
                <button type="button" @click="form.salt = false"
                  class="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg transition-all"
                  :class="!form.salt ? 'bg-white font-bold text-sage-600 shadow-sm' : 'font-medium text-slate-500'">
                  🍰 Sucré
                </button>
              </div>
            </div>

            <div v-if="isAdmin" class="flex items-center pb-0">
              <div class="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button type="button" @click="form.maman = !form.maman"
                  class="px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg transition-all flex items-center gap-1"
                  :class="form.maman ? 'bg-white font-bold text-pink-600 shadow-sm' : 'font-medium text-slate-500'">
                  <svg class="w-4 h-4 text-pink-400" viewBox="0 0 512 512" fill="currentColor"><path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5.3-86.2 32.6-96.8 70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7.9 78.6 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2-25.8 0-46.7-20.9-46.7-46.7v-1.6c0-10.4 1.6-20.8 5.2-30.5zM324.5 92.9c14.3-42.9 51.7-73.1 84.4-58.5s46.9 53.9 32.6 96.8-51.7 73.1-84.4 58.5-46.9-53.9-32.6-96.8zM400.1 165.3c24.5 14 29.1 51.7 10.2 84.1s-54 48.2-78.5 33.3-29.1-51.7-10.2-84.1 54-48.2 78.5-33.3z"/></svg>
                  Ninette
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Ingrédients -->
        <div class="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100">
          <div class="flex items-center justify-between mb-4">
            <label class="text-sm font-bold text-slate-900">🧂 Ingrédients</label>
            <button type="button" @click="addIngredient" class="text-xs font-bold text-sage-300 hover:bg-sage-50 px-3 py-1.5 rounded-lg transition-colors">
              + Ajouter
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="(ing, i) in form.ingredients" :key="i" class="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-start">
              <input v-model="ing.item" type="text" placeholder="Ingrédient (ex: Farine)" required
                class="w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
              <input v-model.number="ing.quantity" type="number" step="any" placeholder="Qté"
                class="w-20 rounded-lg border-slate-200 bg-white px-3 py-2 text-sm" />
              <input v-model="ing.unit" type="text" placeholder="Unité"
                class="w-20 rounded-lg border-slate-200 bg-white px-3 py-2 text-sm" />
              <button type="button" @click="form.ingredients.splice(i, 1)" class="p-2 text-slate-400 hover:text-rose-500">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m1 0H8m8 0l-1-3H9L8 7" /></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Étapes -->
        <div class="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100">
          <div class="flex items-center justify-between mb-4">
            <label class="text-sm font-bold text-slate-900">🍳 Étapes de préparation</label>
            <button type="button" @click="addStep" class="text-xs font-bold text-sage-300 hover:bg-sage-50 px-3 py-1.5 rounded-lg transition-colors">
              + Ajouter
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="(step, i) in form.steps" :key="i" class="flex items-start gap-3 bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
              <div class="flex flex-col items-center gap-1 mt-1">
                <button type="button" @click="moveStep(i, -1)" :disabled="i === 0" class="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                </button>
                <button type="button" @click="moveStep(i, 1)" :disabled="i === form.steps.length - 1" class="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
              <textarea v-model="form.steps[i]" placeholder="Décrivez l'étape..." rows="3"
                class="flex-1 rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-y min-h-[80px]" />
              <button type="button" @click="form.steps.splice(i, 1)" class="mt-2 text-slate-400 hover:text-rose-500">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <p class="text-xs text-slate-400 mt-2 text-center">Utilisez les flèches pour réordonner les étapes</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <NuxtLink to="/recipes" class="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
            Annuler
          </NuxtLink>
          <button type="submit" :disabled="submitting"
            class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sage-300 to-sage-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:from-sage-300 hover:to-sage-600 hover:scale-105 transition-all disabled:opacity-60">
            {{ submitting ? 'Enregistrement...' : 'Enregistrer la recette' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default", middleware: "auth" });

const { isAdmin, isFree } = useAuth();

// Vérifier la limite
const { data: recipes } = await useFetch<any[]>("/api/recipes");
const limitReached = computed(() => isFree.value && (recipes.value?.length || 0) >= 20);

const form = reactive({
  title: "",
  image: "",
  salt: true,
  maman: false,
  ingredients: [{ item: "", quantity: "", unit: "" }] as { item: string; quantity: any; unit: string }[],
  steps: [""] as string[],
});

const statusMsg = ref("");
const statusClass = ref("");
const submitting = ref(false);

const addIngredient = () => form.ingredients.push({ item: "", quantity: "", unit: "" });
const addStep = () => form.steps.push("");

const moveStep = (i: number, dir: number) => {
  const j = i + dir;
  if (j < 0 || j >= form.steps.length) return;
  const tmp = form.steps[i];
  form.steps[i] = form.steps[j];
  form.steps[j] = tmp;
};

const submit = async () => {
  submitting.value = true;
  statusMsg.value = "Enregistrement…";
  statusClass.value = "border-blue-200 bg-blue-50 text-blue-700";

  const ingredients = form.ingredients
    .map((i) => {
      const item = i.item.trim();
      if (!item) return null;
      const qty = i.quantity === "" || i.quantity === null ? undefined : Number(i.quantity);
      return { item, ...(Number.isFinite(qty) ? { quantity: qty } : {}), ...(i.unit ? { unit: i.unit } : {}) };
    })
    .filter(Boolean);

  const steps = form.steps.map((s) => s.trim()).filter(Boolean);

  try {
    const result = await $fetch<{ id: string }>("/api/recipes", {
      method: "POST",
      body: { title: form.title, image: form.image, salt: form.salt, maman: form.maman, ingredients, steps },
    });
    statusMsg.value = "Recette ajoutée avec succès !";
    statusClass.value = "border-green-200 bg-green-50 text-green-700";
    setTimeout(() => navigateTo(`/recipes/${result.id}`), 800);
  } catch (err: any) {
    statusMsg.value = err.data?.statusMessage || "Erreur lors de l'ajout";
    statusClass.value = "border-red-300 bg-red-50 text-red-700";
  } finally {
    submitting.value = false;
  }
};
</script>
