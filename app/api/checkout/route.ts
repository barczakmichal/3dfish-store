import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { isLicenseGateEnabled, effectiveCommercialUse } from '@/lib/license';
import { SHIPPING_COST_PLN } from '@/lib/shipping';
import { sendOrderEmail } from '@/lib/email/send';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface PickupPoint {
  code: string;
  name: string;
}

export async function POST(req: NextRequest) {
  try {
    const { items, customerEmail, customerName, customerPhone, pickupPoint, discountCode } = (await req.json()) as {
      items: CartItem[];
      customerEmail: string;
      customerName?: string;
      customerPhone?: string;
      pickupPoint?: PickupPoint;
      discountCode?: string | null;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Koszyk jest pusty' }, { status: 400 });
    }

    if (!customerEmail) {
      return NextResponse.json({ error: 'Email jest wymagany' }, { status: 400 });
    }

    // Dostawa wyłącznie do paczkomatu InPost — punkt i telefon (SMS z kodem odbioru) są obowiązkowe.
    if (!pickupPoint?.code) {
      return NextResponse.json({ error: 'Wybierz paczkomat InPost' }, { status: 400 });
    }

    if (!customerPhone?.trim()) {
      return NextResponse.json({ error: 'Numer telefonu jest wymagany przy dostawie do paczkomatu' }, { status: 400 });
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

    // Validate discount code if provided
    let discountRecord: { id: string; code: string; type: string; value: number } | null = null;
    let discountAmount = 0;

    if (discountCode) {
      const dc = await prisma.discountCode.findUnique({
        where: { code: discountCode.toUpperCase() },
      });

      if (!dc || !dc.isActive) {
        return NextResponse.json({ error: 'Nieprawidłowy lub nieaktywny kod rabatowy' }, { status: 400 });
      }
      if (dc.expiresAt && new Date() > dc.expiresAt) {
        return NextResponse.json({ error: 'Kod rabatowy wygasł' }, { status: 400 });
      }
      if (dc.usageLimit && dc.usageCount >= dc.usageLimit) {
        return NextResponse.json({ error: 'Kod rabatowy został już w pełni wykorzystany' }, { status: 400 });
      }

      const tempTotal = items.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.id)!;
        return sum + Number(product.price) * item.quantity;
      }, 0);

      if (dc.minOrderAmount && tempTotal < Number(dc.minOrderAmount)) {
        return NextResponse.json(
          { error: `Minimalna kwota zamówienia to ${Number(dc.minOrderAmount).toFixed(2)} PLN` },
          { status: 400 },
        );
      }

      discountRecord = { id: dc.id, code: dc.code, type: dc.type, value: Number(dc.value) };

      if (dc.type === 'PERCENTAGE') {
        discountAmount = Math.round(tempTotal * Number(dc.value)) / 100;
      } else {
        discountAmount = Math.min(Number(dc.value), tempTotal);
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

    const productsTotal = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.id)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);
    const total = productsTotal - discountAmount + SHIPPING_COST_PLN;

    // Create order in database
    const order = await prisma.order.create({
      data: {
        customerEmail,
        customerName: customerName || customerEmail.split('@')[0],
        customerPhone: customerPhone || null,
        shippingMethod: 'paczkomat',
        shippingCarrier: 'inpost',
        pickupPointId: pickupPoint.code,
        pickupPointName: pickupPoint.name,
        shippingCost: SHIPPING_COST_PLN,
        discountCodeId: discountRecord?.id || null,
        discountAmount: discountAmount > 0 ? discountAmount : null,
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

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      `https://${req.headers.get('x-forwarded-host') || req.headers.get('host')}`;

    if (!stripe) {
      sendOrderEmail(order.id, customerEmail, {
        type: 'ORDER_CONFIRMATION',
        data: {
          orderNumber: order.id.slice(-8).toUpperCase(),
          customerName: order.customerName,
          items: items.map((item) => {
            const product = products.find((p) => p.id === item.id)!;
            return { name: product.name, quantity: item.quantity, price: Number(product.price) };
          }),
          total: Number(order.total),
        },
      }).catch((e) => console.error('[email] ORDER_CONFIRMATION (no-stripe) error:', e));
      return NextResponse.json({
        url: `${origin}/order/success?order_id=${order.id}`,
        orderId: order.id,
      });
    }

    // Dostawa tylko do paczkomatu — adres punktu jest już w zamówieniu,
    // więc nie zbieramy osobnego adresu wysyłki w Stripe.
    // Bez payment_method_types — Stripe dobiera metody aktywowane w dashboardzie
    // (karta od razu; BLIK/P24 pojawią się po aktywacji w trybie live, bez deployu).
    let stripeCouponId: string | undefined;
    if (discountAmount > 0 && stripe) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(discountAmount * 100),
        currency: 'pln',
        duration: 'once',
        name: `Rabat ${discountRecord!.code}`,
      });
      stripeCouponId = coupon.id;
    }

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      ...(stripeCouponId ? { discounts: [{ coupon: stripeCouponId }] } : {}),
      mode: 'payment',
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      customer_email: customerEmail,
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            display_name: 'Paczkomat InPost',
            fixed_amount: {
              amount: SHIPPING_COST_PLN * 100,
              currency: 'pln',
            },
          },
        },
      ],
      metadata: {
        orderId: order.id,
        pickupPointId: pickupPoint.code,
        ...(discountRecord ? { discountCodeId: discountRecord.id } : {}),
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    // Send ORDER_CONFIRMATION email (fire-and-forget)
    sendOrderEmail(order.id, customerEmail, {
      type: 'ORDER_CONFIRMATION',
      data: {
        orderNumber: order.id.slice(-8).toUpperCase(),
        customerName: order.customerName,
        items: items.map((item) => {
          const product = products.find((p) => p.id === item.id)!;
          return { name: product.name, quantity: item.quantity, price: Number(product.price) };
        }),
        total: Number(order.total),
      },
    }).catch((e) => console.error('[email] ORDER_CONFIRMATION fire-and-forget error:', e));

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas tworzenia sesji płatności' },
      { status: 500 }
    );
  }
}
