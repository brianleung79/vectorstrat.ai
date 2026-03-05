'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function JoinPage() {
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  async function handleJoin() {
    setJoining(true)
    setError('')

    try {
      const res = await fetch('/api/family/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to join family')
        setJoining(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/kbiacal'), 1500)
    } catch {
      setError('Something went wrong. Please try again.')
      setJoining(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0f2438, #1a3a5c)' }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl p-8 shadow-xl text-center" style={{ background: 'rgba(26, 58, 92, 0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>

          {success ? (
            <>
              <div className="text-4xl mb-4">&#10003;</div>
              <h1 className="text-2xl font-bold text-white mb-2">You&apos;re in!</h1>
              <p className="text-slate-300 text-sm" style={{ opacity: 0.7 }}>
                Redirecting to the scheduler...
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">
                Family Invite
              </h1>
              <p className="text-slate-300 text-sm mb-6" style={{ opacity: 0.7 }}>
                You&apos;ve been invited to join a family on KBIACal.
                Accept to share children and schedules.
              </p>

              {error && (
                <p className="text-red-300 text-sm rounded-lg px-3 py-2 mb-4" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.25)' }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full py-2.5 px-4 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                style={{ background: 'linear-gradient(135deg, #2a5a8c, #4fd1c5)' }}
                onMouseOver={(e) => { if (!joining) e.currentTarget.style.background = 'linear-gradient(135deg, #3470a5, #5ee0ce)' }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #2a5a8c, #4fd1c5)' }}
              >
                {joining ? 'Joining...' : 'Accept Invite'}
              </button>

              <button
                onClick={() => router.push('/kbiacal')}
                className="w-full py-2 px-4 text-slate-400 hover:text-slate-200 text-sm transition-colors"
              >
                No thanks, go to scheduler
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
