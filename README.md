# 3DFish - Sklep z akcesoriami wedkarskimi

Sklep internetowy z akcesoriami wedkarskimi drukowanymi 3D. Next.js 16 + Prisma 7 + PostgreSQL (Neon) + Stripe + NextAuth.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbarczakmichal%2F3dfish-store&env=DATABASE_URL,NEXTAUTH_SECRET,ADMIN_PASSWORD&envDescription=Konfiguracja%20sklepu%203DFish&envLink=https%3A%2F%2Fgithub.com%2Fbarczakmichal%2F3dfish-store%23zmienne-srodowiskowe&project-name=3dfish-store&repository-name=3dfish-store)

## Szybki start

1. Kliknij przycisk **Deploy with Vercel** powyzej
2. Stworz darmowa baze danych na [neon.tech](https://neon.tech) i skopiuj `DATABASE_URL`
3. Wypelnij zmienne srodowiskowe (szczegoly ponizej)
4. Vercel zbuduje i wdrozy sklep automatycznie
5. Po wdrozeniu uruchom migracje: `npx prisma migrate deploy`
6. Zaladuj produkty: `npx prisma db seed`

## Zmienne srodowiskowe

| Zmienna | Opis | Wymagana |
|---------|------|----------|
| `DATABASE_URL` | Connection string PostgreSQL (Neon free tier) | Tak |
| `NEXTAUTH_SECRET` | Secret do sesji (generuj: `openssl rand -base64 32`) | Tak |
| `ADMIN_PASSWORD` | Haslo do panelu admina `/admin` | Tak |
| `STRIPE_SECRET_KEY` | Klucz API Stripe (opcjonalny na start) | Nie |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Nie |

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Next.js App Router (server components + API routes)
- **Baza danych:** PostgreSQL via Neon serverless + Prisma 7
- **Platnosci:** Stripe (opcjonalne)
- **Auth:** NextAuth (admin password-based)
- **Hosting:** Vercel (free tier)
