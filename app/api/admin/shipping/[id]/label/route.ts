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

    if (res.status === 204) {
      return NextResponse.json(
        { error: 'Przesyłka nie ma jeszcze etykiety.' },
        { status: 409 },
      );
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Furgonetka label error:', res.status, errorText);
      // Etykieta istnieje dopiero po opłaceniu/zleceniu przesyłki —
      // szkic w koszyku "Do wysłania" zwraca 400 ze statusem uniemożliwiającym.
      if (res.status === 400 && errorText.includes('status uniemo')) {
        return NextResponse.json(
          {
            error:
              'Przesyłka nie jest jeszcze opłacona. Opłać ją w panelu Furgonetki (zakładka "Do wysłania"), a etykieta będzie dostępna.',
          },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: 'Błąd pobierania etykiety', details: errorText },
        { status: 502 },
      );
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
