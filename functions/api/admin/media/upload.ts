type PagesContext = { request: Request; env: { DB: any; MEDIA: any } };

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(init.headers || {}),
    },
  });
}

function safeFileName(name: string) {
  const cleaned = String(name || 'upload')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90);
  return cleaned || 'upload';
}

export const onRequestPost = async ({ request, env }: PagesContext) => {
  const form = await request.formData().catch(() => null);
  if (!form) return json({ ok: false, error: 'multipart/form-data required' }, { status: 400 });

  const file = form.get('file');
  if (!(file instanceof File)) {
    return json({ ok: false, error: 'file field is required' }, { status: 400 });
  }

  const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'];
  if (!allowed.includes(file.type)) {
    return json({ ok: false, error: `Unsupported file type: ${file.type}` }, { status: 415 });
  }

  const id = crypto.randomUUID();
  const filename = safeFileName(file.name);
  const key = `uploads/${new Date().toISOString().slice(0, 10)}/${id}-${filename}`;

  await env.MEDIA.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type || 'application/octet-stream',
    },
    customMetadata: {
      originalName: file.name,
    },
  });

  const alt = String(form.get('alt') || '').trim() || null;
  const url = `r2://ownitapps-media/${key}`;

  await env.DB.prepare(
    `INSERT INTO media (id, filename, url, alt, mime_type, size, r2_key)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, file.name, url, alt, file.type, file.size, key).run();

  return json({
    ok: true,
    media: {
      id,
      filename: file.name,
      mime_type: file.type,
      size: file.size,
      r2_key: key,
      url,
      alt,
    },
    note: 'Stored in R2. Add a public R2 custom domain later if you want public image URLs.',
  }, { status: 201 });
};
