export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const { date, recipeId } = await readBody(event);
  if (!date || !recipeId) throw createError({ statusCode: 400, statusMessage: "Paramètres manquants" });

  // Insert (pas upsert) : plusieurs recettes par jour sont autorisées.
  const { data, error } = await supabase
    .from("planning_entries")
    .insert({ date, recipe_id: recipeId, user_id: user.id })
    .select("id")
    .single();

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  // Doit être attendu : sur Netlify Functions, l'exécution s'arrête dès la
  // réponse envoyée, donc un vrai "fire-and-forget" ne s'exécuterait jamais.
  await recomputeShoppingTotals(user.id, supabase).catch(() => {});
  return { ok: true, id: data.id };
});
