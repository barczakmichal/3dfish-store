import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { furgonetkaApi, isFurgonetkaConfigured } from '@/lib/furgonetka';

async function getServiceId(carrier: string, pickup: Record<string, string>, receiver: Record<string, string>, parcels: Record<string, unknown>[]): Promise<number | null> {
  const res = await furgonetkaApi('/packages/calculate-price', {
    method: 'POST',
    body: JSON.stringify({ pickup, receiver, parcels, type: 'standard' }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const services: { service: string; service_id: number; available: boolean }[] = data.services_prices || [];
  const match = services.find((s) => s.service === carrier);
  if (match) return match.service_id;
  const fallback = services.find((s) => s.available) || services[0];
  return fallback?.service_id ?? null;
}

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
      quantity: 1,
      description: order.items.map((i) => i.product.name).join(', '),
      value: Number(order.total),
    }];

    const senderName = process.env.FURGONETKA_SENDER_NAME || 'Aleksandra Barczak';
    const senderCompany = process.env.FURGONETKA_SENDER_COMPANY || 'Treefish';
    const senderEmail = process.env.FURGONETKA_SENDER_EMAIL || process.env.FURGONETKA_USERNAME || '';
    const senderPhone = process.env.FURGONETKA_SENDER_PHONE || '606373738';
    const senderStreet = process.env.FURGONETKA_SENDER_STREET || 'ul. Michała Kleofasa Ogińskiego 2';
    const senderCity = process.env.FURGONETKA_SENDER_CITY || 'Bydgoszcz';
    const senderPostcode = process.env.FURGONETKA_SENDER_POSTCODE || '85-092';

    const pickup = {
      name: senderName,
      company: senderCompany,
      email: senderEmail,
      phone: senderPhone,
      street: senderStreet,
      city: senderCity,
      postcode: senderPostcode,
      country_code: 'PL',
    };

    const receiver = {
      name: order.customerName || '',
      company: '',
      email: order.customerEmail || '',
      phone: order.customerPhone || '',
      street: order.street || '',
      city: order.city || '',
      postcode: order.postalCode || '',
      country_code: order.country || 'PL',
      ...(order.pickupPointId ? { point: order.pickupPointId } : {}),
    };

    const carrier = order.shippingCarrier || 'inpost';
    const serviceId = await getServiceId(carrier, pickup, receiver, parcels);
    if (!serviceId) {
      console.error('Furgonetka: no available service for carrier', carrier);
      return NextResponse.json(
        { error: `Brak dostępnej usługi wysyłkowej dla kuriera: ${carrier}` },
        { status: 422 },
      );
    }

    const packageData = {
      service_id: serviceId,
      pickup,
      receiver,
      parcels,
      type: 'standard',
      user_reference_number: `TF-${order.id.slice(-8).toUpperCase()}`,
    };

    console.log('Furgonetka create package request:', JSON.stringify(packageData));

    const res = await furgonetkaApi('/packages', {
      method: 'POST',
      body: JSON.stringify(packageData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Furgonetka create package error:', errorText);
      return NextResponse.json(
        { error: 'Błąd tworzenia przesyłki w Furgonetce', details: errorText },
        { status: 502 },
      );
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
