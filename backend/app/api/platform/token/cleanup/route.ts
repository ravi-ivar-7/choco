import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { tokens } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        message: 'Authentication required',
        data: null
      }, { status: 401 })
    }

    const deletedTokens = await db
      .delete(tokens)
      .where(eq(tokens.teamId, user.teamId))
      .returning()

    return NextResponse.json({
      success: true,
      error: null,
      message: `Successfully cleaned up ${deletedTokens.length} invalid tokens`,
      data: {
        deletedCount: deletedTokens.length,
        teamId: user.teamId
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'Failed to cleanup tokens',
      data: null
    }, { status: 500 })
  }
}
