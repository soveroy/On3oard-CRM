'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
    })
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <main className="min-h-screen grid place-items-center bg-[#0D1B2A] text-white">
      <form onSubmit={onSubmit} className="w-80 space-y-4">
        <h1 className="text-2xl font-semibold">On3oard CRM</h1>
        {sent ? (
          <p>Check your inbox for a magic link.</p>
        ) : (
          <>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@on3oard.com"
              className="w-full rounded-md bg-white/5 px-3 py-2 outline-none ring-1 ring-white/10"
            />
            <button className="w-full rounded-md bg-[#ff914d] px-3 py-2 font-medium text-[#0D1B2A]">
              Send magic link
            </button>
            {error && <p className="text-[#f93f58] text-sm">{error}</p>}
          </>
        )}
      </form>
    </main>
  )
}
