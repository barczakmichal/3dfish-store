# Product Typed Photos + Makerworld Licenses Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Per-product Makerworld license capture with a feature-flagged server-side publication gate, plus typed photo slots (marketing / packshot / real print) on the storefront and admin.

**Architecture:** Extend the existing `Product` model (which already has `sourceUrl` = Makerworld page, `sourceFileUrl`, `printedImageUrl` = real-print photo) with license fields and two new typed image fields (`marketingImageUrl`, `packshotImageUrl`); `images String[]` stays as the untyped extra gallery. License→commercial mapping and the public-visibility `where` clause live in two small new `lib/` modules shared by all four public query sites. Create API rejects products without license data. Gate is off until `LICENSE_GATE_ENABLED=true`.

**Tech Stack:** Next.js 15 App Router, Prisma (postgresql), next-auth (getServerSession), Tailwind, vitest (added by this plan — repo has no test framework today).

**Spec:** `C:\projekty\paperclip\docs\superpowers\specs\2026-07-06-treefish-product-photos-licenses-design.md`

**Repo:** C:\projekty\3dfish-store (GitHub barczakmichal/3dfish-store, prod on VPS /opt/treefish). Work on a feature branch `feature/product-licenses`, NOT main.

**Spec→reality adjustments (already agreed):**
- `makerworldUrl` = existing `sourceUrl` column (no duplicate field).
- Photo typing = dedicated columns (`marketingImageUrl`, `packshotImageUrl`, existing `printedImageUrl`), matching the repo's existing one-field-per-special-photo convention; `images[]` = the OTHER bucket.
- Deploy to VPS is OUT of this plan — it rides with the pending SKL-147 deploy task (coordinated separately).

---

### Task 1: Vitest setup

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1:** `cd C:\projekty\3dfish-store && git checkout -b feature/product-licenses`

- [ ] **Step 2:** `npm install -D vitest` (add to devDependencies).

- [ ] **Step 3:** Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
})
```

- [ ] **Step 4:** Add script to `package.json`: `"test": "vitest run"`.

- [ ] **Step 5:** Sanity: create `lib/license.test.ts` with a trivial `import { describe, it, expect } from 'vitest'; describe('smoke', () => it('runs', () => expect(1).toBe(1)))`, run `npm test` → 1 passing. (This file is rewritten in Task 3.)

- [ ] **Step 6:** Commit: `git add package.json package-lock.json vitest.config.ts lib/license.test.ts && git commit -m "chore: add vitest"`

---

### Task 2: Prisma schema + migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<generated>/migration.sql`

- [ ] **Step 1:** Edit `prisma/schema.prisma` — add the enum above `model Product` and the new fields inside `Product` (after `printedImageUrl`):

```prisma
enum LicenseType {
  CC0
  CC_BY
  CC_BY_SA
  CC_BY_NC
  CC_BY_NC_SA
  CC_BY_ND
  CC_BY_NC_ND
  STANDARD_DIGITAL_FILE
  OWN_MODEL
  UNKNOWN
}
```

```prisma
  licenseType           LicenseType @default(UNKNOWN)
  commercialUseOverride Boolean?
  licenseVerifiedAt     DateTime?
  licenseVerifiedBy     String?
  marketingImageUrl     String?
  packshotImageUrl      String?
```

No stored `commercialUse` column — with only ~tens of products, computing visibility from `licenseType`/`commercialUseOverride` in the `where` clause (Task 4) is trivial and avoids a denormalization to keep in sync. (Deviation from spec §3.1, simpler and equivalent.)

- [ ] **Step 2: Generate the migration.** `prisma migrate dev` needs a database. Preferred: a throwaway local postgres from the paperclip repo's embedded binaries (works on this Windows machine, no Docker):

```bash
PGBIN=$(ls -d /c/projekty/paperclip/node_modules/.pnpm/@embedded-postgres+windows-x64@*/node_modules/@embedded-postgres/windows-x64/native/bin | head -1)
"$PGBIN/initdb" -D /c/Users/barcz/AppData/Local/Temp/treefish-mig-db -U postgres -A trust -E UTF8
"$PGBIN/pg_ctl" -D /c/Users/barcz/AppData/Local/Temp/treefish-mig-db -o "-p 55432" -l /c/Users/barcz/AppData/Local/Temp/treefish-mig-db/log.txt start
cd /c/projekty/3dfish-store
DATABASE_URL="postgresql://postgres@localhost:55432/postgres" npx prisma migrate dev --name product_license_and_typed_photos
"$PGBIN/pg_ctl" -D /c/Users/barcz/AppData/Local/Temp/treefish-mig-db stop
rm -rf /c/Users/barcz/AppData/Local/Temp/treefish-mig-db
```

