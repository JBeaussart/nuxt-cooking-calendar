export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const { error } = await supabase
    .from("planning")
    .update({ recipe_id: null })
    .eq("user_id", user.id);

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });
  return { ok: true };
});
