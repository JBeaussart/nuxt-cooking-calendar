// Recherche par ingredient : /api/recipes ne renvoie plus les ingredients
// (payload trop lourd a chaque visite), donc on ne les charge que lorsqu'une
// recherche est reellement en cours, et on ne renvoie que les IDs qui matchent.
const DIACRITICS_START = String.fromCharCode(768); // U+0300
const DIACRITICS_END = String.fromCharCode(879); // U+036F
const DIACRITICS_RE = new RegExp("[" + DIACRITICS_START + "-" + DIACRITICS_END + "]", "g");

const normalize = (s: string) =>
  String(s || "")
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .toLowerCase()
    .trim();

export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) {
    throw createError({ statusCode: 401, statusMessage: "Non authentifie" });
  }

  const q = normalize(String(getQuery(event).q ?? ""));
  if (!q) return [];

  const { data, error } = await supabase
    .from("recipes")
    .select("id, ingredients")
    .eq("user_id", user.id);

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  return (data || [])
    .filter((r: any) =>
      (r.ingredients || []).some((i: any) => normalize(typeof i === "string" ? i : i?.item || "").includes(q))
    )
    .map((r: any) => r.id);
});
