import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/family — returns the user's family (children array)
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('families')
    .select('children')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found (new user)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ children: data?.children || null })
}

// PUT /api/family — upsert the user's family
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { children } = body

  if (!Array.isArray(children)) {
    return NextResponse.json({ error: 'children must be an array' }, { status: 400 })
  }

  const { error } = await supabase
    .from('families')
    .upsert(
      { user_id: user.id, children },
      { onConflict: 'user_id' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
