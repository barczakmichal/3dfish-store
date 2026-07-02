import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { furgonetkaApi, isFurgonetkaConfigured } from '@/lib/furgonetka';

export async function GET(
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

    const res = await furgonetkaApi(`/packages/${id}/label`);

    if (!res.ok) {
      return NextResponse.json({ error: 'Błąd pobierania etykiety' }, { status: 502 });
    }

    const pdfBuffer = await res.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="label-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Admin shipping label error:', error);
    return NextResponse.json({ error: 'Błąd pobierania etykiety' }, { status: 500 });
  }
}
