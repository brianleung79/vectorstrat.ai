import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkCsrf } from '@/lib/security'

const MAX_CHILDREN = 10
const MAX_NAME_LENGTH = 50
const MAX_COLOR_LENGTH = 20

function validateChild(c: unknown): c is { name: string; age: number; color: string } {
  if (!c || typeof c !== 'object') return false
  const obj = c as Record<string, unknown>
  return (
    typeof obj.name === 'string' && obj.name.length > 0 && obj.name.length <= MAX_NAME_LENGTH &&
    typeof obj.age === 'number' && Number.isInteger(obj.age) && obj.age >= 1 && obj.age <= 18 &&
    typeof obj.color === 'string' && obj.color.length > 0 && obj.color.length <= MAX_COLOR_LENGTH
  )
}

// GET /api/family — returns the user's family (children array)
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('families')
      .select('children')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Family GET error:', error.message)
      return NextResponse.json({ error: 'Failed to load family data' }, { status: 500 })
    }

    return NextResponse.json({ children: data?.children || null })
  } catch (error) {
    console.error('Family GET error:', error)
    return NextResponse.json({ error: 'Failed to load family data' }, { status: 500 })
  }
}

// PUT /api/family — upsert the user's family
export async function PUT(request: NextRequest) {
  if (!checkCsrf(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { children } = body

    if (!Array.isArray(children)) {
      return NextResponse.json({ error: 'children must be an array' }, { status: 400 })
    }
    if (children.length > MAX_CHILDREN) {
      return NextResponse.json({ error: `Maximum ${MAX_CHILDREN} children allowed` }, { status: 400 })
    }
    if (!children.every(validateChild)) {
      return NextResponse.json({ error: 'Invalid child data. Each child needs a name, age (1-18), and color.' }, { status: 400 })
    }

    const { error } = await supabase
      .from('families')
      .upsert(
        { user_id: user.id, children },
        { onConflict: 'user_id' }
      )

    if (error) {
      console.error('Family PUT error:', error.message)
      return NextResponse.json({ error: 'Failed to save family data' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Family PUT error:', error)
    return NextResponse.json({ error: 'Failed to save family data' }, { status: 500 })
  }
}
