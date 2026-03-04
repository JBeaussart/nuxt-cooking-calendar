// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  modules: ["@nuxtjs/supabase", "@nuxtjs/tailwindcss", "@pinia/nuxt"],

  // @nuxtjs/supabase lit automatiquement SUPABASE_URL et SUPABASE_KEY depuis .env
  supabase: {
    redirect: false, // On gère la redirection manuellement via middleware
  },

  runtimeConfig: {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    public: {
      supabaseUrl: process.env.SUPABASE_URL || "",
      supabaseAnonKey: process.env.SUPABASE_KEY || "",
    },
  },

  css: ["~/assets/css/main.css"],

  ssr: true,
});
