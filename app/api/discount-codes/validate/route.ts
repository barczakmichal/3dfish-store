import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { code, orderAmount } = (await req.json()) as {
    code: string;
    orderAmount?: number;
  };

  if (!code) {
    return NextResponse.json({ error: 'Podaj kod rabatowy' }, { status: 400 });
  }

  const discount = await prisma.discountCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!discount) {
    return NextResponse.json({ error: 'Nieprawidłowy kod rabatowy' }, { status: 404 });
  }

  if (!discount.isActive) {
    return NextResponse.json({ error: 'Kod rabatowy jest nieaktywny' }, { status: 400 });
  }

  if (discount.expiresAt && new Date() > discount.expiresAt) {
    return NextResponse.json({ error: 'Kod rabatowy wygasł' }, { status: 400 });
  }

  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
    return NextResponse.json({ error: 'Kod rabatowy został już wykorzystany maksymalną liczbę razy' }, { status: 400 });
  }

  if (discount.minOrderAmount && orderAmount != null && orderAmount < Number(discount.minOrderAmount)) {
    return NextResponse.json(
      { error: `Minimalna kwota zamówienia to ${Number(discount.minOrderAmount).toFixed(2)} PLN` },
      { status: 400 }
    );
  }

  return NextResponse.json({
    code: discount.code,
    type: discount.type,
    value: Number(discount.value),
    minOrderAmount: discount.minOrderAmount ? Number(discount.minOrderAmount) : null,
  });
}