Check first how the repo's existing `prisma/migrations/` are named/structured and whether `prisma.config.ts` overrides the datasource URL env var name — adapt `DATABASE_URL` accordingly (look at `prisma.config.ts` and `lib/prisma.ts`). If the embedded binaries path doesn't exist, fall back to hand-writing the migration folder (Prisma officially supports customized migrations): `mkdir prisma/migrations/20260706120000_product_license_and_typed_photos` with `migration.sql`:

```sql
CREATE TYPE "LicenseType" AS ENUM ('CC0', 'CC_BY', 'CC_BY_SA', 'CC_BY_NC', 'CC_BY_NC_SA', 'CC_BY_ND', 'CC_BY_NC_ND', 'STANDARD_DIGITAL_FILE', 'OWN_MODEL', 'UNKNOWN');
ALTER TABLE "Product" ADD COLUMN "licenseType" "LicenseType" NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN "commercialUseOverride" BOOLEAN,
  ADD COLUMN "licenseVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "licenseVerifiedBy" TEXT,
  ADD COLUMN "marketingImageUrl" TEXT,
  ADD COLUMN "packshotImageUrl" TEXT;
```

(Verify quoted table/column casing against an existing migration file before committing the hand-written variant.)

- [ ] **Step 3:** `npx prisma generate` → exit 0. `npx tsc --noEmit` → no NEW errors (note any pre-existing ones).

- [ ] **Step 4:** Commit: `git add prisma && git commit -m "feat(db): license fields + typed photo slots on Product"`

---

### Task 3: `lib/license.ts` — mapping + validation (TDD)

**Files:**
- Create: `lib/license.ts`
- Rewrite: `lib/license.test.ts`

- [ ] **Step 1: Failing tests** — replace `lib/license.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  commercialUseAllowed,
  effectiveCommercialUse,
  validateProductLicenseInput,
} from './license'

describe('commercialUseAllowed', () => {
  it.each([
    ['CC0', true], ['CC_BY', true], ['CC_BY_SA', true], ['OWN_MODEL', true],
    ['CC_BY_NC', false], ['CC_BY_NC_SA', false], ['CC_BY_NC_ND', false],
    ['CC_BY_ND', false], ['STANDARD_DIGITAL_FILE', false], ['UNKNOWN', false],
  ] as const)('%s → %s', (license, expected) => {
    expect(commercialUseAllowed(license)).toBe(expected)
  })
})

describe('effectiveCommercialUse', () => {
  it('override wins over mapping', () => {
    expect(effectiveCommercialUse('CC_BY_NC', true)).toBe(true)
    expect(effectiveCommercialUse('CC_BY', false)).toBe(false)
  })
  it('null override falls back to mapping', () => {
    expect(effectiveCommercialUse('CC_BY', null)).toBe(true)
    expect(effectiveCommercialUse('UNKNOWN', null)).toBe(false)
  })
})

describe('validateProductLicenseInput', () => {
  it('accepts sourceUrl + known license', () => {
    expect(validateProductLicenseInput({ sourceUrl: 'https://makerworld.com/en/models/123', licenseType: 'CC_BY' })).toBeNull()
  })
  it('accepts OWN_MODEL without sourceUrl', () => {
    expect(validateProductLicenseInput({ sourceUrl: null, licenseType: 'OWN_MODEL' })).toBeNull()
  })
  it('rejects missing licenseType', () => {
    expect(validateProductLicenseInput({ sourceUrl: 'https://makerworld.com/x', licenseType: undefined })).toMatch(/licencj/i)
  })
  it('rejects UNKNOWN license', () => {
    expect(validateProductLicenseInput({ sourceUrl: 'https://makerworld.com/x', licenseType: 'UNKNOWN' })).toMatch(/licencj/i)
  })
  it('rejects non-OWN_MODEL without sourceUrl', () => {
    expect(validateProductLicenseInput({ sourceUrl: null, licenseType: 'CC_BY' })).toMatch(/sourceUrl/i)
  })
  it('rejects invalid licenseType string', () => {
    expect(validateProductLicenseInput({ sourceUrl: 'https://x', licenseType: 'NOT_A_LICENSE' })).toMatch(/licencj/i)
  })
})
```

