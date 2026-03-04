export default defineEventHandler(async (event) => {
  const { user, supabase, userRole } = await getServerUser(event);
  if (!user || !supabase) {
    throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  }

  const body = await readBody(event);
  const { title, image, ingredients, steps, maman = false, salt = true } = body;

  if (!title || !Array.isArray(ingredients) || ingredients.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Champs requis manquants" });
  }

  // Vérifier la limite pour les utilisateurs free
  if (!["admin", "premium"].includes(userRole)) {
    const { count } = await supabase
      .from("recipes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    if ((count || 0) >= 20) {
      throw createError({
        statusCode: 403,
        statusMessage: "Limite de 20 recettes atteinte. Passez à Premium pour créer des recettes illimitées.",
      });
    }
  }

  const cleanIngredients = ingredients
    .map((i: any) => {
      if (!i || typeof i !== "object") return null;
      const item = String(i.item || "").trim();
      if (!item) return null;
      const qty = i.quantity === "" || i.quantity === null || i.quantity === undefined ? undefined : Number(i.quantity);
      const unit = String(i.unit || "").trim();
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
      maman: isAdmin(userRole) ? !!maman : false,
      salt: !!salt,
    })
    .select("id")
    .single();

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });
  return { ok: true, id: data.id };
});
