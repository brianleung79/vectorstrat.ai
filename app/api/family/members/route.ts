import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMembership } from '@/lib/supabase/helpers'
import { checkCsrf } from '@/lib/security'

// GET /api/family/members — list family members
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const membership = await getMembership(supabase, user.id)
    if (!membership) {
      return NextResponse.json({ members: [], role: null })
    }

    // Use admin client to get member emails from auth.users
    const admin = createAdminClient()

    const { data: members, error } = await admin
      .from('family_members')
      .select('user_id, role, created_at')
      .eq('family_id', membership.family_id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Members list error:', error.message)
      return NextResponse.json({ error: 'Failed to load members' }, { status: 500 })
    }

    // Fetch emails for each member
    const membersWithEmail = await Promise.all(
      (members || []).map(async (m) => {
        const { data: { user: memberUser } } = await admin.auth.admin.getUserById(m.user_id)
        return {
          userId: m.user_id,
          email: memberUser?.email || 'Unknown',
          role: m.role,
          isYou: m.user_id === user.id,
        }
      })
    )

    return NextResponse.json({
      members: membersWithEmail,
      role: membership.role,
    })
  } catch (error) {
    console.error('Members list error:', error)
    return NextResponse.json({ error: 'Failed to load members' }, { status: 500 })
  }
}

// DELETE /api/family/members — remove a member or leave family
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
    const targetUserId = searchParams.get('userId')

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const membership = await getMembership(supabase, user.id)
    if (!membership) {
      return NextResponse.json({ error: 'No family found' }, { status: 400 })
    }

    const admin = createAdminClient()
    const isSelf = targetUserId === user.id
    const isOwner = membership.role === 'owner'

    if (!isSelf && !isOwner) {
      return NextResponse.json({ error: 'Only the family owner can remove members' }, { status: 403 })
    }

    if (isSelf && isOwner) {
      return NextResponse.json({ error: 'The owner cannot leave. Transfer ownership or delete the family.' }, { status: 400 })
    }

    // Remove the target from family_members
    await admin
      .from('family_members')
      .delete()
      .eq('user_id', targetUserId)
      .eq('family_id', membership.family_id)

    // Create a fresh empty family for the removed/leaving user (families row + membership)
    const newFamilyId = crypto.randomUUID()
    await admin
      .from('families')
      .insert({ family_id: newFamilyId, user_id: targetUserId, children: [] })
    await admin
      .from('family_members')
      .insert({ family_id: newFamilyId, user_id: targetUserId, role: 'owner' })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Member remove error:', error)
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }
}
