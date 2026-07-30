export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const nextServings = Math.round(Number(body?.servings));
  if (!Number.isFinite(nextServings) || nextServings < 1 || nextServings > 50) {
    throw createError({ statusCode: 400, statusMessage: "Nombre de personnes invalide" });
  }

  const { data: recipe, error: fetchError } = await supabase
    .from("recipes")
    .select("base_servings, base_ingredients")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (fetchError || !recipe) throw createError({ statusCode: 404, statusMessage: "Recette introuvable" });

  // On recalcule TOUJOURS a partir de la base immuable (telle qu'ecrite dans
  // le formulaire d'edition), jamais a partir de l'etat courant deja arrondi.
  // Sinon, des allers-retours successifs (4 -> 5 -> 4 pers...) accumulent des
  // erreurs d'arrondi et peuvent faire deriver la recette de sa vraie valeur
  // d'origine (ex: "1 avocat pour 4 pers" qui se transforme en "2" a tort).
  const baseServings = recipe.base_servings || 1;
  const ratio = nextServings / baseServings;

  // Les ingredients sans quantite chiffree (ex: "Sel") ne sont pas mis a
  // l'echelle : rien a multiplier. Arrondi a 2 decimales pour eviter le bruit
  // flottant (ex: 3 * (5/3) doit rester 5, pas 4.999999999).
  //
  // Pas d'arrondi "a la piece" ici : cette valeur precise est la source de
  // verite pour deux affichages qui arrondissent differemment (page recette :
  // au demi le plus proche : liste de courses : toujours au superieur). Voir
  // shared/utils/ingredientQuantity.ts.
  const scaledIngredients = (recipe.base_ingredients || []).map((ing: any) => {
    if (!ing || typeof ing !== "object") return ing;
    const qty = Number(ing.quantity);
    if (!Number.isFinite(qty)) return ing;
    return { ...ing, quantity: Math.round(qty * ratio * 100) / 100 };
  });

  const { error: updateError } = await supabase
    .from("recipes")
    .update({ servings: nextServings, ingredients: scaledIngredients })
    .eq("id", id)
    .eq("user_id", user.id);
  if (updateError) throw createError({ statusCode: 500, statusMessage: updateError.message });

  // La recette peut deja etre planifiee : la liste de courses doit refleter
  // les nouvelles quantites immediatement.
  await recomputeShoppingTotals(user.id, supabase).catch(() => {});

  return { ok: true, servings: nextServings, ingredients: scaledIngredients };
});
