import type { ShoppingTotalItem } from "~/types/shopping";

export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const { items } = await readBody<{ items: ShoppingTotalItem[] }>(event);
  if (!Array.isArray(items)) throw createError({ statusCode: 400, statusMessage: "Items requis" });

  const cleaned: ShoppingTotalItem[] = items.map((i) => ({
    item: String(i.item || "").trim(),
    unit: String(i.unit || "").trim(),
    checked: !!i.checked,
    ...(Array.isArray(i.checkedOccurrences)
      ? {
          checkedOccurrences: [...new Set(
            i.checkedOccurrences
              .map((occurrence) => String(occurrence || "").trim())
              .filter((occurrence) => !!occurrence),
          )],
        }
      : {}),
    ...(Number.isFinite(Number(i.quantity)) && i.quantity !== null ? { quantity: Number(i.quantity) } : {}),
    ...(Array.isArray(i.recipes)
      ? {
          recipes: i.recipes
            .map((r) => String(r || "").trim())
            .filter((r) => !!r),
        }
      : { recipes: [] }),
  }));

  await supabase
    .from("shopping_totals")
    .upsert({ user_id: user.id, data: { items: cleaned } }, { onConflict: "user_id" });

  return { ok: true };
});
