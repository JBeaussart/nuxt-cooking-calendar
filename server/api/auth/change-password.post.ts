import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const { currentPassword, newPassword } = await readBody(event);
  const { user, supabase } = await getServerUser(event);

  if (!user || !supabase) {
    throw createError({ statusCode: 401, statusMessage: "Non authentifié" });
  }

  // Vérifier le mot de passe actuel
  const config = useRuntimeConfig();
  const baseClient = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey);
  const { error: signInError } = await baseClient.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    throw createError({ statusCode: 400, statusMessage: "Mot de passe actuel incorrect" });
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message });
  }

  return { message: "Mot de passe modifié avec succès" };
});
