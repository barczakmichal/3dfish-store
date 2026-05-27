import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Strona nie znaleziona',
  description: 'Strona, której szukasz, nie istnieje.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-blue-700 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Strona nie znaleziona
        </h2>
        <p className="text-gray-600 mb-8">
          Przepraszamy, nie mogliśmy znaleźć strony, której szukasz.
        </p>
        <a
          href="/"
          className="inline-block bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors font-medium"
        >
          Wróć do strony głównej
        </a>
      </div>
    </div>
  );
}
