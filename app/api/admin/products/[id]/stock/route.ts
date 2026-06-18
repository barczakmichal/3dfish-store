import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    if (typeof body.stock !== 'number' || body.stock < 0) {
      return NextResponse.json({ error: 'Nieprawidłowa wartość stanu magazynowego' }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { id },
      data: { stock: body.stock },
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Błąd aktualizacji stanu magazynowego:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
