import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getUserTeamIds } from '@/lib/auth'
import { db } from '@/lib/db'
import { teams, users, credentials, teamMembers } from '@/lib/schema'
import { count, inArray, eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const userTeamIds = getUserTeamIds(user)
    
    // If user has no teams, return zero stats
    if (userTeamIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalTeams: 0,
          totalMembers: 0,
          activeCredentials: 0,
          adminTeams: 0,
          lastCredentialUpdate: 'Never',
          credentialStatus: 'none'
        }
      })
    }
    
    // Get stats scoped to user's teams only
    const [userTeamsCount] = await db.select({ count: count() })
      .from(teams)
      .where(inArray(teams.id, userTeamIds))
    
    const [teamMembersCount] = await db.select({ count: count() })
      .from(teamMembers)
      .where(inArray(teamMembers.teamId, userTeamIds))
    
    const [userCredentialsCount] = await db.select({ count: count() })
      .from(credentials)
      .where(inArray(credentials.teamId, userTeamIds))
    
    // Count admin teams for this user
    const adminTeamsCount = user.teams.filter(team => team.role === 'admin' || team.isOwner).length
    
    return NextResponse.json({
      success: true,
      data: {
        totalTeams: userTeamsCount?.count || 0,
        totalMembers: teamMembersCount?.count || 0,
        activeCredentials: userCredentialsCount?.count || 0,
        adminTeams: adminTeamsCount,
        lastCredentialUpdate: userCredentialsCount?.count > 0 ? 'Recently' : 'Never',
        credentialStatus: userCredentialsCount?.count > 0 ? 'active' : 'none'
      }
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch stats' 
    }, { status: 500 })
  }
}
