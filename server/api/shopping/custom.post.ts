export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const body = await readBody(event);
  const { action, item, quantity, id } = body;

  if (action === "add") {
    const { data, error } = await supabase
      .from("shopping_custom")
      .insert({ user_id: user.id, item, quantity: quantity || 0, checked: false })
      .select("*")
      .single();
    if (error) throw createError({ statusCode: 500, statusMessage: error.message });
    return { ok: true, item: data };
  }

  if (action === "delete") {
    await supabase.from("shopping_custom").delete().eq("id", id).eq("user_id", user.id);
    return { ok: true };
  }

  if (action === "toggle") {
    const { data: current } = await supabase
      .from("shopping_custom")
      .select("checked")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    await supabase.from("shopping_custom").update({ checked: !current?.checked }).eq("id", id).eq("user_id", user.id);
    return { ok: true };
  }

  throw createError({ statusCode: 400, statusMessage: "Action invalide" });
});
