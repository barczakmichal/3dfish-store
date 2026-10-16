'use client';

import { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <div className="max-w-xl mx-auto px-4 text-center text-white">
        <h2 className="text-3xl font-bold mb-3">Bądź na bieżąco</h2>
        <p className="text-blue-100 mb-8">Otrzymuj informacje o nowościach i promocjach</p>

        {submitted ? (
          <p className="text-lg font-medium text-orange-300">Dziękujemy za zapisanie!</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Twój adres e-mail"
              className="flex-1 rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-3 rounded-lg transition-colors text-sm whitespace-nowrap"
            >
              Zapisz się
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
