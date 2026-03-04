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

  const fetchProfile = async (force = false) => {
    if (!user.value) {
      profile.value = null;
      return;
    }
    // Skip if already loaded for this user
    if (!force && profile.value?.id === user.value.id) return;
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.value.id)
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
