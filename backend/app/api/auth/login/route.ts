import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// POST /api/auth/login - Admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email and password are required' 
      }, { status: 400 });
    }

    // Find user by email
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
        message: 'Invalid credentials' 
      }, { status: 401 });
    }

    const userData = user[0];

    // Validate password using bcrypt
    const isValidPassword = await bcrypt.compare(password, userData.password);

    if (!isValidPassword) {
      // Log failed login attempt
     

      return NextResponse.json({ 
        success: false, 
        message: 'Invalid credentials' 
      }, { status: 401 });
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { 
        userId: userData.id, 
        email: userData.email,
        role: userData.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login time
    await db.update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userData.id));

    // Log successful login
   

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        teamId: userData.teamId
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
