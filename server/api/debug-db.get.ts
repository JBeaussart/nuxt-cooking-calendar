export default defineEventHandler(() => {
  throw createError({ statusCode: 404, statusMessage: "Page non trouvée" });
});
