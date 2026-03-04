// Middleware global : redirige vers /login si non connecté sur les routes protégées
export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ["/", "/login", "/signup"];
  if (publicRoutes.includes(to.path)) return;

  const user = useSupabaseUser();
  if (!user.value) {
    return navigateTo("/login");
  }
});
