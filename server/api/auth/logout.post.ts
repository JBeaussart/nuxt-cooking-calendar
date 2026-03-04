export default defineEventHandler(async (event) => {
  const past = "Thu, 01 Jan 1970 00:00:00 GMT";
  appendHeader(event, "Set-Cookie", `sb-access-token=; Path=/; Expires=${past}; HttpOnly; SameSite=Lax`);
  appendHeader(event, "Set-Cookie", `sb-refresh-token=; Path=/; Expires=${past}; HttpOnly; SameSite=Lax`);
  return { ok: true };
});
