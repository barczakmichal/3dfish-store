import { baseLayout } from './base-layout';

export interface DeliveryConfirmationData {
  orderNumber: string;
  customerName: string;
}

export function deliveryConfirmationHtml(data: DeliveryConfirmationData): string {
  const body = `
    <h2>Zamówienie dostarczone! 🎣</h2>
    <p>Cześć ${data.customerName},</p>
    <p>Twoje zamówienie <strong>#${data.orderNumber}</strong> zostało oznaczone jako dostarczone. Mamy nadzieję, że wszystko dotarło w idealnym stanie!</p>

    <p>Jeśli masz jakiekolwiek pytania lub coś jest nie tak z Twoim zamówieniem, nie wahaj się z nami skontaktować:</p>

    <p style="text-align:center;margin-top:20px">
      <a class="btn" href="mailto:zamowienia@treefish.pl">Napisz do nas →</a>
    </p>

    <p>Dziękujemy za zakupy w Treefish! Żyłka napięta i połowu pełnego ryb! 🐟</p>
  `;

  return baseLayout(`Zamówienie #${data.orderNumber} dostarczone – Treefish`, body);
}

export function deliveryConfirmationSubject(orderNumber: string): string {
  return `🎣 Zamówienie #${orderNumber} dostarczone – dziękujemy!`;
}
