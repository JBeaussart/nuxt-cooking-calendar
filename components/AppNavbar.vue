<template>
  <!-- ================= DESKTOP NAV ================= -->
  <nav class="hidden sm:block sticky top-0 z-50 bg-white border-b border-gray-200">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <!-- LEFT NAV -->
      <ul v-if="user" class="flex items-center gap-4">
        <li>
          <NuxtLink
            to="/planning"
            class="text-sm font-medium px-3 py-2 rounded-lg"
            :class="isActive('/planning') ? 'bg-sage-100 text-sage-700' : 'text-gray-700 hover:bg-gray-100'"
          >
            Planning
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/recipes"
            class="text-sm font-medium px-3 py-2 rounded-lg"
            :class="isActive('/recipes') ? 'bg-sage-100 text-sage-700' : 'text-gray-700 hover:bg-gray-100'"
          >
            Recettes
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/shopping-list"
            class="text-sm font-medium px-3 py-2 rounded-lg"
            :class="isActive('/shopping-list') ? 'bg-sage-100 text-sage-700' : 'text-gray-700 hover:bg-gray-100'"
          >
            Courses
          </NuxtLink>
        </li>
        <li v-if="isPremium">
          <NuxtLink
            to="/reception"
            class="text-sm font-medium px-3 py-2 rounded-lg"
            :class="isActive('/reception') ? 'bg-sage-100 text-sage-700' : 'text-gray-700 hover:bg-gray-100'"
          >
            Réception
          </NuxtLink>
        </li>
      </ul>
      <ul v-else class="flex items-center gap-4">
        <li>
          <NuxtLink to="/" class="text-sm font-medium px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
            Accueil
          </NuxtLink>
        </li>
      </ul>

      <!-- RIGHT ACTIONS -->
      <div class="flex items-center gap-3">
        <template v-if="user">
          <NuxtLink
            v-if="isFree"
            to="/premium"
            class="px-4 py-2 rounded-lg text-sm font-medium bg-sage-100 text-sage-700 hover:bg-sage-200 transition"
          >
            Passer à Premium
          </NuxtLink>

          <div class="relative">
            <button
              @click="desktopMenuOpen = !desktopMenuOpen"
              @click.stop
              class="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Mon compte
            </button>
            <div
              v-if="desktopMenuOpen"
              class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
              <div class="px-4 py-3 border-b">
                <div class="text-sm text-gray-600 mb-2">{{ user.email }}</div>
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold"
                    :class="{
                      'bg-purple-100 text-purple-700': userRole === 'admin',
                      'bg-sage-100 text-sage-700': userRole === 'premium',
                      'bg-gray-100 text-gray-700': userRole === 'free',
                    }"
                  >
                    {{ userRole === 'admin' ? 'Admin' : userRole === 'premium' ? 'Premium' : 'Free' }}
                  </span>
                </div>
              </div>
              <NuxtLink to="/account" class="block px-4 py-2 text-sm hover:bg-gray-50" @click="desktopMenuOpen = false">
                Mon profil
              </NuxtLink>
              <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
            Se connecter
          </NuxtLink>
          <NuxtLink to="/signup" class="px-4 py-2 rounded-lg text-sm font-medium bg-sage-600 text-white hover:bg-sage-700 transition">
            Créer un compte
          </NuxtLink>
        </template>
      </div>
    </div>
  </nav>

  <!-- ================= MOBILE BOTTOM NAV ================= -->
  <nav class="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
    <ul v-if="user" class="flex justify-around h-16">
      <li class="flex-1">
        <NuxtLink to="/planning" class="flex flex-col items-center justify-center h-full text-xs" :class="isActive('/planning') ? 'text-sage-600' : 'text-gray-500'">
          <svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 7V3m8 4V3M3 9h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Planning
        </NuxtLink>
      </li>
      <li class="flex-1">
        <NuxtLink to="/recipes" class="flex flex-col items-center justify-center h-full text-xs" :class="isActive('/recipes') ? 'text-sage-600' : 'text-gray-500'">
          <svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          Recettes
        </NuxtLink>
      </li>
      <li class="flex-1">
        <NuxtLink to="/shopping-list" class="flex flex-col items-center justify-center h-full text-xs" :class="isActive('/shopping-list') ? 'text-sage-600' : 'text-gray-500'">
          <svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          Courses
        </NuxtLink>
      </li>
      <li v-if="isPremium" class="flex-1">
        <NuxtLink to="/reception" class="flex flex-col items-center justify-center h-full text-xs" :class="isActive('/reception') ? 'text-sage-600' : 'text-gray-500'">
          <svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Réception
        </NuxtLink>
      </li>
      <li class="flex-1">
        <NuxtLink to="/account" class="flex flex-col items-center justify-center h-full text-xs" :class="isActive('/account') ? 'text-sage-600' : 'text-gray-500'">
          <svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          Compte
        </NuxtLink>
      </li>
    </ul>
    <ul v-else class="flex justify-around h-16">
      <li class="flex-1">
        <NuxtLink to="/" class="flex flex-col items-center justify-center h-full text-xs text-gray-500">
          <svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Accueil
        </NuxtLink>
      </li>
      <li class="flex-1">
        <NuxtLink to="/login" class="flex flex-col items-center justify-center h-full text-xs text-gray-500">
          <svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          Connexion
        </NuxtLink>
      </li>
      <li class="flex-1">
        <NuxtLink to="/signup" class="flex flex-col items-center justify-center h-full text-xs text-gray-500">
          <svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          Inscription
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute();
const { user, userRole, isPremium, isFree, logout } = useAuth();

const desktopMenuOpen = ref(false);

const isActive = (path: string) =>
  route.path === path || route.path.startsWith(path + "/");

const handleLogout = async () => {
  desktopMenuOpen.value = false;
  await logout();
};

// Fermer le menu au clic extérieur
onMounted(() => {
  document.addEventListener("click", () => {
    desktopMenuOpen.value = false;
  });
});
</script>
