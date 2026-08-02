// Recherche par ingredient : /api/recipes ne renvoie plus les ingredients
// (payload trop lourd a chaque visite), donc on ne les charge que lorsqu'une
// recherche est reellement en cours, et on ne renvoie que les IDs qui matchent.
import { normalizeLabel as normalize } from "~/shared/utils/ingredientKey";

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
