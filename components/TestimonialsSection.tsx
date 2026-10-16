'use client';

const testimonials = [
  {
    name: 'Tomek W.',
    text: 'Uchwyt na wędkę idealnie pasuje do mojego pontonu. Jakość druku rewelacyjna!',
  },
  {
    name: 'Anna K.',
    text: 'Zamówiłam organizer na przynęty — precyzja wykonania niesamowita. Na pewno wrócę po więcej.',
  },
  {
    name: 'Marek S.',
    text: 'Szybka dostawa, super kontakt. Produkty wytrzymałe i praktyczne.',
  },
];

function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
    </svg>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Co mówią nasi klienci</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex gap-0.5 text-orange-400 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              <p className="text-gray-600 italic text-sm leading-relaxed">{t.text}</p>
              <p className="text-gray-900 font-semibold text-sm mt-4">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
