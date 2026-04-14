<template>
  <header
    :class="[
      noMargin ? '' : 'mb-6 sm:mb-8',
      align === 'center' ? 'text-center' : 'text-left',
    ]"
  >
    <div
      :class="[
        'flex flex-wrap items-center gap-3',
        align === 'center' ? 'justify-center' : 'justify-start',
      ]"
    >
      <h1 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
        {{ title }}
      </h1>
      <slot name="after-title" />
    </div>
    <slot name="description">
      <p
        v-if="description"
        :class="[
          'mt-1.5 max-w-lg text-xs text-slate-600 sm:text-sm',
          align === 'center' ? 'mx-auto' : '',
        ]"
      >
        {{ description }}
      </p>
    </slot>
    <slot />
  </header>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description?: string;
    align?: "center" | "left";
    /** Désactive la marge basse du bloc titre (ex. espacement géré par le parent) */
    noMargin?: boolean;
  }>(),
  {
    align: "center",
    noMargin: false,
  },
);
</script>
