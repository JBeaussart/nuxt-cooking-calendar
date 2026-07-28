import type { ShoppingDataResponse, ShoppingRecipeEntry, ShoppingTotalItem } from "~/types/shopping";

export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const [{ data: savedRow }, { data: custom }, { data: planningRows }, { data: receptionRow }] = await Promise.all([
    supabase.from("shopping_totals").select("data").eq("user_id", user.id).maybeSingle(),
    supabase.from("shopping_custom").select("*").eq("user_id", user.id),
    supabase
      .from("planning")
      .select("day, recipe_id")
      .eq("user_id", user.id)
      .not("recipe_id", "is", null),
    supabase.from("reception").select("data").eq("user_id", user.id).maybeSingle(),
  ]);

  const totals: ShoppingTotalItem[] = Array.isArray(savedRow?.data?.items) ? savedRow.data.items : [];
  const daysOrder = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
  const planning = (planningRows || []).sort(
    (a: any, b: any) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day)
  );

  // Les recettes assignées en réception (apéritif/entrée/plat/dessert) doivent
  // aussi apparaître ici, sinon leurs ingrédients sont comptés dans les totaux
  // (recomputeShoppingTotals) sans jamais être affichés/cochables.
  const receptionSlots: { key: string; label: string }[] = [
    { key: "aperitifId", label: "Apéritif" },
    { key: "entreeId", label: "Entrée" },
    { key: "platId", label: "Plat" },
    { key: "dessertId", label: "Dessert" },
  ];
  const receptionData = receptionRow?.data || {};
  const receptionEntries = receptionSlots
    .filter((slot) => receptionData[slot.key])
    .map((slot) => ({ day: slot.label, recipe_id: receptionData[slot.key] }));

  const entries = [...planning, ...receptionEntries];
  const recipeIds = [...new Set(entries.map((row: any) => row.recipe_id).filter(Boolean))];
  const recipes: ShoppingRecipeEntry[] = [];

  if (recipeIds.length) {
    const { data: recipesRows } = await supabase
      .from("recipes")
      .select("id, title, image, ingredients")
      .eq("user_id", user.id)
      .in("id", recipeIds);

    const byId = new Map((recipesRows || []).map((r: any) => [r.id, r]));
    for (const row of entries) {
      const recipe = byId.get(row.recipe_id);
      if (!recipe) continue;
      const ingredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients
          .map((ing: any) => {
            if (typeof ing === "string") {
              const item = ing.trim();
              if (!item) return null;
              if (["sel", "poivre"].includes(item.toLowerCase())) return null;
              return { item };
            }
            const item = String(ing?.item || "").trim();
            if (!item) return null;
            if (["sel", "poivre"].includes(item.toLowerCase())) return null;
            const quantity = Number(ing?.quantity);
            return {
              item,
              quantity: Number.isFinite(quantity) ? quantity : undefined,
              unit: String(ing?.unit || "").trim() || undefined,
            };
          })
          .filter(Boolean)
        : [];
      recipes.push({
        day: row.day,
        recipeId: recipe.id,
        title: recipe.title,
        image: recipe.image || undefined,
        ingredients: ingredients as ShoppingRecipeEntry["ingredients"],
      });
    }
  }

  return { totals, custom: custom || [], recipes } satisfies ShoppingDataResponse;
});
