export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const { day } = await readBody(event);
  if (!day) throw createError({ statusCode: 400, statusMessage: "Jour manquant" });

  const { error } = await supabase
    .from("planning")
    .update({ recipe_id: null })
    .eq("day", day)
    .eq("user_id", user.id);

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  // Doit être attendu : sur Netlify Functions, l'exécution s'arrête dès la
  // réponse envoyée, donc un vrai "fire-and-forget" ne s'exécuterait jamais.
  // Le client a déjà été mis à jour de façon optimiste, on ignore juste les erreurs.
  await recomputeShoppingTotals(user.id, supabase).catch(() => {});
  return { ok: true };
});
