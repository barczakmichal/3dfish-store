import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { validateProductLicenseInput } from '@/lib/license'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })

    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Błąd pobierania produktów:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })

    const body = await req.json()

    if (!body.name || !body.description || body.price === undefined || !body.category || !body.slug) {
      return NextResponse.json({ error: 'Brakujące wymagane pola' }, { status: 400 })
    }

    const licenseError = validateProductLicenseInput({ sourceUrl: body.sourceUrl ?? null, licenseType: body.licenseType })
    if (licenseError) {
      return NextResponse.json({ error: licenseError }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        images: body.images || [],
        stock: body.stock || 0,
        category: body.category,
        slug: body.slug,
        sourceUrl: body.sourceUrl ?? null,
        sourceFileUrl: body.sourceFileUrl ?? null,
        printedImageUrl: body.printedImageUrl ?? null,
        licenseType: body.licenseType,
        commercialUseOverride: body.commercialUseOverride ?? null,
        licenseVerifiedAt: new Date(),
        licenseVerifiedBy: body.licenseVerifiedBy ?? session.user?.email ?? 'admin',
        marketingImageUrl: body.marketingImageUrl ?? null,
        packshotImageUrl: body.packshotImageUrl ?? null,
      }
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Błąd tworzenia produktu:', error)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
