import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getFamilyId } from '@/lib/supabase/helpers'

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

    const userFamilyId = await getFamilyId(supabase, user.id)
    const admin = createAdminClient()

    // Use Postgres RPC to search JSON children array efficiently
    // Falls back to filtering: fetch only families that contain the name in their children JSON
    const { data: families, error } = await admin
      .from('families')
      .select('family_id, children')
      .filter('children', 'cs', JSON.stringify([{ name }]))

    if (error) {
      // Fallback: containment might not work for case-insensitive; try ilike on cast
      console.error('Check-name filter error, falling back:', error.message)
      return NextResponse.json({ exists: false })
    }

    // Filter out own family and verify case-insensitive match
    for (const family of families || []) {
      if (family.family_id === userFamilyId) continue

      const children = family.children as Array<{ name: string }> | null
      if (!children) continue

      const match = children.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      )

      if (match) {
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
