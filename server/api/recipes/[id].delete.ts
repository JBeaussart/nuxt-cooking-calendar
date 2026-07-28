export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const id = getRouterParam(event, "id");

  // planning_entries a recipe_id en "on delete cascade" : les entrées de
  // planning liées à cette recette sont supprimées automatiquement par la
  // base. Un cascade ne recalcule pas la liste de courses, donc on le fait
  // explicitement plus bas.
  const { error } = await supabase.from("recipes").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  await recomputeShoppingTotals(user.id, supabase).catch(() => {});
  return { ok: true };
});
