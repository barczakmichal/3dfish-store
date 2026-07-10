import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import OrderDetailClient from '@/components/admin/OrderDetailClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  return { title: `Zamówienie ${id.slice(0, 8)}... - Panel Admina` }
}

async function getOrder(id: string) {
  try {
    return await prisma.order.findUnique({
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
  } catch {
    return null
  }
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) notFound()

  // Serialize Decimal fields to string for the client component
  const serialized = {
    ...order,
    total: order.total.toString(),
    shippingCost: order.shippingCost?.toString() ?? null,
    items: order.items.map(item => ({
      ...item,
      price: item.price.toString(),
    })),
    events: order.events.map(event => ({
      ...event,
      createdAt: event.createdAt.toISOString(),
    })),
    emails: order.emails,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }

  return <OrderDetailClient order={serialized} />
}
