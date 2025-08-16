import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, teams, credentials } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';

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

    // Get user with team information
    const userWithTeam = await db
      .select({
        user: {
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          teamId: users.teamId,
          isActive: users.isActive,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        team: {
          id: teams.id,
          name: teams.name,
          description: teams.description,
          platformAccountId: teams.platformAccountId,
          createdAt: teams.createdAt,
          updatedAt: teams.updatedAt,
        }
      })
      .from(users)
      .leftJoin(teams, eq(users.teamId, teams.id))
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!userWithTeam.length) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        message: 'User does not exist',
        data: null
      }, { status: 404 });
    }

    const userData = userWithTeam[0];

    // Get team members count
    const teamMembers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.teamId, userData.user.teamId))
      .orderBy(desc(users.createdAt));


    // Calculate statistics
    const stats = {
      totalTeamMembers: teamMembers.length,
      activeTeamMembers: teamMembers.filter(member => member.isActive).length,
      memberSince: userData.user.createdAt,
      lastLogin: userData.user.lastLoginAt,
    };

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Profile data retrieved successfully',
      data: {
        user: userData.user,
        team: userData.team,
        teamMembers: teamMembers,
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
