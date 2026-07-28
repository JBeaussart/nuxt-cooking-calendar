export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const { id } = await readBody(event);
  if (!id) throw createError({ statusCode: 400, statusMessage: "Identifiant manquant" });

  const { error } = await supabase
    .from("planning_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  // Doit être attendu : sur Netlify Functions, l'exécution s'arrête dès la
  // réponse envoyée, donc un vrai "fire-and-forget" ne s'exécuterait jamais.
  await recomputeShoppingTotals(user.id, supabase).catch(() => {});
  return { ok: true };
});
