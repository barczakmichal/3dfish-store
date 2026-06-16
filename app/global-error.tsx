'use client'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html lang="pl">
      <body>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Coś poszło nie tak!</h2>
          <p>{error.message}</p>
          <button
            onClick={() => unstable_retry()}
            style={{ marginTop: '16px', padding: '8px 16px' }}
          >
            Spróbuj ponownie
          </button>
        </div>
      </body>
    </html>
  )
}
