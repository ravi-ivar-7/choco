import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { teams, users, credentials } from '@/lib/schema'
import { count } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    
    // Get basic counts for dashboard stats
    const [teamsCount] = await db.select({ count: count() }).from(teams)
    const [usersCount] = await db.select({ count: count() }).from(users)
    const [credentialsCount] = await db.select({ count: count() }).from(credentials)
    
    return NextResponse.json({
      success: true,
      data: {
        totalTeams: teamsCount?.count || 0,
        totalUsers: usersCount?.count || 0,
        activeCredentials: credentialsCount?.count || 0,
        lastCredentialUpdate: credentialsCount?.count > 0 ? 'Recently' : 'Never',
        credentialStatus: credentialsCount?.count > 0 ? 'active' : 'none'
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
