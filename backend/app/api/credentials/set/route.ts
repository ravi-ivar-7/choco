import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { credentials, credentialConfigs } from '@/lib/schema';
import { requireAuth, getUserTeamIds } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

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
      teamId,
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
      credentialSource = 'manual' 
    } = body;

    // Extract client IP from request headers as fallback
    const clientIP = request.headers.get('cf-connecting-ip') ||
                    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                    request.headers.get('x-real-ip') ||
                    null;

    // Basic input validation
    if (!teamId) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing team ID',
        message: 'Team ID is required',
        data: { missing: ['teamId'] }
      }, { status: 400 });
    }

    // Check if any credential data is provided
    const hasAnyData = cookies || localStorage || sessionStorage || fingerprint || 
                      geoLocation || metadata || ipAddress || userAgent || platform || browser;
    
    if (!hasAnyData) {
      return NextResponse.json({ 
        success: false,
        error: 'No credential data',
        message: 'At least one type of credential data must be provided',
        data: { 
          missing: ['cookies', 'localStorage', 'sessionStorage', 'fingerprint', 'geoLocation', 'metadata', 'ipAddress', 'userAgent', 'platform', 'browser'],
          provided: []
        }
      }, { status: 400 });
    }


    if (!userTeamIds.includes(teamId)) {
      return NextResponse.json({ 
        success: false,
        error: 'Team access denied',
        message: 'User does not have access to the specified team',
        data: { 
          teamId,
          userTeams: userTeamIds
        }
      }, { status: 403 });
    }

    // Handle IP address: null (none), real IP, or fallback to backend
    let finalIPAddress;
    if (ipAddress === null) {
      // Config was 'none' - don't collect IP at all
      finalIPAddress = null;
    } else if (ipAddress === 'unavailable_fallback_backend') {
      // Extension couldn't collect - use backend fallback
      finalIPAddress = clientIP;
    } else {
      // Extension successfully collected IP
      finalIPAddress = ipAddress;
    }
    
    const credentialData = {
      cookies: cookies ? JSON.stringify(cookies) : null,
      localStorage: localStorage ? JSON.stringify(localStorage) : null,
      sessionStorage: sessionStorage ? JSON.stringify(sessionStorage) : null,
      fingerprint: fingerprint ? JSON.stringify(fingerprint) : null,
      geoLocation: geoLocation ? JSON.stringify(geoLocation) : null,
      ipAddress: finalIPAddress,
      userAgent: userAgent || null,
      platform: platform || null,
      browser: browser ? JSON.stringify(browser) : null,
    };

    // Check for existing credentials to avoid duplicates
    const existingCredentials = await db.select().from(credentials)
      .where(and(
        eq(credentials.teamId, teamId),
        eq(credentials.isActive, true)
      ));

    // Simple duplicate detection - exact match of all provided fields
    let isDuplicate = false;
    const fieldsToCompare = [
      'cookies', 'localStorage', 'sessionStorage', 
      'fingerprint', 'geoLocation',
      'ipAddress', 'userAgent', 'platform', 'browser'
    ];
    
    if (existingCredentials.length > 0) {
      for (const existingCred of existingCredentials) {
        let isFullMatch = true;
        
        for (const field of fieldsToCompare) {
          const existingValue = (existingCred as any)[field];
          const newValue = (credentialData as any)[field];
          
          // Both should be null/empty or both should match exactly
          if (existingValue !== newValue) {
            isFullMatch = false;
            break;
          }
        }
        
        if (isFullMatch) {
          isDuplicate = true;
          break;
        }
      }
    }

    if (isDuplicate) {
      return NextResponse.json({
        success: true,
        error: null,
        message: 'Credentials already exists - team is ready',
        data: {
          credential: 'existing',
          duplicate: true
        }
      });
    }
    
    // Prepare final credential record
    const finalCredentialData: any = {
      teamId,
      isActive: true,
      createdBy: user.id,
      credentialSource,
      ...credentialData
    };

    // Insert the new credential record
    const [newCredential] = await db.insert(credentials).values(finalCredentialData).returning();

    return NextResponse.json({
      success: true,
      error: null,
      message: 'New credentials stored successfully',
      data: {
        credential: newCredential.id,
        stored: true,
        storedFields: Object.keys(credentialData).filter(key => (credentialData as any)[key] !== null)
      }
    });

  } catch (error) {
    console.error('Credentials store API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Server error',
      message: 'Internal server error occurred while processing credentials',
      data: {
        timestamp: new Date().toISOString(),
        errorType: error instanceof Error ? error.name : 'Unknown'
      }
    }, { status: 500 });
  }
}
