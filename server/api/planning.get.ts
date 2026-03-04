export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

  const { data: planningData } = await supabase
    .from("planning")
    .select("day, recipe_id")
    .eq("user_id", user.id);

  const planningMap = new Map((planningData || []).map((p: any) => [p.day, p.recipe_id || ""]));
  const recipeIds = days.map((d) => planningMap.get(d) || "").filter(Boolean);

  let recipesById = new Map();
  if (recipeIds.length) {
    const { data: recipesData } = await supabase
      .from("recipes")
      .select("*")
      .in("id", recipeIds)
      .eq("user_id", user.id);
    if (recipesData) {
      for (const r of recipesData) recipesById.set(r.id, r);
    }
  }

  return days.map((day) => {
    const rid = planningMap.get(day) || "";
    return { day, recipe: rid ? (recipesById.get(rid) ?? null) : null };
  });
});
