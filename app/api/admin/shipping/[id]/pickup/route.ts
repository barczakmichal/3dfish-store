import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { furgonetkaApi, isFurgonetkaConfigured } from '@/lib/furgonetka';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });

    if (!isFurgonetkaConfigured()) {
      return NextResponse.json({ error: 'Furgonetka nie jest skonfigurowana' }, { status: 503 });
    }

    const { id } = await params;

    const res = await furgonetkaApi(`/packages/${id}/pickup`, {
      method: 'POST',
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Furgonetka pickup error:', errorText);
      return NextResponse.json({ error: 'Błąd zamawiania kuriera' }, { status: 502 });
    }

    const result = await res.json();

    return NextResponse.json({
      success: true,
      pickupId: result.pickup_id || result.id,
    });
  } catch (error) {
    console.error('Admin shipping pickup error:', error);
    return NextResponse.json({ error: 'Błąd zamawiania kuriera' }, { status: 500 });
  }
}
