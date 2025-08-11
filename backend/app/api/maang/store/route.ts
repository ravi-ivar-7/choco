import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tokens } from '@/lib/schema';
import { getAuthUser, getClientIP, getUserAgent } from '@/lib/auth';
import { encryptToken, hashToken } from '@/lib/crypto';
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
    const { refreshToken, userEmail } = body;

    if (!refreshToken) {
      return NextResponse.json({ 
        success: false, 
        message: 'Refresh token is required' 
      }, { status: 400 });
    }

    // Hash the tokens to check if they already exist
    const refreshTokenHash = hashToken(refreshToken);

    // Check if this token combination already exists (use refresh token hash since that's what we store)
    const existingToken = await db.select()
      .from(tokens)
      .where(and(
        eq(tokens.teamId, user.teamId),
        eq(tokens.tokenHash, refreshTokenHash),
        eq(tokens.isActive, true)
      ))
      .limit(1);

    if (existingToken.length > 0) {
      // Token already exists, just update the last used timestamp
      await db.update(tokens)
        .set({ 
          updatedAt: new Date(),
          lastUsedAt: new Date()
        })
        .where(eq(tokens.id, existingToken[0].id));


      return NextResponse.json({
        success: true,
        message: 'Token already exists and is active',
        tokenId: existingToken[0].id
      });
    }

    // Encrypt and store the refresh token (returns base64 string ready for database)
    const encryptedTokenString = encryptToken(refreshToken);

    const [newToken] = await db.insert(tokens).values({
      teamId: user.teamId,
      tokenHash: refreshTokenHash,
      encryptedToken: encryptedTokenString,
      isActive: true,
      createdBy: user.id
    }).returning();

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
