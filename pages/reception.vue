<template>
  <div class="min-h-screen">
    <div class="mx-auto max-w-3xl px-4 py-12">
      <PageHeader
        title="Menu de réception"
        description="Composez votre menu parfait"
      />

      <div v-if="pending" class="text-center py-20 text-slate-400">Chargement...</div>
      <div v-else class="grid grid-cols-1 gap-6 pb-16 sm:pb-0">
        <section
          v-for="slot in slots"
          :key="slot.key"
          class="group relative rounded-3xl bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-xl overflow-hidden"
        >
          <template v-if="receptionData && receptionData[slot.key]">
            <div class="relative h-28 overflow-hidden rounded-t-3xl">
              <img
                :src="receptionData[slot.key]?.image || '/images/default-recipe.jpg'"
                :alt="receptionData[slot.key]?.title"
                loading="lazy"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                @error="(e: Event) => (e.target as HTMLImageElement).src = '/images/default-recipe.jpg'"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div class="absolute top-2 left-2">
                <div class="rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 shadow-lg">
                  <span class="text-xs font-bold text-slate-900">{{ slot.label }}</span>
                </div>
              </div>
              <div class="absolute bottom-0 left-0 right-0 p-3">
                <NuxtLink :to="`/recipes/${receptionData[slot.key]?.id}`"
                  class="block text-base font-bold text-white drop-shadow-lg hover:text-sage-200 transition line-clamp-2">
                  {{ receptionData[slot.key]?.title }}
                </NuxtLink>
              </div>
            </div>
            <div class="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-3 py-2">
              <NuxtLink :to="`/recipes/${receptionData[slot.key]?.id}`"
                class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sage-300 transition">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Voir
              </NuxtLink>
              <div class="flex items-center gap-1">
                <NuxtLink :to="`/recipes?slot=${slot.key}`"
                  class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/50 transition">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </NuxtLink>
                <button @click="clearSlot(slot.key)"
                  class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <NuxtLink :to="`/recipes?slot=${slot.key}`" class="block">
              <div class="relative h-28 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 transition hover:from-slate-200 hover:to-slate-300">
                <div class="absolute top-2 left-2">
                  <div class="rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 shadow-lg">
                    <span class="text-xs font-bold text-slate-900">{{ slot.label }}</span>
                  </div>
                </div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-sage-300 to-sage-500 text-white shadow-lg shadow-sage-300/30 hover:scale-110 transition-all">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </template>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "default", middleware: "auth" });

const { isPremium } = useAuth();
if (!isPremium.value) await navigateTo("/planning");

const slots = [
  { key: "aperitif", label: "Apéritif" },
  { key: "entree", label: "Entrée" },
  { key: "plat", label: "Plat" },
  { key: "dessert", label: "Dessert" },
];

const { data: receptionData, pending, refresh } = useFetch<Record<string, any>>("/api/reception");

const clearSlot = async (slot: string) => {
  await $fetch("/api/reception/assign", { method: "POST", body: { slot, id: null } });
  await refresh();
};
</script>
