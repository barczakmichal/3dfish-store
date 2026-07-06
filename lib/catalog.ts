import type { Prisma } from '@prisma/client'
import { COMMERCIAL_OK_LICENSES, isLicenseGateEnabled } from './license'

// Server-side publication gate (spec §3.2). Spread into every PUBLIC product
// query's `where`. Admin queries must NOT use this.
export function publicProductWhere(): Prisma.ProductWhereInput {
  if (!isLicenseGateEnabled()) return {}
  return {
    OR: [
      { commercialUseOverride: true },
      {
        commercialUseOverride: null,
        licenseType: { in: [...COMMERCIAL_OK_LICENSES] },
      },
    ],
  }
}
