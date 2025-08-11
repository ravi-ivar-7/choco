import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams, users } from '@/lib/schema';
import { getAuthUser, requireAdmin, getClientIP, getUserAgent } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// GET /api/teams - List all teams
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    
    const allTeams = await db.select({
      id: teams.id,
      name: teams.name,
      description: teams.description,
      platformAccountId: teams.platformAccountId,
      createdAt: teams.createdAt,
      updatedAt: teams.updatedAt,
    }).from(teams);

    return NextResponse.json({
      success: true,
      teams: allTeams
    });
  } catch (error) {
    console.error('Teams fetch error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch teams'
    }, { status: error instanceof Error && error.message === 'Authentication required' ? 401 : 500 });
  }
}

// POST /api/teams - Create new team
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    const body = await request.json();
    
    const { name, description, platformAccountId } = body;
    
    if (!name || !platformAccountId) {
      return NextResponse.json({
        success: false,
        message: 'Team name and Platform Account ID are required'
      }, { status: 400 });
    }

    // Check if platformAccountId already exists
    const existingTeam = await db.select()
      .from(teams)
      .where(eq(teams.platformAccountId, platformAccountId))
      .limit(1);

    if (existingTeam.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'A team with this Platform Account ID already exists'
      }, { status: 400 });
    }

    const teamId = createId();
    const [newTeam] = await db.insert(teams).values({
      id: teamId,
      name,
      description: description || null,
      platformAccountId,
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Team created successfully',
      team: newTeam
    });
  } catch (error) {
    console.error('Team creation error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create team'
    }, { status: 500 });
  }
}

// PUT /api/teams - Update team
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    const body = await request.json();
    
    const { id, name, description, platformAccountId } = body;
    
    if (!id || !name || !platformAccountId) {
      return NextResponse.json({
        success: false,
        message: 'Team ID, name, and Platform Account ID are required'
      }, { status: 400 });
    }

    // Check if team exists
    const existingTeam = await db.select()
      .from(teams)
      .where(eq(teams.id, id))
      .limit(1);

    if (existingTeam.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Team not found'
      }, { status: 404 });
    }

    // Check if platformAccountId is used by another team
    const duplicateTeam = await db.select()
      .from(teams)
      .where(eq(teams.platformAccountId, platformAccountId))
      .limit(1);

    if (duplicateTeam.length > 0 && duplicateTeam[0].id !== id) {
      return NextResponse.json({
        success: false,
        message: 'Another team is already using this Platform Account ID'
      }, { status: 400 });
    }

    const updatedTeam = await db.update(teams)
      .set({
        name,
        description: description || null,
        platformAccountId,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Team updated successfully',
      team: updatedTeam[0]
    });
  } catch (error) {
    console.error('Team update error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update team'
    }, { status: 500 });
  }
}

// DELETE /api/teams - Delete team
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('id');
    
    if (!teamId) {
      return NextResponse.json({
        success: false,
        message: 'Team ID is required'
      }, { status: 400 });
    }

    // Check if team exists
    const existingTeam = await db.select()
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    if (existingTeam.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Team not found'
      }, { status: 404 });
    }

    // Check if team has members
    const teamMembers = await db.select()
      .from(users)
      .where(eq(users.teamId, teamId))
      .limit(1);

    if (teamMembers.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete team with existing members. Please remove all members first.'
      }, { status: 400 });
    }

    await db.delete(teams).where(eq(teams.id, teamId));

    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Team deletion error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete team'
    }, { status: 500 });
  }
}
