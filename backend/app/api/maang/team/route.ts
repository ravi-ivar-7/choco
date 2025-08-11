import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tokens } from '@/lib/schema';
import { getAuthUser, getClientIP, getUserAgent } from '@/lib/auth';
import { decryptToken } from '@/lib/crypto';
import { eq, and } from 'drizzle-orm';

// GET /api/token/team - Get all active tokens for the team
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    // Fetch all active tokens for the team
    const teamTokens = await db.select()
      .from(tokens)
      .where(and(
        eq(tokens.teamId, user.teamId),
        eq(tokens.isActive, true)
      ))
      .orderBy(tokens.createdAt);

    // Decrypt tokens for testing
    const decryptedTokens = teamTokens.map(token => {
      try {
        const decryptedData: any = {
          id: token.id,
          createdAt: token.createdAt,
          tokenSource: token.tokenSource,
          lastUsedAt: token.lastUsedAt
        };
        
        // Decrypt individual tokens if they exist
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
        
        // For backward compatibility, set 'token' to refreshToken if available
        if (decryptedData.refreshToken) {
          decryptedData.token = decryptedData.refreshToken;
        }
        
        return decryptedData;
      } catch (error) {
        console.error(`Failed to decrypt tokens for ${token.id}:`, error);
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      tokens: decryptedTokens,
      count: decryptedTokens.length
    });

  } catch (error) {
    console.error('Team tokens fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
