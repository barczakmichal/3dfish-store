-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('CC0', 'CC_BY', 'CC_BY_SA', 'CC_BY_NC', 'CC_BY_NC_SA', 'CC_BY_ND', 'CC_BY_NC_ND', 'STANDARD_DIGITAL_FILE', 'OWN_MODEL', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "commercialUseOverride" BOOLEAN,
ADD COLUMN     "licenseType" "LicenseType" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "licenseVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "licenseVerifiedBy" TEXT,
ADD COLUMN     "marketingImageUrl" TEXT,
ADD COLUMN     "packshotImageUrl" TEXT;
