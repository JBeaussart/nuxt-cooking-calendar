import type { H3Event } from "h3";
import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";

const ROLE_HIERARCHY: Record<string, number> = { admin: 3, premium: 2, free: 1 };

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
  let user = null as Awaited<ReturnType<typeof serverSupabaseUser>> | null;
  try {
    user = await serverSupabaseUser(event);
  } catch (e: any) {
    // Nuxt Supabase server helpers throw when session cookie is missing.
    // We want callers to consistently get a 401 (not a 500) in that case.
    const msg = String(e?.message || "");
    if (msg.includes("Auth session missing")) {
      return {
        user: null,
        supabase: null,
        getProfile: async () => null,
        getUserRole: async () => "free",
      };
    }
    throw e;
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
