# OwnitApps Cloudflare Functions Phase 2

This patch adds the first real Cloudflare Pages Functions API layer for the OwnitApps dashboard.

## Added routes

- `GET /api/admin/me`
- `GET /api/admin/posts`
- `POST /api/admin/posts`
- `GET /api/admin/posts/:id-or-slug`
- `PUT /api/admin/posts/:id-or-slug`
- `DELETE /api/admin/posts/:id-or-slug`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `GET /api/admin/products/:id-or-slug`
- `PUT /api/admin/products/:id-or-slug`
- `DELETE /api/admin/products/:id-or-slug`
- `POST /api/admin/media/upload`

## Required bindings

`wrangler.jsonc` should already contain:

```json
{
  "d1_databases": [{ "binding": "DB", "database_name": "ownitapps_db" }],
  "r2_buckets": [{ "binding": "MEDIA", "bucket_name": "ownitapps-media" }]
}
```

## Next after deploy

Protect these paths with Cloudflare Access:

- `/admin/*`
- `/api/admin/*`

Allow only your admin email.

## Test after Cloudflare deploy

Open:

```text
https://ownitapps.com/api/admin/me
```

If Cloudflare Access is configured, the response should include the authenticated email.
