import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing credentials',
        message: 'Email and password are required',
        data: null
      }, { status: 400 });
    }

    const user = await db.select()
      .from(users)
      .where(and(
        eq(users.email, email.toLowerCase()),
        eq(users.isActive, true)
      ))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication failed',
        message: 'Invalid credentials',
        data: null
      }, { status: 401 });
    }

    const userData = user[0];

    const isValidPassword = await bcrypt.compare(password, userData.password);

    if (!isValidPassword) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication failed',
        message: 'Invalid credentials',
        data: null
      }, { status: 401 });
    }

    const JWT_SECRET = process.env.JWT_SECRET ;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    const token = jwt.sign(
      { 
        userId: userData.id, 
        email: userData.email,
        role: userData.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await db.update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userData.id));

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          teamId: userData.teamId
        }
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: 'Server error',
      message: 'Internal server error',
      data: null
    }, { status: 500 });
  }
}
