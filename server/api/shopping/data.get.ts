import type { ShoppingDataResponse, ShoppingTotalItem } from "~/types/shopping";

export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const [{ data: savedRow }, { data: custom }] = await Promise.all([
    supabase.from("shopping_totals").select("data").eq("user_id", user.id).maybeSingle(),
    supabase.from("shopping_custom").select("*").eq("user_id", user.id),
  ]);

  const totals: ShoppingTotalItem[] = Array.isArray(savedRow?.data?.items) ? savedRow.data.items : [];

  return { totals, custom: custom || [] } satisfies ShoppingDataResponse;
});
