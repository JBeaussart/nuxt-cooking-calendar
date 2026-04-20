// Middleware global : redirige vers /login si non connecté sur les routes protégées
export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ["/", "/login", "/signup"];
  if (publicRoutes.includes(to.path)) return;

  const user = useSupabaseUser();
  if (user.value) return;

  // On client navigation, session hydration can be briefly delayed.
  // Validate with Supabase before redirecting to avoid false negatives.
  const supabase = useSupabaseClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return navigateTo("/login");
});
