import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const { items, customerEmail } = (await req.json()) as {
      items: CartItem[];
      customerEmail: string;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Koszyk jest pusty' }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: 'Email jest wymagany' }, { status: 400 });
    }

    // Verify products exist and prices match
    const productIds = items.map((item) => item.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== items.length) {
      return NextResponse.json({ error: 'Niektóre produkty nie istnieją' }, { status: 400 });
    }

    // Build Stripe line items using server-side prices (security)
    const lineItems = items.map((item) => {
      const product = products.find((p) => p.id === item.id)!;
      return {
        price_data: {
          currency: 'pln',
          product_data: {
            name: product.name,
            description: product.description.slice(0, 500),
          },
          unit_amount: Math.round(Number(product.price) * 100),
        },
        quantity: item.quantity,
      };
    });

    const total = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.id)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    // Create order in database
    const order = await prisma.order.create({
      data: {
        customerEmail,
        customerName: customerEmail.split('@')[0],
        total,
        status: 'PENDING',
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.id)!;
            return {
              productId: product.id,
              quantity: item.quantity,
              price: Number(product.price),
            };
          }),
        },
      },
    });

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/cart`,
      customer_email: customerEmail,
      metadata: {
        orderId: order.id,
      },
    });

    // Link Stripe session to order
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas tworzenia sesji płatności' },
      { status: 500 }
    );
  }
}
