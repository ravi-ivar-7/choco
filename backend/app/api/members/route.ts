import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, teams } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth';
import { generateAndHashInitialPassword } from '@/lib/password-utils';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    
    const baseQuery = db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      teamId: users.teamId,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      teamName: teams.name,
    })
    .from(users)
    .innerJoin(teams, eq(users.teamId, teams.id));

    const members = teamId 
      ? await baseQuery.where(eq(users.teamId, teamId))
      : await baseQuery;

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Members retrieved successfully',
      data: {
        members
      }
    });
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
    const adminUser = await requireAdmin(request);
    const body = await request.json();
    
    const { email, name, role = 'member', teamId } = body;
    
    if (!email || !name || !teamId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'Email, name, and team ID are required',
        data: null
      }, { status: 400 });
    }

    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid role',
        message: 'Role must be either "admin" or "member"',
        data: null
      }, { status: 400 });
    }

    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Email already exists',
        message: 'A user with this email already exists',
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

    const memberId = createId();
    
    const hashedPassword = await generateAndHashInitialPassword(email);
    
    const newMember = await db.insert(users).values({
      id: memberId,
      email,
      name,
      password: hashedPassword,
      role,
      teamId,
      isActive: true,
    }).returning();

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Member created successfully',
      data: {
        member: newMember[0]
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
    const adminUser = await requireAdmin(request);
    const body = await request.json();
    
    const { id, email, name, role, teamId, isActive } = body;
    
    if (!id || !email || !name || !teamId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'Member ID, email, name, and team ID are required',
        data: null
      }, { status: 400 });
    }

    if (role && !['admin', 'member'].includes(role)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid role',
        message: 'Role must be either "admin" or "member"',
        data: null
      }, { status: 400 });
    }

    const existingMember = await db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existingMember.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Member not found',
        message: 'Member not found',
        data: null
      }, { status: 404 });
    }

    const duplicateUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (duplicateUser.length > 0 && duplicateUser[0].id !== id) {
      return NextResponse.json({
        success: false,
        error: 'Email already exists',
        message: 'Another user is already using this email',
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

    const updatedMember = await db.update(users)
      .set({
        email,
        name,
        role: role || existingMember[0].role,
        teamId,
        isActive: isActive !== undefined ? isActive : existingMember[0].isActive,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

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
    const adminUser = await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('id');
    
    if (!memberId) {
      return NextResponse.json({
        success: false,
        error: 'Missing member ID',
        message: 'Member ID is required',
        data: null
      }, { status: 400 });
    }

    const existingMember = await db.select()
      .from(users)
      .where(eq(users.id, memberId))
      .limit(1);

    if (existingMember.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Member not found',
        message: 'Member not found',
        data: null
      }, { status: 404 });
    }

    if (existingMember[0].id === adminUser.id) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete self',
        message: 'You cannot delete your own account',
        data: null
      }, { status: 400 });
    }

    await db.delete(users).where(eq(users.id, memberId));

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Member deleted successfully',
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
