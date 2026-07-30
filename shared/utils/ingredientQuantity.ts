// Regles de quantite partagees entre le calcul serveur (mise a l'echelle des
// portions, liste de courses) et l'affichage client (page recette, page
// liste de courses). Auto-importe cote client ET serveur via le dossier
// Nuxt `shared/`.

export type IngredientQuantityType = "continuous" | "shareable" | "unitary";

// \p{Mn} (marques combinantes) ne deplie pas les ligatures oe/ae collees,
// qui n'ont pas de decomposition canonique : depliage manuel necessaire.
const norm = (s: string) =>
  String(s || "")
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .trim();

// Unites mesurables/dosables : pas de contrainte d'achat a la piece, la
// precision (ou une fraction) a un sens autant en cuisine qu'au moment de
// l'achat (on pese/mesure ce qu'il faut).
const CONTINUOUS_UNITS = new Set(
  ["g", "kg", "ml", "cl", "l", "c. a cafe", "c. a soupe", "pincee", "zeste", "poignee", "verre"].map(norm)
);

// Unites qui representent un contenant achete entier (on ne peut pas acheter
// une demi-boite au supermarche), mais qui restent traitees comme les
// ingredients "partageables" pour l'instant (voir formatRecipeQuantity /
// getShoppingListQuantity) : la distinction sert a documenter l'intention et
// permettra de les differencier plus tard si besoin.
const UNITARY_UNITS = new Set(["boite", "sachet", "conserve", "conserves", "tranche", "tranches"].map(norm));

// La gousse d'ail se coupe/partage tres naturellement en cuisine.
const SHAREABLE_UNITS = new Set(["gousse", "gousses"].map(norm));

// Ingredients sans unite generalement compris comme un compte a la piece
// indivisible en cuisine (contrairement a "demi-avocat" ou "demi-oignon",
// qui sont des usages courants).
const UNITARY_ITEM_NAMES = new Set(["oeuf", "oeufs", "citron", "citron jaune", "citron vert"].map(norm));

/**
 * Determine le type de quantite d'un ingredient (deduit de son unite, puis
 * de son nom si l'ingredient est compte a la piece sans unite).
 */
export function getIngredientQuantityType(ingredient: { unit?: string; item?: string }): IngredientQuantityType {
  const unit = norm(ingredient.unit || "");
  if (unit) {
    if (SHAREABLE_UNITS.has(unit)) return "shareable";
    if (UNITARY_UNITS.has(unit)) return "unitary";
    if (CONTINUOUS_UNITS.has(unit)) return "continuous";
    // Unite inconnue/non repertoriee : pas de contrainte d'achat a la piece
    // connue, on la traite comme continue par defaut.
    return "continuous";
  }
  const item = norm(ingredient.item || "");
  return UNITARY_ITEM_NAMES.has(item) ? "unitary" : "shareable";
}

/**
 * Quantite a afficher sur la page recette (cuisine) : les ingredients
 * mesurables gardent leur precision, les ingredients a la piece sont
 * arrondis au demi le plus proche (1.25 -> 1.5), car une demi-unite est un
 * usage de cuisine courant meme si ce n'est pas achetable tel quel.
 */
export function formatRecipeQuantity(quantity: number, type: IngredientQuantityType): number {
  if (!Number.isFinite(quantity)) return quantity;
  if (type === "continuous") return quantity;
  return Math.round(quantity * 2) / 2;
}

// Pas d'arrondi "au superieur" pour les ingredients mesurables sur la liste
// de courses (ex: 125g -> 130g) : achete un peu plus que le strict
// necessaire pour rester sur une quantite facile a lire/peser.
const CONTINUOUS_ROUND_STEP: Record<string, number> = {
  g: 10,
  kg: 0.1,
  ml: 10,
  cl: 1,
  l: 0.1,
  [norm("c. a cafe")]: 0.5,
  [norm("c. a soupe")]: 0.5,
  pincee: 1,
  zeste: 1,
  poignee: 1,
  verre: 0.5,
};

/**
 * Quantite a afficher/acheter sur la liste de courses : les ingredients a la
 * piece (partageables ou unitaires) sont TOUJOURS arrondis au superieur, pour
 * ne jamais risquer d'en acheter trop peu (2.25 avocats -> 3 a acheter). Les
 * ingredients mesurables sont arrondis au superieur sur une tranche logique
 * plutot que sur un gramme pres.
 */
export function getShoppingListQuantity(quantity: number, type: IngredientQuantityType, unit?: string): number {
  if (!Number.isFinite(quantity)) return quantity;
  if (type === "continuous") {
    const step = CONTINUOUS_ROUND_STEP[norm(unit || "")] ?? 1;
    return Math.round(Math.ceil(quantity / step) * step * 100) / 100;
  }
  return Math.max(1, Math.ceil(quantity));
}

/**
 * Formatte une quantite pour l'affichage (1.5 -> "1 ½"). N'est utilise que
 * la ou l'affichage d'une fraction lisible apporte quelque chose (page
 * recette) ; la liste de courses affiche des entiers et n'en a pas besoin.
 */
export function formatQuantityLabel(quantity: number): string {
  if (!Number.isFinite(quantity)) return "";
  const whole = Math.floor(quantity);
  const frac = quantity - whole;
  if (Math.abs(frac - 0.5) < 1e-9) {
    return whole > 0 ? `${whole} ½` : "½";
  }
  if (Number.isInteger(quantity)) return String(quantity);
  return String(Math.round(quantity * 100) / 100);
}
