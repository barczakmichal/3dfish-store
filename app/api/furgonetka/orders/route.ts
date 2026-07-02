import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyHmacSignature } from '@/lib/furgonetka';

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
