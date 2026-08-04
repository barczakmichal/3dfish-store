import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function authError() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function getSetting(settings: { key: string; value: string }[], key: string): string | null {
  return settings.find((s) => s.key === key)?.value ?? null
}

export async function GET(request: NextRequest) {
  // Bearer token auth using ADMIN_PASSWORD
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return authError()
  }

  const settings = await prisma.siteSettings.findMany({
    where: { key: { in: ['tiktok_access_token', 'tiktok_advertiser_id', 'tiktok_token_expires_at'] } },
  })

  const accessToken = getSetting(settings, 'tiktok_access_token')
  const advertiserId = getSetting(settings, 'tiktok_advertiser_id')
  const expiresAt = getSetting(settings, 'tiktok_token_expires_at')

  if (!accessToken || !advertiserId) {
    return NextResponse.json({
      configured: false,
      error: 'TikTok credentials not configured. Visit /admin/tiktok to set up OAuth.',
    })
  }

  // Check token expiry
  const expiresAtMs = expiresAt ? parseInt(expiresAt, 10) : null
  const daysUntilExpiry = expiresAtMs
    ? Math.floor((expiresAtMs - Date.now()) / (1000 * 60 * 60 * 24))
    : null
  const tokenWarning =
    daysUntilExpiry !== null && daysUntilExpiry < 30
      ? `⚠️ Token wygasa za ${daysUntilExpiry} dni`
      : null

  // Fetch yesterday's data (TikTok reports on completed days)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = yesterday.toISOString().split('T')[0]

  try {
    const insightsRes = await fetch(
      'https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/',
      {
        method: 'POST',
        headers: {
          'Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          advertiser_id: advertiserId,
          report_type: 'BASIC',
          dimensions: ['stat_time_day'],
          metrics: [
            'spend',
            'impressions',
            'clicks',
            'ctr',
            'cpc',
            'conversion',
            'cost_per_conversion',
            'conversion_rate',
          ],
          start_date: dateStr,
          end_date: dateStr,
          page_size: 10,
        }),
      }
    )

    const insightsData = await insightsRes.json()

    if (insightsData.code !== 0) {
      return NextResponse.json({
        configured: true,
        error: `TikTok API error: ${insightsData.message}`,
        code: insightsData.code,
        tokenWarning,
        date: dateStr,
      })
    }

    const rows = insightsData.data?.list ?? []
    const metrics =
      rows.length > 0
        ? rows[0].metrics
        : {
            spend: '0',
            impressions: '0',
            clicks: '0',
            ctr: '0',
            cpc: '0',
            conversion: '0',
            cost_per_conversion: '0',
            conversion_rate: '0',
          }

    // Also fetch campaigns list for budget check
    const campaignsRes = await fetch(
      `https://business-api.tiktok.com/open_api/v1.3/campaign/get/?advertiser_id=${advertiserId}&fields=["campaign_id","campaign_name","status","budget","budget_mode","objective_type"]`,
      {
        headers: { 'Access-Token': accessToken },
      }
    )
    const campaignsData = await campaignsRes.json()
    const campaigns = campaignsData.data?.list ?? []

    return NextResponse.json({
      configured: true,
      date: dateStr,
      advertiserId,
      tokenWarning,
      metrics: {
        spend: parseFloat(metrics.spend || '0'),
        impressions: parseInt(metrics.impressions || '0', 10),
        clicks: parseInt(metrics.clicks || '0', 10),
        ctr: parseFloat(metrics.ctr || '0'),
        cpc: parseFloat(metrics.cpc || '0'),
        conversions: parseInt(metrics.conversion || '0', 10),
        costPerConversion: parseFloat(metrics.cost_per_conversion || '0'),
        conversionRate: parseFloat(metrics.conversion_rate || '0'),
      },
      campaigns: campaigns.map((c: Record<string, unknown>) => ({
        id: c.campaign_id,
        name: c.campaign_name,
        status: c.status,
        budget: c.budget,
        budgetMode: c.budget_mode,
        objective: c.objective_type,
      })),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown_error'
    return NextResponse.json({ configured: true, error: msg, date: dateStr, tokenWarning })
  }
}
