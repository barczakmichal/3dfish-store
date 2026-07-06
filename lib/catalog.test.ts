import { describe, it, expect, afterEach } from 'vitest'
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
