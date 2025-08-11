import bcrypt from 'bcryptjs'

export function generateInitialPassword(email: string): string {
  const username = email.split('@')[0]
  return username
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function generateAndHashInitialPassword(email: string): Promise<string> {
  const initialPassword = generateInitialPassword(email)
  return await hashPassword(initialPassword)
}
