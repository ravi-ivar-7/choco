import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const teams = pgTable('teams', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  platformAccountId: text('platform_account_id').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(), // Hashed password, initially email without @domain.tld
  role: text('role', { enum: ['admin', 'member'] }).notNull().default('member'),
  teamId: text('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tokens = pgTable('tokens', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  teamId: text('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  
  // Individual token fields (encrypted)
  encryptedRefreshToken: text('encrypted_refresh_token'), // Encrypted refresh token
  encryptedAccessToken: text('encrypted_access_token'),   // Encrypted access token
  encryptedGeneralToken: text('encrypted_general_token'), // Encrypted general token (JWT/other)
  
  // Individual expiration timestamps
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  generalTokenExpiresAt: timestamp('general_token_expires_at'),
  
  // Metadata
  tokenSource: text('token_source').notNull().default('manual'), // 'manual', 'auto_detected', 'team_shared'
  isActive: boolean('is_active').notNull().default(true),
  createdBy: text('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at'),
});
