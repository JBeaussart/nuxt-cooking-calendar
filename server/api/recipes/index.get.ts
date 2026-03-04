export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) {
    throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  }

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", user.id)
    .order("title", { ascending: true });

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });
  return data || [];
});
