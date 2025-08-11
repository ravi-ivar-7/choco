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
        // Direct decryption from base64 string stored in database
        const decryptedRefreshToken = decryptToken(token.encryptedToken);
        
        // The stored token is just the refresh token string, not a JSON object
        return {
          id: token.id,
          decryptedToken: {
            refreshToken: decryptedRefreshToken,
            accessToken: null // We only store refresh tokens
          },
          createdAt: token.createdAt
        };
      } catch (error) {
        console.error(`Failed to decrypt token ${token.id}:`, error);
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
