import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { credentialConfigs } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { requireAuth, requireTeamAdmin } from '@/lib/auth'

// GET - Fetch credential config for a team
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')
    
    if (!teamId) {
      return NextResponse.json({ success: false, error: 'Team ID is required' }, { status: 400 })
    }

    // Verify user has admin access to this team
    await requireTeamAdmin(request, teamId)

    // Fetch config
    const config = await db.select().from(credentialConfigs)
      .where(eq(credentialConfigs.teamId, teamId))
      .limit(1)

    return NextResponse.json({
      success: true,
      data: {
        config: config.length > 0 ? config[0] : null
      }
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('denied')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 })
    }
    console.error('Error fetching credential config:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new credential config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teamId, ...configData } = body

    if (!teamId || !configData.name) {
      return NextResponse.json({ success: false, error: 'Team ID and name are required' }, { status: 400 })
    }

    if (!configData.domain || !configData.domain.trim()) {
      return NextResponse.json({ success: false, error: 'Domain is required' }, { status: 400 })
    }

    // Verify user has admin access to this team
    const user = await requireTeamAdmin(request, teamId)

    // Check if config already exists
    const existingConfig = await db.select().from(credentialConfigs)
      .where(eq(credentialConfigs.teamId, teamId))
      .limit(1)

    if (existingConfig.length > 0) {
      return NextResponse.json({ success: false, error: 'Configuration already exists for this team' }, { status: 409 })
    }

    // Create new config
    const { updatedAt, createdAt, id, ...insertData } = configData
    const newConfig = await db.insert(credentialConfigs).values({
      teamId,
      createdBy: user.id,
      ...insertData
    }).returning()

    return NextResponse.json({
      success: true,
      data: { config: newConfig[0] },
      message: 'Configuration created successfully'
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('denied')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 })
    }
    console.error('Error creating credential config:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update existing credential config
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { teamId, ...configData } = body

    if (!teamId || !configData.name) {
      return NextResponse.json({ success: false, error: 'Team ID and name are required' }, { status: 400 })
    }

    if (!configData.domain || !configData.domain.trim()) {
      return NextResponse.json({ success: false, error: 'Domain is required' }, { status: 400 })
    }

    // Verify user has admin access to this team
    await requireTeamAdmin(request, teamId)

    // Update config
    const { updatedAt, createdAt, id, ...updateData } = configData
    const updatedConfig = await db.update(credentialConfigs)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(credentialConfigs.teamId, teamId))
      .returning()

    if (updatedConfig.length === 0) {
      return NextResponse.json({ success: false, error: 'Configuration not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { config: updatedConfig[0] },
      message: 'Configuration updated successfully'
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('denied')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 })
    }
    console.error('Error updating credential config:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete credential config
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')
    
    if (!teamId) {
      return NextResponse.json({ success: false, error: 'Team ID is required' }, { status: 400 })
    }

    // Verify user has admin access to this team
    await requireTeamAdmin(request, teamId)

    // Delete config
    const deletedConfig = await db.delete(credentialConfigs)
      .where(eq(credentialConfigs.teamId, teamId))
      .returning()

    if (deletedConfig.length === 0) {
      return NextResponse.json({ success: false, error: 'Configuration not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration deleted successfully'
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('denied')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 })
    }
    console.error('Error deleting credential config:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
