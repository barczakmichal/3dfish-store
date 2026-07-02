import crypto from 'crypto';

const FURGONETKA_API_URL = process.env.FURGONETKA_API_URL || 'https://api.sandbox.furgonetka.pl';
const FURGONETKA_CLIENT_ID = process.env.FURGONETKA_CLIENT_ID || '';
const FURGONETKA_CLIENT_SECRET = process.env.FURGONETKA_CLIENT_SECRET || '';
const FURGONETKA_USERNAME = process.env.FURGONETKA_USERNAME || '';
const FURGONETKA_PASSWORD = process.env.FURGONETKA_PASSWORD || '';

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.accessToken;
  }

  const credentials = Buffer.from(`${FURGONETKA_CLIENT_ID}:${FURGONETKA_CLIENT_SECRET}`).toString('base64');

  const res = await fetch(`${FURGONETKA_API_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'password',
      scope: 'api',
      username: FURGONETKA_USERNAME,
      password: FURGONETKA_PASSWORD,
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

  return fetch(`${FURGONETKA_API_URL}${path}`, {
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
  return !!(FURGONETKA_CLIENT_ID && FURGONETKA_CLIENT_SECRET && FURGONETKA_USERNAME && FURGONETKA_PASSWORD);
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
