import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.discountCode.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Kod nie znaleziony' }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (body.code !== undefined) {
    const upper = body.code.toUpperCase();
    const conflict = await prisma.discountCode.findUnique({ where: { code: upper } });
    if (conflict && conflict.id !== id) {
      return NextResponse.json({ error: 'Taki kod już istnieje' }, { status: 409 });
    }
    data.code = upper;
  }
  if (body.type !== undefined) data.type = body.type;
  if (body.value !== undefined) data.value = Number(body.value);
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  if (body.usageLimit !== undefined) data.usageLimit = body.usageLimit ? Number(body.usageLimit) : null;
  if (body.minOrderAmount !== undefined) data.minOrderAmount = body.minOrderAmount ? Number(body.minOrderAmount) : null;

  const updated = await prisma.discountCode.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.discountCode.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Kod nie znaleziony' }, { status: 404 });
  }

  await prisma.discountCode.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
