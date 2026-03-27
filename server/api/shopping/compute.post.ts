import type { ShoppingTotalItem } from "~/types/shopping";

export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  // Récupérer planning + réception en parallèle
  const [{ data: planningData }, { data: receptionRow }] = await Promise.all([
    supabase.from("planning").select("recipe_id").eq("user_id", user.id).not("recipe_id", "is", null),
    supabase.from("reception").select("data").eq("user_id", user.id).maybeSingle(),
  ]);

  const reception = receptionRow?.data || {};
  const receptionIds = ["aperitifId", "entreeId", "platId", "dessertId"]
    .map((k) => reception[k])
    .filter(Boolean);

  // Compter les occurrences de chaque recette
  const recipeCount: Record<string, number> = {};
  for (const p of planningData || []) {
    if (p.recipe_id) recipeCount[p.recipe_id] = (recipeCount[p.recipe_id] || 0) + 1;
  }
  for (const id of receptionIds) {
    recipeCount[id] = (recipeCount[id] || 0) + 1;
  }

  const allRecipeIds = Object.keys(recipeCount);
  if (!allRecipeIds.length) {
    await supabase.from("shopping_totals").upsert({ user_id: user.id, data: { items: [] } }, { onConflict: "user_id" });
    return { ok: true, items: [] };
  }

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title, ingredients")
    .in("id", allRecipeIds);

  const normalize = (s: string) =>
    String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const totalsMap = new Map<string, ShoppingTotalItem>();

  for (const recipe of recipes || []) {
    const count = recipeCount[recipe.id] || 1;
    for (const ing of recipe.ingredients || []) {
      const item = (typeof ing === "string" ? ing : ing?.item) || "";
      if (!item) continue;
      const raw = item.toLowerCase();
      if (raw === "sel" || raw === "poivre") continue;

      const qty = typeof ing === "object" && ing.quantity !== undefined && ing.quantity !== null
        ? Number(ing.quantity) * count
        : undefined;
      const unit = typeof ing === "object" ? (ing.unit || "") : "";
      const key = `${normalize(item)}|${normalize(unit)}`;

      const prev = totalsMap.get(key);
      if (!prev) {
        totalsMap.set(key, {
          item: item.trim(),
          quantity: Number.isFinite(qty) ? qty : undefined,
          unit: unit.trim(),
          checked: false,
          recipes: recipe.title ? [recipe.title] : [],
        });
      } else {
        if (Number.isFinite(prev.quantity) && Number.isFinite(qty)) {
          prev.quantity = (prev.quantity as number) + (qty as number);
        } else if (!Number.isFinite(prev.quantity) && Number.isFinite(qty)) {
          prev.quantity = qty;
        }
        if (recipe.title && !prev.recipes.includes(recipe.title)) prev.recipes.push(recipe.title);
      }
    }
  }

  const items = Array.from(totalsMap.values());

  await supabase
    .from("shopping_totals")
    .upsert({ user_id: user.id, data: { items } }, { onConflict: "user_id" });

  return { ok: true, items };
});
