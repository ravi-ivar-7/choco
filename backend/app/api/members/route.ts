import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, teams, teamMembers } from '@/lib/schema';
import { requireAuth, requireTeamAdmin, getUserTeamIds } from '@/lib/auth';
import { eq, inArray, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    
    if (teamId) {
      // Check if user has access to this specific team
      const userTeamIds = getUserTeamIds(user);
      if (!userTeamIds.includes(teamId)) {
        return NextResponse.json({
          success: false,
          error: 'Access denied',
          message: 'You do not have access to this team',
          data: null
        }, { status: 403 });
      }
      
      // Get members of specific team
      const members = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: teamMembers.role,
        teamId: teamMembers.teamId,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        teamName: teams.name,
        joinedAt: teamMembers.joinedAt
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.teamId, teamId));
      
      return NextResponse.json({
        success: true,
        error: null,
        message: 'Team members retrieved successfully',
        data: {
          members
        }
      });
    } else {
      // Get all members from user's teams
      const userTeamIds = getUserTeamIds(user);
      
      if (userTeamIds.length === 0) {
        return NextResponse.json({
          success: true,
          error: null,
          message: 'No members found',
          data: {
            members: []
          }
        });
      }
      
      const members = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: teamMembers.role,
        teamId: teamMembers.teamId,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        teamName: teams.name,
        joinedAt: teamMembers.joinedAt
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(inArray(teamMembers.teamId, userTeamIds));
      
      return NextResponse.json({
        success: true,
        error: null,
        message: 'Members retrieved successfully',
        data: {
          members
        }
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to fetch members',
      data: null
    }, { status: error instanceof Error && error.message === 'Authentication required' ? 401 : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, teamId, role = 'member' } = body;
    
    if (!email || !teamId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'Email and team ID are required',
        data: null
      }, { status: 400 });
    }

    // Verify user is admin of this team
    const adminUser = await requireTeamAdmin(request, teamId);

    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid role',
        message: 'Role must be either "admin" or "member"',
        data: null
      }, { status: 400 });
    }

    // Check if user exists (can only add registered users)
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        message: 'User must be registered before being added to a team',
        data: null
      }, { status: 400 });
    }
    
    // Check if user is already a member of this team
    const existingMember = await db.select()
      .from(teamMembers)
      .where(and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.userId, existingUser[0].id)
      ))
      .limit(1);
      
    if (existingMember.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'User already in team',
        message: 'User is already a member of this team',
        data: null
      }, { status: 400 });
    }

    // Check if team exists
    const team = await db.select()
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    if (team.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Team not found'
      }, { status: 404 });
    }

    // Add user to team
    const [newMember] = await db.insert(teamMembers).values({
      teamId,
      userId: existingUser[0].id,
      role,
      invitedBy: adminUser.id,
    }).returning();

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Member added to team successfully',
      data: {
        member: {
          ...existingUser[0],
          role: newMember.role,
          teamId: newMember.teamId,
          joinedAt: newMember.joinedAt
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to create member',
      data: null
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, teamId, role, isActive } = body;
    
    if (!id || !teamId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'Member ID and team ID are required',
        data: null
      }, { status: 400 });
    }

    // Verify user is admin of this team
    const adminUser = await requireTeamAdmin(request, teamId);
    

    if (role && !['admin', 'member'].includes(role)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid role',
        message: 'Role must be either "admin" or "member"',
        data: null
      }, { status: 400 });
    }

    // Check if team member exists
    const existingMember = await db.select()
      .from(teamMembers)
      .where(and(
        eq(teamMembers.userId, id),
        eq(teamMembers.teamId, teamId)
      ))
      .limit(1);

    if (existingMember.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Member not found',
        message: 'Member not found in this team',
        data: null
      }, { status: 404 });
    }

    // Update team member
    const updatedMember = await db.update(teamMembers)
      .set({
        role: role || existingMember[0].role,
      })
      .where(and(
        eq(teamMembers.userId, id),
        eq(teamMembers.teamId, teamId)
      ))
      .returning();
      
    // If updating active status, update user record
    if (isActive !== undefined) {
      await db.update(users)
        .set({
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));
    }

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Member updated successfully',
      data: {
        member: updatedMember[0]
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to update member',
      data: null
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('id');
    const teamId = searchParams.get('teamId');
    
    if (!memberId || !teamId) {
      return NextResponse.json({
        success: false,
        error: 'Missing parameters',
        message: 'Member ID and team ID are required',
        data: null
      }, { status: 400 });
    }

    // Verify user is admin of this team
    const adminUser = await requireTeamAdmin(request, teamId);

    // Check if team member exists
    const existingMember = await db.select()
      .from(teamMembers)
      .where(and(
        eq(teamMembers.userId, memberId),
        eq(teamMembers.teamId, teamId)
      ))
      .limit(1);

    if (existingMember.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Member not found',
        message: 'Member not found in this team',
        data: null
      }, { status: 404 });
    }

    if (memberId === adminUser.id) {
      return NextResponse.json({
        success: false,
        error: 'Cannot remove self',
        message: 'You cannot remove yourself from the team',
        data: null
      }, { status: 400 });
    }

    // Remove member from team
    await db.delete(teamMembers)
      .where(and(
        eq(teamMembers.userId, memberId),
        eq(teamMembers.teamId, teamId)
      ));

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Member removed from team successfully',
      data: null
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Failed to delete member',
      data: null
    }, { status: 500 });
  }
}
