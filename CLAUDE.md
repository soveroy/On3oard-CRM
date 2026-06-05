# On3oard CRM — Project Notes

Lean dark-mode CRM for On3oard Pte Ltd (Singapore AI Strategy & Automation consultancy).
Built per `../docs/superpowers/plans/2026-06-05-on3oard-crm.md`.

## Stack
Next.js 14 (App Router, TS strict) · Tailwind + shadcn/ui · Supabase (Postgres/Auth/RLS/Realtime) ·
Anthropic Claude (`claude-sonnet-4-20250514`, server-only) · Recharts · @dnd-kit · Zod ·
Vitest + Testing Library · Playwright · Cloudflare Pages.

## Brand
Primary `#ff914d`, accent `#f93f58`, navy base `#0D1B2A`. Display font Syne, body DM Sans.
Dark mode only in v1. Logo: https://i.postimg.cc/28BygFTw/Logov3.png

## Architecture rules
- Server Components by default; Client Components only at interactive leaves (Kanban, charts, forms, search).
- All writes go through `app/(app)/<module>/actions.ts` Server Actions, validated by Zod schemas in `lib/validation/*`.
- `lib/domain/*` is pure, dependency-free, fully unit-tested logic (no Supabase, no React).
- AI runs only in `app/api/ai/*` route handlers. `ANTHROPIC_API_KEY` is server-only, never `NEXT_PUBLIC`.
- PDPA: `do_not_contact` flag enforced in UI; no PII in route params (UUIDs only).

## Commands
- `npm run dev` · `npm run build` · `npm run typecheck`
- `npm run test` (vitest) · `npm run e2e` (playwright)

## Database (Supabase)
Schema lives in `supabase/migrations/` and is applied in order:
1. `0001_init.sql` — tables + indexes
2. `0002_rls.sql` — row level security (single-tenant v1: any authenticated user)
3. `0003_triggers.sql` — updated_at, stage_changed_at, last_contacted_at, auth→users provisioning
4. `0004_settings.sql` — app_settings (added in Phase 11)

`lib/supabase/types.ts` is **hand-authored** to mirror the schema so the app typechecks offline.
When a live project exists, regenerate it:
`npx supabase gen types typescript --project-id <REF> --schema public > lib/supabase/types.ts`

### Applying to a live project (credential hand-off — NOT yet done)
1. Create a Supabase project. Put the URL + anon key + service role key into `.env.local`.
2. Apply migrations: either `supabase link` + `supabase db push`, or paste each file (0001→0003) into
   the SQL editor in order.
3. (Dev only) run `supabase/seed.sql` for the PNH + NUP demo data. **Do NOT seed production.**
4. Auth → URL Configuration: add `http://localhost:3000/auth/callback` and the Cloudflare URL to the
   redirect allow-list. Enable the Email (magic link) provider.
5. Add `ANTHROPIC_API_KEY` to `.env.local` (and to Cloudflare Pages env as an encrypted var at deploy).

### Current mode
Built in **offline/local-buildable** mode: `.env.local` holds placeholder values so `npm run build`
and `npm run dev` work without live services. Live auth, AI streaming, and deploy smoke tests are
pending the credential hand-off above.

## Cloudflare Pages deploy

### Build & deploy
- Build command: `npm run pages:build` — runs `npx @cloudflare/next-on-pages` and produces `.vercel/output/static`.
- Deploy: `npx wrangler pages deploy .vercel/output/static`
- `wrangler.toml` sets `compatibility_flags = ["nodejs_compat"]`, which is required by the two AI route handlers that declare `export const runtime = 'nodejs'`.

### KNOWN ISSUE — adapter version mismatch
`@cloudflare/next-on-pages@1.13.16` peer-requires Next ≥ 14.3 (this project uses 14.2.35) and is
deprecated upstream in favour of the OpenNext Cloudflare adapter (`@opennextjs/cloudflare`).
**Before first deploy, either:**
1. Bump Next.js to ≥ 14.3 (`npm install next@latest`), or
2. Migrate to the OpenNext adapter (`npm install @opennextjs/cloudflare` and follow its docs).

Validate that `npm run pages:build` succeeds without errors before deploying.

### Environment variables
Set these in the Cloudflare Pages dashboard (Settings → Environment variables).
Copy names from `.env.local.example`:

| Variable | Type | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Plain | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Plain | Supabase anon/public key |
| `NEXT_PUBLIC_SITE_URL` | Plain | The Pages deployment URL (e.g. `https://on3oard-crm.pages.dev`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Encrypted secret | Supabase service role key |
| `ANTHROPIC_API_KEY` | Encrypted secret | Anthropic API key |

### Supabase Auth redirect allow-list
After deploying, add the Pages URL (e.g. `https://on3oard-crm.pages.dev`) to:
Supabase dashboard → Auth → URL Configuration → Redirect URLs allow-list.
