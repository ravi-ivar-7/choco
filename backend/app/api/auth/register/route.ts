import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { hashPassword } from '@/utils/password'
import { createId } from '@paralleldrive/cuid2'
import { eq } from 'drizzle-orm'
import { generateToken } from '@/utils/jwt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, password } = body

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'Email, name, and password are required',
        data: null
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format',
        message: 'Please provide a valid email address',
        data: null
      }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password too weak',
        message: 'Password must be at least 6 characters long',
        data: null
      }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'User already exists',
        message: 'An account with this email already exists',
        data: null
      }, { status: 409 })
    }

    // Hash the password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const userId = createId()
    const [newUser] = await db.insert(users).values({
      id: userId,
      email: email.toLowerCase(),
      name: name.trim(),
      password: hashedPassword,
      isActive: true,
    }).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      isActive: users.isActive,
      createdAt: users.createdAt
    })

    // Generate JWT token for auto-authentication
    const token = generateToken(newUser.id, newUser.email)

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Account created successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          teams: []
        },
        token
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'Failed to create account. Please try again.',
      data: null
    }, { status: 500 })
  }
}
