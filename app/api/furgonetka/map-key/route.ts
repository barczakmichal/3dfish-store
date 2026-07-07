import { NextResponse } from 'next/server';

// Klucz mapy punktów Furgonetki jest przypisany do domeny sklepu (nie jest
// sekretem w sensie ścisłym), ale trzymamy go w env serwera, bo NEXT_PUBLIC_*
// wymagałoby wstrzykiwania na etapie builda obrazu Docker.
export async function GET() {
  const apiKey = process.env.FURGONETKA_MAP_API_KEY || '';
  if (!apiKey) {
    return NextResponse.json({ error: 'Mapa punktów nie jest skonfigurowana' }, { status: 503 });
  }
  return NextResponse.json({ apiKey });
}
