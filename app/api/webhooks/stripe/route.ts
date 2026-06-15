import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe nie jest skonfigurowany' }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Brak podpisu Stripe' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Nieznany błąd';
    console.error(`Błąd weryfikacji webhooka: ${message}`);
    return NextResponse.json({ error: `Błąd webhooka: ${message}` }, { status: 400 });
  }

  // Obsługa zdarzeń Stripe
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      try {
        // Spróbuj zaktualizować istniejące zamówienie
        const existing = await prisma.order.findUnique({
          where: { stripeSessionId: session.id },
        });

        if (existing) {
          await prisma.order.update({
            where: { stripeSessionId: session.id },
            data: { status: 'PAID' },
          });
        } else {
          // Stwórz zamówienie jeśli nie zostało wcześniej utworzone
          await prisma.order.create({
            data: {
              stripeSessionId: session.id,
              customerEmail: session.customer_details?.email || '',
              customerName: session.customer_details?.name || '',
              total: (session.amount_total || 0) / 100,
              status: 'PAID',
            },
          });
        }

        console.log(`Zamówienie opłacone: ${session.id}`);
      } catch (error) {
        console.error('Błąd aktualizacji zamówienia:', error);
        return NextResponse.json({ error: 'Błąd aktualizacji zamówienia' }, { status: 500 });
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Płatność nie powiodła się: ${paymentIntent.id}`);
      break;
    }

    default:
      console.log(`Nieobsługiwane zdarzenie Stripe: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
