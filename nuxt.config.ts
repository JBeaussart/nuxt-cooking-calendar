// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },

  app: {
    head: {
      title: "Cooking Calendar",
      meta: [],
      link: [
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/icon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/icon-16x16.png" },
        { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192x192.png" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/icon-180x180.png" },
        { rel: "manifest", href: "/manifest.json" },
      ],
    },
  },

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

  // /, /login et /signup sont statiques (aucune donnée par requête) : on les
  // prérend au build pour qu'ils soient servis par le CDN Netlify sans passer
  // par la fonction serverless (mesuré : ~300-700ms de moins par visite).
  routeRules: {
    "/": { prerender: true },
    "/login": { prerender: true },
    "/signup": { prerender: true },
  },

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
