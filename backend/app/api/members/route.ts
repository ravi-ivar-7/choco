import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, teams } from '@/lib/schema';
import { requireAdmin, getClientIP, getUserAgent } from '@/lib/auth';
import { generateAndHashInitialPassword } from '@/lib/password-utils';
import { eq, and } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// GET /api/members - List all members or members of a specific team
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
      members
    });
  } catch (error) {
    console.error('Members fetch error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch members'
    }, { status: error instanceof Error && error.message === 'Authentication required' ? 401 : 500 });
  }
}

// POST /api/members - Create new member
export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request);
    const body = await request.json();
    
    const { email, name, role = 'member', teamId } = body;
    
    if (!email || !name || !teamId) {
      return NextResponse.json({
        success: false,
        message: 'Email, name, and team ID are required'
      }, { status: 400 });
    }

    // Validate role
    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json({
        success: false,
        message: 'Role must be either "admin" or "member"'
      }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'A user with this email already exists'
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
    
    // Generate initial password from email (without @domain.tld)
    const hashedPassword = await generateAndHashInitialPassword(email);
    const initialPassword = email.split('@')[0]; // For logging purposes
    
    const newMember = await db.insert(users).values({
      id: memberId,
      email,
      name,
      password: hashedPassword,
      role,
      teamId,
      isActive: true,
    }).returning();


    console.log(`✅ Created user ${email} with initial password: ${initialPassword}`);

    return NextResponse.json({
      success: true,
      message: 'Member created successfully',
      member: newMember[0]
    });
  } catch (error) {
    console.error('Member creation error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create member'
    }, { status: 500 });
  }
}

// PUT /api/members - Update member
export async function PUT(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request);
    const body = await request.json();
    
    const { id, email, name, role, teamId, isActive } = body;
    
    if (!id || !email || !name || !teamId) {
      return NextResponse.json({
        success: false,
        message: 'Member ID, email, name, and team ID are required'
      }, { status: 400 });
    }

    // Validate role
    if (role && !['admin', 'member'].includes(role)) {
      return NextResponse.json({
        success: false,
        message: 'Role must be either "admin" or "member"'
      }, { status: 400 });
    }

    // Check if member exists
    const existingMember = await db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existingMember.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Member not found'
      }, { status: 404 });
    }

    // Check if email is used by another user
    const duplicateUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (duplicateUser.length > 0 && duplicateUser[0].id !== id) {
      return NextResponse.json({
        success: false,
        message: 'Another user is already using this email'
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
      message: 'Member updated successfully',
      member: updatedMember[0]
    });
  } catch (error) {
    console.error('Member update error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update member'
    }, { status: 500 });
  }
}

// DELETE /api/members - Delete member
export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('id');
    
    if (!memberId) {
      return NextResponse.json({
        success: false,
        message: 'Member ID is required'
      }, { status: 400 });
    }

    // Check if member exists
    const existingMember = await db.select()
      .from(users)
      .where(eq(users.id, memberId))
      .limit(1);

    if (existingMember.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Member not found'
      }, { status: 404 });
    }

    // Prevent deleting yourself
    if (existingMember[0].id === adminUser.id) {
      return NextResponse.json({
        success: false,
        message: 'You cannot delete your own account'
      }, { status: 400 });
    }

    const member = existingMember[0];


    await db.delete(users).where(eq(users.id, memberId));

    return NextResponse.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error('Member deletion error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete member'
    }, { status: 500 });
  }
}
