import { normalizeLabel } from "./ingredientKey";

// Liste fermee des unites d'ingredient. Source de verite unique, utilisee par
// les deux formulaires de recette (listes deroulantes), par la validation des
// routes API et par la classification des quantites (ingredientQuantity.ts).
//
// Les valeurs sont ecrites au singulier et avec leurs accents : c'est
// exactement ce qui est stocke en base et affiche a l'utilisateur.

export type IngredientUnitCategory = "continuous" | "shareable" | "unitary";

export interface IngredientUnitDef {
  /** Valeur canonique stockee en base et affichee. */
  value: string;
  /** Regroupement dans les listes deroulantes. */
  group: string;
  /**
   * Comment la quantite se comporte a l'achat :
   * - continuous : mesurable, on achete la quantite exacte (g, ml...)
   * - shareable  : se coupe naturellement en cuisine (gousse d'ail)
   * - unitary    : contenant/piece achete entier (boite, sachet...)
   */
  category: IngredientUnitCategory;
}

export const INGREDIENT_UNITS: IngredientUnitDef[] = [
  { value: "g", group: "Poids", category: "continuous" },
  { value: "kg", group: "Poids", category: "continuous" },

  { value: "ml", group: "Volume", category: "continuous" },
  { value: "cl", group: "Volume", category: "continuous" },
  { value: "l", group: "Volume", category: "continuous" },

  { value: "c. à café", group: "Cuillères", category: "continuous" },
  { value: "c. à soupe", group: "Cuillères", category: "continuous" },

  { value: "pincée", group: "Dosage", category: "continuous" },
  { value: "poignée", group: "Dosage", category: "continuous" },
  { value: "zeste", group: "Dosage", category: "continuous" },
  { value: "verre", group: "Dosage", category: "continuous" },

  { value: "gousse", group: "Pièces", category: "shareable" },
  { value: "tranche", group: "Pièces", category: "unitary" },
  { value: "feuille", group: "Pièces", category: "unitary" },
  { value: "botte", group: "Pièces", category: "unitary" },
  { value: "bloc", group: "Pièces", category: "unitary" },

  { value: "boîte", group: "Contenants", category: "unitary" },
  { value: "conserve", group: "Contenants", category: "unitary" },
  { value: "bocal", group: "Contenants", category: "unitary" },
  { value: "sachet", group: "Contenants", category: "unitary" },
  { value: "barquette", group: "Contenants", category: "unitary" },
  { value: "pot", group: "Contenants", category: "unitary" },
];

export const INGREDIENT_UNIT_VALUES = INGREDIENT_UNITS.map((u) => u.value);

/** Unites groupees, pour construire les <optgroup> des listes deroulantes. */
export const INGREDIENT_UNIT_GROUPS = INGREDIENT_UNITS.reduce<
  { group: string; units: string[] }[]
>((acc, u) => {
  const found = acc.find((g) => g.group === u.group);
  if (found) found.units.push(u.value);
  else acc.push({ group: u.group, units: [u.value] });
  return acc;
}, []);

// Ecritures historiquement presentes en base ou saisies a la main, ramenees a
// leur equivalent canonique. Les pluriels simples ("gousses", "tranches") sont
// geres automatiquement plus bas et n'ont pas besoin de figurer ici.
const UNIT_ALIASES: Record<string, string> = {
  // abreviations de cuilleres
  cs: "c. à soupe",
  cas: "c. à soupe",
  "c.a.s": "c. à soupe",
  "c a s": "c. à soupe",
  "cuillere a soupe": "c. à soupe",
  "cuilleres a soupe": "c. à soupe",
  "cuillere a soupe rase": "c. à soupe",
  cc: "c. à café",
  cac: "c. à café",
  "c.a.c": "c. à café",
  "c a c": "c. à café",
  "cuillere a cafe": "c. à café",
  "cuilleres a cafe": "c. à café",
  // pluriels irreguliers
  bocaux: "bocal",
  // synonymes
  boite: "boîte",
  brique: "pot",
  barquettes: "barquette",
};

// Index des valeurs canoniques par forme normalisee (sans accents, minuscules).
const BY_NORMALIZED = new Map(INGREDIENT_UNITS.map((u) => [normalizeLabel(u.value), u.value]));

/**
 * Ramene une unite saisie librement a sa valeur canonique.
 * Retourne "" pour une unite absente (cas valide : ingredient sans unite),
 * et `null` si l'unite n'est pas reconnue — a l'appelant de decider quoi faire
 * (les formulaires ne proposent que des valeurs valides, mais l'import JSON et
 * les appels API directs peuvent contenir n'importe quoi).
 */
export function canonicalizeUnit(raw: unknown): string | null {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return "";

  const n = normalizeLabel(trimmed);
  if (BY_NORMALIZED.has(n)) return BY_NORMALIZED.get(n)!;
  if (UNIT_ALIASES[n]) return UNIT_ALIASES[n];

  // Pluriel simple : "gousses" -> "gousse", "tranches" -> "tranche"
  if (n.length > 1 && n.endsWith("s")) {
    const singular = n.slice(0, -1);
    if (BY_NORMALIZED.has(singular)) return BY_NORMALIZED.get(singular)!;
    if (UNIT_ALIASES[singular]) return UNIT_ALIASES[singular];
  }

  return null;
}

/** Categorie d'une unite canonique (defaut : continuous, comme avant). */
export function getUnitCategory(unit: string): IngredientUnitCategory {
  const n = normalizeLabel(unit);
  const found = INGREDIENT_UNITS.find((u) => normalizeLabel(u.value) === n);
  return found ? found.category : "continuous";
}
