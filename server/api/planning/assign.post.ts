export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const { day, id } = await readBody(event);
  if (!day || !id) throw createError({ statusCode: 400, statusMessage: "Paramètres manquants" });

  const { error } = await supabase
    .from("planning")
    .upsert({ day, recipe_id: id, user_id: user.id }, { onConflict: "day,user_id" });

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });
  return { ok: true };
});
