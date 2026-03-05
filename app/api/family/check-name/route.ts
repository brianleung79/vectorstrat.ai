import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/family/check-name?name=X — check if a child name exists in another family
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')?.trim()

    if (!name || name.length < 2) {
      return NextResponse.json({ exists: false })
    }

    // Get user's own family_id
    const { data: membership } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    const userFamilyId = membership?.family_id

    // Use admin client to search across all families (bypasses RLS)
    const admin = createAdminClient()

    // Search for families with a child matching this name (case-insensitive)
    const { data: families, error } = await admin
      .from('families')
      .select('family_id, children')

    if (error) {
      console.error('Check-name error:', error.message)
      return NextResponse.json({ exists: false })
    }

    // Find a match in another family
    for (const family of families || []) {
      if (family.family_id === userFamilyId) continue // skip own family

      const children = family.children as Array<{ name: string }> | null
      if (!children) continue

      const match = children.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      )

      if (match) {
        // Find the owner's email
        const { data: owner } = await admin
          .from('family_members')
          .select('user_id')
          .eq('family_id', family.family_id)
          .eq('role', 'owner')
          .single()

        let ownerEmail = 'another family'
        if (owner) {
          const { data: { user: ownerUser } } = await admin.auth.admin.getUserById(owner.user_id)
          if (ownerUser?.email) {
            ownerEmail = ownerUser.email
          }
        }

        return NextResponse.json({
          exists: true,
          childName: match.name,
          ownerEmail,
        })
      }
    }

    return NextResponse.json({ exists: false })
  } catch (error) {
    console.error('Check-name error:', error)
    return NextResponse.json({ exists: false })
  }
}
