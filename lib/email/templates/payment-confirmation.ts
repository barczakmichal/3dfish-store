import { baseLayout } from './base-layout';

export interface PaymentConfirmationData {
  orderNumber: string;
  customerName: string;
  total: number;
}

export function paymentConfirmationHtml(data: PaymentConfirmationData): string {
  const body = `
    <h2>Płatność potwierdzona! 🎉</h2>
    <p>Cześć ${data.customerName},</p>
    <p>Świetnie! Otrzymaliśmy Twoją płatność i już zaczynamy przygotowywać Twoje zamówienie.</p>

    <div class="highlight">
      <strong>Nr zamówienia: ${data.orderNumber}</strong><br/>
      <span>Kwota: ${data.total.toFixed(2)} zł</span>
    </div>

    <p>Co dalej?</p>
    <p>
      Twoje akcesoria wędkarskie są drukowane 3D na zamówienie, więc przygotowanie zajmuje zazwyczaj 1–3 dni robocze.
      Gdy tylko paczka zostanie nadana, wyślemy Ci wiadomość ze szczegółami śledzenia przesyłki.
    </p>
    <p>Dziękujemy za zaufanie i połowu pełnego ryb! 🐟</p>
  `;

  return baseLayout(`Potwierdzenie płatności – Treefish`, body);
}

export function paymentConfirmationSubject(orderNumber: string): string {
  return `💳 Płatność potwierdzona – zamówienie #${orderNumber}`;
}
