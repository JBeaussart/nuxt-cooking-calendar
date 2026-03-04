export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  // Charger tout en parallèle
  const [{ data: planningData }, { data: receptionRow }, { data: savedRow }, { data: custom }] = await Promise.all([
    supabase.from("planning").select("recipe_id").eq("user_id", user.id).not("recipe_id", "is", null),
    supabase.from("reception").select("data").eq("user_id", user.id).maybeSingle(),
    supabase.from("shopping_totals").select("data").eq("user_id", user.id).maybeSingle(),
    supabase.from("shopping_custom").select("*").eq("user_id", user.id),
  ]);

  // Récupérer les états cochés sauvegardés (clé: "item|unit")
  const savedItems: any[] = Array.isArray(savedRow?.data?.items) ? savedRow.data.items : [];
  const checkedMap = new Map(savedItems.map((i: any) => [`${i.item}|${i.unit || ""}`, i.checked]));

  // Compter les occurrences de chaque recette (planning + réception)
  const reception = receptionRow?.data || {};
  const recipeCount: Record<string, number> = {};
  for (const p of planningData || []) {
    if (p.recipe_id) recipeCount[p.recipe_id] = (recipeCount[p.recipe_id] || 0) + 1;
  }
  for (const k of ["aperitifId", "entreeId", "platId", "dessertId"]) {
    if (reception[k]) recipeCount[reception[k]] = (recipeCount[reception[k]] || 0) + 1;
  }

  const allRecipeIds = Object.keys(recipeCount);
  let totals: any[] = [];

  if (allRecipeIds.length) {
    const { data: recipes } = await supabase.from("recipes").select("id, ingredients").in("id", allRecipeIds);

    const normalize = (s: string) =>
      String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

    const totalsMap = new Map<string, any>();
    for (const recipe of recipes || []) {
      const count = recipeCount[recipe.id] || 1;
      for (const ing of recipe.ingredients || []) {
        const item = (typeof ing === "string" ? ing : ing?.item) || "";
        if (!item) continue;
        if (["sel", "poivre"].includes(item.toLowerCase())) continue;

        const qty = typeof ing === "object" && ing.quantity != null ? Number(ing.quantity) * count : undefined;
        const unit = typeof ing === "object" ? (ing.unit || "") : "";
        const key = `${normalize(item)}|${normalize(unit)}`;
        const savedChecked = checkedMap.get(`${item.trim()}|${unit.trim()}`) ?? false;

        const prev = totalsMap.get(key);
        if (!prev) {
          totalsMap.set(key, { item: item.trim(), quantity: Number.isFinite(qty) ? qty : undefined, unit: unit.trim(), checked: savedChecked });
        } else {
          if (Number.isFinite(prev.quantity) && Number.isFinite(qty)) prev.quantity += qty;
          else if (!Number.isFinite(prev.quantity) && Number.isFinite(qty)) prev.quantity = qty;
        }
      }
    }
    totals = Array.from(totalsMap.values());
  }

  return { totals, custom: custom || [] };
});
