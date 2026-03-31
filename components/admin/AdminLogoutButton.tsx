'use client'

import { signOut } from 'next-auth/react'

export default function AdminLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/admin/login' })}
      className="w-full text-left text-gray-400 hover:text-red-400 text-sm transition-colors"
    >
      Wyloguj się
    </button>
  )
}
