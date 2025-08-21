import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { users, teams, teamMembers } from './schema';
import { eq } from 'drizzle-orm';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  teams: Array<{
    teamId: string;
    teamName: string;
    role: 'admin' | 'member';
    isOwner: boolean;
  }>;
}

// JWT-based authentication for all APIs
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Validate token format
    if (!token || token.length < 10 || !token.includes('.')) {
      console.error('Invalid token format');
      return null;
    }
    
    const JWT_SECRET = process.env.JWT_SECRET ;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError instanceof Error ? jwtError.message : String(jwtError));
      return null;
    }
    
    let user;
    try {
      user = await db.select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);
    } catch (dbError) {
      console.error('Database error during user lookup:', dbError instanceof Error ? dbError.message : String(dbError));
      return null;
    }
    
    if (user.length === 0 || !user[0].isActive) {
      return null;
    }

    // Get user's team memberships
    let userTeams;
    try {
      userTeams = await db.select({
        teamId: teamMembers.teamId,
        teamName: teams.name,
        role: teamMembers.role,
        ownerId: teams.ownerId
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, decoded.userId));
    } catch (dbError) {
      console.error('Database error during team lookup:', dbError instanceof Error ? dbError.message : String(dbError));
      return null;
    }
    
    const formattedTeams = userTeams.map(team => ({
      teamId: team.teamId,
      teamName: team.teamName,
      role: team.role,
      isOwner: team.ownerId === decoded.userId
    }));
    
    return {
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
      teams: formattedTeams
    };
    
  } catch (error) {
    console.error('JWT verification error:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireTeamAdmin(request: NextRequest, teamId: string): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new Error('Authentication required');
  }
  
  const userTeam = user.teams.find(t => t.teamId === teamId);
  if (!userTeam) {
    throw new Error('Access denied: Not a member of this team');
  }
  
  if (userTeam.role !== 'admin' && !userTeam.isOwner) {
    throw new Error('Admin access required for this team');
  }
  
  return user;
}

export function getUserTeamIds(user: AuthUser): string[] {
  return user.teams.map(t => t.teamId);
}

export function isTeamAdmin(user: AuthUser, teamId: string): boolean {
  const userTeam = user.teams.find(t => t.teamId === teamId);
  return userTeam ? (userTeam.role === 'admin' || userTeam.isOwner) : false;
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

export function verifyToken(token: string): any {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error instanceof Error ? error.message : String(error));
    return null;
  }
}
