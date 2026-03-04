'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawRedirect = searchParams.get('redirectTo') || '/kbiacal'
  const redirectTo = rawRedirect.startsWith('/kbiacal') ? rawRedirect : '/kbiacal'

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
      } else {
        router.push(redirectTo)
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for a confirmation link.')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0f2438, #1a3a5c)' }}>
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="block text-center text-slate-400 hover:text-slate-200 text-sm mb-8 transition-colors"
        >
          &larr; Back to vectorstrat.ai
        </Link>

        <div className="rounded-2xl p-8 shadow-xl" style={{ background: 'rgba(26, 58, 92, 0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 className="text-2xl font-bold text-center mb-2 text-white">
            KBIACal
          </h1>
          <p className="text-slate-300 text-center text-sm mb-6" style={{ opacity: 0.7 }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>

          {message ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📬</div>
              <p className="text-teal-400 font-medium mb-2">Check your email</p>
              <p className="text-slate-300 text-sm" style={{ opacity: 0.7 }}>{message}</p>
              <button
                onClick={() => { setMessage(''); setMode('login') }}
                className="mt-6 text-sm text-teal-400 hover:text-teal-300 transition-colors"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                    onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px rgba(79,209,197,0.4)'; e.target.style.borderColor = '#4fd1c5' }}
                    onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'rgba(255,255,255,0.2)' }}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                    onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px rgba(79,209,197,0.4)'; e.target.style.borderColor = '#4fd1c5' }}
                    onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'rgba(255,255,255,0.2)' }}
                    placeholder="At least 6 characters"
                  />
                </div>

                {error && (
                  <p className="text-red-300 text-sm rounded-lg px-3 py-2" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.25)' }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #2a5a8c, #4fd1c5)' }}
                  onMouseOver={(e) => { if (!loading) e.currentTarget.style.background = 'linear-gradient(135deg, #3470a5, #5ee0ce)' }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #2a5a8c, #4fd1c5)' }}
                >
                  {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
                  className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
                >
                  {mode === 'login'
                    ? "Don\u0027t have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f2438, #1a3a5c)' }}>
        <p className="text-slate-400">Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
