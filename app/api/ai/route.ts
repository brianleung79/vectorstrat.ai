import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, checkCsrf } from '@/lib/security'

const ALLOWED_MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 16000
const MAX_SYSTEM_LENGTH = 50000
const MAX_MESSAGES = 50

function validateMessages(messages: unknown): messages is Array<{ role: string; content: unknown }> {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return false
  return messages.every(
    (m) =>
      m &&
      typeof m === 'object' &&
      typeof (m as Record<string, unknown>).role === 'string' &&
      ['user', 'assistant'].includes((m as Record<string, unknown>).role as string) &&
      validateContent((m as Record<string, unknown>).content)
  )
}

function validateContent(content: unknown): boolean {
  // String content (normal chat messages)
  if (typeof content === 'string') return content.length > 0
  // Array content (document/image blocks for PDF import)
  if (Array.isArray(content)) {
    return content.length > 0 && content.every((block) => {
      if (!block || typeof block !== 'object') return false
      const b = block as Record<string, unknown>
      if (b.type === 'text') return typeof b.text === 'string'
      if (b.type === 'document') return b.source && typeof b.source === 'object'
      if (b.type === 'image') return b.source && typeof b.source === 'object'
      return false
    })
  }
  return false
}

export async function POST(request: NextRequest) {
  if (!checkCsrf(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit
  const { allowed, retryAfter } = checkRateLimit(user.id)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not configured')
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
  }

  try {
    const body = await request.json()

    // Validate messages
    if (!validateMessages(body.messages)) {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 })
    }

    // Accept system prompt from client but cap length
    let system: string | undefined
    if (typeof body.system === 'string' && body.system.length > 0) {
      system = body.system.slice(0, MAX_SYSTEM_LENGTH)
    }

    // Build sanitized request — only allow known fields
    const anthropicBody: Record<string, unknown> = {
      model: ALLOWED_MODEL,
      max_tokens: MAX_TOKENS,
      messages: body.messages,
    }
    if (system) {
      anthropicBody.system = system
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(anthropicBody),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic API error:', response.status, data)
      return NextResponse.json({ error: 'AI service error' }, { status: 502 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('AI proxy error:', error)
    return NextResponse.json({ error: 'AI service error' }, { status: 500 })
  }
}
