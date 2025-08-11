ALTER TABLE "tokens" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
ALTER TABLE "tokens" DROP COLUMN IF EXISTS "encrypted_refresh_token";--> statement-breakpoint
ALTER TABLE "tokens" DROP COLUMN IF EXISTS "refresh_token_hash";--> statement-breakpoint
ALTER TABLE "tokens" DROP COLUMN IF EXISTS "expires_at";--> statement-breakpoint
ALTER TABLE "tokens" DROP COLUMN IF EXISTS "last_used_at";--> statement-breakpoint
ALTER TABLE "tokens" DROP COLUMN IF EXISTS "updated_at";