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

export interface ShoppingDataResponse {
  totals: ShoppingTotalItem[];
  custom: ShoppingCustomItem[];
}
