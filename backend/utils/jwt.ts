import jwt from 'jsonwebtoken'

export interface TokenPayload {
  userId: string
  email: string
}

export function generateToken(userId: string, email: string): string {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured')
  }

  return jwt.sign(
    {
      userId,
      email
    },
    jwtSecret,
    { expiresIn: '90d' }
  )
}

export function verifyToken(token: string): TokenPayload {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured')
  }

  return jwt.verify(token, jwtSecret) as TokenPayload
}
