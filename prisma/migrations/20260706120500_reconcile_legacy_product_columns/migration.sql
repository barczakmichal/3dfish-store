-- Reconcile legacy schema drift: these columns exist in schema.prisma (and in
-- long-lived databases, where they were added out-of-band) but were never
-- captured by any migration. Guarded with IF NOT EXISTS so this is a no-op on
-- databases that already have them, and creates them on fresh bootstraps.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sourceFileUrl" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "printedImageUrl" TEXT;
ALTER TABLE "Order" ALTER COLUMN "updatedAt" DROP DEFAULT;
