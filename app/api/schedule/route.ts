import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFamilyId } from '@/lib/supabase/helpers'
import { checkCsrf } from '@/lib/security'

const MAX_SCHEDULE_SIZE = 500_000 // 500KB

function validateScheduleData(data: unknown): data is Record<string, unknown> {
  return data !== null && typeof data === 'object' && !Array.isArray(data)
}

// GET /api/schedule — returns the user's full schedule + waitlist
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const familyId = await getFamilyId(supabase, user.id)

    if (!familyId) {
      return NextResponse.json({ schedule: {}, waitlist: {} })
    }

    const { data, error } = await supabase
      .from('schedules')
      .select('schedule, waitlist')
      .eq('family_id', familyId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Schedule GET error:', error.message)
      return NextResponse.json({ error: 'Failed to load schedule' }, { status: 500 })
    }

    return NextResponse.json({
      schedule: data?.schedule || {},
      waitlist: data?.waitlist || {},
    })
  } catch (error) {
    console.error('Schedule GET error:', error)
    return NextResponse.json({ error: 'Failed to load schedule' }, { status: 500 })
  }
}

// PUT /api/schedule — upsert the user's full schedule + waitlist
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
    const rawBody = await request.text()
    if (rawBody.length > MAX_SCHEDULE_SIZE) {
      return NextResponse.json({ error: 'Schedule data too large' }, { status: 413 })
    }

    const body = JSON.parse(rawBody)
    const { schedule, waitlist } = body

    if (schedule !== undefined && !validateScheduleData(schedule)) {
      return NextResponse.json({ error: 'Invalid schedule format' }, { status: 400 })
    }
    if (waitlist !== undefined && !validateScheduleData(waitlist)) {
      return NextResponse.json({ error: 'Invalid waitlist format' }, { status: 400 })
    }

    const familyId = await getFamilyId(supabase, user.id)

    if (!familyId) {
      return NextResponse.json({ error: 'No family found. Set up your family first.' }, { status: 400 })
    }

    const { error } = await supabase
      .from('schedules')
      .upsert(
        {
          family_id: familyId,
          user_id: user.id,
          schedule: schedule || {},
          waitlist: waitlist || {},
        },
        { onConflict: 'family_id' }
      )

    if (error) {
      console.error('Schedule PUT error:', error.message)
      return NextResponse.json({ error: 'Failed to save schedule' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Schedule PUT error:', error)
    return NextResponse.json({ error: 'Failed to save schedule' }, { status: 500 })
  }
}

// DELETE /api/schedule — clear the user's schedule
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
    const familyId = await getFamilyId(supabase, user.id)

    if (!familyId) {
      return NextResponse.json({ success: true })
    }

    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('family_id', familyId)

    if (error) {
      console.error('Schedule DELETE error:', error.message)
      return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Schedule DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 })
  }
}
