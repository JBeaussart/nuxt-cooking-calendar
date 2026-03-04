import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  // Supprimer les données utilisateur
  await Promise.all([
    supabase.from("planning").delete().eq("user_id", user.id),
    supabase.from("reception").delete().eq("user_id", user.id),
    supabase.from("shopping_totals").delete().eq("user_id", user.id),
    supabase.from("shopping_custom").delete().eq("user_id", user.id),
    supabase.from("recipes").delete().eq("user_id", user.id),
  ]);

  // Supprimer le compte via le service role (nécessite SUPABASE_SERVICE_ROLE_KEY)
  const config = useRuntimeConfig();
  if (config.supabaseServiceRoleKey) {
    const adminClient = createClient(config.public.supabaseUrl, config.supabaseServiceRoleKey);
    await adminClient.auth.admin.deleteUser(user.id);
  }

  const past = "Thu, 01 Jan 1970 00:00:00 GMT";
  appendHeader(event, "Set-Cookie", `sb-access-token=; Path=/; Expires=${past}; HttpOnly; SameSite=Lax`);
  appendHeader(event, "Set-Cookie", `sb-refresh-token=; Path=/; Expires=${past}; HttpOnly; SameSite=Lax`);

  return { ok: true };
});
