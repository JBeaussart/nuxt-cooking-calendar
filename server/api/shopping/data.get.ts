import type { ShoppingDataResponse, ShoppingRecipeEntry, ShoppingTotalItem } from "~/types/shopping";

export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const today = new Date().toISOString().slice(0, 10);
  const [{ data: savedRow }, { data: custom }, { data: planningRows }] = await Promise.all([
    supabase.from("shopping_totals").select("data").eq("user_id", user.id).maybeSingle(),
    supabase.from("shopping_custom").select("*").eq("user_id", user.id),
    supabase
      .from("planning_entries")
      .select("date, recipe_id")
      .eq("user_id", user.id)
      .gte("date", today)
      .order("date", { ascending: true }),
  ]);

  const totals: ShoppingTotalItem[] = Array.isArray(savedRow?.data?.items) ? savedRow.data.items : [];
  const dayLabelFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  const planning = (planningRows || []).map((row: any) => ({
    day: dayLabelFormatter.format(new Date(`${row.date}T00:00:00`)),
    recipe_id: row.recipe_id,
  }));

  const recipeIds = [...new Set(planning.map((row: any) => row.recipe_id).filter(Boolean))];
  const recipes: ShoppingRecipeEntry[] = [];

  if (recipeIds.length) {
    const { data: recipesRows } = await supabase
      .from("recipes")
      .select("id, title, image, ingredients")
      .eq("user_id", user.id)
      .in("id", recipeIds);

    const byId = new Map((recipesRows || []).map((r: any) => [r.id, r]));
    for (const row of planning) {
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
