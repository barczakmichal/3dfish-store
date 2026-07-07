import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateIntegrationToken } from '@/lib/furgonetka';

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
    // Oficjalny wzór API: { tracking: { number, courierService } };
    // tracking_number zostaje dla zgodności ze starszymi testami.
    const trackingNumber = body?.tracking?.number ?? body?.tracking_number;

    if (!trackingNumber || typeof trackingNumber !== 'string') {
      return NextResponse.json(
        { error: 'tracking.number is required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        trackingNumber,
        status: 'SHIPPED',
      },
    });

    return NextResponse.json({
      success: true,
      orderId: updated.id,
      trackingNumber: updated.trackingNumber,
      status: updated.status,
    });
  } catch (error) {
    console.error('Furgonetka tracking-number error:', error);
    return NextResponse.json(
      { error: 'Błąd aktualizacji numeru śledzenia' },
      { status: 500 }
    );
  }
}
