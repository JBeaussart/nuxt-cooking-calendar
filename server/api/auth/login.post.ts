import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: "Email et mot de passe requis" });
  }

  const config = useRuntimeConfig();
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw createError({ statusCode: 401, statusMessage: error.message });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  const maxAge = 60 * 60 * 24 * 30;
  const secure = config.public.supabaseUrl.startsWith("https://") ? "; Secure" : "";

  appendHeader(event, "Set-Cookie", `sb-access-token=${data.session.access_token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`);
  appendHeader(event, "Set-Cookie", `sb-refresh-token=${data.session.refresh_token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`);

  return {
    user: { ...data.user, role: profile?.user_role || "free" },
    message: "Connexion réussie",
  };
});
