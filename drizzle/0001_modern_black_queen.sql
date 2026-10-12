ALTER TABLE "profiles" ALTER COLUMN "theme_color" SET DEFAULT '#EAB308';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "badges" jsonb DEFAULT '[]'::jsonb NOT NULL;