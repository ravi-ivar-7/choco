import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tokens } from '@/lib/schema';
import { getAuthUser } from '@/lib/auth';
import { encryptToken } from '@/lib/crypto';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { refreshToken, accessToken, generalToken, userEmail, tokenSource = 'manual' } = body;

    if (!refreshToken && !accessToken && !generalToken) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing token',
        message: 'At least one token (refresh, access, or general) is required',
        data: null
      }, { status: 400 });
    }
    
    await db.delete(tokens).where(eq(tokens.teamId, user.teamId));
    
    const primaryToken = refreshToken || accessToken || generalToken;
    
    if (!primaryToken) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid token',
        message: 'No valid token provided',
        data: null
      }, { status: 400 });
    }

    const tokenData: any = {
      teamId: user.teamId,
      isActive: true,
      createdBy: user.id,
      tokenSource
    };
    
    if (refreshToken) {
      tokenData.encryptedRefreshToken = encryptToken(refreshToken);
      tokenData.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (accessToken) {
      tokenData.encryptedAccessToken = encryptToken(accessToken);
      tokenData.accessTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    } else if (generalToken) {
      tokenData.encryptedGeneralToken = encryptToken(generalToken);
      tokenData.generalTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    const [newToken] = await db.insert(tokens).values(tokenData).returning();

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Token stored successfully',
      data: {
        tokenId: newToken.id
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
