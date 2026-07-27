<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
        <PageHeader
          no-margin
          class="mb-8"
          title="Créer un compte"
          description="Rejoignez Cooking Calendar"
        />

        <form @submit.prevent="handleSignup" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-sage-300 focus:border-transparent outline-none transition"
              placeholder="votre@email.com"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-sage-300 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirmer le mot de passe</label>
            <input
              v-model="confirm"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-sage-300 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <div v-if="error" class="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">{{ error }}</div>
          <div v-if="success" class="text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">{{ success }}</div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-sage-300 to-sage-500 text-white py-3 rounded-lg font-semibold hover:from-sage-300 hover:to-sage-600 transition shadow-lg disabled:opacity-60"
          >
            {{ loading ? 'Création...' : 'Créer mon compte' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-slate-600 dark:text-slate-400">
            Déjà un compte ?
            <NuxtLink to="/login" class="text-sage-600 hover:text-sage-700 dark:text-sage-400 dark:hover:text-sage-300 font-medium ml-1">Se connecter</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default" });

const user = useSupabaseUser();
if (user.value) await navigateTo("/planning");

const email = ref("");
const password = ref("");
const confirm = ref("");
const error = ref("");
const success = ref("");
const loading = ref(false);
const supabase = useSupabaseClient();
const { fetchProfile } = useAuth();

const handleSignup = async () => {
  error.value = "";
  if (password.value !== confirm.value) {
    error.value = "Les mots de passe ne correspondent pas";
    return;
  }
  loading.value = true;
  try {
    const { error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });
    if (authError) throw new Error(authError.message);
    await fetchProfile();
    success.value = "Compte créé ! Redirection...";
    // Navigation "dure" pour forcer une requête SSR fraîche avec le cookie
    // de session déjà posé (voir login.vue).
    setTimeout(() => { window.location.href = "/planning"; }, 1000);
  } catch (err: any) {
    error.value = err.message || "Erreur lors de la création du compte";
  } finally {
    loading.value = false;
  }
};
</script>
