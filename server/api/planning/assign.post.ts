export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const { day, id } = await readBody(event);
  if (!day || !id) throw createError({ statusCode: 400, statusMessage: "Paramètres manquants" });

  const { error } = await supabase
    .from("planning")
    .upsert({ day, recipe_id: id, user_id: user.id }, { onConflict: "day,user_id" });

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  // Doit être attendu : sur Netlify Functions, l'exécution s'arrête dès la
  // réponse envoyée, donc un vrai "fire-and-forget" ne s'exécuterait jamais.
  // Le client a déjà été mis à jour de façon optimiste, on ignore juste les erreurs.
  await recomputeShoppingTotals(user.id, supabase).catch(() => {});
  return { ok: true };
});
