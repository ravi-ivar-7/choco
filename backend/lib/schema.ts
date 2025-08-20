import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(), // Hashed password, initially email without @domain.tld
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teams = pgTable('teams', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  platformAccountId: text('platform_account_id').notNull().unique(),
  ownerId: text('owner_id').notNull().references(() => users.id), // Team creator/owner
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teamMembers = pgTable('team_members', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  teamId: text('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['admin', 'member'] }).notNull().default('member'),
  invitedBy: text('invited_by').references(() => users.id), // Who added this member
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const credentialConfigs = pgTable('credential_configs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  teamId: text('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  createdBy: text('created_by').notNull().references(() => users.id),
  
  name: text('name').notNull(), // Config name (e.g., "LeetCode Config", "HackerRank Config")
  description: text('description'),
  
  // Domain configuration
  domain: text('domain').notNull(), // 'google.com
  domainDisplayName: text('domain_display_name').default('Platform'),  
  domainIcon: text('domain_icon').default('🌐'), // '🚀', '💻'
  
  // Field-level configuration for each data type ('none', 'full', or JSON array of specific keys)
  // Browser environment data
  ipAddress: text('ip_address').default('none'), 
  userAgent: text('user_agent').default('none'),
  platform: text('platform').default('none'),
  browser: text('browser').default('none'),
  
  // Browser storage data
  cookies: text('cookies').default('none'), // e.g., ['access_token', 'refresh_token']
  localStorage: text('local_storage').default('none'), // e.g., ['user_tracking_id']
  sessionStorage: text('session_storage').default('none'),
  
  // Advanced browser data
  fingerprint: text('fingerprint').default('none'),
  geoLocation: text('geo_location').default('none'),
  metadata: text('metadata').default('none'),
  
  // Extended browser data
  browserHistory: text('browser_history').default('none'),
  tabs: text('tabs').default('none'),
  bookmarks: text('bookmarks').default('none'),
  downloads: text('downloads').default('none'),
  extensions: text('extensions').default('none'),
  
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const credentials = pgTable('credentials', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  teamId: text('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  configId: text('config_id').notNull().references(() => credentialConfigs.id, { onDelete: 'cascade' }),
  createdBy: text('created_by').notNull().references(() => users.id),
  
  // Browser environment data
  ipAddress: text('ip_address'), // IPv4/IPv6 address
  userAgent: text('user_agent'), // Raw browser user agent string
  platform: text('platform'), // OS / device type (Windows, iOS, Android, etc.)
  browser: text('browser'), // Browser name/version
  
  // Browser storage data (JSON) - collected based on configId settings
  cookies: text('cookies'), // Cookies data as per config: none/full/specific keys
  localStorage: text('local_storage'), // localStorage data as per config: none/full/specific keys
  sessionStorage: text('session_storage'), // sessionStorage data as per config: none/full/specific keys
  
  // Advanced browser data - collected based on configId settings
  fingerprint: text('fingerprint'), // Fingerprint data as per config: none/full/specific keys
  geoLocation: text('geo_location'), // GeoLocation data as per config: none/full/specific keys
  metadata: text('metadata'), // Metadata as per config: none/full/specific keys
  
  // Extended browser data - collected based on configId settings
  browserHistory: text('browser_history'), // Browser history as per config: none/full/specific keys
  tabs: text('tabs'), // Tabs data as per config: none/full/specific keys
  bookmarks: text('bookmarks'), // Bookmarks as per config: none/full/specific keys
  downloads: text('downloads'), // Downloads as per config: none/full/specific keys
  extensions: text('extensions'), // Extensions as per config: none/full/specific keys
  
  // Management fields
  credentialSource: text('credential_source').notNull().default('manual'), // 'manual', 'auto_detected', 'team_shared'
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at'),
});
