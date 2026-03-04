export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const { items } = await readBody(event);
  if (!Array.isArray(items)) throw createError({ statusCode: 400, statusMessage: "Items requis" });

  const cleaned = items.map((i: any) => ({
    item: String(i.item || "").trim(),
    unit: String(i.unit || "").trim(),
    checked: !!i.checked,
    ...(Number.isFinite(Number(i.quantity)) && i.quantity !== null ? { quantity: Number(i.quantity) } : {}),
  }));

  await supabase
    .from("shopping_totals")
    .upsert({ user_id: user.id, data: { items: cleaned } }, { onConflict: "user_id" });

  return { ok: true };
});
