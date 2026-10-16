import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'TikTok Ads Setup - Panel Admina' }

async function getTiktokStatus() {
  try {
    const settings = await prisma.siteSettings.findMany({
      where: { key: { in: ['tiktok_access_token', 'tiktok_advertiser_id', 'tiktok_token_expires_at'] } },
    })
    const token = settings.find((s) => s.key === 'tiktok_access_token')?.value
    const advertiserId = settings.find((s) => s.key === 'tiktok_advertiser_id')?.value
    const expiresAt = settings.find((s) => s.key === 'tiktok_token_expires_at')?.value

    const configured = !!(token && advertiserId)
    const daysUntilExpiry = expiresAt
      ? Math.floor((parseInt(expiresAt, 10) - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    return { configured, advertiserId, daysUntilExpiry, tokenMasked: token ? `${token.slice(0, 8)}...` : null }
  } catch {
    return { configured: false, advertiserId: null, daysUntilExpiry: null, tokenMasked: null }
  }
}

function buildAuthUrl(appId: string, redirectUri: string): string {
  const state = Math.random().toString(36).slice(2)
  const params = new URLSearchParams({
    app_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: 'ad_account.info,campaign.read,campaign.write,ad.read,ad.write,reporting.read',
  })
  return `https://business-api.tiktok.com/portal/auth?${params}`
}

interface PageProps {
  searchParams: Promise<{ error?: string; success?: string }>
}

export default async function TiktokSetupPage({ searchParams }: PageProps) {
  const params = await searchParams
  const status = await getTiktokStatus()
  const appId = process.env.TIKTOK_APP_ID ?? ''
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://treefish.pl'
  const redirectUri = `${baseUrl}/api/tiktok/callback`
  const authUrl = appId ? buildAuthUrl(appId, redirectUri) : null

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">TikTok Ads — konfiguracja OAuth</h1>
        <p className="text-gray-600 mt-1">
          Połącz konto TikTok Ads z treefish.pl, aby agent mógł pobierać codzienne raporty.
        </p>
      </div>

      {params.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          ✅ <strong>Sukces!</strong> Token TikTok został zapisany. Jutrzejszy raport rutyny SKL-224 będzie zawierał dane.
        </div>
      )}

      {params.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          ❌ <strong>Błąd:</strong> {decodeURIComponent(params.error)}
        </div>
      )}

      {/* Status */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status połączenia</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Token dostępowy</span>
            {status.configured ? (
              <span className="text-green-700 font-mono text-sm">{status.tokenMasked}</span>
            ) : (
              <span className="text-red-600 text-sm">Nie skonfigurowany</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Advertiser ID</span>
            {status.advertiserId ? (
              <span className="text-green-700 font-mono text-sm">{status.advertiserId}</span>
            ) : (
              <span className="text-red-600 text-sm">Brak</span>
            )}
          </div>
          {status.daysUntilExpiry !== null && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Wygasanie tokenu</span>
              <span className={status.daysUntilExpiry < 30 ? 'text-orange-600 font-semibold' : 'text-gray-700'}>
                {status.daysUntilExpiry > 0 ? `za ${status.daysUntilExpiry} dni` : 'WYGASŁ'}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">TIKTOK_APP_ID w env</span>
            {appId ? (
              <span className="text-green-700 text-sm font-mono">{appId.slice(0, 8)}...</span>
            ) : (
              <span className="text-red-600 text-sm">Brak — dodaj do .env na VPS</span>
            )}
          </div>
        </div>
      </div>

      {/* OAuth flow */}
      {authUrl ? (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Autoryzacja OAuth</h2>
          <p className="text-gray-600 text-sm mb-4">
            Kliknij przycisk poniżej, aby autoryzować dostęp do TikTok Ads. Zostaniesz przekierowany do TikTok,
            a po zatwierdzeniu token zostanie automatycznie zapisany.
          </p>
          <a
            href={authUrl}
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.69a8.22 8.22 0 004.79 1.53V6.72a4.85 4.85 0 01-1.03-.03z"/>
            </svg>
            Połącz z TikTok Ads
          </a>
          <p className="text-xs text-gray-400 mt-3">
            Redirect URI: <code className="font-mono">{redirectUri}</code>
            <br />
            Upewnij się, że ten URL jest dodany jako dozwolony redirect w TikTok Developer Portal.
          </p>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-amber-900 mb-2">Wymagane: TIKTOK_APP_ID</h2>
          <p className="text-amber-800 text-sm mb-3">
            Aby uruchomić OAuth, dodaj <code className="font-mono">TIKTOK_APP_ID</code> i{' '}
            <code className="font-mono">TIKTOK_APP_SECRET</code> do pliku <code className="font-mono">/opt/treefish/.env</code> na VPS.
          </p>
          <div className="bg-amber-100 rounded-md p-3 font-mono text-xs text-amber-900">
            TIKTOK_APP_ID=twoje_app_id_z_tiktok_developer_portal<br/>
            TIKTOK_APP_SECRET=twoj_app_secret
          </div>
          <p className="text-amber-700 text-xs mt-3">
            Wartości znajdziesz w{' '}
            <strong>TikTok Developer Portal → My Apps → App Details</strong>
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Jak to działa</h2>
        <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
          <li>Dodaj <code className="font-mono text-xs bg-gray-200 px-1 py-0.5 rounded">TIKTOK_APP_ID</code> i <code className="font-mono text-xs bg-gray-200 px-1 py-0.5 rounded">TIKTOK_APP_SECRET</code> do .env na VPS i uruchom ponownie serwis</li>
          <li>Wróć tutaj i kliknij &quot;Połącz z TikTok Ads&quot;</li>
          <li>Autoryzuj aplikację w TikTok</li>
          <li>Token zostanie automatycznie zapisany w bazie danych</li>
          <li>Jutrzejszy raport rutyny będzie już zawierał dane kampanii</li>
        </ol>
      </div>
    </div>
  )
}
