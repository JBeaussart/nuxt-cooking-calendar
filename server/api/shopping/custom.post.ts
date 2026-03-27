export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const body = await readBody(event);
  const { action, item, quantity, id, checked } = body;

  if (action === "add") {
    const payloadWithQuantity = { user_id: user.id, item, quantity: quantity || 0, checked: false };
    const { data, error } = await supabase.from("shopping_custom").insert(payloadWithQuantity).select("*").single();

    if (!error) return { ok: true, item: data };

    // Compatibility fallback for databases that do not have `quantity` on shopping_custom.
    if (error.message.includes("Could not find the 'quantity' column")) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("shopping_custom")
        .insert({ user_id: user.id, item, checked: false })
        .select("*")
        .single();
      if (fallbackError) throw createError({ statusCode: 500, statusMessage: fallbackError.message });
      return { ok: true, item: fallbackData };
    }

    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  if (action === "delete") {
    await supabase.from("shopping_custom").delete().eq("id", id).eq("user_id", user.id);
    return { ok: true };
  }

  if (action === "clear") {
    await supabase.from("shopping_custom").delete().eq("user_id", user.id);
    return { ok: true };
  }

  if (action === "toggle") {
    // Client sends the desired checked state directly — no SELECT needed
    await supabase.from("shopping_custom").update({ checked: !!checked }).eq("id", id).eq("user_id", user.id);
    return { ok: true };
  }

  throw createError({ statusCode: 400, statusMessage: "Action invalide" });
});
