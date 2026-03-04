export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const { fromDay, toDay, recipeId } = await readBody(event);
  if (!fromDay || !toDay || !recipeId) throw createError({ statusCode: 400, statusMessage: "Paramètres manquants" });

  // Assigner au jour cible
  await supabase
    .from("planning")
    .upsert({ day: toDay, recipe_id: recipeId, user_id: user.id }, { onConflict: "day,user_id" });

  // Retirer du jour source
  await supabase
    .from("planning")
    .update({ recipe_id: null })
    .eq("day", fromDay)
    .eq("user_id", user.id);

  return { ok: true };
});
