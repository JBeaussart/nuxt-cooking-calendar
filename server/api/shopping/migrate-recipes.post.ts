import { recomputeShoppingTotals } from "~/server/utils/shopping";

export default defineEventHandler(async (event) => {
  const { user, supabase } = await getServerUser(event);
  if (!user || !supabase) throw createError({ statusCode: 401, statusMessage: "Non authentifié" });

  const items = await recomputeShoppingTotals(user.id, supabase);
  return { ok: true, migrated: items.length };
});
