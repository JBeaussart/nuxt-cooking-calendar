// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: process.env.NODE_ENV === "development" },

  modules: ["@nuxtjs/supabase", "@nuxtjs/tailwindcss", "@pinia/nuxt"],

  // @nuxtjs/supabase lit automatiquement SUPABASE_URL et SUPABASE_KEY depuis .env
  supabase: {
    redirect: false, // On gère la redirection manuellement via middleware
    url: process.env.PUBLIC_SUPABASE_URL,
    key: process.env.PUBLIC_SUPABASE_ANON_KEY,
  },

  runtimeConfig: {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    public: {
      supabaseUrl: process.env.PUBLIC_SUPABASE_URL || "",
      supabaseAnonKey: process.env.PUBLIC_SUPABASE_ANON_KEY || "",
    },
  },

  css: ["~/assets/css/main.css"],

  ssr: true,

  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },
    minify: true,
  },

  vite: {
    build: {
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            supabase: ["@supabase/supabase-js"],
          },
        },
      },
    },
  },
});
