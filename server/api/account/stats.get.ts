export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const [{ count: recipesCount }, { count: planningCount }] = await Promise.all([
    supabase.from("recipes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("planning_entries").select("*", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  return {
    recipesCount: recipesCount || 0,
    planningCount: planningCount || 0,
    email: user.email,
    createdAt: user.created_at,
  };
});
