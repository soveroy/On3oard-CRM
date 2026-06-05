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
