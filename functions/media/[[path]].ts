type PagesContext = {
  request: Request;
  env: { MEDIA: any };
  params: { path?: string | string[] };
};

function getPathParam(path: string | string[] | undefined) {
  if (Array.isArray(path)) return path.join("/");
  return String(path || "");
}

function contentTypeFallback(key: string) {
  const lower = key.toLowerCase();

  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".pdf")) return "application/pdf";

  return "application/octet-stream";
}

export const onRequestGet = async ({ env, params }: PagesContext) => {
  const key = decodeURIComponent(getPathParam(params.path)).replace(/^\/+/, "");

  if (!key || !key.startsWith("uploads/")) {
    return new Response("Not found", { status: 404 });
  }

  const object = await env.MEDIA.get(key);

  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();

  const contentType =
    object.httpMetadata?.contentType ||
    contentTypeFallback(key);

  headers.set("content-type", contentType);
  headers.set("cache-control", "public, max-age=31536000, immutable");

  if (object.httpEtag) {
    headers.set("etag", object.httpEtag);
  }

  return new Response(object.body, { headers });
};