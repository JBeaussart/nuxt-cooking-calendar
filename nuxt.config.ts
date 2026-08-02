// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },

  app: {
    head: {
      title: "Cooking Calendar",
      meta: [],
      link: [
        // Les navigateurs modernes preferent le SVG (net a toutes les tailles) ;
        // les PNG restent le repli pour ceux qui ne le supportent pas.
        { rel: "icon", type: "image/svg+xml", href: "/icon.svg" },
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

  // Pas de prerender sur /, /login, /signup : le layout affiche une barre de
  // navigation qui depend de l'utilisateur connecte. Un HTML fige au build
  // contient forcement la nav "deconnecte" ; quand un utilisateur connecte
  // hydrate par-dessus, Vue met a jour les libelles mais PAS les <svg>
  // (contenu statique ignore par l'hydratation), ce qui donnait des icones
  // melangees dans le PWA iOS (icone Accueil sous le libelle "Planning").
  // Verifie : ni un `key` sur les branches v-if/v-else ni un `:d` dynamique ne
  // reparent ce mismatch. Le rendu SSR par requete, lui, connait le cookie de
  // session et produit la bonne nav des le HTML.
  // Le gros du gain de perf vient de toute facon de la region fra1 (vercel.json),
  // colocalisee avec Supabase, pas du prerender.

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
