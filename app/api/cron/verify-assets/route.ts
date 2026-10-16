import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface BrokenAsset {
  productId: string
  productName: string
  slug: string
  url: string
  resolvedUrl: string
  status: number | null
  field: string
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://treefish.pl'

function resolveUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

async function checkUrl(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
    })
    return res.status
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, images: true },
  })

  const broken: BrokenAsset[] = []
  let totalChecked = 0

  for (const product of products) {
    for (let i = 0; i < product.images.length; i++) {
      const url = product.images[i]
      if (!url) continue
      totalChecked++
      const resolvedUrl = resolveUrl(url)
      const status = await checkUrl(resolvedUrl)
      if (status === null || status >= 400) {
        broken.push({
          productId: product.id,
          productName: product.name,
          slug: product.slug,
          url,
          resolvedUrl,
          status,
          field: `images[${i}]`,
        })
      }
    }
  }

  if (broken.length > 0) {
    const slackWebhook = process.env.SLACK_WEBHOOK_URL
    if (slackWebhook) {
      const lines = broken.map(
        (b) =>
          `• \`${b.field}\` *${b.productName}* — \`${b.resolvedUrl}\` — HTTP ${b.status ?? 'timeout'}`
      )
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 *treefish.pl — zepsute zasoby produktów* (${broken.length} z ${totalChecked})\n\n${lines.join('\n')}`,
        }),
      }).catch(() => {})
    }
  }

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    totalProducts: products.length,
    totalChecked,
    brokenCount: broken.length,
    broken,
  })
}
