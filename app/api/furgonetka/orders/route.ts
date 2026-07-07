import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyHmacSignature, validateIntegrationToken } from '@/lib/furgonetka';

// Format odpowiedzi wg wzoru API integracji e-commerce Furgonetki
// (https://furgonetka.pl/api/universal-integration-example): top-level tablica
// zamówień nowszych niż ?datetime, sortowanych od najstarszego, max ?limit.
export async function GET(req: NextRequest) {
  if (!validateIntegrationToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const datetimeParam = req.nextUrl.searchParams.get('datetime');
    const limitParam = Number(req.nextUrl.searchParams.get('limit'));
    const since = datetimeParam ? new Date(datetimeParam) : null;
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 100;

    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'PAID'] },
        ...(since && !isNaN(since.getTime()) ? { updatedAt: { gt: since } } : {}),
      },
      include: { items: { include: { product: true } } },
      orderBy: { updatedAt: 'asc' },
      take: limit,
    });

    return NextResponse.json(
      orders.map((order) => {
        const [firstName, ...rest] = (order.customerName || '').trim().split(/\s+/);
        const totalWeightKg = order.items.reduce(
          (sum, item) => sum + ((item.product.weightGrams || 500) / 1000) * item.quantity,
          0,
        );
        return {
          sourceOrderId: order.id,
          datetimeOrder: order.createdAt.toISOString(),
          sourceDatetimeChange: order.updatedAt.toISOString(),
          service: order.shippingCarrier || 'inpost',
          status: order.status === 'PAID' ? 'paid' : 'pending',
          totalPrice: Number(order.total),
          shippingCost: Number(order.shippingCost ?? 0),
          totalPaid: order.status === 'PAID' ? Number(order.total) : 0,
          codAmount: 0,
          totalWeight: Math.round(totalWeightKg * 1000) / 1000,
          ...(order.pickupPointId ? { point: order.pickupPointId } : {}),
          ...(order.notes ? { comment: order.notes } : {}),
          shippingAddress: {
            company: '',
            name: firstName || '',
            surname: rest.join(' '),
            street: order.street || '',
            city: order.city || '',
            postcode: order.postalCode || '',
            countryCode: order.country || 'PL',
            phone: order.customerPhone || '',
            email: order.customerEmail,
          },
          products: order.items.map((item) => ({
            sourceProductId: item.productId,
            name: item.product.name,
            priceGross: Number(item.price),
            quantity: item.quantity,
            weight: (item.product.weightGrams || 500) / 1000,
          })),
          ...(order.status === 'PAID' ? { paymentDatetime: order.updatedAt.toISOString() } : {}),
        };
      }),
    );
  } catch (error) {
    console.error('Furgonetka GET /orders error:', error);
    return NextResponse.json({ error: 'Błąd pobierania zamówień' }, { status: 500 });
  }
}

interface FurgonetkaOrderPayload {
  order_id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      postCode: string;
      country: string;
    };
  };
  delivery: {
    method: string;
    carrier: string;
    price: number;
    pickupPoint?: {
      id: string;
      name: string;
    };
  };
  products: Array<{
    sku: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  notes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-furgonetka-signature');

    if (signature && process.env.FURGONETKA_SECRET_KEY) {
      if (!verifyHmacSignature(body, signature)) {
        return NextResponse.json({ error: 'Nieprawidłowy podpis' }, { status: 401 });
      }
    }

    const payload = JSON.parse(body) as FurgonetkaOrderPayload;

    const total = payload.products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    ) + (payload.delivery?.price || 0);

    const productSlugs = payload.products.map((p) => p.sku);
    const products = await prisma.product.findMany({
      where: { slug: { in: productSlugs } },
    });

    const order = await prisma.order.create({
      data: {
        customerEmail: payload.customer.email,
        customerName: payload.customer.name,
        customerPhone: payload.customer.phone,
        street: payload.customer.address.street,
        city: payload.customer.address.city,
        postalCode: payload.customer.address.postCode,
        country: payload.customer.address.country || 'PL',
        total,
        status: 'PENDING',
        shippingMethod: payload.delivery.method,
        shippingCarrier: payload.delivery.carrier,
        shippingCost: payload.delivery.price,
        pickupPointId: payload.delivery.pickupPoint?.id,
        pickupPointName: payload.delivery.pickupPoint?.name,
        furgonetkaId: payload.order_id,
        notes: payload.notes,
        items: {
          create: payload.products.map((item) => {
            const product = products.find((p) => p.slug === item.sku);
            return {
              productId: product?.id || '',
              quantity: item.quantity,
              price: item.price,
            };
          }).filter((item) => item.productId),
        },
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: order.status,
    });
  } catch (error) {
    console.error('Furgonetka orders webhook error:', error);
    return NextResponse.json({ error: 'Błąd przetwarzania zamówienia' }, { status: 500 });
  }
}
