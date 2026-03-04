<template>
  <div>
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
