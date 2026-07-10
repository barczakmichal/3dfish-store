import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })

    const { id } = await params
    const emails = await prisma.emailLog.findMany({
      where: { orderId: id },
      orderBy: { sentAt: 'desc' },
    })

    return NextResponse.json(emails)
  } catch (error) {
    console.error('Błąd pobierania historii emaili:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
