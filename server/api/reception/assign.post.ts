export default defineEventHandler(async (event) => {
  const { user, supabase, userRole } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  if (!isPremiumOrAdmin(userRole)) throw createError({ statusCode: 403, statusMessage: "Accès réservé aux utilisateurs Premium" });

  const { slot, id } = await readBody(event);
  const validSlots = ["aperitif", "entree", "plat", "dessert"];
  if (!slot || !validSlots.includes(slot)) throw createError({ statusCode: 400, statusMessage: "Slot invalide" });

  const { data: existing } = await supabase
    .from("reception")
    .select("data")
    .eq("user_id", user.id)
    .single();

  const currentData = existing?.data || {};
  const fieldMap: Record<string, string> = {
    aperitif: "aperitifId",
    entree: "entreeId",
    plat: "platId",
    dessert: "dessertId",
  };

  currentData[fieldMap[slot]] = id || null;

  const { error } = await supabase
    .from("reception")
    .upsert({ user_id: user.id, data: currentData }, { onConflict: "user_id" });

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });
  return { ok: true };
});
