import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateIntegrationToken } from '@/lib/furgonetka';

// Wzór API integracji e-commerce Furgonetki: POST /orders/{sourceOrderId}/payments
// { paymentStatus: "completed", paidAmount: 200.99 }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateIntegrationToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const paymentStatus = body?.paymentStatus;

    if (!paymentStatus || typeof paymentStatus !== 'string') {
      return NextResponse.json({ error: 'paymentStatus is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (paymentStatus === 'completed' && order.status === 'PENDING') {
      await prisma.order.update({ where: { id }, data: { status: 'PAID' } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Furgonetka payments error:', error);
    return NextResponse.json({ error: 'Błąd aktualizacji płatności' }, { status: 500 });
  }
}
