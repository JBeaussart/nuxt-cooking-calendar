export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const id = getRouterParam(event, "id");

  // planning_entries a recipe_id en "on delete cascade" : les entrées de
  // planning liées à cette recette sont supprimées automatiquement par la
  // base. Un cascade ne recalcule pas la liste de courses, donc on le fait
  // explicitement plus bas. La réception, elle, n'a pas de FK : nettoyage manuel.
  const { data: receptionData } = await supabase
    .from("reception")
    .select("data")
    .eq("user_id", user.id)
    .maybeSingle();

  if (receptionData?.data) {
    const rd = receptionData.data;
    let changed = false;
    for (const key of ["aperitifId", "entreeId", "platId", "dessertId"]) {
      if (rd[key] === id) { rd[key] = null; changed = true; }
    }
    if (changed) {
      await supabase.from("reception").update({ data: rd }).eq("user_id", user.id);
    }
  }

  const { error } = await supabase.from("recipes").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  await recomputeShoppingTotals(user.id, supabase).catch(() => {});
  return { ok: true };
});
