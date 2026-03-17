export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) {
    throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  }

  const { data, error } = await supabase
    .from("recipes")
    .select("id, ingredients")
    .eq("user_id", user.id);

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });
  return data || [];
});
