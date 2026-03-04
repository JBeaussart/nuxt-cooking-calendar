export default defineEventHandler(async (event) => {
  const { user, supabase, profile } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const [{ count: recipesCount }, { count: planningCount }] = await Promise.all([
    supabase.from("recipes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("planning").select("*", { count: "exact", head: true }).eq("user_id", user.id).not("recipe_id", "is", null),
  ]);

  return {
    recipesCount: recipesCount || 0,
    planningCount: planningCount || 0,
    email: user.email,
    role: profile?.user_role || "free",
    createdAt: profile?.created_at || user.created_at,
  };
});
