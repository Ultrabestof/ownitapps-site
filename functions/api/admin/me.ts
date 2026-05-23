export async function onRequest(context: any) {
  const { request, env } = context;

  const email =
    request.headers.get("CF-Access-Authenticated-User-Email") ||
    request.headers.get("cf-access-authenticated-user-email") ||
    null;

  let dbStatus = "missing";
  let mediaStatus = "missing";

  try {
    if (env.DB) {
      await env.DB.prepare("SELECT name FROM sqlite_master WHERE type = 'table' LIMIT 1").first();
      dbStatus = "connected";
    }
  } catch (error) {
    dbStatus = "error";
  }

  try {
    if (env.MEDIA) {
      mediaStatus = "bound";
    }
  } catch (error) {
    mediaStatus = "error";
  }

  return Response.json({
    ok: true,
    app: "OwnitApps Admin API",
    endpoint: "/api/admin/me",
    authenticatedEmail: email,
    bindings: {
      DB: dbStatus,
      MEDIA: mediaStatus
    },
    message: "Cloudflare Pages Functions are active."
  });
}
