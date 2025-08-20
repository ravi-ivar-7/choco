import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getUserTeamIds } from '@/lib/auth'
import { db } from '@/lib/db'
import { credentials } from '@/lib/schema'
import { eq, and, inArray } from 'drizzle-orm'

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const userTeamIds = getUserTeamIds(user)
    
    if (userTeamIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No team access',
        message: 'User must belong to at least one team',
        data: null
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const credentialId = searchParams.get('credentialId')

    let deletedCredentials
    let message

    if (credentialId) {
      // Delete specific credential by ID
      deletedCredentials = await db
        .delete(credentials)
        .where(and(
          eq(credentials.id, credentialId),
          inArray(credentials.teamId, userTeamIds)
        ))
        .returning()
      
      if (deletedCredentials.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Not found',
          message: 'Credential not found or access denied',
          data: null
        }, { status: 404 })
      }
      
      message = `Successfully deleted credential ${credentialId}`
    } else {
      // Delete all credentials for the team
      deletedCredentials = await db
        .delete(credentials)
        .where(inArray(credentials.teamId, userTeamIds))
        .returning()
      
      message = `Successfully cleaned up ${deletedCredentials.length} credentials`
    }

    return NextResponse.json({
      success: true,
      error: null,
      message,
      data: {
        deletedCount: deletedCredentials.length,
        teamIds: userTeamIds,
        credentialId: credentialId || null
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'Failed to cleanup credentials',
      data: null
    }, { status: 500 })
  }
}
