import crypto from 'crypto';

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

function getFurgonetkaConfig() {
  return {
    apiUrl: process.env.FURGONETKA_API_URL || 'https://api.sandbox.furgonetka.pl',
    clientId: process.env.FURGONETKA_CLIENT_ID || '',
    clientSecret: process.env.FURGONETKA_CLIENT_SECRET || '',
    username: process.env.FURGONETKA_USERNAME || '',
    password: process.env.FURGONETKA_PASSWORD || '',
  };
}

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.accessToken;
  }

  // Clear stale cache so config changes take effect
  cachedToken = null;

  const { apiUrl, clientId, clientSecret, username, password } = getFurgonetkaConfig();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${apiUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'password',
      scope: 'api',
      username,
      password,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Furgonetka OAuth failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.accessToken;
}

export async function furgonetkaApi(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const { apiUrl } = getFurgonetkaConfig();

  return fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

export function verifyHmacSignature(payload: string, signature: string): boolean {
  const secret = process.env.FURGONETKA_SECRET_KEY;
  if (!secret) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex')
  );
}

export function isFurgonetkaConfigured(): boolean {
  const { clientId, clientSecret, username, password } = getFurgonetkaConfig();
  return !!(clientId && clientSecret && username && password);
}

export function validateIntegrationToken(req: import('next/server').NextRequest): boolean {
  const token = process.env.FURGONETKA_INTEGRATION_TOKEN;
  if (!token) return false;
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const requestToken = authHeader.slice(7);
  if (requestToken.length !== token.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(requestToken));
}
