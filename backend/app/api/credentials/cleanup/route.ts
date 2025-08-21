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
    const teamId = searchParams.get('teamId')

    if (!teamId) {
      return NextResponse.json({
        success: false,
        error: 'Missing team ID',
        message: 'Team ID is required',
        data: null
      }, { status: 400 })
    }

    if (!userTeamIds.includes(teamId)) {
      return NextResponse.json({
        success: false,
        error: 'Team access denied',
        message: 'User does not have access to the specified team',
        data: null
      }, { status: 403 })
    }

    // Get credential IDs from request body only
    let body = null
    try {
      const text = await request.text()
      if (text) {
        body = JSON.parse(text)
      }
    } catch (error) {
      // Ignore JSON parse errors for empty body
    }

    const credentialIds = body?.credentialIds || null

    let deletedCredentials
    let message

    if (credentialIds && credentialIds.length > 0) {
      // Delete specific credentials by IDs (single or multiple)
      deletedCredentials = await db
        .delete(credentials)
        .where(and(
          inArray(credentials.id, credentialIds),
          eq(credentials.teamId, teamId)
        ))
        .returning()
      
      if (deletedCredentials.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Not found',
          message: 'No credentials found with the provided IDs or access denied',
          data: null
        }, { status: 404 })
      }
      
      const deletedIds = deletedCredentials.map(cred => cred.id)
      message = credentialIds.length === 1 
        ? `Successfully deleted credential ${deletedIds[0]}`
        : `Successfully deleted ${deletedCredentials.length} credentials: ${deletedIds.join(', ')}`
    } else {
      // Delete all credentials for the specific team
      deletedCredentials = await db
        .delete(credentials)
        .where(eq(credentials.teamId, teamId))
        .returning()
      
      message = `Successfully cleaned up ${deletedCredentials.length} credentials for team ${teamId}`
    }

    return NextResponse.json({
      success: true,
      error: null,
      message,
      data: {
        deletedCount: deletedCredentials.length,
        teamId: teamId,
        deletedCredentialIds: deletedCredentials.map(cred => cred.id)
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
