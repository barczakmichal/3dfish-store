import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const codes = await prisma.discountCode.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(codes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { code, type, value, isActive, expiresAt, usageLimit, minOrderAmount } = body;

  if (!code || !type || value == null) {
    return NextResponse.json({ error: 'Kod, typ i wartość są wymagane' }, { status: 400 });
  }

  if (type !== 'PERCENTAGE' && type !== 'FIXED_AMOUNT') {
    return NextResponse.json({ error: 'Nieprawidłowy typ rabatu' }, { status: 400 });
  }

  if (Number(value) <= 0) {
    return NextResponse.json({ error: 'Wartość rabatu musi być większa od 0' }, { status: 400 });
  }

  if (type === 'PERCENTAGE' && Number(value) > 100) {
    return NextResponse.json({ error: 'Rabat procentowy nie może przekraczać 100%' }, { status: 400 });
  }

  const existing = await prisma.discountCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (existing) {
    return NextResponse.json({ error: 'Kod rabatowy już istnieje' }, { status: 409 });
  }

  const discountCode = await prisma.discountCode.create({
    data: {
      code: code.toUpperCase(),
      type,
      value: Number(value),
      isActive: isActive ?? true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
    },
  });

  return NextResponse.json(discountCode, { status: 201 });
}
