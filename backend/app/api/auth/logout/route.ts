import { NextRequest, NextResponse } from 'next/server';

// POST /api/auth/logout - JWT logout (stateless)
export async function POST(request: NextRequest) {
  try {
    // With JWT, logout is handled client-side by removing the token
    // No server-side session to invalidate
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
