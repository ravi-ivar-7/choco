import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { tokens } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`🧹 Cleanup request from user: ${user.email} (Team: ${user.teamId})`)

    // This is called when ALL tokens have been validated and found to be invalid
    const deletedTokens = await db
      .delete(tokens)
      .where(eq(tokens.teamId, user.teamId))
      .returning()

    console.log(`✅ Cleaned up ${deletedTokens.length} invalid tokens for team ${user.teamId}`)

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up ${deletedTokens.length} invalid tokens`,
      deletedCount: deletedTokens.length,
      teamId: user.teamId
    })

  } catch (error) {
    console.error('Token cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup tokens' },
      { status: 500 }
    )
  }
}
