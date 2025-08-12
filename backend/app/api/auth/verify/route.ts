import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requiredRole } = body

    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token',
        message: 'Invalid or expired token',
        data: null
      }, { status: 401 })
    }

    if (requiredRole && user.role !== requiredRole) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions',
        message: `Access denied. ${requiredRole} role required, but user has ${user.role} role`,
        data: null
      }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Token verified successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          teamId: user.teamId
        }
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'Token verification failed',
      data: null
    }, { status: 500 })
  }
}
