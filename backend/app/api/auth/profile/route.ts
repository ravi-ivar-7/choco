import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, teams, teamMembers, credentials } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '@/utils/password';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Missing authorization header',
        message: 'Authorization token required',
        data: null
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token',
        message: 'Token verification failed',
        data: null
      }, { status: 401 });
    }

    // Get user information
    const userResult = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!userResult.length) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        message: 'User does not exist',
        data: null
      }, { status: 404 });
    }

    const userData = userResult[0];

    // Get user's team memberships with team details
    const userTeams = await db.select({
      teamId: teamMembers.teamId,
      teamName: teams.name,
      teamDescription: teams.description,
      platformAccountId: teams.platformAccountId,
      role: teamMembers.role,
      ownerId: teams.ownerId,
      joinedAt: teamMembers.joinedAt,
      teamCreatedAt: teams.createdAt,
      teamUpdatedAt: teams.updatedAt
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, decoded.userId));
    
    const formattedTeams = userTeams.map(team => ({
      id: team.teamId,
      name: team.teamName,
      description: team.teamDescription,
      platformAccountId: team.platformAccountId,
      role: team.role,
      isOwner: team.ownerId === decoded.userId,
      joinedAt: team.joinedAt,
      createdAt: team.teamCreatedAt,
      updatedAt: team.teamUpdatedAt
    }));

    // Get all team members from user's teams
    const allTeamMembers = [];
    for (const team of formattedTeams) {
      const members = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: teamMembers.role,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        joinedAt: teamMembers.joinedAt,
        teamId: teamMembers.teamId,
        teamName: teams.name
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.teamId, team.id))
      .orderBy(desc(teamMembers.joinedAt));
      
      allTeamMembers.push(...members);
    }

    // Calculate statistics
    const stats = {
      totalTeams: formattedTeams.length,
      totalTeamMembers: allTeamMembers.length,
      activeTeamMembers: allTeamMembers.filter(member => member.isActive).length,
      memberSince: userData.createdAt,
      lastLogin: userData.lastLoginAt,
      adminTeams: formattedTeams.filter(team => team.role === 'admin' || team.isOwner).length
    };

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Profile data retrieved successfully',
      data: {
        user: userData,
        teams: formattedTeams,
        teamMembers: allTeamMembers,
        statistics: stats
      }
    });

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'Failed to retrieve profile data',
      data: null
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Missing authorization header',
        message: 'Authorization token required',
        data: null
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token',
        message: 'Token verification failed',
        data: null
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, currentPassword, newPassword } = body;

    // Validate input
    if (!name && !newPassword) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input',
        message: 'Either name or password update is required',
        data: null
      }, { status: 400 });
    }

    // Get current user data
    const userResult = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        password: users.password,
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!userResult.length) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        message: 'User does not exist',
        data: null
      }, { status: 404 });
    }

    const userData = userResult[0];
    const updates: any = {};

    // Handle name update
    if (name && name.trim() !== userData.name) {
      if (name.trim().length < 1) {
        return NextResponse.json({
          success: false,
          error: 'Invalid name',
          message: 'Name cannot be empty',
          data: null
        }, { status: 400 });
      }
      updates.name = name.trim();
    }

    // Handle password update
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({
          success: false,
          error: 'Current password required',
          message: 'Current password is required to change password',
          data: null
        }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({
          success: false,
          error: 'Password too short',
          message: 'New password must be at least 6 characters long',
          data: null
        }, { status: 400 });
      }

      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(currentPassword, userData.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({
          success: false,
          error: 'Invalid current password',
          message: 'Current password is incorrect',
          data: null
        }, { status: 400 });
      }

      // Hash new password
      updates.password = await hashPassword(newPassword);
    }

    // If no updates needed
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: true,
        error: null,
        message: 'No changes needed',
        data: { updated: false }
      });
    }

    // Update user
    updates.updatedAt = new Date();
    await db
      .update(users)
      .set(updates)
      .where(eq(users.id, decoded.userId));

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Profile updated successfully',
      data: { 
        updated: true,
        changes: Object.keys(updates).filter(key => key !== 'updatedAt')
      }
    });

  } catch (error) {
    console.error('Profile update API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'Failed to update profile',
      data: null
    }, { status: 500 });
  }
}
