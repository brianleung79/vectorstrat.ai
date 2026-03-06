import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkCsrf } from '@/lib/security'

// POST /api/family/join — accept an invite token
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
    const body = await request.json()
    const { token } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Missing invite token' }, { status: 400 })
    }

    // Use admin client to look up invite (bypasses RLS since user isn't in the family yet)
    const admin = createAdminClient()

    // Find the invite
    const { data: invite, error: inviteError } = await admin
      .from('family_invites')
      .select('id, family_id, status, expires_at')
      .eq('token', token)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 })
    }

    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'This invite has already been used' }, { status: 400 })
    }

    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invite has expired' }, { status: 400 })
    }

    // Check if user already belongs to a family
    const { data: existingMembership } = await admin
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (existingMembership) {
      if (existingMembership.family_id === invite.family_id) {
        return NextResponse.json({ error: 'You are already a member of this family' }, { status: 400 })
      }

      // Check if other members share the old family before deleting its data
      const { count } = await admin
        .from('family_members')
        .select('id', { count: 'exact', head: true })
        .eq('family_id', existingMembership.family_id)

      // Remove user's membership first
      await admin.from('family_members').delete().eq('user_id', user.id)

      // Only delete family/schedule data if user was the sole member
      if (count !== null && count <= 1) {
        await admin.from('schedules').delete().eq('family_id', existingMembership.family_id)
        await admin.from('families').delete().eq('family_id', existingMembership.family_id)
      }
    }

    // Add user to the new family
    const { error: memberError } = await admin
      .from('family_members')
      .insert({
        family_id: invite.family_id,
        user_id: user.id,
        role: 'member',
      })

    if (memberError) {
      console.error('Join error:', memberError.message)
      return NextResponse.json({ error: 'Failed to join family' }, { status: 500 })
    }

    // Mark invite as accepted
    await admin
      .from('family_invites')
      .update({ status: 'accepted' })
      .eq('id', invite.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Join error:', error)
    return NextResponse.json({ error: 'Failed to join family' }, { status: 500 })
  }
}
