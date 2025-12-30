CREATE TYPE "public"."program" AS ENUM('NA', 'AA');--> statement-breakpoint
CREATE TYPE "public"."routine_status" AS ENUM('completed', 'skipped', 'failed');--> statement-breakpoint
CREATE TYPE "public"."sponsor_status" AS ENUM('pending', 'active', 'revoked');--> statement-breakpoint
CREATE TABLE "action_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"situation" text,
	"if_then" jsonb DEFAULT '[]'::jsonb,
	"checklist" jsonb DEFAULT '[]'::jsonb,
	"emergency_contacts" jsonb DEFAULT '[]'::jsonb,
	"is_shared_with_sponsor" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "craving_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"occurred_at" timestamp DEFAULT now() NOT NULL,
	"intensity" integer NOT NULL,
	"trigger_type" varchar(100),
	"lat" double precision,
	"lng" double precision,
	"notes" text,
	"response_taken" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entry_date" timestamp DEFAULT now() NOT NULL,
	"cravings_intensity" integer,
	"feelings" jsonb DEFAULT '[]'::jsonb,
	"triggers" jsonb DEFAULT '[]'::jsonb,
	"coping_actions" jsonb DEFAULT '[]'::jsonb,
	"gratitude" text,
	"notes" text,
	"share_with_sponsor" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"recipient_id" uuid NOT NULL,
	"content_ciphertext" text NOT NULL,
	"nonce" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(500) NOT NULL,
	"platform" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "notification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"handle" varchar(50),
	"timezone" varchar(50) DEFAULT 'UTC',
	"avatar_url" varchar,
	"clean_date" timestamp,
	"program" "program",
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profiles_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "risk_signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"scored_at" timestamp DEFAULT now() NOT NULL,
	"score" integer NOT NULL,
	"inputs" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "routine_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"routine_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"run_at" timestamp DEFAULT now() NOT NULL,
	"status" "routine_status" NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "routines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"schedule" jsonb NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sobriety_streaks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"relapse_note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sponsor_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sponsor_id" uuid NOT NULL,
	"sponsee_id" uuid NOT NULL,
	"status" "sponsor_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "step_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"step_id" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"content" jsonb NOT NULL,
	"is_shared_with_sponsor" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program" "program" NOT NULL,
	"step_number" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"prompts" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trigger_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"label" varchar(100) NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"radius_m" integer DEFAULT 50 NOT NULL,
	"on_enter" jsonb DEFAULT '[]'::jsonb,
	"on_exit" jsonb DEFAULT '[]'::jsonb,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "idx_action_plans_user_id" ON "action_plans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_user_id" ON "audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_action" ON "audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_log_created_at" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_craving_events_user_id" ON "craving_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_craving_events_occurred_at" ON "craving_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "idx_daily_entries_user_id" ON "daily_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_daily_entries_entry_date" ON "daily_entries" USING btree ("entry_date");--> statement-breakpoint
CREATE INDEX "idx_daily_entries_user_date" ON "daily_entries" USING btree ("user_id","entry_date");--> statement-breakpoint
CREATE INDEX "idx_messages_thread_id" ON "messages" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "idx_messages_sender_id" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_messages_recipient_id" ON "messages" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "idx_messages_created_at" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notification_tokens_user_id" ON "notification_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notification_tokens_token" ON "notification_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_profiles_user_id" ON "profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_profiles_handle" ON "profiles" USING btree ("handle");--> statement-breakpoint
CREATE INDEX "idx_risk_signals_user_id" ON "risk_signals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_risk_signals_scored_at" ON "risk_signals" USING btree ("scored_at");--> statement-breakpoint
CREATE INDEX "idx_routine_logs_routine_id" ON "routine_logs" USING btree ("routine_id");--> statement-breakpoint
CREATE INDEX "idx_routine_logs_user_id" ON "routine_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_routine_logs_run_at" ON "routine_logs" USING btree ("run_at");--> statement-breakpoint
CREATE INDEX "idx_routines_user_id" ON "routines" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_routines_active" ON "routines" USING btree ("active");--> statement-breakpoint
CREATE INDEX "idx_sobriety_streaks_user_id" ON "sobriety_streaks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sobriety_streaks_start_date" ON "sobriety_streaks" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "idx_sponsor_relationships_sponsor_id" ON "sponsor_relationships" USING btree ("sponsor_id");--> statement-breakpoint
CREATE INDEX "idx_sponsor_relationships_sponsee_id" ON "sponsor_relationships" USING btree ("sponsee_id");--> statement-breakpoint
CREATE INDEX "idx_sponsor_relationships_status" ON "sponsor_relationships" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_step_entries_user_id" ON "step_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_step_entries_step_id" ON "step_entries" USING btree ("step_id");--> statement-breakpoint
CREATE INDEX "idx_step_entries_user_step" ON "step_entries" USING btree ("user_id","step_id");--> statement-breakpoint
CREATE INDEX "idx_steps_program_step" ON "steps" USING btree ("program","step_number");--> statement-breakpoint
CREATE INDEX "idx_trigger_locations_user_id" ON "trigger_locations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_trigger_locations_active" ON "trigger_locations" USING btree ("active");