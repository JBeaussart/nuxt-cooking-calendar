<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="bg-white dark:bg-stone-800 rounded-2xl shadow-xl p-8">
        <PageHeader
          no-margin
          class="mb-8"
          title="Connexion"
          description="Connectez-vous à votre compte"
        />

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Email</label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 rounded-lg focus:ring-2 focus:ring-saffron-300 focus:border-transparent outline-none transition"
              placeholder="votre@email.com"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 rounded-lg focus:ring-2 focus:ring-saffron-300 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <div v-if="error" class="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-saffron-300 to-saffron-500 text-white py-3 rounded-lg font-semibold hover:from-saffron-300 hover:to-saffron-600 transition shadow-lg hover:shadow-xl disabled:opacity-60"
          >
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-stone-600 dark:text-stone-400">
            Pas encore de compte ?
            <NuxtLink to="/signup" class="text-saffron-600 hover:text-saffron-700 dark:text-saffron-400 dark:hover:text-saffron-300 font-medium ml-1">
              Créer un compte
            </NuxtLink>
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
const error = ref("");
const loading = ref(false);
const { fetchProfile } = useAuth();

const supabase = useSupabaseClient();

const handleLogin = async () => {
  error.value = "";
  loading.value = true;
  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (authError) throw new Error(authError.message);
    await fetchProfile();
    // Navigation "dure" pour forcer une requête SSR fraîche avec le cookie
    // de session déjà posé (évite une page vide tant que le cookie n'a pas
    // encore été pris en compte par une navigation SPA classique).
    window.location.href = "/planning";
  } catch (err: any) {
    error.value = err.message || "Erreur de connexion";
  } finally {
    loading.value = false;
  }
};
</script>
