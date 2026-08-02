// Cle de regroupement des ingredients, partagee entre le calcul serveur
// (fusion des totaux de la liste de courses) et l'affichage client (retrouver
// a quel total fusionne appartient l'ingredient d'une recette).
//
// Ces deux cotes DOIVENT produire exactement la meme cle : quand ils divergent,
// un ingredient de recette ne retrouve plus son total et sa case a cocher
// devient muette (cas vecu : "Courgette" au singulier dans une recette contre
// "Courgettes" au pluriel dans les autres). D'ou cette implementation unique.

// Plage des marques diacritiques combinantes (U+0300 a U+036F), construite par
// code plutot qu'ecrite en litteral : ces caracteres sont invisibles dans un
// editeur et se corrompent facilement au copier-coller.
const DIACRITICS_RE = new RegExp(
  "[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]",
  "g",
);

// Les ligatures oe/ae collees (U+0153 / U+00E6) n'ont pas de decomposition
// canonique NFD : elles doivent etre depliees a la main.
const OE = String.fromCharCode(0x0153);
const AE = String.fromCharCode(0x00e6);

export const normalizeLabel = (s: string) =>
  String(s || "")
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .toLowerCase()
    .split(OE)
    .join("oe")
    .split(AE)
    .join("ae")
    .trim();

// "gousse" et "gousses" (ou "Ail"/"ail") doivent fusionner : on ignore le
// pluriel de l'unite dans la cle de regroupement (l'affichage garde le
// premier libelle rencontre, seule la cle de fusion est concernee).
export const normalizeUnitKey = (s: string) => {
  const n = normalizeLabel(s);
  return n.length > 1 && n.endsWith("s") ? n.slice(0, -1) : n;
};

// "Haricot rouge" et "haricots rouges" doivent fusionner de la meme facon :
// on ignore le pluriel de chaque mot du nom d'ingredient.
export const normalizeItemKey = (s: string) =>
  normalizeLabel(s)
    .split(" ")
    .map((word) => (word.length > 1 && word.endsWith("s") ? word.slice(0, -1) : word))
    .join(" ");
