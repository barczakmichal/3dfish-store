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
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return NextResponse.json({ error: 'Produkt nie znaleziony' }, { status: 404 })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Błąd pobierania produktu:', error)
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

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        images: body.images,
        stock: body.stock,
        category: body.category,
        slug: body.slug,
        sourceUrl: body.sourceUrl ?? null,
        sourceFileUrl: body.sourceFileUrl ?? null,
        printedImageUrl: body.printedImageUrl ?? null,
      }
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error('Błąd aktualizacji produktu:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })

    const { id } = await params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Błąd usuwania produktu:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
