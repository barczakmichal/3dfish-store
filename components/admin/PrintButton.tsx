'use client'

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="print-btn no-print">
      Drukuj
    </button>
  )
}
