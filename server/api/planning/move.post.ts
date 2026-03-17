export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const { fromDay, toDay, recipeId } = await readBody(event);
  if (!fromDay || !toDay || !recipeId) throw createError({ statusCode: 400, statusMessage: "Paramètres manquants" });

  await Promise.all([
    supabase.from("planning").upsert({ day: toDay, recipe_id: recipeId, user_id: user.id }, { onConflict: "day,user_id" }),
    supabase.from("planning").update({ recipe_id: null }).eq("day", fromDay).eq("user_id", user.id),
  ]);

  // Fire-and-forget — client already updated optimistically
  recomputeShoppingTotals(user.id, supabase).catch(() => {});
  return { ok: true };
});
