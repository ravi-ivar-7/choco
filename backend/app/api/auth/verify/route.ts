import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token',
        message: 'Invalid or expired token',
        data: null
      }, { status: 401 })
    }

    
    return NextResponse.json({
      success: true,
      error: null,
      message: 'Token verified successfully',
      data: {
        user: user
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
