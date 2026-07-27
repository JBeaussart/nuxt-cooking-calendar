export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const { fromDay, toDay, recipeId } = await readBody(event);
  if (!fromDay || !toDay || !recipeId) throw createError({ statusCode: 400, statusMessage: "Paramètres manquants" });

  await Promise.all([
    supabase.from("planning").upsert({ day: toDay, recipe_id: recipeId, user_id: user.id }, { onConflict: "day,user_id" }),
    supabase.from("planning").update({ recipe_id: null }).eq("day", fromDay).eq("user_id", user.id),
  ]);

  // Doit être attendu : sur Netlify Functions, l'exécution s'arrête dès la
  // réponse envoyée, donc un vrai "fire-and-forget" ne s'exécuterait jamais.
  // Le client a déjà été mis à jour de façon optimiste, on ignore juste les erreurs.
  await recomputeShoppingTotals(user.id, supabase).catch(() => {});
  return { ok: true };
});
