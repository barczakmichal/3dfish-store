'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
  unstable_retry: () => void
}) {
  return (
    <html lang="pl">
      <body>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Coś poszło nie tak</h2>
            <button
              onClick={() => reset()}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
