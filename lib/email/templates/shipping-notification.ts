import { baseLayout } from './base-layout';

export interface ShippingNotificationData {
  orderNumber: string;
  customerName: string;
  trackingNumber?: string;
  carrier?: string;
  pickupPointName?: string;
  pickupPointId?: string;
}

export function shippingNotificationHtml(data: ShippingNotificationData): string {
  const trackingBlock = data.trackingNumber
    ? `
    <div class="highlight">
      <strong>Numer śledzenia: ${data.trackingNumber}</strong><br/>
      ${data.carrier ? `Przewoźnik: ${data.carrier}` : ''}
    </div>`
    : '';

  const pickupBlock = data.pickupPointName
    ? `<p><strong>Punkt odbioru:</strong> ${data.pickupPointName}${data.pickupPointId ? ` (${data.pickupPointId})` : ''}</p>`
    : '';

  const inpostLink = data.trackingNumber
    ? `<p style="text-align:center;margin-top:20px"><a class="btn" href="https://inpost.pl/sledzenie-przesylek?number=${data.trackingNumber}">Śledź przesyłkę →</a></p>`
    : '';

  const body = `
    <h2>Paczka w drodze! 📦</h2>
    <p>Cześć ${data.customerName},</p>
    <p>Twoje zamówienie <strong>#${data.orderNumber}</strong> zostało nadane i jest w drodze do Ciebie!</p>

    ${trackingBlock}
    ${pickupBlock}
    ${inpostLink}

    <p>Zazwyczaj paczki dostarczane są w ciągu 1–2 dni roboczych.</p>
    <p>Masz pytania dotyczące dostawy? Napisz do nas – chętnie pomożemy. 🐟</p>
  `;

  return baseLayout(`Zamówienie #${data.orderNumber} nadane – Treefish`, body);
}

export function shippingNotificationSubject(orderNumber: string): string {
  return `📦 Zamówienie #${orderNumber} w drodze do Ciebie!`;
}
