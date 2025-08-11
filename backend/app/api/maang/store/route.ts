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

    // Get all existing tokens for this team to check for duplicates
    const allTeamTokens = await db.select()
      .from(tokens)
      .where(and(
        eq(tokens.teamId, user.teamId),
        eq(tokens.isActive, true)
      ));

    // Check for duplicates by decrypting and comparing tokens
    console.log(`🔍 Checking ${allTeamTokens.length} existing tokens for duplicates`);
    console.log('🔍 New tokens provided:', {
      hasRefresh: !!refreshToken,
      hasAccess: !!accessToken,
      hasGeneral: !!generalToken,
      refreshPreview: refreshToken ? refreshToken.substring(0, 20) + '...' : null
    });
    
    let existingToken: any = null;
    
    for (const tokenRecord of allTeamTokens) {
      try {
        console.log(`🔍 Checking token record ${tokenRecord.id}`);
        
        // Check refresh token match
        if (refreshToken && tokenRecord.encryptedRefreshToken) {
          console.log('🔍 Decrypting existing refresh token...');
          const decryptedRefresh = decryptToken(tokenRecord.encryptedRefreshToken);
          console.log('🔍 Comparing refresh tokens:', {
            newPreview: refreshToken.substring(0, 20) + '...',
            existingPreview: decryptedRefresh.substring(0, 20) + '...',
            match: decryptedRefresh === refreshToken
          });
          
          if (decryptedRefresh === refreshToken) {
            console.log('✅ Found duplicate refresh token!');
            existingToken = tokenRecord;
            break;
          }
        }
        
        // Check access token match
        if (accessToken && tokenRecord.encryptedAccessToken) {
          console.log('🔍 Decrypting existing access token...');
          const decryptedAccess = decryptToken(tokenRecord.encryptedAccessToken);
          console.log('🔍 Comparing access tokens:', {
            newPreview: accessToken.substring(0, 20) + '...',
            existingPreview: decryptedAccess.substring(0, 20) + '...',
            match: decryptedAccess === accessToken
          });
          
          if (decryptedAccess === accessToken) {
            console.log('✅ Found duplicate access token!');
            existingToken = tokenRecord;
            break;
          }
        }
        
        // Check general token match
        if (generalToken && tokenRecord.encryptedGeneralToken) {
          console.log('🔍 Decrypting existing general token...');
          const decryptedGeneral = decryptToken(tokenRecord.encryptedGeneralToken);
          console.log('🔍 Comparing general tokens:', {
            newPreview: generalToken.substring(0, 20) + '...',
            existingPreview: decryptedGeneral.substring(0, 20) + '...',
            match: decryptedGeneral === generalToken
          });
          
          if (decryptedGeneral === generalToken) {
            console.log('✅ Found duplicate general token!');
            existingToken = tokenRecord;
            break;
          }
        }
      } catch (error) {
        // Skip tokens that can't be decrypted (corrupted data)
        console.warn(`❌ Failed to decrypt token ${tokenRecord.id}:`, error);
        continue;
      }
    }
    
    console.log('🔍 Duplicate check result:', {
      foundDuplicate: !!existingToken,
      existingTokenId: existingToken?.id
    });

    if (existingToken) {
      // Token entry exists, update with all provided tokens and timestamps
      const updateData: any = { 
        updatedAt: new Date(),
        lastUsedAt: new Date(),
        tokenSource // Update source if different
      };
      
      // Update refresh token if provided
      if (refreshToken) {
        updateData.encryptedRefreshToken = encryptToken(refreshToken);
        updateData.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
      
      // Update access token if provided
      if (accessToken) {
        updateData.encryptedAccessToken = encryptToken(accessToken);
        updateData.accessTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
      }
      
      // Update general token if provided
      if (generalToken) {
        updateData.encryptedGeneralToken = encryptToken(generalToken);
        updateData.generalTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
      
      await db.update(tokens)
        .set(updateData)
        .where(eq(tokens.id, existingToken.id));

      return NextResponse.json({
        success: true,
        message: 'Token updated successfully',
        tokenId: existingToken.id
      });
    }

    // Create new token entry with all provided tokens
    const tokenData: any = {
      teamId: user.teamId,
      isActive: true,
      createdBy: user.id,
      tokenSource
    };
    
    // Add individual tokens if provided
    if (refreshToken) {
      tokenData.encryptedRefreshToken = encryptToken(refreshToken);
      // Set expiration to 30 days from now (default for refresh tokens)
      tokenData.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    
    if (accessToken) {
      tokenData.encryptedAccessToken = encryptToken(accessToken);
      // Set expiration to 1 hour from now (default for access tokens)
      tokenData.accessTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    }
    
    if (generalToken) {
      tokenData.encryptedGeneralToken = encryptToken(generalToken);
      // Set expiration to 24 hours from now (default for general tokens)
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
