// Logique partagée entre pages/recipes/new.vue et pages/recipes/[id]/edit.vue
export interface RecipeFormIngredient {
  item: string;
  quantity: number | string;
  unit: string;
}

export interface RecipeFormState {
  ingredients: RecipeFormIngredient[];
  steps: string[];
}

export const useRecipeFormHelpers = (form: RecipeFormState) => {
  const addIngredient = () => form.ingredients.push({ item: "", quantity: "", unit: "" });
  const addStep = () => form.steps.push("");

  const moveStep = (i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= form.steps.length) return;
    [form.steps[i], form.steps[j]] = [form.steps[j], form.steps[i]];
  };

  const cleanIngredients = () =>
    form.ingredients
      .map((i) => {
        const item = i.item.trim();
        if (!item) return null;
        const qty = i.quantity === "" || i.quantity === null || i.quantity === undefined ? undefined : Number(i.quantity);
        return { item, ...(Number.isFinite(qty) ? { quantity: qty } : {}), ...(i.unit ? { unit: i.unit } : {}) };
      })
      .filter(Boolean) as { item: string; quantity?: number; unit?: string }[];

  const cleanSteps = () => form.steps.map((s) => s.trim()).filter(Boolean);

  return { addIngredient, addStep, moveStep, cleanIngredients, cleanSteps };
};
