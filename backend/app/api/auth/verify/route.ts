import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, getClientIP } from '@/lib/auth'

// POST /api/auth/verify - Verify JWT token and user role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requiredRole } = body // Optional: specify required role (e.g., 'admin')

    // Verify JWT token and get user
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check required role if specified
    if (requiredRole && user.role !== requiredRole) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Access denied. ${requiredRole} role required, but user has ${user.role} role` 
        },
        { status: 403 }
      )
    }

    const clientIP = getClientIP(request)
    console.log(`JWT verification successful: ${user.email} (${user.role}) from ${clientIP}`)

    return NextResponse.json({
      success: true,
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        teamId: user.teamId
      },
      message: `Token verified successfully for ${user.role} user`
    })

  } catch (error) {
    console.error('JWT verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Token verification failed' },
      { status: 500 }
    )
  }
}
