import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams, users, teamMembers } from '@/lib/schema';
import { requireAuth, requireTeamAdmin, getUserTeamIds } from '@/lib/auth';
import { eq, inArray } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    // Only return teams the user belongs to
    const userTeamIds = getUserTeamIds(user);
    
    if (userTeamIds.length === 0) {
      return NextResponse.json({
        success: true,
        error: null,
        message: 'No teams found',
        data: {
          teams: []
        }
      });
    }
    
    const userTeams = await db.select({
      id: teams.id,
      name: teams.name,
      description: teams.description,
      platformAccountId: teams.platformAccountId,
      ownerId: teams.ownerId,
      createdAt: teams.createdAt,
      updatedAt: teams.updatedAt,
    }).from(teams)
    .where(inArray(teams.id, userTeamIds));

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Teams retrieved successfully',
      data: {
        teams: userTeams
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to fetch teams',
      data: null
    }, { status: error instanceof Error && error.message === 'Authentication required' ? 401 : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    
    const { name, description, platformAccountId } = body;
    
    if (!name || !platformAccountId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'Team name and Platform Account ID are required',
        data: null
      }, { status: 400 });
    }

    const existingTeam = await db.select()
      .from(teams)
      .where(eq(teams.platformAccountId, platformAccountId))
      .limit(1);

    if (existingTeam.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Platform account already exists',
        message: 'A team with this Platform Account ID already exists',
        data: null
      }, { status: 400 });
    }

    const teamId = createId();
    const [newTeam] = await db.insert(teams).values({
      id: teamId,
      name,
      description: description || null,
      platformAccountId,
      ownerId: user.id,
    }).returning();

    // Add creator as team admin
    await db.insert(teamMembers).values({
      teamId,
      userId: user.id,
      role: 'admin',
      invitedBy: user.id,
    });

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Team created successfully',
      data: {
        team: newTeam
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to create team',
      data: null
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, platformAccountId } = body;
    
    if (!id || !name || !platformAccountId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'Team ID, name, and Platform Account ID are required',
        data: null
      }, { status: 400 });
    }

    // Verify user is admin of this team BEFORE any operations
    const user = await requireTeamAdmin(request, id);

    const existingTeam = await db.select()
      .from(teams)
      .where(eq(teams.id, id))
      .limit(1);

    if (existingTeam.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Team not found',
        message: 'Team not found',
        data: null
      }, { status: 404 });
    }

    const duplicateTeam = await db.select()
      .from(teams)
      .where(eq(teams.platformAccountId, platformAccountId))
      .limit(1);

    if (duplicateTeam.length > 0 && duplicateTeam[0].id !== id) {
      return NextResponse.json({
        success: false,
        error: 'Platform account already exists',
        message: 'Another team is already using this Platform Account ID',
        data: null
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
      error: null,
      message: 'Team updated successfully',
      data: {
        team: updatedTeam[0]
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to update team',
      data: null
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('id');
    
    if (!teamId) {
      return NextResponse.json({
        success: false,
        error: 'Missing team ID',
        message: 'Team ID is required',
        data: null
      }, { status: 400 });
    }

    // Verify user is admin of this team BEFORE any operations
    const user = await requireTeamAdmin(request, teamId);

    const existingTeam = await db.select()
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    if (existingTeam.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Team not found',
        message: 'Team not found',
        data: null
      }, { status: 404 });
    }

    const teamMemberCount = await db.select()
      .from(teamMembers)
      .where(eq(teamMembers.teamId, teamId))
      .limit(1);

    if (teamMemberCount.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Team has members',
        message: 'Cannot delete team with existing members. Please remove all members first.',
        data: null
      }, { status: 400 });
    }

    await db.delete(teams).where(eq(teams.id, teamId));

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Team deleted successfully',
      data: null
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to delete team',
      data: null
    }, { status: 500 });
  }
}
