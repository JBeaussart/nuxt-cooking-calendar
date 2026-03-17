export default defineEventHandler(async (event) => {
  const { user, supabase, userRole } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  if (!isPremiumOrAdmin(userRole)) throw createError({ statusCode: 403, statusMessage: "Accès réservé aux utilisateurs Premium" });

  const { data: receptionData } = await supabase
    .from("reception")
    .select("data")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  const data = receptionData?.data || {};
  const recipeIds = [data.aperitifId, data.entreeId, data.platId, data.dessertId].filter(Boolean);

  let recipesMap = new Map();
  if (recipeIds.length > 0) {
    const { data: recipesData } = await supabase
      .from("recipes")
      .select("id, title, image")
      .in("id", recipeIds)
      .eq("user_id", user.id);
    if (recipesData) recipesMap = new Map(recipesData.map((r: any) => [r.id, r]));
  }

  return {
    aperitif: recipesMap.get(data.aperitifId) || null,
    entree: recipesMap.get(data.entreeId) || null,
    plat: recipesMap.get(data.platId) || null,
    dessert: recipesMap.get(data.dessertId) || null,
  };
});
