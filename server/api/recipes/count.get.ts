export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const { count } = await supabase
    .from("recipes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return { count: count ?? 0 };
});
