import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tokens } from '@/lib/schema';
import { getAuthUser, getClientIP, getUserAgent } from '@/lib/auth';
import { encryptToken, decryptToken } from '@/lib/crypto';
import { eq, and } from 'drizzle-orm';

// POST /api/token/store - Store a new token for the team
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { refreshToken, accessToken, generalToken, userEmail, tokenSource = 'manual' } = body;

    // At least one token must be provided
    if (!refreshToken && !accessToken && !generalToken) {
      return NextResponse.json({ 
        success: false, 
        message: 'At least one token (refresh, access, or general) is required' 
      }, { status: 400 });
    }

    console.log('💾 Storing new token for team (one token per team policy)');
    console.log('💾 New token provided:', {
      hasRefresh: !!refreshToken,
      hasAccess: !!accessToken,
      hasGeneral: !!generalToken,
      source: tokenSource
    });
    
    // Delete all existing tokens for this team (one token per team policy)
    const deletedCount = await db.delete(tokens)
      .where(eq(tokens.teamId, user.teamId));
    
    console.log(`🗑️ Deleted ${deletedCount} existing tokens for team ${user.teamId}`);
    
    // Use refresh token as the primary token (most common and long-lasting)
    const primaryToken = refreshToken || accessToken || generalToken;
    
    if (!primaryToken) {
      return NextResponse.json({ 
        success: false, 
        message: 'No valid token provided' 
      }, { status: 400 });
    }

    // Create new token entry with the primary token only
    const tokenData: any = {
      teamId: user.teamId,
      isActive: true,
      createdBy: user.id,
      tokenSource
    };
    
    // Store only the primary token (priority: refresh > access > general)
    if (refreshToken) {
      console.log('💾 Storing refresh token as primary token');
      tokenData.encryptedRefreshToken = encryptToken(refreshToken);
      tokenData.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (accessToken) {
      console.log('💾 Storing access token as primary token');
      tokenData.encryptedAccessToken = encryptToken(accessToken);
      tokenData.accessTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    } else if (generalToken) {
      console.log('💾 Storing general token as primary token');
      tokenData.encryptedGeneralToken = encryptToken(generalToken);
      tokenData.generalTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    const [newToken] = await db.insert(tokens).values(tokenData).returning();

    return NextResponse.json({
      success: true,
      message: 'Token stored successfully',
      tokenId: newToken.id
    });

  } catch (error) {
    console.error('Token storage error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
