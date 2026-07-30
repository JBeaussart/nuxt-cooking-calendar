import type { SupabaseClient } from "@supabase/supabase-js";
import type { ShoppingTotalItem } from "~/types/shopping";

// NFD ne decompose que les accents (e-aigu -> e) : les ligatures oe/ae collees
// n'ont pas de decomposition canonique et doivent etre depliees a la main.
const normalize = (s: string) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\u0153/g, "oe")
    .replace(/\u00e6/g, "ae")
    .trim();

// "gousse" et "gousses" (ou "Ail"/"ail") doivent fusionner : on ignore le
// pluriel de l'unite dans la cle de regroupement (l'affichage garde le
// premier libelle rencontre, seule la cle de fusion est concernee).
const normalizeUnitKey = (s: string) => {
  const n = normalize(s);
  return n.length > 1 && n.endsWith("s") ? n.slice(0, -1) : n;
};

// "Haricot rouge" et "haricots rouges" doivent fusionner de la meme facon :
// on ignore le pluriel de chaque mot du nom d'ingredient dans la cle de
// regroupement (l'affichage garde le premier libelle rencontre).
const normalizeItemKey = (s: string) =>
  normalize(s)
    .split(" ")
    .map((word) => (word.length > 1 && word.endsWith("s") ? word.slice(0, -1) : word))
    .join(" ");

export async function recomputeShoppingTotals(userId: string, supabase: SupabaseClient) {
  // Seules les recettes planifiées à venir (aujourd'hui inclus) comptent :
  // un repas déjà passé n'a plus besoin d'être acheté.
  const today = new Date().toISOString().slice(0, 10);
  const [{ data: planningData }, { data: savedRow }] = await Promise.all([
    supabase.from("planning_entries").select("recipe_id").eq("user_id", userId).gte("date", today),
    supabase.from("shopping_totals").select("data").eq("user_id", userId).maybeSingle(),
  ]);

  // Preserved checked states from previous list. On garde aussi
  // checkedOccurrences (pas seulement le booleen global) : sinon un item
  // partiellement coche (une recette sur deux) perdait ce detail a chaque
  // recalcul et redevenait soit tout coche, soit tout decoche.
  const savedItems: ShoppingTotalItem[] = Array.isArray(savedRow?.data?.items) ? savedRow.data.items : [];
  const savedStateMap = new Map(
    savedItems.map((i) => [
      `${i.item}|${i.unit || ""}`,
      { checked: i.checked, checkedOccurrences: i.checkedOccurrences },
    ]),
  );

  // Count recipe occurrences across planning
  const recipeCount: Record<string, number> = {};
  for (const p of planningData || []) {
    if (p.recipe_id) recipeCount[p.recipe_id] = (recipeCount[p.recipe_id] || 0) + 1;
  }

  const allRecipeIds = Object.keys(recipeCount);
  let items: ShoppingTotalItem[] = [];

  if (allRecipeIds.length) {
    const { data: recipes } = await supabase
      .from("recipes")
      .select("id, title, ingredients")
      .in("id", allRecipeIds);

    const totalsMap = new Map<string, ShoppingTotalItem>();
    for (const recipe of recipes || []) {
      const count = recipeCount[recipe.id] || 1;
      for (const ing of recipe.ingredients || []) {
        const item = (typeof ing === "string" ? ing : ing?.item) || "";
        if (!item) continue;
        if (["sel", "poivre"].includes(item.toLowerCase())) continue;

        const qty = typeof ing === "object" && ing.quantity != null ? Number(ing.quantity) * count : undefined;
        const unit = typeof ing === "object" ? (ing.unit || "") : "";
        const key = `${normalizeItemKey(item)}|${normalizeUnitKey(unit)}`;
        const savedState = savedStateMap.get(`${item.trim()}|${unit.trim()}`);

        const prev = totalsMap.get(key);
        if (!prev) {
          totalsMap.set(key, {
            item: item.trim(),
            quantity: Number.isFinite(qty) ? qty : undefined,
            unit: unit.trim(),
            checked: savedState?.checked ?? false,
            ...(Array.isArray(savedState?.checkedOccurrences)
              ? { checkedOccurrences: savedState.checkedOccurrences }
              : {}),
            recipes: recipe.title ? [recipe.title] : [],
          });
        } else {
          if (Number.isFinite(prev.quantity) && Number.isFinite(qty)) prev.quantity += qty;
          else if (!Number.isFinite(prev.quantity) && Number.isFinite(qty)) prev.quantity = qty;
          if (recipe.title && !prev.recipes.includes(recipe.title)) prev.recipes.push(recipe.title);
        }
      }
    }
    items = Array.from(totalsMap.values());
  }

  await supabase
    .from("shopping_totals")
    .upsert({ user_id: userId, data: { items } }, { onConflict: "user_id" });

  return items;
}
