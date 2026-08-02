# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Cooking Calendar — a Nuxt 3 app for managing recipes, planning meals on a calendar, and generating a
merged shopping list. Backend is Supabase (Postgres + Auth, region `eu-central-1`), deployed to Vercel.

Vercel functions are pinned to region `fra1` in [vercel.json](vercel.json) so they sit next to the
Supabase project — the app was previously on Netlify (us-east-1) and every DB round-trip paid a
transatlantic penalty. Keep those two regions aligned. `/`, `/login` and `/signup` are prerendered
(`routeRules` in [nuxt.config.ts](nuxt.config.ts)) so they are served from the CDN without invoking a
function; don't add per-user data to them without removing the prerender.

There is a single user tier — no roles, no premium/free gating, no per-account limits.

## Commands

```bash
npm run dev       # start dev server (nuxt dev, default port 3000)
npm run build     # production build
npm run preview   # preview a production build locally
npm run generate  # static generation
```

There is no lint script and no test suite configured — verify changes by running `npm run dev` and
exercising the affected page/API route in the browser, and `npx tsc --noEmit` for type errors.

Environment variables (`.env`, see `.env.example`): `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`.

## Architecture

### Auth

- Client auth state comes from `@nuxtjs/supabase` (`useSupabaseUser`/`useSupabaseClient`), wrapped by
  [composables/useAuth.ts](composables/useAuth.ts) (`user` + `logout`).
- [middleware/auth.ts](middleware/auth.ts) is a **global** route middleware; every route is protected
  except `/`, `/login`, `/signup`. It falls back to `supabase.auth.getSession()` when `useSupabaseUser()`
  hasn't hydrated yet on client navigation — don't remove that fallback, it prevents a spurious redirect
  to `/login` on direct navigation.
- Server-side, [server/utils/auth.ts](server/utils/auth.ts)'s `getServerUser(event)` is the entry point for
  every API route: it validates the Supabase session (with a short in-memory cache keyed by the
  `authorization`/`cookie` header to avoid re-validating on rapid navigations — see the comment there for
  the exact TTL tradeoff) and returns `{ user, supabase }`.
- `server/utils/*` files are auto-imported into every API route (Nitro convention) — no explicit import
  needed for `getServerUser`, `recomputeShoppingTotals`, etc. Files under `shared/` are **not**
  auto-imported here; import them explicitly via `~/shared/...` (both server and client do this).

### Recipes & serving-size scaling

Each recipe stores both a mutable `ingredients`/`servings` (current, displayed) and an immutable
`base_ingredients`/`base_servings` (set whenever the recipe is created or edited via the form). The
`+/-` servings stepper ([server/api/recipes/[id]/servings.patch.ts](server/api/recipes/[id]/servings.patch.ts))
always rescales from `base_*`, never from the current rounded values — rescaling from an already-rounded
state would drift the recipe from its true original quantities after repeated +/- clicks.

Ingredient quantity formatting/rounding rules are centralized in
[shared/utils/ingredientQuantity.ts](shared/utils/ingredientQuantity.ts), imported explicitly by both
client and server. Ingredients are classified `continuous` (measured, e.g. g/ml —
kept precise), `shareable` (e.g. garlic cloves — rounded to nearest half for cooking), or `unitary`
(bought whole, e.g. eggs, cans — always rounded up). The *same* quantity is formatted differently for the
recipe page (`formatRecipeQuantity`, nearest half) vs. the shopping list (`getShoppingListQuantity`,
always rounds up so you never under-buy).

### Planning & shopping list

- [stores/planning.ts](stores/planning.ts) (Pinia) holds calendar entries keyed by date and does optimistic
  updates for assign/remove/move/clear against `/api/planning/*`, rolling back on request failure.
- [server/utils/shopping.ts](server/utils/shopping.ts)'s `recomputeShoppingTotals(userId, supabase)` is the
  single source of truth for the merged shopping list: it sums ingredient quantities across all recipes
  planned today-or-later (past meals don't need buying), merges items whose name/unit differ only by French
  plural ("gousse"/"gousses", "haricots rouges"/"haricot rouge"), and preserves each item's checked state
  (including partial `checkedOccurrences`) across recomputation. It's persisted to the `shopping_totals`
  table and only re-written when the computed items actually changed. Any mutation that can affect planned
  recipes (edit a recipe, change servings, planning assign/move/remove) calls this to keep the shopping
  list in sync — check for it when touching those flows.
- The merge key is [shared/utils/ingredientKey.ts](shared/utils/ingredientKey.ts) (`normalizeItemKey` /
  `normalizeUnitKey`), used by **both** the server merge and `pages/shopping-list.vue`'s `totalIdentity`.
  These two sides must produce identical keys or a recipe's ingredient stops finding its merged total and
  its checkbox silently does nothing — that exact drift happened once ("Courgette" vs "Courgettes"), which
  is why there is a single shared implementation. Never re-inline a local copy.
- "Sel"/"poivre" ingredients are excluded from the shopping list.

### Data model (Supabase tables)

`recipes`, `planning_entries`, `shopping_totals`, `shopping_custom`, `user_profiles`. Ownership is
enforced both by Supabase RLS (verified: anonymous reads return empty) and by every API route filtering on
`user_id` — always scope queries with `.eq("user_id", user.id)`.

`user_profiles` is now only an email/created_at record; the app reads nothing from it at runtime.

### Frontend conventions

- Pages under `pages/recipes/` follow Nuxt file-based routing (`[id]/index.vue`, `[id]/edit.vue`, `new.vue`).
- `composables/useImageOptimizer.ts` proxies external recipe images through `wsrv.nl` for resize/WebP/CDN
  caching — local paths (`/...`) are passed through unchanged.
- `composables/useToast.ts` + `components/AppToast.vue` is the app's single toast mechanism.
- Styling is Tailwind (`@nuxtjs/tailwindcss`), dark mode via `media` query, brand color scale is `saffron`
  (see [tailwind.config.ts](tailwind.config.ts)).
- [plugins/00.websocket.global.ts](plugins/00.websocket.global.ts) polyfills `globalThis.WebSocket` from
  the `ws` package for Node < 22 during SSR — needed by the Supabase realtime client. The `00.` prefix
  ensures it runs before other plugins.

### Comments & language

Code comments in this repo are written in French and explain *why*, not *what* (e.g. rounding-direction
rationale, cache TTL tradeoffs, plural-merging behavior) — match that style/language when adding comments
in existing French-commented files.
