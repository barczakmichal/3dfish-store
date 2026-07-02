import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyHmacSignature } from '@/lib/furgonetka';

interface PaymentStatusPayload {
  order_id: string;
  status: 'paid' | 'cancelled' | 'refunded';
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

    const payload = JSON.parse(body) as PaymentStatusPayload;

    const order = await prisma.order.findFirst({
      where: { furgonetkaId: payload.order_id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Zamówienie nie znalezione' }, { status: 404 });
    }

    const statusMap: Record<string, 'PAID' | 'CANCELLED'> = {
      paid: 'PAID',
      cancelled: 'CANCELLED',
      refunded: 'CANCELLED',
    };

    const newStatus = statusMap[payload.status];
    if (newStatus) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: newStatus },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Furgonetka payment-status webhook error:', error);
    return NextResponse.json({ error: 'Błąd aktualizacji statusu płatności' }, { status: 500 });
  }
}
