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
    await createClient().auth.signOut()
    router.push('/kbiacal/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/kbiacal"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            &larr; Back to scheduler
          </Link>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Sign out
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Family Setup</h1>
          <p className="text-gray-400 text-sm mb-6">
            Add your children to start scheduling KBIA classes.
          </p>

          <div className="space-y-4 mb-6">
            {children.map((child, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3">
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
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors text-sm"
                />
                <input
                  type="number"
                  value={child.age}
                  onChange={(e) => updateChild(i, 'age', parseInt(e.target.value) || 0)}
                  min={1}
                  max={18}
                  className="w-16 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors text-sm text-center"
                  title="Age"
                />
                <button
                  onClick={() => removeChild(i)}
                  className="text-gray-500 hover:text-red-400 transition-colors p-1"
                  title="Remove"
                >
                  &#10005;
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addChild}
            className="w-full py-2 px-4 border border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors text-sm mb-6"
          >
            + Add child
          </button>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving || children.length === 0}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
