<template>
  <div class="min-h-screen pb-24">
    <div class="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <PageHeader
        title="Mon compte"
        description="Vos informations et paramètres essentiels"
      />

      <div v-if="pending" class="text-center py-10 text-slate-400">Chargement...</div>

      <template v-else-if="stats">
        <!-- Compte -->
        <section class="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div>
            <p class="text-sm text-gray-500">Email</p>
            <p class="font-medium">{{ stats.email }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-full text-sm font-medium" :class="{
              'bg-purple-100 text-purple-700': stats.role === 'admin',
              'bg-sage-100 text-sage-700': stats.role === 'premium',
              'bg-gray-100 text-gray-700': stats.role === 'free',
            }">
              {{ stats.role === 'admin' ? 'Administrateur' : stats.role === 'premium' ? 'Premium' : 'Gratuit' }}
            </span>
            <span class="text-sm text-gray-500">Membre depuis {{ formatDate(stats.createdAt) }}</span>
          </div>
        </section>

        <!-- Stats -->
        <section class="grid grid-cols-2 gap-4">
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p class="text-2xl font-bold">{{ stats.recipesCount }}</p>
            <p class="text-sm text-gray-600">Recettes créées</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p class="text-2xl font-bold">{{ stats.planningCount }}</p>
            <p class="text-sm text-gray-600">Recettes planifiées</p>
          </div>
        </section>
      </template>

      <!-- Changer mot de passe -->
      <section class="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold mb-4">Changer de mot de passe</h2>
        <form @submit.prevent="changePassword" class="space-y-4">
          <input v-model="pwForm.current" type="password" placeholder="Mot de passe actuel"
            class="w-full px-4 py-3 border rounded-lg" required />
          <input v-model="pwForm.next" type="password" placeholder="Nouveau mot de passe"
            class="w-full px-4 py-3 border rounded-lg" required minlength="6" />
          <input v-model="pwForm.confirm" type="password" placeholder="Confirmer le mot de passe"
            class="w-full px-4 py-3 border rounded-lg" required minlength="6" />
          <div v-if="pwError" class="text-sm text-red-600">{{ pwError }}</div>
          <div v-if="pwSuccess" class="text-sm text-green-600">{{ pwSuccess }}</div>
          <button type="submit" :disabled="pwLoading"
            class="w-full py-3 bg-sage-600 text-white rounded-lg font-medium disabled:opacity-60">
            {{ pwLoading ? 'Modification...' : 'Modifier le mot de passe' }}
          </button>
        </form>
      </section>

      <!-- Actions -->
      <section class="space-y-3">
        <NuxtLink to="/recipes" class="block w-full py-3 bg-sage-100 text-sage-700 rounded-lg text-center">Voir mes recettes</NuxtLink>
        <NuxtLink to="/planning" class="block w-full py-3 border rounded-lg text-center">Voir mon planning</NuxtLink>
        <button @click="handleLogout" class="w-full py-3 border border-red-200 text-red-600 rounded-lg">Déconnexion</button>
      </section>

      <!-- Danger -->
      <section class="border border-red-200 bg-red-50 rounded-2xl p-6">
        <button @click="deleteAccount" :disabled="deleteLoading"
          class="w-full py-3 bg-red-600 text-white rounded-lg font-medium disabled:opacity-60">
          {{ deleteLoading ? 'Suppression...' : 'Supprimer mon compte' }}
        </button>
        <div v-if="deleteError" class="text-sm text-red-600 mt-3">{{ deleteError }}</div>
        <p class="text-sm text-red-700 mt-3">Cette action est définitive et irréversible.</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default", middleware: "auth" });

const { logout } = useAuth();
const supabase = useSupabaseClient();
const { data: stats, pending } = useFetch<{
  recipesCount: number; planningCount: number; email: string; role: string; createdAt: string;
}>("/api/account/stats");

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }) : "—";

const pwForm = reactive({ current: "", next: "", confirm: "" });
const pwError = ref("");
const pwSuccess = ref("");
const pwLoading = ref(false);

const changePassword = async () => {
  pwError.value = "";
  pwSuccess.value = "";
  if (pwForm.next !== pwForm.confirm) { pwError.value = "Les mots de passe ne correspondent pas"; return; }
  if (pwForm.next.length < 6) { pwError.value = "Au moins 6 caractères requis"; return; }
  pwLoading.value = true;
  try {
    const res = await $fetch<{ message: string }>("/api/auth/change-password", {
      method: "POST",
      body: { currentPassword: pwForm.current, newPassword: pwForm.next },
    });
    pwSuccess.value = res.message || "Mot de passe modifié avec succès";
    Object.assign(pwForm, { current: "", next: "", confirm: "" });
    setTimeout(() => { pwSuccess.value = ""; }, 5000);
  } catch (err: any) {
    pwError.value = err.data?.statusMessage || "Erreur lors de la modification";
  } finally { pwLoading.value = false; }
};

const handleLogout = async () => {
  await logout();
};

const deleteError = ref("");
const deleteLoading = ref(false);

const deleteAccount = async () => {
  if (!confirm("⚠️ Cette action est irréversible !\n\nToutes vos données seront supprimées.\n\nÊtes-vous sûr ?")) return;
  const confirm2 = window.prompt("Tapez 'SUPPRIMER' pour confirmer :");
  if (confirm2 !== "SUPPRIMER") { deleteError.value = "Suppression annulée."; return; }
  deleteLoading.value = true;
  deleteError.value = "";
  try {
    await $fetch("/api/account/delete", { method: "DELETE" });
    await supabase.auth.signOut();
    alert("Votre compte a été supprimé.");
    window.location.replace("/");
  } catch (err: any) {
    deleteError.value = err.data?.statusMessage || "Erreur lors de la suppression";
  } finally { deleteLoading.value = false; }
};
</script>
