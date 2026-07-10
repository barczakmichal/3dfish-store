import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    if (!body.note || typeof body.note !== 'string' || !body.note.trim()) {
      return NextResponse.json({ error: 'Treść notatki jest wymagana' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id }, select: { id: true } })
    if (!order) return NextResponse.json({ error: 'Zamówienie nie znalezione' }, { status: 404 })

    const event = await prisma.orderEvent.create({
      data: {
        orderId: id,
        type: 'note_added',
        note: body.note.trim(),
        actor: 'admin',
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Błąd dodawania notatki:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
