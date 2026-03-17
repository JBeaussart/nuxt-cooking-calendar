export default defineEventHandler(async (event) => {
  const { user, supabase, userRole } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const { title, image, ingredients, steps, maman, salt } = body;

  if (!title) throw createError({ statusCode: 400, statusMessage: "Titre requis" });

  const cleanIngredients = (ingredients || [])
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

  const { error } = await supabase
    .from("recipes")
    .update({
      title: String(title).trim(),
      image: image ? String(image).trim() : "",
      ingredients: cleanIngredients,
      steps: cleanSteps,
      maman: isAdmin(userRole) ? !!maman : false,
      salt: !!salt,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  // Refresh shopping list in case this recipe is in the planning
  recomputeShoppingTotals(user.id, supabase).catch(() => {});

  return { ok: true };
});
