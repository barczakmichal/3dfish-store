# treefish - Sklep z akcesoriami wedkarskimi

Sklep internetowy z akcesoriami wedkarskimi drukowanymi 3D. Next.js 16 + Prisma 7 + PostgreSQL (Neon) + Stripe + NextAuth.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbarczakmichal%2Ftreefish-store&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D&env=NEXTAUTH_SECRET,ADMIN_PASSWORD&envDescription=NEXTAUTH_SECRET%3A%20wpisz%20dowolny%20losowy%20ciag%20(np.%20moj-tajny-klucz-123).%20ADMIN_PASSWORD%3A%20haslo%20do%20panelu%20admina.&project-name=treefish-store&repository-name=treefish-store)

## Szybki start (1 klik)

1. Kliknij przycisk **Deploy with Vercel** powyzej
2. Zaloguj sie do Vercel (lub stworz darmowe konto przez GitHub)
3. Baza danych PostgreSQL zostanie utworzona automatycznie
4. Wpisz dowolne `NEXTAUTH_SECRET` (np. `moj-sekret-123`) i `ADMIN_PASSWORD`
5. Kliknij Deploy — sklep zostanie zbudowany i wdrozony automatycznie

## Zmienne srodowiskowe

| Zmienna | Opis | Wymagana |
|---------|------|----------|
| `POSTGRES_PRISMA_URL` | Auto-ustawiane przez Vercel Postgres | Auto |
| `DATABASE_URL` | Connection string PostgreSQL (alternatywa do Vercel Postgres) | Nie* |
| `NEXTAUTH_SECRET` | Dowolny tajny ciag znakow do sesji | Tak |
| `ADMIN_PASSWORD` | Haslo do panelu admina `/admin` | Tak |
| `STRIPE_SECRET_KEY` | Klucz API Stripe (opcjonalny na start) | Nie |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Nie |

\* `DATABASE_URL` jest wymagany tylko jesli nie uzywasz Vercel Postgres (przycisk Deploy ustawia baze automatycznie).

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Next.js App Router (server components + API routes)
- **Baza danych:** PostgreSQL via Neon serverless + Prisma 7
- **Platnosci:** Stripe (opcjonalne)
- **Auth:** NextAuth (admin password-based)
- **Hosting:** Vercel (free tier)
