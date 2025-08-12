import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tokens } from '@/lib/schema';
import { getAuthUser } from '@/lib/auth';
import { decryptToken } from '@/lib/crypto';
import { eq, and } from 'drizzle-orm';

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

    const teamTokens = await db.select()
      .from(tokens)
      .where(and(
        eq(tokens.teamId, user.teamId),
        eq(tokens.isActive, true)
      ))
      .orderBy(tokens.createdAt);

    const decryptedTokens = teamTokens.map(token => {
      try {
        const decryptedData: any = {
          id: token.id,
          createdAt: token.createdAt,
          tokenSource: token.tokenSource,
          lastUsedAt: token.lastUsedAt
        };
        
        if (token.encryptedRefreshToken) {
          decryptedData.refreshToken = decryptToken(token.encryptedRefreshToken);
          decryptedData.refreshTokenExpiresAt = token.refreshTokenExpiresAt;
        }
        
        if (token.encryptedAccessToken) {
          decryptedData.accessToken = decryptToken(token.encryptedAccessToken);
          decryptedData.accessTokenExpiresAt = token.accessTokenExpiresAt;
        }
        
        if (token.encryptedGeneralToken) {
          decryptedData.generalToken = decryptToken(token.encryptedGeneralToken);
          decryptedData.generalTokenExpiresAt = token.generalTokenExpiresAt;
        }
        
        if (decryptedData.refreshToken) {
          decryptedData.token = decryptedData.refreshToken;
        }
        
        return decryptedData;
      } catch (error) {
        console.error('Error processing token:', token.id, error);
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      error: null,
      message: 'Tokens retrieved successfully',
      data: {
        tokens: decryptedTokens,
        count: decryptedTokens.length
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
