import prisma from '@/lib/prisma';
import { EmailType } from '@prisma/client';
import { getResendClient, FROM_ADDRESS, RESEND_ENABLED } from './client';
import {
  orderConfirmationHtml,
  orderConfirmationSubject,
  OrderConfirmationData,
} from './templates/order-confirmation';
import {
  paymentConfirmationHtml,
  paymentConfirmationSubject,
  PaymentConfirmationData,
} from './templates/payment-confirmation';
import {
  shippingNotificationHtml,
  shippingNotificationSubject,
  ShippingNotificationData,
} from './templates/shipping-notification';
import {
  deliveryConfirmationHtml,
  deliveryConfirmationSubject,
  DeliveryConfirmationData,
} from './templates/delivery-confirmation';

type EmailData =
  | { type: 'ORDER_CONFIRMATION'; data: OrderConfirmationData }
  | { type: 'PAYMENT_CONFIRMATION'; data: PaymentConfirmationData }
  | { type: 'SHIPPING_NOTIFICATION'; data: ShippingNotificationData }
  | { type: 'DELIVERY_CONFIRMATION'; data: DeliveryConfirmationData };

function buildEmail(payload: EmailData): { subject: string; html: string } {
  switch (payload.type) {
    case 'ORDER_CONFIRMATION':
      return {
        subject: orderConfirmationSubject(payload.data.orderNumber),
        html: orderConfirmationHtml(payload.data),
      };
    case 'PAYMENT_CONFIRMATION':
      return {
        subject: paymentConfirmationSubject(payload.data.orderNumber),
        html: paymentConfirmationHtml(payload.data),
      };
    case 'SHIPPING_NOTIFICATION':
      return {
        subject: shippingNotificationSubject(payload.data.orderNumber),
        html: shippingNotificationHtml(payload.data),
      };
    case 'DELIVERY_CONFIRMATION':
      return {
        subject: deliveryConfirmationSubject(payload.data.orderNumber),
        html: deliveryConfirmationHtml(payload.data),
      };
  }
}

export async function sendOrderEmail(
  orderId: string,
  customerEmail: string,
  payload: EmailData,
): Promise<void> {
  const emailType = payload.type as EmailType;

  // Idempotency: skip if already sent for this order+type
  const existing = await prisma.emailLog.findFirst({
    where: { orderId, type: emailType, status: { in: ['SENT', 'DELIVERED'] } },
  });
  if (existing) {
    console.log(`[email] Skipping duplicate ${emailType} for order ${orderId}`);
    return;
  }

  const { subject, html } = buildEmail(payload);

  if (!RESEND_ENABLED) {
    console.warn(`[email] RESEND_API_KEY not set – skipping ${emailType} for order ${orderId}`);
    await prisma.emailLog.create({
      data: {
        orderId,
        type: emailType,
        status: 'FAILED',
        to: customerEmail,
        subject,
        body: html,
        errorMsg: 'RESEND_API_KEY not configured',
      },
    });
    return;
  }

  try {
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: customerEmail,
      subject,
      html,
    });

    await prisma.emailLog.create({
      data: {
        orderId,
        type: emailType,
        status: 'SENT',
        to: customerEmail,
        subject,
        body: html,
        messageId: result.data?.id ?? null,
      },
    });

    await prisma.orderEvent.create({
      data: {
        orderId,
        type: 'email_sent',
        note: `${emailType} → ${customerEmail}`,
        actor: 'system',
      },
    });

    console.log(`[email] Sent ${emailType} to ${customerEmail} (order ${orderId})`);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[email] Failed to send ${emailType} for order ${orderId}:`, errMsg);

    await prisma.emailLog.create({
      data: {
        orderId,
        type: emailType,
        status: 'FAILED',
        to: customerEmail,
        subject,
        body: html,
        errorMsg: errMsg,
      },
    });
  }
}
