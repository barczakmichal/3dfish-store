declare global {
  interface Window {
    fbq: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue: unknown[][];
      loaded: boolean;
      version: string;
      push: (...args: unknown[]) => void;
    };
    _fbq: typeof Window.prototype.fbq;
    Cookiebot?: {
      consent: {
        marketing: boolean;
        statistics: boolean;
        preferences: boolean;
        necessary: boolean;
      };
      consented: boolean;
      declined: boolean;
      hasResponse: boolean;
    };
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function hasMarketingConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.Cookiebot?.consent?.marketing;
}

export function isPixelReady(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function' && hasMarketingConsent();
}

export function initPixel(): void {
  if (!PIXEL_ID || typeof window === 'undefined') return;
  if (typeof window.fbq === 'function') return;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const f: any = function (...args: unknown[]) {
    if (f.callMethod) {
      f.callMethod(...args);
    } else {
      f.queue.push(args);
    }
  };
  f.push = f;
  f.loaded = true;
  f.version = '2.0';
  f.queue = [] as unknown[][];
  window.fbq = f;
  if (!window._fbq) window._fbq = f;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string,
): void {
  if (!isPixelReady()) return;
  if (eventId) {
    window.fbq('track', eventName, params ?? {}, { eventID: eventId });
  } else {
    window.fbq('track', eventName, params);
  }
}

export function trackViewContent(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}): void {
  trackEvent('ViewContent', {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'PLN',
    ...(product.category ? { content_category: product.category } : {}),
  });
}

export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}): void {
  trackEvent('AddToCart', {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price * product.quantity,
    currency: 'PLN',
    num_items: product.quantity,
  });
}

export function trackInitiateCheckout(data: {
  value: number;
  numItems: number;
  contentIds: string[];
}): void {
  trackEvent('InitiateCheckout', {
    value: data.value,
    currency: 'PLN',
    num_items: data.numItems,
    content_ids: data.contentIds,
    content_type: 'product',
  });
}

export function trackPurchase(data: {
  value: number;
  orderId: string;
  contentIds: string[];
  numItems: number;
}): void {
  trackEvent(
    'Purchase',
    {
      value: data.value,
      currency: 'PLN',
      content_ids: data.contentIds,
      content_type: 'product',
      num_items: data.numItems,
    },
    data.orderId,
  );
}
