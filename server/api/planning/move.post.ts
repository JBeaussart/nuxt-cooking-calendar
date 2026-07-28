export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const { id, date } = await readBody(event);
  if (!id || !date) throw createError({ statusCode: 400, statusMessage: "Paramètres manquants" });

  const { error } = await supabase
    .from("planning_entries")
    .update({ date })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  // Un déplacement peut faire passer une entrée d'un côté ou l'autre de la
  // frontière "aujourd'hui" : toujours recalculer, même si la recette est
  // inchangée. Doit être attendu (cf. commentaire Netlify dans les autres routes).
  await recomputeShoppingTotals(user.id, supabase).catch(() => {});
  return { ok: true };
});
