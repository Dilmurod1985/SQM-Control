# Supabase setup

1) Install packages

```bash
npm install @supabase/supabase-js @supabase/ssr
```

2) Environment variables

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=https://mezbzuzregsqigvckyvi.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_tpUKSPy-ZqLteRvxM4Ow_Q_PhqQw9pZ
```

3) Files

helpers are in `utils/supabase/{server,client,middleware}.ts`.

4) Middleware

Root `middleware.ts` calls `utils/supabase/middleware.createClient` to keep session cookies refreshed.

5) Usage examples

- Server page: `app/supabase-example/page.tsx` uses server.createClient + cookies.
- Client component: `app/supabase-example/client/PageClient.tsx` uses client.createClient.

6) Notes

- Do not store secret service role keys in `NEXT_PUBLIC_*`.
- Run `npm install` locally before building.
- If you use Edge runtime for routes that use server-only libs, set `export const runtime = 'nodejs'` in the route.

7) Optional: add agent skills

```bash
npx skills add supabase/agent-skills
```

If you want, I can add a root `middleware.ts` that only matches specific paths or add an API helper for auth refresh.
