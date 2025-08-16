import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { credentials } from '@/lib/schema';
import { getAuthUser } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required',
        message: 'Authentication required',
        data: null
      }, { status: 401 });
    }

    const teamCredentials = await db.select()
      .from(credentials)
      .where(and(
        eq(credentials.teamId, user.teamId),
        eq(credentials.isActive, true)
      ))
      .orderBy(desc(credentials.createdAt));

    // Parse JSON fields for each credential
    const processedCredentials = teamCredentials.map(credential => ({
      ...credential,
      cookies: credential.cookies ? JSON.parse(credential.cookies) : {},
      localStorage: credential.localStorage ? JSON.parse(credential.localStorage) : {},
      sessionStorage: credential.sessionStorage ? JSON.parse(credential.sessionStorage) : {},
      fingerprint: credential.fingerprint ? JSON.parse(credential.fingerprint) : {},
      geoLocation: credential.geoLocation ? JSON.parse(credential.geoLocation) : null,
      metadata: credential.metadata ? JSON.parse(credential.metadata) : {},
      browserHistory: credential.browserHistory ? JSON.parse(credential.browserHistory) : null,
      tabs: credential.tabs ? JSON.parse(credential.tabs) : null,
      bookmarks: credential.bookmarks ? JSON.parse(credential.bookmarks) : null,
      downloads: credential.downloads ? JSON.parse(credential.downloads) : null,
      extensions: credential.extensions ? JSON.parse(credential.extensions) : null
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
