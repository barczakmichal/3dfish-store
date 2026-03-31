'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';

// Przykładowe dane produktu (będą pobierane z DB)
const mockProducts: Record<string, {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  images: string[];
}> = {
  'kolowrotek-spinmaster-3d': {
    id: '1',
    name: 'Kołowrotek SpinMaster 3D',
    price: 129.99,
    description: 'Profesjonalny kołowrotek wędkarski drukowany w technologii 3D. Wykonany z najwyższej jakości tworzyw sztucznych odpornych na wodę i UV. Idealny do wędkowania spinningowego. Hamulec tylny z regulacją, 5 łożysk kulkowych, przekładnia 5.2:1.',
    category: 'Kołowrotki',
    stock: 15,
    images: [],
  },
  'splawik-ultrafloat-pro': {
    id: '2',
    name: 'Spławik UltraFloat Pro',
    price: 24.99,
    description: 'Precyzyjnie wydrukowany spławik o doskonałej widoczności i stabilności. Dostępny w jaskrawych kolorach. Aerodynamiczny kształt minimalizuje opory powietrza podczas rzutu. Nośność 3g.',
    category: 'Spławiki',
    stock: 50,
    images: [],
  },
  'przypona-fluorocarbon-3d': {
    id: '3',
    name: 'Przypona Fluorocarbon 3D',
    price: 39.99,
    description: 'Zestaw przypon fluorowęglowych z elementami drukowanymi w 3D. Wytrzymałość 8kg, długość 30cm. Elementy złączne wydrukowane z PLA+.',
    category: 'Przypony',
    stock: 30,
    images: [],
  },
  'haczyk-steelhook-3d-pack': {
    id: '4',
    name: 'Haczyk SteelHook 3D Pack',
    price: 19.99,
    description: 'Zestaw haczyków wędkarskich z uchwytem drukowanym w 3D. Opakowanie zawiera 20 sztuk haczyków w różnych rozmiarach (6-12). Doskonałe do wędkowania karpiowego.',
    category: 'Haczyki',
    stock: 100,
    images: [],
  },
  'zaneta-pelletmix-3d': {
    id: '5',
    name: 'Zanęta PelletMix 3D',
    price: 34.99,
    description: 'Innowacyjna zanęta w pelletach z dodatkami wydrukowanymi w 3D. Przyciąga karpie i liny. Opakowanie 1kg. Skład naturalny, bez konserwantów.',
    category: 'Zanęty',
    stock: 25,
    images: [],
  },
  'wedka-carbonpro-3d': {
    id: '6',
    name: 'Wędka CarbonPro 3D',
    price: 299.99,
    description: 'Wędka karpiowa z węgla z elementami prowadnicy drukowanymi w 3D. Długość 3.6m, akcja szybka. Uchwyty z EVA, przelotki Fuji. Idealna do połowów karpia i amura.',
    category: 'Wędki',
    stock: 8,
    images: [],
  },
};

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const addItem = useCartStore((state) => state.addItem);

  const product = mockProducts[slug];

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Produkt nie znaleziony</h1>
        <p className="text-gray-600 mb-8">Przepraszamy, taki produkt nie istnieje.</p>
        <Link href="/products" className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors">
          Wróć do produktów
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(product.price);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '',
      slug,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-blue-700">Strona główna</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-blue-700">Produkty</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product image */}
        <div className="aspect-square bg-blue-50 rounded-2xl flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-32 h-32 text-blue-200">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75 7.5 9l4.5 4.5 3-3.75 4.5 5.25H2.25Z" />
          </svg>
        </div>

        {/* Product details */}
        <div>
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
            {product.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="text-4xl font-bold text-blue-700 mb-6">{formattedPrice}</div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            <span className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-600">
              {product.stock > 0 ? `Dostępny (${product.stock} szt.)` : 'Brak w magazynie'}
            </span>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-colors text-lg mb-4"
          >
            {product.stock > 0 ? 'Dodaj do koszyka' : 'Brak w magazynie'}
          </button>

          <Link
            href="/cart"
            className="block w-full text-center border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold py-4 px-8 rounded-xl transition-colors text-lg"
          >
            Przejdź do koszyka
          </Link>
        </div>
      </div>
    </div>
  );
}
