import { createHash } from 'crypto';

const PIXEL_ID = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const API_VERSION = 'v21.0';

function hashSHA256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

interface CAPIUserData {
  email?: string;
  phone?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
}

interface CAPIEvent {
  eventName: string;
  eventId?: string;
  eventSourceUrl?: string;
  userData: CAPIUserData;
  customData?: Record<string, unknown>;
}

export async function sendCAPIEvent(event: CAPIEvent): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) return;

  const userData: Record<string, unknown> = {};
  if (event.userData.email) userData.em = [hashSHA256(event.userData.email)];
  if (event.userData.phone) userData.ph = [hashSHA256(event.userData.phone)];
  if (event.userData.clientIpAddress) userData.client_ip_address = event.userData.clientIpAddress;
  if (event.userData.clientUserAgent) userData.client_user_agent = event.userData.clientUserAgent;
  if (event.userData.fbc) userData.fbc = event.userData.fbc;
  if (event.userData.fbp) userData.fbp = event.userData.fbp;

  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.eventSourceUrl || 'https://treefish.pl',
        action_source: 'website',
        user_data: userData,
        ...(event.customData ? { custom_data: event.customData } : {}),
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      console.error('[meta-capi] Error:', text);
    }
  } catch (err) {
    console.error('[meta-capi] Failed:', err);
  }
}

export async function sendPurchaseEvent(data: {
  orderId: string;
  value: number;
  email: string;
  phone?: string;
  contentIds: string[];
  numItems: number;
  clientIp?: string;
  userAgent?: string;
}): Promise<void> {
  await sendCAPIEvent({
    eventName: 'Purchase',
    eventId: data.orderId,
    eventSourceUrl: 'https://treefish.pl/order/success',
    userData: {
      email: data.email,
      phone: data.phone,
      clientIpAddress: data.clientIp,
      clientUserAgent: data.userAgent,
    },
    customData: {
      value: data.value,
      currency: 'PLN',
      content_ids: data.contentIds,
      content_type: 'product',
      num_items: data.numItems,
    },
  });
}
