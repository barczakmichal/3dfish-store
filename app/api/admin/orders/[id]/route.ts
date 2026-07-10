import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })

    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, images: true } }
          }
        },
        emails: { orderBy: { sentAt: 'desc' } },
        events: { orderBy: { createdAt: 'asc' } },
      }
    })
    if (!order) return NextResponse.json({ error: 'Zamówienie nie znalezione' }, { status: 404 })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Błąd pobierania zamówienia:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    const validStatuses = Object.values(OrderStatus)
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Nieprawidłowy status' }, { status: 400 })
    }

    const current = await prisma.order.findUnique({ where: { id }, select: { status: true } })
    if (!current) return NextResponse.json({ error: 'Zamówienie nie znalezione' }, { status: 404 })

    const [order] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { status: body.status as OrderStatus }
      }),
      prisma.orderEvent.create({
        data: {
          orderId: id,
          type: 'status_change',
          fromValue: current.status,
          toValue: body.status,
          actor: 'admin',
        }
      }),
    ])

    return NextResponse.json(order)
  } catch (error) {
    console.error('Błąd aktualizacji zamówienia:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