- [ ] **Step 2:** `npm test` → FAIL (module `./license` has no exports).

- [ ] **Step 3: Implement** `lib/license.ts`:

```ts
import type { LicenseType } from '@prisma/client'

export const LICENSE_TYPES = [
  'CC0', 'CC_BY', 'CC_BY_SA', 'CC_BY_NC', 'CC_BY_NC_SA',
  'CC_BY_ND', 'CC_BY_NC_ND', 'STANDARD_DIGITAL_FILE', 'OWN_MODEL', 'UNKNOWN',
] as const

// NC variants forbid selling prints. ND is conservatively blocked (a physical
// print can be argued to be a derivative). STANDARD_DIGITAL_FILE (Makerworld
// default) does not permit selling physical prints. Manual override exists for
// individually granted permissions.
const COMMERCIAL_OK: ReadonlySet<LicenseType> = new Set(['CC0', 'CC_BY', 'CC_BY_SA', 'OWN_MODEL'] as LicenseType[])

export function commercialUseAllowed(licenseType: LicenseType): boolean {
  return COMMERCIAL_OK.has(licenseType)
}

export function effectiveCommercialUse(licenseType: LicenseType, override: boolean | null | undefined): boolean {
  return override ?? commercialUseAllowed(licenseType)
}

export function isLicenseGateEnabled(): boolean {
  return process.env.LICENSE_GATE_ENABLED === 'true'
}

// Returns null when valid, otherwise a Polish error message for the 400 response.
export function validateProductLicenseInput(input: { sourceUrl?: string | null; licenseType?: string }): string | null {
  const { sourceUrl, licenseType } = input
  if (!licenseType || !LICENSE_TYPES.includes(licenseType as (typeof LICENSE_TYPES)[number]) || licenseType === 'UNKNOWN') {
    return 'Wymagane pole licenseType z odczytaną licencją modelu (np. CC_BY, CC_BY_NC, OWN_MODEL). Odczytaj licencję ze strony modelu na Makerworld.'
  }
  if (licenseType !== 'OWN_MODEL' && !sourceUrl) {
    return 'Wymagane pole sourceUrl (link do strony modelu, np. Makerworld) dla produktów z zewnętrznych modeli.'
  }
  return null
}
```

- [ ] **Step 4:** `npm test` → all pass.

- [ ] **Step 5:** Commit: `git add lib/license.ts lib/license.test.ts && git commit -m "feat: license mapping, gate flag and create-input validation"`

---

### Task 4: `lib/catalog.ts` — public visibility where-clause + apply to all public queries (TDD)

**Files:**
- Create: `lib/catalog.ts`, `lib/catalog.test.ts`
- Modify: `app/(shop)/page.tsx`, `app/(shop)/products/page.tsx`, `app/(shop)/products/[slug]/page.tsx` (both queries: page + generateMetadata), `app/sitemap.ts`

- [ ] **Step 1: Failing tests** `lib/catalog.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { publicProductWhere } from './catalog'

describe('publicProductWhere', () => {
  const OLD_ENV = process.env.LICENSE_GATE_ENABLED
  afterEach(() => { process.env.LICENSE_GATE_ENABLED = OLD_ENV })

  it('gate disabled → empty filter (behavior identical to today)', () => {
    process.env.LICENSE_GATE_ENABLED = 'false'
    expect(publicProductWhere()).toEqual({})
  })

  it('gate enabled → allows commercial licenses or explicit override', () => {
    process.env.LICENSE_GATE_ENABLED = 'true'
    expect(publicProductWhere()).toEqual({
      OR: [
        { commercialUseOverride: true },
        {
          commercialUseOverride: null,
          licenseType: { in: ['CC0', 'CC_BY', 'CC_BY_SA', 'OWN_MODEL'] },
        },
      ],
    })
  })
})
```

- [ ] **Step 2:** `npm test` → FAIL.

- [ ] **Step 3: Implement** `lib/catalog.ts`:

```ts
import type { Prisma } from '@prisma/client'
import { isLicenseGateEnabled } from './license'

// Server-side publication gate (spec §3.2). Spread into every PUBLIC product
// query's `where`. Admin queries must NOT use this.
export function publicProductWhere(): Prisma.ProductWhereInput {
  if (!isLicenseGateEnabled()) return {}
  return {
    OR: [
      { commercialUseOverride: true },
      {
        commercialUseOverride: null,
        licenseType: { in: ['CC0', 'CC_BY', 'CC_BY_SA', 'OWN_MODEL'] },
      },
    ],
  }
}
```

