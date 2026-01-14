import { NextRequest, NextResponse } from 'next/server'
import { supabase, createSupabaseClient } from '@/lib/supabase'

// Helper: Get user and client from token
async function getUserAndClient(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return null
  }
  
  const userClient = createSupabaseClient(token)
  
  return { user, client: userClient }
}

// GET /api/income/:id - Get single income entry
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const result = await getUserAndClient(request)
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { user, client } = result
    const { id } = await context.params  // ✅ Await params!

    const { data, error } = await client
      .from('income')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Income entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/income/:id - Update income entry
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const result = await getUserAndClient(request)
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { user, client } = result
    const { id } = await context.params  // ✅ Await params!

    const body = await request.json()
    const { amount, source, date, notes } = body

    // Validate if amount is provided and positive
    if (amount !== undefined && amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be positive' },
        { status: 400 }
      )
    }

    // Validate source if provided
    if (source) {
      const validSources = ['hackathon', 'bounty', 'freelance', 'crypto', 'other']
      if (!validSources.includes(source)) {
        return NextResponse.json(
          { success: false, error: `Source must be one of: ${validSources.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Build update object (only include provided fields)
    const updates: any = {}
    if (amount !== undefined) updates.amount = amount
    if (source) updates.source = source
    if (date) updates.date = date
    if (notes !== undefined) updates.notes = notes

    // Update in database
    const { data, error } = await client
      .from('income')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Failed to update income entry' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/income/:id - Delete income entry
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const result = await getUserAndClient(request)
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { user, client } = result
    const { id } = await context.params  // ✅ Await params!

    const { error } = await client
      .from('income')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete income entry' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Income entry deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
