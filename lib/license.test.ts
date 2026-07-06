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
