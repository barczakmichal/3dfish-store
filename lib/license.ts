import type { LicenseType } from '@prisma/client'

export const LICENSE_TYPES = [
  'CC0', 'CC_BY', 'CC_BY_SA', 'CC_BY_NC', 'CC_BY_NC_SA',
  'CC_BY_ND', 'CC_BY_NC_ND', 'STANDARD_DIGITAL_FILE', 'OWN_MODEL', 'UNKNOWN',
] as const

// NC variants forbid selling prints. ND is conservatively blocked (a physical
// print can be argued to be a derivative). STANDARD_DIGITAL_FILE (Makerworld
// default) does not permit selling physical prints. Manual override exists for
// individually granted permissions.
export const COMMERCIAL_OK_LICENSES = ['CC0', 'CC_BY', 'CC_BY_SA', 'OWN_MODEL'] as const satisfies readonly LicenseType[]

const COMMERCIAL_OK: ReadonlySet<LicenseType> = new Set(COMMERCIAL_OK_LICENSES)

export const LICENSE_SHORT_LABELS: Record<string, string> = {
  CC0: 'CC0',
  CC_BY: 'CC BY',
  CC_BY_SA: 'CC BY-SA',
  CC_BY_NC: 'CC BY-NC',
  CC_BY_NC_SA: 'CC BY-NC-SA',
  CC_BY_ND: 'CC BY-ND',
  CC_BY_NC_ND: 'CC BY-NC-ND',
  STANDARD_DIGITAL_FILE: 'MW Standard',
  OWN_MODEL: 'Model własny',
  UNKNOWN: 'Licencja nieznana',
}

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
