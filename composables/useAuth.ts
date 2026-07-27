// Composable centralisé pour l'authentification
export const useAuth = () => {
  const user = useSupabaseUser();
  const supabase = useSupabaseClient();

  const profile = useState<{
    id: string;
    user_role: string;
    email?: string;
    created_at?: string;
  } | null>("profile", () => null);

  const userRole = computed(() => profile.value?.user_role || "free");
  const isPremium = computed(() =>
    ["premium", "admin"].includes(userRole.value)
  );
  const isAdmin = computed(() => userRole.value === "admin");
  const isFree = computed(
    () => !["premium", "admin"].includes(userRole.value)
  );

  const fetchProfile = async (force = false, userId?: string) => {
    // useSupabaseUser() n'est mis à jour que par l'écouteur onAuthStateChange :
    // juste après une validation de session via getSession(), user.value peut
    // encore être vide. On accepte donc un id explicite dans ce cas précis.
    const id = userId || user.value?.id;
    if (!id) {
      profile.value = null;
      return;
    }
    // Skip if already loaded for this user
    if (!force && profile.value?.id === id) return;
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", id)
      .single();
    profile.value = data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    profile.value = null;
    await navigateTo("/login");
  };

  return {
    user,
    profile,
    userRole,
    isPremium,
    isAdmin,
    isFree,
    fetchProfile,
    logout,
  };
};
