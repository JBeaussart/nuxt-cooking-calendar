<template>
  <div class="min-h-dvh bg-[#f7f4ef] dark:bg-slate-900">
    <AppNavbar />
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { fetchProfile } = useAuth();

// Charger le profil au montage du layout
onMounted(() => {
  fetchProfile();
});
</script>
