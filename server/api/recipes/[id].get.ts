export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const id = getRouterParam(event, "id");
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  // PGRST116 = aucune ligne trouvée (véritable 404). Toute autre erreur
  // (réseau, timeout...) doit remonter en 500 pour ne pas être confondue
  // avec "cette recette n'existe pas" côté client.
  if (error && error.code !== "PGRST116") {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
  if (!data) throw createError({ statusCode: 404, statusMessage: "Recette introuvable" });
  return data;
});
