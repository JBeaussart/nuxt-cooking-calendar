export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const { start, end } = await readBody(event);
  if (
    typeof start !== "string" || typeof end !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)
  ) {
    throw createError({ statusCode: 400, statusMessage: "Paramètres start/end invalides" });
  }

  // Portée : uniquement l'intervalle affiché (ex. la semaine courante), pas
  // tout le planning.
  const { error } = await supabase
    .from("planning_entries")
    .delete()
    .eq("user_id", user.id)
    .gte("date", start)
    .lte("date", end);

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  // Recalcule (et non un vidage direct de shopping_totals) pour ne pas
  // écraser la contribution de la réception.
  await recomputeShoppingTotals(user.id, supabase).catch(() => {});
  return { ok: true };
});
