# On3oard CRM — Project Notes

Lean dark-mode CRM for On3oard Pte Ltd (Singapore AI Strategy & Automation consultancy).
Built per `../docs/superpowers/plans/2026-06-05-on3oard-crm.md`.

## Stack
Next.js 14 (App Router, TS strict) · Tailwind + shadcn/ui · Supabase (Postgres/Auth/RLS/Realtime) ·
Anthropic Claude (`claude-sonnet-4-20250514`, server-only) · Recharts · @dnd-kit · Zod ·
Vitest + Testing Library · Playwright · Cloudflare Workers (via OpenNext).

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
4. Auth → URL Configuration: add `http://localhost:3030/auth/callback` and the Cloudflare Worker URL to the
   redirect allow-list. Enable the Email (magic link) provider.
5. Add `ANTHROPIC_API_KEY` to `.env.local` (and as a Cloudflare Worker secret via `wrangler secret put` at deploy).

### Current mode
Live: Supabase project provisioned, migrations 0001–0008 applied, and the app is deployed to
Cloudflare Workers (see below). `.env.local` holds real keys for local dev.

## Cloudflare Workers deploy (via OpenNext)

The project deploys to a **Cloudflare Worker** (not Cloudflare Pages) using the OpenNext adapter
(`@opennextjs/cloudflare`). `@cloudflare/next-on-pages` was tried first but is deprecated upstream
and peer-requires Next ≥ 14.3 — a version that doesn't exist (Next jumped straight from 14.2 to 15).
OpenNext supports Next 14.2 directly, so it replaced next-on-pages entirely.

**Live URL:** https://on3oard-crm.on3oard.workers.dev

### Build & deploy
```bash
npm run cf:build     # opennextjs-cloudflare build --dangerouslyUseUnsupportedNextVersion
                      # produces .open-next/worker.js + .open-next/assets
npx wrangler deploy   # uploads the worker + assets to Cloudflare
```
- `npm run cf:preview` — run the built worker locally via Miniflare before deploying.
- `wrangler.toml`: `main = ".open-next/worker.js"`, `[assets]` binds `.open-next/assets`,
  `compatibility_flags = ["nodejs_compat"]` (required by the AI route handlers that declare
  `export const runtime = 'nodejs'`).
- `.open-next/` and `.wrangler/` are build artifacts — gitignored, never commit them.

### KNOWN ISSUE — unsupported Next.js version
Next 14.2.35 is past OpenNext's officially supported window (majors are supported ~2 years from
release; 14.2 predates that cutoff for this adapter version). The build only proceeds because
`cf:build` passes `--dangerouslyUseUnsupportedNextVersion`. It builds and runs correctly, but the
clean long-term fix is upgrading to Next 15 — treat that as a separate, deliberate migration, not
a quick patch.

### KNOWN ISSUE — Windows build warning
OpenNext prints `OpenNext is not fully compatible with Windows` and recommends WSL. The build has
succeeded from a native Windows shell in practice, but if a future build fails with an obscure
error, try it under WSL before deep-diving.

### Environment variables / secrets
`NEXT_PUBLIC_*` vars are inlined into the client bundle **at build time** — editing them in
`.env.local` requires an `npm run cf:build` + `npx wrangler deploy` to take effect; setting them
as a Worker secret alone does nothing for the client bundle. Server-only vars (no `NEXT_PUBLIC_`
prefix) are read at runtime from Worker secrets.

Set secrets with:
```bash
echo "<value>" | npx wrangler secret put <NAME>
```

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Baked in at build time |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Baked in at build time |
| `NEXT_PUBLIC_SITE_URL` | Baked in at build time — must equal the deployed Worker URL for magic-link redirects to work |
| `SUPABASE_SERVICE_ROLE_KEY` | Runtime secret |
| `ANTHROPIC_API_KEY` | Runtime secret |
| `OPENAI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` / `DEEPSEEK_API_KEY` | Runtime secrets, multi-provider AI |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Runtime secrets |
| `CRM_INTEGRATION_TOKEN` | Runtime secret |

All secrets above are already set on the live Worker. None are committed to git.

### Supabase Auth redirect allow-list
Add the Worker URL's callback route to:
Supabase dashboard → Auth → URL Configuration → Redirect URLs allow-list:
`https://on3oard-crm.on3oard.workers.dev/auth/callback`

### Canonical deployment
`https://on3oard-crm.on3oard.workers.dev` is the standardized production URL — use this everywhere
(bookmarks, Supabase redirect allow-list, docs, mobile).

### Vercel deployment — being decommissioned
`on3oard-crm.vercel.app` was the original deployment; Cloudflare Workers has replaced it as of
2026-08-05. It is still technically live (not yet disconnected — the Vercel account that owns it
is not accessible from this machine's CLI login, so the GitHub↔Vercel integration or the Vercel
project itself needs to be removed manually by whoever holds that account). Once disconnected,
delete this section.
