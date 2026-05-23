function decodeBase64Url(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}

function getCookie(request: Request, name: string) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp("(^|; )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function readJwtPayload(token: string | null) {
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const payload = JSON.parse(decodeBase64Url(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

export async function onRequest(context: any) {
  const { request, env } = context;

  const emailHeader =
    request.headers.get("Cf-Access-Authenticated-User-Email") ||
    request.headers.get("CF-Access-Authenticated-User-Email") ||
    request.headers.get("cf-access-authenticated-user-email") ||
    null;

  const accessJwt =
    request.headers.get("Cf-Access-Jwt-Assertion") ||
    request.headers.get("CF-Access-Jwt-Assertion") ||
    request.headers.get("cf-access-jwt-assertion") ||
    null;

  const authorizationCookie = getCookie(request, "CF_Authorization");

  const headerPayload = readJwtPayload(accessJwt);
  const cookiePayload = readJwtPayload(authorizationCookie);

  const authenticatedEmail =
    emailHeader ||
    headerPayload?.email ||
    cookiePayload?.email ||
    null;

  let dbStatus = "missing";
  let mediaStatus = "missing";

  try {
    if (env.DB) {
      await env.DB.prepare("SELECT name FROM sqlite_master WHERE type = 'table' LIMIT 1").first();
      dbStatus = "connected";
    }
  } catch {
    dbStatus = "error";
  }

  try {
    if (env.MEDIA) {
      mediaStatus = "bound";
    }
  } catch {
    mediaStatus = "error";
  }

  return Response.json({
    ok: true,
    app: "OwnitApps Admin API",
    endpoint: "/api/admin/me",
    accessProtected: Boolean(accessJwt || authorizationCookie || emailHeader),
    authenticatedEmail,
    accessSignals: {
      hasEmailHeader: Boolean(emailHeader),
      hasJwtHeader: Boolean(accessJwt),
      hasAuthorizationCookie: Boolean(authorizationCookie),
      jwtHeaderEmailFound: Boolean(headerPayload?.email),
      cookieEmailFound: Boolean(cookiePayload?.email)
    },
    bindings: {
      DB: dbStatus,
      MEDIA: mediaStatus
    },
    message: "Cloudflare Pages Functions are active and Access is protecting this endpoint."
  });
}
