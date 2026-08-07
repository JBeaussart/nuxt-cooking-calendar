import { canonicalizeUnit } from "~/shared/utils/ingredientUnits";

export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const { title, image, ingredients, steps, maman, reception, salt, servings, prepMinutes } = body;

  if (!title) throw createError({ statusCode: 400, statusMessage: "Titre requis" });

  const cleanServings = Math.round(Number(servings));
  const finalServings = Number.isFinite(cleanServings) && cleanServings >= 1 && cleanServings <= 50 ? cleanServings : 4;

  const cleanMinutes = (v: unknown) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) && n >= 0 && n <= 1440 ? n : null;
  };
  const finalPrepMinutes = cleanMinutes(prepMinutes);

  const cleanIngredients = (ingredients || [])
    .map((i: any) => {
      if (!i || typeof i !== "object") return null;
      const item = String(i.item || "").trim();
      if (!item) return null;
      const qty = i.quantity === "" || i.quantity === null || i.quantity === undefined ? undefined : Number(i.quantity);
      const unit = canonicalizeUnit(i.unit);
      if (unit === null) {
        throw createError({
          statusCode: 400,
          statusMessage: `Unité non reconnue : « ${String(i.unit).trim()} ». Utilisez une unité de la liste.`,
        });
      }
      return { item, ...(Number.isFinite(qty) ? { quantity: qty } : {}), ...(unit ? { unit } : {}) };
    })
    .filter(Boolean);

  const cleanSteps = (steps || []).map((s: string) => String(s || "").trim()).filter((s: string) => s.length > 0);

  const { error } = await supabase
    .from("recipes")
    .update({
      title: String(title).trim(),
      image: image ? String(image).trim() : "",
      ingredients: cleanIngredients,
      steps: cleanSteps,
      maman: !!maman,
      reception: !!reception,
      salt: !!salt,
      servings: finalServings,
      // Une modification manuelle (formulaire d'edition) redefinit la base :
      // c'est la nouvelle verite dont partira tout futur calcul du curseur
      // +/- personnes, plus l'etat courant deja arrondi.
      base_servings: finalServings,
      base_ingredients: cleanIngredients,
      prep_minutes: finalPrepMinutes,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  // Refresh shopping list in case this recipe is in the planning
  await recomputeShoppingTotals(user.id, supabase).catch(() => {});

  return { ok: true };
});
