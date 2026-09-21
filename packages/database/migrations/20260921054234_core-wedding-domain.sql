CREATE TYPE "public"."event_type" AS ENUM('ceremony', 'reception');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('invited', 'confirmed', 'declined');--> statement-breakpoint
CREATE TYPE "public"."wedding_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "couples" (
	"partner_one" jsonb NOT NULL,
	"partner_two" jsonb NOT NULL,
	"wedding_id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"address" text NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"map_url" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"streaming_url" text,
	"title" varchar(120) NOT NULL,
	"type" "event_type" NOT NULL,
	"venue_name" varchar(160) NOT NULL,
	"wedding_id" uuid NOT NULL,
	CONSTRAINT "events_time_order" CHECK ("events"."ends_at" > "events"."starts_at")
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"display_name" varchar(120) NOT NULL,
	"group_name" varchar(120) NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"invitation_status" "invitation_status" DEFAULT 'invited' NOT NULL,
	"max_party_size" integer NOT NULL,
	"wedding_id" uuid NOT NULL,
	CONSTRAINT "guests_party_size_range" CHECK ("guests"."max_party_size" BETWEEN 1 AND 20)
);
--> statement-breakpoint
CREATE TABLE "theme_assignments" (
	"customizations" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"theme_id" varchar(120) NOT NULL,
	"theme_version" integer NOT NULL,
	"wedding_id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weddings" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"locale" varchar(16) NOT NULL,
	"published_at" timestamp with time zone,
	"slug" varchar(120) NOT NULL,
	"status" "wedding_status" DEFAULT 'draft' NOT NULL,
	"timezone" varchar(64) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weddings_slug_format" CHECK ("weddings"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "weddings_publication_state" CHECK ("weddings"."status" <> 'published' OR "weddings"."published_at" IS NOT NULL)
);
--> statement-breakpoint
ALTER TABLE "couples" ADD CONSTRAINT "couples_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_assignments" ADD CONSTRAINT "theme_assignments_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_wedding_start_idx" ON "events" USING btree ("wedding_id","starts_at");--> statement-breakpoint
CREATE INDEX "guests_wedding_idx" ON "guests" USING btree ("wedding_id");--> statement-breakpoint
CREATE UNIQUE INDEX "weddings_slug_unique" ON "weddings" USING btree ("slug");