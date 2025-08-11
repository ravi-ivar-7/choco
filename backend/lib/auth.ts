import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  teamId: string;
}

// JWT-based authentication for all APIs
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    const JWT_SECRET = process.env.JWT_SECRET ;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = await db.select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);
    
    if (user.length === 0 || !user[0].isActive) {
      return null;
    }
    
    return {
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
      role: user[0].role,
      teamId: user[0].teamId
    };
    
  } catch (error) {
    console.error('JWT verification error:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new Error('Authentication required');
  }
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-forwarded-host');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (remoteAddr) {
    return remoteAddr;
  }
  
  try {
    const url = new URL(request.url);
    if (url.hostname && url.hostname !== 'localhost') {
      return url.hostname;
    }
  } catch (e) {
    console.error('Failed to get client IP:', e instanceof Error ? e.message : String(e));
  }
  
  return 'unknown';
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}
