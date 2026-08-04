import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/tiktok?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL('/admin/tiktok?error=missing_code', request.url))
  }

  // Verify CSRF state
  const expectedState = process.env.TIKTOK_OAUTH_STATE
  if (expectedState && state !== expectedState) {
    return NextResponse.redirect(new URL('/admin/tiktok?error=invalid_state', request.url))
  }

  const appId = process.env.TIKTOK_APP_ID
  const appSecret = process.env.TIKTOK_APP_SECRET

  if (!appId || !appSecret) {
    return NextResponse.redirect(new URL('/admin/tiktok?error=missing_app_credentials', request.url))
  }

  try {
    const tokenRes = await fetch('https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId, secret: appSecret, auth_code: code }),
    })

    const tokenData = await tokenRes.json()

    if (tokenData.code !== 0) {
      return NextResponse.redirect(
        new URL(`/admin/tiktok?error=${encodeURIComponent(tokenData.message ?? 'token_exchange_failed')}`, request.url)
      )
    }

    const accessToken: string = tokenData.data.access_token
    const advertiserId: string = tokenData.data.advertiser_ids?.[0] ?? ''
    const expiresIn: number = tokenData.data.expires_in ?? 0
    const expiresAt = Date.now() + expiresIn * 1000

    await Promise.all([
      prisma.siteSettings.upsert({
        where: { key: 'tiktok_access_token' },
        update: { value: accessToken },
        create: { key: 'tiktok_access_token', value: accessToken },
      }),
      prisma.siteSettings.upsert({
        where: { key: 'tiktok_token_expires_at' },
        update: { value: String(expiresAt) },
        create: { key: 'tiktok_token_expires_at', value: String(expiresAt) },
      }),
      advertiserId
        ? prisma.siteSettings.upsert({
            where: { key: 'tiktok_advertiser_id' },
            update: { value: advertiserId },
            create: { key: 'tiktok_advertiser_id', value: advertiserId },
          })
        : Promise.resolve(),
    ])

    // Notify Slack
    const slackWebhook = process.env.SLACK_WEBHOOK_URL
    if (slackWebhook) {
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `✅ *TikTok Ads OAuth zakończony pomyślnie!*\nAdvertiser ID: \`${advertiserId || 'pobierz ręcznie'}\`\nToken wygasa: ${new Date(expiresAt).toLocaleDateString('pl-PL')}\nRutyna SKL-224 pobierze dane od następnego uruchomienia.`,
        }),
      }).catch(() => {})
    }

    return NextResponse.redirect(new URL('/admin/tiktok?success=1', request.url))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown_error'
    return NextResponse.redirect(
      new URL(`/admin/tiktok?error=${encodeURIComponent(msg)}`, request.url)
    )
  }
}
