import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { isLicenseGateEnabled, effectiveCommercialUse } from '@/lib/license';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const { items, customerEmail, customerName, customerPhone } = (await req.json()) as {
      items: CartItem[];
      customerEmail: string;
      customerName?: string;
      customerPhone?: string;
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

    if (isLicenseGateEnabled()) {
      const blocked = products.filter((p) => !effectiveCommercialUse(p.licenseType, p.commercialUseOverride));
      if (blocked.length > 0) {
        return NextResponse.json(
          { error: `Produkty niedostępne w sprzedaży: ${blocked.map((p) => p.name).join(', ')}. Usuń je z koszyka.` },
          { status: 400 },
        );
      }
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
        customerName: customerName || customerEmail.split('@')[0],
        customerPhone: customerPhone || null,
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

    if (!stripe) {
      return NextResponse.json({
        url: `${req.nextUrl.origin}/order/success?order_id=${order.id}`,
        orderId: order.id,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'p24', 'blik'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/cart`,
      customer_email: customerEmail,
      shipping_address_collection: {
        allowed_countries: ['PL'],
      },
      metadata: {
        orderId: order.id,
      },
    });

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
