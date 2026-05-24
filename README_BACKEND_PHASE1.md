# OwnitApps Cloudflare Backend Phase 1

Copy these files into the root of your `ownitapps-site` project.

Resources already created:

- D1 database: `ownitapps_db`
- D1 database ID: `852f18dd-5abb-4d2b-a658-d7621addf12a`
- R2 bucket: `ownitapps-media`

## 1. Apply the D1 migration

```powershell
npx.cmd wrangler d1 migrations apply ownitapps_db --remote
```

## 2. Test build

```powershell
npm.cmd run build
```

## 3. Commit and push

```powershell
git add wrangler.toml migrations functions src/lib/db
git commit -m "Add Cloudflare D1 R2 backend foundation"
git push
```

## 4. Add Cloudflare Pages bindings if needed

Cloudflare Pages can use bindings from Wrangler config or dashboard. If the dashboard does not detect them, add them manually:

Pages project → Settings → Bindings

- D1 binding name: `DB`, database: `ownitapps_db`
- R2 binding name: `MEDIA`, bucket: `ownitapps-media`
- Environment variable: `ALLOWED_ADMIN_EMAIL`, value: your admin email

## 5. Protect admin paths with Cloudflare Access

Protect:

- `ownitapps.com/admin/*`
- `ownitapps.com/api/admin/*`

Allow only your email.
