import { baseLayout } from './base-layout';

export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  shippingMethod?: string;
  street?: string;
  city?: string;
  postalCode?: string;
}

export function orderConfirmationHtml(data: OrderConfirmationData): string {
  const itemRows = data.items.map(
    (item) => `
    <tr>
      <td>${item.name}</td>
      <td class="right">${item.quantity} szt.</td>
      <td class="right">${(item.price * item.quantity).toFixed(2)} zł</td>
    </tr>`,
  ).join('');

  const addressBlock = data.street
    ? `<p><strong>Adres dostawy:</strong><br/>${data.street}<br/>${data.postalCode} ${data.city}</p>`
    : '';

  const body = `
    <h2>Dziękujemy za zamówienie! 🎣</h2>
    <p>Cześć ${data.customerName},</p>
    <p>Twoje zamówienie zostało przyjęte i oczekuje na płatność. Gdy tylko płatność zostanie potwierdzona, zaczniemy przygotowywać Twoją paczkę.</p>

    <div class="highlight">
      <strong>Nr zamówienia: ${data.orderNumber}</strong>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th>Produkt</th>
          <th class="right">Ilość</th>
          <th class="right">Kwota</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        <tr class="total-row">
          <td colspan="2">Razem</td>
          <td class="right">${data.total.toFixed(2)} zł</td>
        </tr>
      </tbody>
    </table>

    ${addressBlock}

    <p>Po dokonaniu płatności otrzymasz kolejnego emaila z potwierdzeniem.</p>
    <p>Masz pytania? Odpowiedz na tę wiadomość – chętnie pomożemy! 🐟</p>
  `;

  return baseLayout(`Zamówienie ${data.orderNumber} – Treefish`, body);
}

export function orderConfirmationSubject(orderNumber: string): string {
  return `✅ Zamówienie #${orderNumber} przyjęte – Treefish`;
}
