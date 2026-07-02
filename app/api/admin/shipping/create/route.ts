import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { furgonetkaApi, isFurgonetkaConfigured } from '@/lib/furgonetka';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });

    if (!isFurgonetkaConfigured()) {
      return NextResponse.json({ error: 'Furgonetka nie jest skonfigurowana' }, { status: 503 });
    }

    const { orderId } = (await req.json()) as { orderId: string };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: 'Zamówienie nie znalezione' }, { status: 404 });
    }

    const parcels = [{
      weight: order.items.reduce((sum, item) => {
        const w = item.product.weightGrams || 500;
        return sum + (w / 1000) * item.quantity;
      }, 0),
      width: 30,
      height: 20,
      depth: 15,
      contents: order.items.map((i) => i.product.name).join(', '),
      value: Number(order.total),
    }];

    const packageData = {
      service: order.shippingCarrier || 'inpost',
      pickup: order.shippingMethod === 'paczkomat' ? 'parcel_locker' : 'courier',
      receiver: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone || '',
        address: {
          street: order.street || '',
          city: order.city || '',
          postCode: order.postalCode || '',
          country: order.country || 'PL',
        },
        ...(order.pickupPointId ? { point: order.pickupPointId } : {}),
      },
      parcels,
      cod: null,
      insurance: Number(order.total),
    };

    const res = await furgonetkaApi('/packages', {
      method: 'POST',
      body: JSON.stringify(packageData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Furgonetka create package error:', errorText);
      return NextResponse.json({ error: 'Błąd tworzenia przesyłki w Furgonetce' }, { status: 502 });
    }

    const result = await res.json();

    await prisma.order.update({
      where: { id: orderId },
      data: {
        furgonetkaId: result.package_id || result.id,
        trackingNumber: result.tracking_number,
        status: 'SHIPPED',
      },
    });

    return NextResponse.json({
      success: true,
      packageId: result.package_id || result.id,
      trackingNumber: result.tracking_number,
    });
  } catch (error) {
    console.error('Admin shipping create error:', error);
    return NextResponse.json({ error: 'Błąd tworzenia przesyłki' }, { status: 500 });
  }
}
