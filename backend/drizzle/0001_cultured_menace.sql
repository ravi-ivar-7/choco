ALTER TABLE "tokens" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "encrypted_token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "refresh_token_hash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "last_used_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tokens" DROP COLUMN IF EXISTS "encrypted_access_token";