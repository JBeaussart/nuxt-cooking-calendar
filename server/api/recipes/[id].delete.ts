export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const id = getRouterParam(event, "id");

  // Nettoyer les références dans planning et reception
  await supabase.from("planning").update({ recipe_id: null }).eq("recipe_id", id).eq("user_id", user.id);

  const { data: receptionData } = await supabase
    .from("reception")
    .select("data")
    .eq("user_id", user.id)
    .single();

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
  return { ok: true };
});
