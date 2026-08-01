import type { H3Event } from "h3";
import { getHeader } from "h3";
import type { User } from "@supabase/supabase-js";
import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";

const ROLE_HIERARCHY: Record<string, number> = { admin: 3, premium: 2, free: 1 };

// serverSupabaseUser() valide le token via un aller-retour réseau vers
// l'API Auth de Supabase à chaque requête (méthode sécurisée, vérifie la
// révocation). On met en cache le résultat quelques secondes par cookie,
// pour ne pas repayer cet aller-retour sur des navigations rapprochées
// (ex: planning → détail recette → détail recette suivante) tant que
// l'instance serverless reste chaude. Fenêtre volontairement courte : une
// session déconnectée peut rester acceptée jusqu'à USER_CACHE_TTL_MS après
// la déconnexion.
const USER_CACHE_TTL_MS = 60_000;
const USER_CACHE_MAX_SIZE = 1000;
const userCache = new Map<string, { user: User | null; expiresAt: number }>();

function pruneUserCache(now: number) {
  if (userCache.size < USER_CACHE_MAX_SIZE) return;
  for (const [key, entry] of userCache) {
    if (entry.expiresAt <= now) userCache.delete(key);
  }
}

export function hasRole(userRole: string, required: string): boolean {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[required] || 0);
}

export function isPremiumOrAdmin(userRole: string): boolean {
  return hasRole(userRole, "premium");
}

export function isAdmin(userRole: string): boolean {
  return userRole === "admin";
}

export async function getServerUser(event: H3Event) {
  const authHeader = getHeader(event, "authorization");
  const cacheKey = authHeader || getHeader(event, "cookie") || null;
  const now = Date.now();
  const cached = cacheKey ? userCache.get(cacheKey) : undefined;
  const cacheHit = !!cached && cached.expiresAt > now;

  let user: User | null = cacheHit ? cached!.user : null;

  if (!cacheHit) {
    try {
      user = await serverSupabaseUser(event);
    } catch (e: any) {
      // Catch missing auth session or token expiration gracefully to return 401
      if (cacheKey) {
        pruneUserCache(now);
        userCache.set(cacheKey, { user: null, expiresAt: now + 5_000 });
      }
      return {
        user: null,
        supabase: null,
        getProfile: async () => null,
        getUserRole: async () => "free",
      };
    }
    if (cacheKey && user) {
      pruneUserCache(now);
      userCache.set(cacheKey, { user, expiresAt: now + USER_CACHE_TTL_MS });
    }
  }

  if (!user) {
    return {
      user: null,
      supabase: null,
      getProfile: async () => null,
      getUserRole: async () => "free",
    };
  }

  const supabase = await serverSupabaseClient(event);

  // La plupart des routes n'ont pas besoin du rôle : on ne va le chercher en
  // base que si un appelant le demande (getProfile/getUserRole), pour éviter
  // un aller-retour Supabase inutile sur chaque requête authentifiée.
  let profilePromise: Promise<{ user_role: string; created_at?: string } | null> | null = null;
  const getProfile = () => {
    if (!profilePromise) {
      profilePromise = supabase
        .from("user_profiles")
        .select("user_role, created_at")
        .eq("id", user!.id)
        .single()
        .then(({ data }: any) => data ?? null);
    }
    return profilePromise;
  };
  const getUserRole = async () => (await getProfile())?.user_role || "free";

  return { user, supabase, getProfile, getUserRole };
}
