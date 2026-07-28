export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const { start, end } = getQuery(event);
  if (
    typeof start !== "string" || typeof end !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)
  ) {
    throw createError({ statusCode: 400, statusMessage: "Paramètres start/end invalides" });
  }

  const { data, error } = await supabase
    .from("planning_entries")
    .select("id, date, recipe:recipes(id, title, image)")
    .eq("user_id", user.id)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });
  return data || [];
});
