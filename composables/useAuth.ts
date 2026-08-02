// Composable centralisé pour l'authentification
export const useAuth = () => {
  const user = useSupabaseUser();
  const supabase = useSupabaseClient();

  const logout = async () => {
    await supabase.auth.signOut();
    await navigateTo("/login");
  };

  return {
    user,
    logout,
  };
};
