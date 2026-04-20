export interface ShoppingTotalItem {
  item: string;
  quantity?: number;
  unit: string;
  checked: boolean;
  recipes: string[];
}

export interface ShoppingCustomItem {
  id: string;
  item: string;
  quantity?: number;
  unit?: string;
  checked: boolean;
}

export interface ShoppingRecipeIngredient {
  item: string;
  quantity?: number;
  unit?: string;
}

export interface ShoppingRecipeEntry {
  day: string;
  recipeId: string;
  title: string;
  image?: string;
  ingredients: ShoppingRecipeIngredient[];
}

export interface ShoppingDataResponse {
  totals: ShoppingTotalItem[];
  custom: ShoppingCustomItem[];
  recipes: ShoppingRecipeEntry[];
}
