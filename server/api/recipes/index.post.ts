import { canonicalizeUnit } from "~/shared/utils/ingredientUnits";

export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) {
    throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  }

  const body = await readBody(event);
  const { title, image, ingredients, steps, maman = false, reception = false, salt = true, servings, prepMinutes } = body;

  if (!title || !Array.isArray(ingredients) || ingredients.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Champs requis manquants" });
  }

  const cleanServings = Math.round(Number(servings));
  const finalServings = Number.isFinite(cleanServings) && cleanServings >= 1 && cleanServings <= 50 ? cleanServings : 4;

  const cleanMinutes = (v: unknown) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) && n >= 0 && n <= 1440 ? n : null;
  };
  const finalPrepMinutes = cleanMinutes(prepMinutes);

  const cleanIngredients = ingredients
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

  const { data, error } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,
      title: String(title).trim(),
      image: image ? String(image).trim() : "",
      ingredients: cleanIngredients,
      steps: cleanSteps,
      maman: !!maman,
      reception: !!reception,
      salt: !!salt,
      servings: finalServings,
      base_servings: finalServings,
      base_ingredients: cleanIngredients,
      prep_minutes: finalPrepMinutes,
    })
    .select("id")
    .single();

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });
  return { ok: true, id: data.id };
});
