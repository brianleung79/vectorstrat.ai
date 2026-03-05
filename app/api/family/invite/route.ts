import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkCsrf } from '@/lib/security'

// Helper: get the user's family_id from family_members
async function getFamilyId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)
    .single()
  return data?.family_id || null
}

// POST /api/family/invite — create an invite link
export async function POST(request: NextRequest) {
  if (!checkCsrf(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const familyId = await getFamilyId(supabase, user.id)
    if (!familyId) {
      return NextResponse.json({ error: 'No family found. Set up your family first.' }, { status: 400 })
    }

    // Optional: accept an email for display purposes
    let invitedEmail: string | undefined
    try {
      const body = await request.json()
      if (typeof body.email === 'string' && body.email.includes('@')) {
        invitedEmail = body.email.trim().toLowerCase()
      }
    } catch {
      // No body is fine
    }

    const { data, error } = await supabase
      .from('family_invites')
      .insert({
        family_id: familyId,
        invited_by: user.id,
        invited_email: invitedEmail || null,
      })
      .select('token')
      .single()

    if (error) {
      console.error('Invite create error:', error.message)
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
    }

    const host = request.headers.get('host') || 'vectorstrat.ai'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const link = `${protocol}://${host}/kbiacal/join/${data.token}`

    return NextResponse.json({ token: data.token, link })
  } catch (error) {
    console.error('Invite create error:', error)
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
  }
}

// GET /api/family/invite — list pending invites for user's family
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const familyId = await getFamilyId(supabase, user.id)
    if (!familyId) {
      return NextResponse.json({ invites: [] })
    }

    const { data, error } = await supabase
      .from('family_invites')
      .select('id, token, invited_email, status, created_at, expires_at')
      .eq('family_id', familyId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Invite list error:', error.message)
      return NextResponse.json({ error: 'Failed to load invites' }, { status: 500 })
    }

    return NextResponse.json({ invites: data || [] })
  } catch (error) {
    console.error('Invite list error:', error)
    return NextResponse.json({ error: 'Failed to load invites' }, { status: 500 })
  }
}

// DELETE /api/family/invite — revoke an invite
export async function DELETE(request: NextRequest) {
  if (!checkCsrf(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const inviteId = searchParams.get('id')

    if (!inviteId) {
      return NextResponse.json({ error: 'Missing invite id' }, { status: 400 })
    }

    const familyId = await getFamilyId(supabase, user.id)
    if (!familyId) {
      return NextResponse.json({ error: 'No family found' }, { status: 400 })
    }

    const { error } = await supabase
      .from('family_invites')
      .update({ status: 'expired' })
      .eq('id', inviteId)
      .eq('family_id', familyId)

    if (error) {
      console.error('Invite revoke error:', error.message)
      return NextResponse.json({ error: 'Failed to revoke invite' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Invite revoke error:', error)
    return NextResponse.json({ error: 'Failed to revoke invite' }, { status: 500 })
  }
}
