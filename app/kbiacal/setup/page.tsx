'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Child {
  name: string
  age: number
  color: string
}

const COLOR_OPTIONS = [
  { value: '#4a90d9', label: 'Blue' },
  { value: '#e74c3c', label: 'Red' },
  { value: '#2ecc71', label: 'Green' },
  { value: '#f39c12', label: 'Orange' },
  { value: '#9b59b6', label: 'Purple' },
  { value: '#1abc9c', label: 'Teal' },
  { value: '#e91e63', label: 'Pink' },
  { value: '#795548', label: 'Brown' },
]

export const dynamic = 'force-dynamic'

export default function SetupPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function loadFamily() {
      const res = await fetch('/api/family')
      const data = await res.json()
      if (data.children && data.children.length > 0) {
        setChildren(data.children)
      }
      setLoading(false)
    }
    loadFamily()
  }, [])

  function addChild() {
    const usedColors = children.map(c => c.color)
    const nextColor = COLOR_OPTIONS.find(c => !usedColors.includes(c.value))?.value || COLOR_OPTIONS[0].value
    setChildren([...children, { name: '', age: 5, color: nextColor }])
  }

  function updateChild(index: number, field: keyof Child, value: string | number) {
    const updated = [...children]
    updated[index] = { ...updated[index], [field]: value }
    setChildren(updated)
  }

  function removeChild(index: number) {
    setChildren(children.filter((_, i) => i !== index))
  }

  async function handleSave() {
    // Validate
    const valid = children.every(c => c.name.trim() && c.age > 0)
    if (!valid) {
      setError('Each child needs a name and age.')
      return
    }
    if (children.length === 0) {
      setError('Add at least one child.')
      return
    }

    setError('')
    setSaving(true)

    const res = await fetch('/api/family', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ children: children.map(c => ({ ...c, name: c.name.trim() })) }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to save')
      setSaving(false)
      return
    }

    router.push('/kbiacal')
  }

  async function handleLogout() {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/kbiacal/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f2438, #1a3a5c)' }}>
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0f2438, #1a3a5c)' }}>
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/kbiacal"
            className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            &larr; Back to scheduler
          </Link>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            Sign out
          </button>
        </div>

        <div className="rounded-2xl p-8 shadow-xl" style={{ background: 'rgba(26, 58, 92, 0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 className="text-2xl font-bold text-white mb-2">Family Setup</h1>
          <p className="text-slate-300 text-sm mb-6" style={{ opacity: 0.7 }}>
            Add your children to start scheduling KBIA classes.
          </p>

          <div className="space-y-4 mb-6">
            {children.map((child, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <input
                  type="color"
                  value={child.color}
                  onChange={(e) => updateChild(i, 'color', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                  title="Pick a color"
                />
                <input
                  type="text"
                  value={child.name}
                  onChange={(e) => updateChild(i, 'name', e.target.value)}
                  placeholder="Name"
                  className="flex-1 px-3 py-2 rounded-lg text-white placeholder-slate-400 focus:outline-none transition-colors text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                  onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px rgba(79,209,197,0.4)'; e.target.style.borderColor = '#4fd1c5' }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'rgba(255,255,255,0.2)' }}
                />
                <input
                  type="number"
                  value={child.age}
                  onChange={(e) => updateChild(i, 'age', parseInt(e.target.value) || 0)}
                  min={1}
                  max={18}
                  className="w-16 px-3 py-2 rounded-lg text-white focus:outline-none transition-colors text-sm text-center"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                  onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px rgba(79,209,197,0.4)'; e.target.style.borderColor = '#4fd1c5' }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'rgba(255,255,255,0.2)' }}
                  title="Age"
                />
                <button
                  onClick={() => removeChild(i)}
                  className="text-slate-400 hover:text-red-400 transition-colors p-1"
                  title="Remove"
                >
                  &#10005;
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addChild}
            className="w-full py-2 px-4 rounded-lg text-slate-300 hover:text-white transition-colors text-sm mb-6"
            style={{ border: '1px dashed rgba(255,255,255,0.2)' }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)' }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
          >
            + Add child
          </button>

          {error && (
            <p className="text-red-300 text-sm rounded-lg px-3 py-2 mb-4" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.25)' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving || children.length === 0}
            className="w-full py-2.5 px-4 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #2a5a8c, #4fd1c5)' }}
            onMouseOver={(e) => { if (!saving && children.length > 0) e.currentTarget.style.background = 'linear-gradient(135deg, #3470a5, #5ee0ce)' }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #2a5a8c, #4fd1c5)' }}
          >
            {saving ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