- [ ] **Step 4:** `npm test` → pass.

- [ ] **Step 5: Apply to the four public query sites.** In each, merge the clause with `AND` so existing conditions stay intact:
- `app/(shop)/products/page.tsx:23-26` → `where: { AND: [{ stock: { gt: 0 } }, publicProductWhere()] }`
- `app/(shop)/page.tsx` (featured query ~line 24) → add/merge `where: { AND: [<existing where if any>, publicProductWhere()] }` (read the file; if it has no `where`, use `where: publicProductWhere()`)
- `app/(shop)/products/[slug]/page.tsx` — BOTH `findUnique` calls (lines ~17 and ~46) become `findFirst({ where: { AND: [{ slug }, publicProductWhere()] } })` (findUnique can't take non-unique filters)
- `app/sitemap.ts:8` → add `where: publicProductWhere()`
Import `publicProductWhere` from `@/lib/catalog` in each.

- [ ] **Step 6:** `npx tsc --noEmit` → no new errors. `npm test` still green.

- [ ] **Step 7:** Commit: `git add lib/catalog.ts lib/catalog.test.ts "app/(shop)" app/sitemap.ts && git commit -m "feat: feature-flagged public license gate on all storefront queries"`

---

### Task 5: Create/update API — license validation + new fields

**Files:**
- Modify: `app/api/admin/products/route.ts` (POST)
- Modify: `app/api/admin/products/[id]/route.ts` (PUT/PATCH — read the file first for its exact shape)

- [ ] **Step 1:** In `route.ts` POST (after the existing required-fields check at line ~25), add:

```ts
import { validateProductLicenseInput } from '@/lib/license'
// ... inside POST, after the existing required-fields check:
    const licenseError = validateProductLicenseInput({ sourceUrl: body.sourceUrl ?? null, licenseType: body.licenseType })
    if (licenseError) {
      return NextResponse.json({ error: licenseError }, { status: 400 })
    }
```

and extend `prisma.product.create` data:

```ts
        licenseType: body.licenseType,
        commercialUseOverride: body.commercialUseOverride ?? null,
        licenseVerifiedAt: new Date(),
        licenseVerifiedBy: body.licenseVerifiedBy ?? session.user?.email ?? 'admin',
        marketingImageUrl: body.marketingImageUrl ?? null,
        packshotImageUrl: body.packshotImageUrl ?? null,
```

- [ ] **Step 2:** In `[id]/route.ts` update handler: pass through the six new fields when present in the body (partial update — NO license validation on update, per spec §3.4, so backfill/corrections work field-by-field). When `licenseType` is present in the body, also set `licenseVerifiedAt: new Date()` and `licenseVerifiedBy` as in create.

- [ ] **Step 3:** `npx tsc --noEmit` → clean. `npm test` green.

- [ ] **Step 4:** Commit: `git add app/api/admin/products && git commit -m "feat(api): require license data on product create, accept typed photo fields"`

---

### Task 6: Storefront — typed photos on product page and cards

**Files:**
- Modify: `components/ProductGallery.tsx`
- Modify: `app/(shop)/products/[slug]/page.tsx`
- Modify: `components/ProductCard.tsx` (read first — use `marketingImageUrl ?? images[0]` as the card image)

- [ ] **Step 1:** Extend `ProductGallery` props to accept labeled images. Change the interface and build the display list with captions:

```tsx
interface GalleryImage { url: string; label?: string }
interface ProductGalleryProps {
  images: GalleryImage[]
  productName: string
  slug: string
}
```

Ordering contract (build in the SERVER component, pass down): `[marketingImageUrl (label "Zdjęcie reklamowe"), packshotImageUrl (label "Packshot"), printedImageUrl (label "Przykładowy wydruk"), ...images (no label)]` — filter out nulls and de-duplicate URLs (a URL may appear both in a typed slot and in `images[]`). No empty slots: missing types simply don't appear (spec §3.3 fallback). Render the label as a small overlay badge on the main image (`absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded`) and keep thumbnails as-is.

- [ ] **Step 2:** In `app/(shop)/products/[slug]/page.tsx` build the array:

```tsx
const galleryImages = [
  product.marketingImageUrl ? { url: product.marketingImageUrl, label: 'Zdjęcie reklamowe' } : null,
  product.packshotImageUrl ? { url: product.packshotImageUrl, label: 'Packshot' } : null,
  product.printedImageUrl ? { url: product.printedImageUrl, label: 'Przykładowy wydruk' } : null,
  ...product.images.map((url) => ({ url })),
].filter((x): x is { url: string; label?: string } => x !== null)
const seen = new Set<string>()
const dedupedImages = galleryImages.filter((img) => (seen.has(img.url) ? false : (seen.add(img.url), true)))
```

Pass `images={dedupedImages}`. Also update the OG image in `generateMetadata` to `product.marketingImageUrl ?? product.images[0]`, and `AddToCartButton`'s `image` to the same expression.

- [ ] **Step 3:** `components/ProductCard.tsx`: card image becomes `product.marketingImageUrl ?? product.images[0] ?? fallback` (match the file's existing fallback pattern).

- [ ] **Step 4:** `npx tsc --noEmit` → clean. Visual check: `npm run dev` (needs a DATABASE_URL; if no local DB, skip the visual check and note it — Task 8 covers it) — otherwise verify a product page renders badges.

- [ ] **Step 5:** Commit: `git add components "app/(shop)" && git commit -m "feat(storefront): typed photo slots with labels, marketing image as hero"`

---

### Task 7: Admin — license fields, Makerworld link, flags

**Files:**
- Modify: the shared product form (read `components/admin/` and `app/(admin)/admin/products/new/page.tsx` + `[id]/edit/page.tsx` first — the form is likely a shared component given the pages are 24/60 lines)
- Modify: `app/(admin)/admin/products/page.tsx` (product list)

- [ ] **Step 1:** Product form additions, following the form's existing field style:
- select `licenseType` (all 10 enum values, labels: "CC0 (domena publiczna)", "CC BY", "CC BY-SA", "CC BY-NC — ZAKAZ sprzedaży", "CC BY-NC-SA — ZAKAZ sprzedaży", "CC BY-ND — blokada (wydruk = utwór zależny)", "CC BY-NC-ND — ZAKAZ sprzedaży", "Makerworld Standard — blokada sprzedaży wydruków", "Model własny", "Nieznana — do weryfikacji")
- checkbox trójstanowy dla `commercialUseOverride` (select: "automatycznie wg licencji" = null / "wymuś: sprzedaż OK" = true / "wymuś: blokada" = false)
- text inputs `marketingImageUrl`, `packshotImageUrl` (obok istniejącego `printedImageUrl`)
- obok pola `sourceUrl`: gdy wypełnione, klikalny link "Otwórz w Makerworld →" (`<a href={sourceUrl} target="_blank" rel="noopener noreferrer">`) — szybkie przejście do druku
- read-only informacja: "Sprzedaż: DOZWOLONA/ZABLOKOWANA" wyliczona przez `effectiveCommercialUse` (import z `@/lib/license`)

- [ ] **Step 2:** Product list (`app/(admin)/admin/products/page.tsx`): per row add
- red badge `Licencja blokuje sprzedaż` when `!effectiveCommercialUse(product.licenseType, product.commercialUseOverride)`
- amber badges for missing photo types: `brak reklamowego` / `brak packshota` / `brak zdjęcia wydruku` when the respective field is null
- link icon to `sourceUrl` when present

- [ ] **Step 3:** `npx tsc --noEmit` clean; `npm test` green.

- [ ] **Step 4:** Commit: `git add "app/(admin)" components/admin && git commit -m "feat(admin): license fields, Makerworld quick link, sale-blocked and missing-photo flags"`

---

### Task 8: Verification + PR (no deploy)

- [ ] **Step 1:** `npm test` → all green. `npx tsc --noEmit` → no new errors vs main (`git stash`-compare if unsure). `npm run lint` → no new errors.
- [ ] **Step 2:** `npm run build` — needs `DATABASE_URL` at build? Check: `prisma generate` runs prebuild and doesn't need a live DB; Next build may prerender pages that query the DB but those have try/catch fallbacks. If build requires a DB, boot the throwaway embedded postgres from Task 2 Step 2, run `npx prisma migrate deploy` against it, build, tear down.
- [ ] **Step 3:** Push branch + open PR to main: `git push -u origin feature/product-licenses && gh pr create --title "Product typed photos + Makerworld license gate" --body "<summary + link to spec>. Gate ships DISABLED (LICENSE_GATE_ENABLED unset). Deploy rides with SKL-147."` End PR body with the standard generated-with footer.
- [ ] **Step 4:** Report: what remains manual — (a) merge PR, (b) deploy w ramach SKL-147, (c) Paperclip-side rollout (Task 9 below) — and explicitly that `LICENSE_GATE_ENABLED` stays OFF until backfill completes.

---

### Task 9: Paperclip side — agent rule + backfill task (separate system!)

**Context:** runs against the LOCAL paperclip server (C:\projekty\paperclip), NOT the shop repo. The server must be started with `HEARTBEAT_SCHEDULER_ENABLED=false` (agents burn real money otherwise) — see repo memory for start/stop quirks. SKL companyId: `a113afa7-38ff-419b-8f48-1a137ef9b171`.

- [ ] **Step 1:** Start the paperclip server heartbeat-disabled (foreground tsx variant), wait for `/api/health`.
- [ ] **Step 2:** Record the policy as company knowledge:

```bash
curl -s -X PATCH "http://127.0.0.1:3100/api/companies/a113afa7-38ff-419b-8f48-1a137ef9b171/documents/knowledge/facts" \
  -H "Content-Type: application/json" \
  -d '{"factKey":"product-license-policy","value":"Kazdy nowy produkt w sklepie treefish MUSI miec sourceUrl (strona modelu Makerworld) i licenseType odczytany ze strony modelu. API create odrzuca produkty bez tych pol (400). Licencje NC/ND/Standard blokuja sprzedaz (produkt ukryty po wlaczeniu LICENSE_GATE_ENABLED). Modele wlasne: licenseType=OWN_MODEL bez sourceUrl."}'
```

- [ ] **Step 3:** Create the backfill issue for the SKL Developer agent (`aa635305-ee93-4507-b803-49562307d786`):

```bash
curl -s -X POST "http://127.0.0.1:3100/api/companies/a113afa7-38ff-419b-8f48-1a137ef9b171/issues" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Backfill licencji Makerworld dla istniejacych produktow treefish",
    "description": "## Cel\nDla KAZDEGO istniejacego produktu w sklepie treefish: ustalic strone modelu na Makerworld, odczytac licencje i uzupelnic pola sourceUrl + licenseType (+ licenseVerifiedAt/By) przez admin API sklepu (PATCH /api/admin/products/:id).\n\n## Mapa licencji\nCC0/CC BY/CC BY-SA -> sprzedaz OK. Warianty NC, ND oraz Makerworld Standard Digital File -> blokada sprzedazy. Model wlasny -> OWN_MODEL.\n\n## Wazne\n- Produktow NIE ukrywac ani nie kasowac - bramka LICENSE_GATE_ENABLED jest wylaczona do konca backfillu.\n- Produkty nie do namierzenia na Makerworld: zostawic licenseType=UNKNOWN i wypisac je w komentarzu do decyzji operatora.\n- Po ukonczeniu: komentarz z tabela produkt->licencja->sprzedaz OK/blokada.\n\nSpec: docs/superpowers/specs/2026-07-06-treefish-product-photos-licenses-design.md (repo paperclip).",
    "priority": "high",
    "assigneeAgentId": "aa635305-ee93-4507-b803-49562307d786",
    "status": "todo"
  }'
```

NOTE: the task will only be picked up when the heartbeat scheduler runs again — that's deliberate; it waits until Michał consciously turns agents back on AND the shop PR is deployed.

- [ ] **Step 4:** Stop the server, kill orphaned postgres/node processes, verify ports 3100/54329 free.

---

## Self-Review Notes

- **Spec coverage:** §3.1 → Task 2 (minus stored `commercialUse`, noted deviation), §3.2 → Task 4, §3.3 → Task 6, §3.4 → Tasks 5+7, §3.5 → Task 9, §4 rollout order → Tasks 8-9 explicitly keep the gate off and defer deploy to SKL-147, §6 tests → Tasks 3-4 (unit; API/storefront verified by typecheck+build+manual, consistent with a repo that had zero tests before this plan).
- **Known soft spots (deliberate, flagged for the executor):** exact shape of the admin product form (Task 7) and `[id]/route.ts` update handler (Task 5) and `ProductCard` (Task 6) were not fully read while planning — each task instructs the implementer to read the real file first and follow its conventions.
- **Type consistency:** `publicProductWhere`'s inline license list must equal `COMMERCIAL_OK` in `lib/license.ts` — both enumerate `CC0, CC_BY, CC_BY_SA, OWN_MODEL`. Keep them in sync (or derive the array from the set; either is fine).
