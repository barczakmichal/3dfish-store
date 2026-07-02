import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface CartRequestItem {
  id: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const { items } = (await req.json()) as { items: CartRequestItem[] };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Koszyk jest pusty' }, { status: 400 });
    }

    const productIds = items.map((i) => i.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const cartProducts = items.map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return null;
      return {
        name: product.name,
        sku: product.slug,
        ean: null,
        price: Number(product.price),
        quantity: item.quantity,
        weight: product.weightGrams ? product.weightGrams / 1000 : 0.5,
        dimensions: {
          width: product.widthMm ? product.widthMm / 10 : 20,
          height: product.heightMm ? product.heightMm / 10 : 10,
          depth: product.depthMm ? product.depthMm / 10 : 20,
        },
      };
    }).filter(Boolean);

    const totalValue = cartProducts.reduce(
      (sum, p) => sum + (p ? p.price * p.quantity : 0),
      0
    );
    const totalWeight = cartProducts.reduce(
      (sum, p) => sum + (p ? p.weight * p.quantity : 0),
      0
    );

    return NextResponse.json({
      products: cartProducts,
      totalValue,
      totalWeight,
      currency: 'PLN',
      language: 'pl',
      sender: {
        name: 'treefish',
        street: '',
        city: '',
        postCode: '',
        country: 'PL',
        email: 'kontakt@treefish.pl',
      },
    });
  } catch (error) {
    console.error('Furgonetka cart error:', error);
    return NextResponse.json({ error: 'Błąd pobierania danych koszyka' }, { status: 500 });
  }
}
