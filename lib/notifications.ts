interface OrderForNotification {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  total: { toString(): string };
  shippingMethod: string | null;
  pickupPointName: string | null;
  city: string | null;
  street: string | null;
  postalCode: string | null;
  items: Array<{
    quantity: number;
    price: { toString(): string };
    product: { name: string };
  }>;
}

function formatPLN(value: { toString(): string }): string {
  return `${Number(value.toString()).toFixed(2)} zł`;
}

function buildSlackBlocks(order: OrderForNotification) {
  const itemLines = order.items
    .map((item) => `• ${item.product.name} × ${item.quantity} — ${formatPLN(item.price)}`)
    .join('\n');

  const addressParts = [order.street, order.postalCode, order.city]
    .filter(Boolean)
    .join(', ');

  const delivery = order.pickupPointName
    ? `Paczkomat: ${order.pickupPointName}`
    : addressParts || 'Brak danych';

  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: `🎣 Nowe zamówienie — ${formatPLN(order.total)}` },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Klient:*\n${order.customerName}` },
        { type: 'mrkdwn', text: `*Email:*\n${order.customerEmail}` },
        { type: 'mrkdwn', text: `*Telefon:*\n${order.customerPhone || '—'}` },
        { type: 'mrkdwn', text: `*Dostawa:*\n${delivery}` },
      ],
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Produkty:*\n${itemLines}` },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Zamówienie \`${order.id}\` · <https://treefish.pl/admin/orders/${order.id}|Otwórz w panelu admina>`,
        },
      ],
    },
  ];
}

export async function sendOrderNotificationToSlack(order: OrderForNotification): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL nie ustawiony — pomijam powiadomienie Slack');
    return;
  }

  const payload = {
    text: `Nowe zamówienie od ${order.customerName} na ${formatPLN(order.total)}`,
    blocks: buildSlackBlocks(order),
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`Slack webhook zwrócił ${res.status}: ${await res.text()}`);
    }
  } catch (err) {
    console.error('Błąd wysyłki powiadomienia Slack:', err);
  }
}
