import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  jsonb,
  index,
  uuid,
  integer,
  boolean,
  doublePrecision,
  text,
  pgEnum,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";

// Session storage table - Used for authentication when enabled
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Used for authentication when enabled
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ============================================================================
// Supabase Schema - Recovery Companion Tables
// ============================================================================

// Enums
export const programEnum = pgEnum("program", ["NA", "AA"]);
export const sponsorStatusEnum = pgEnum("sponsor_status", ["pending", "active", "revoked"]);
export const routineStatusEnum = pgEnum("routine_status", ["completed", "skipped", "failed"]);

// Profiles table - User profiles linked to Supabase Auth
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull().unique(), // FK to auth.users
    handle: varchar("handle", { length: 50 }).unique(),
    timezone: varchar("timezone", { length: 50 }).default("UTC"),
    avatarUrl: varchar("avatar_url"),
    cleanDate: timestamp("clean_date"),
    program: programEnum("program"), // NA or AA
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_profiles_user_id").on(table.userId),
    index("idx_profiles_handle").on(table.handle),
  ]
);

// Steps table - Step definitions for NA/AA programs
export const steps = pgTable("steps", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  program: programEnum("program").notNull(), // NA or AA
  stepNumber: integer("step_number").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  prompts: jsonb("prompts").$type<string[]>().notNull(), // Array of prompt strings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_steps_program_step").on(table.program, table.stepNumber),
]);

// Step entries table - User's step work entries
export const stepEntries = pgTable(
  "step_entries",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull(), // FK to auth.users
    stepId: uuid("step_id").notNull(), // FK to steps
    version: integer("version").notNull().default(1),
    content: jsonb("content").notNull(), // Step work content (structured JSON)
    isSharedWithSponsor: boolean("is_shared_with_sponsor").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_step_entries_user_id").on(table.userId),
    index("idx_step_entries_step_id").on(table.stepId),
    index("idx_step_entries_user_step").on(table.userId, table.stepId),
  ]
);

// Daily entries table - Daily recovery logs
export const dailyEntries = pgTable(
  "daily_entries",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull(), // FK to auth.users
    entryDate: timestamp("entry_date").notNull().defaultNow(),
    cravingsIntensity: integer("cravings_intensity"), // 0-10 scale
    feelings: jsonb("feelings").$type<string[]>().default([]), // Array of feeling strings
    triggers: jsonb("triggers").$type<string[]>().default([]), // Array of trigger strings
    copingActions: jsonb("coping_actions").$type<string[]>().default([]), // Array of action strings
    gratitude: text("gratitude"), // Gratitude journal entry
    notes: text("notes"), // General notes
    shareWithSponsor: boolean("share_with_sponsor").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_daily_entries_user_id").on(table.userId),
    index("idx_daily_entries_entry_date").on(table.entryDate),
    index("idx_daily_entries_user_date").on(table.userId, table.entryDate),
  ]
);

// Craving events table - Individual craving tracking events
export const cravingEvents = pgTable(
  "craving_events",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull(), // FK to auth.users
    occurredAt: timestamp("occurred_at").notNull().defaultNow(),
    intensity: integer("intensity").notNull(), // 0-10 scale
    triggerType: varchar("trigger_type", { length: 100 }), // e.g., "location", "emotion", "social"
    lat: doublePrecision("lat"), // Latitude for location-based triggers
    lng: doublePrecision("lng"), // Longitude for location-based triggers
    notes: text("notes"),
    responseTaken: text("response_taken"), // What the user did in response
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_craving_events_user_id").on(table.userId),
    index("idx_craving_events_occurred_at").on(table.occurredAt),
  ]
);

// Action plans table - If-then plans for crisis situations
export const actionPlans = pgTable(
  "action_plans",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull(), // FK to auth.users
    title: varchar("title", { length: 200 }).notNull(),
    situation: text("situation"), // Description of the situation
    ifThen: jsonb("if_then").$type<Array<{ if: string; then: string }>>().default([]), // Array of if-then rules
    checklist: jsonb("checklist").$type<string[]>().default([]), // Array of checklist items
    emergencyContacts: jsonb("emergency_contacts").$type<Array<{ name: string; phone: string }>>().default([]),
    isSharedWithSponsor: boolean("is_shared_with_sponsor").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_action_plans_user_id").on(table.userId),
  ]
);

// Routines table - Daily/weekly routines with schedules
export const routines = pgTable(
  "routines",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull(), // FK to auth.users
    title: varchar("title", { length: 200 }).notNull(),
    schedule: jsonb("schedule").notNull(), // JSON schedule (e.g., { type: "daily", time: "09:00" })
    active: boolean("active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_routines_user_id").on(table.userId),
    index("idx_routines_active").on(table.active),
  ]
);

// Routine logs table - Completion logs for routines
export const routineLogs = pgTable(
  "routine_logs",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    routineId: uuid("routine_id").notNull(), // FK to routines
    userId: uuid("user_id").notNull(), // FK to auth.users
    runAt: timestamp("run_at").notNull().defaultNow(),
    status: routineStatusEnum("status").notNull(), // completed, skipped, failed
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_routine_logs_routine_id").on(table.routineId),
    index("idx_routine_logs_user_id").on(table.userId),
    index("idx_routine_logs_run_at").on(table.runAt),
  ]
);

// Sobriety streaks table - Track sobriety streaks
export const sobrietyStreaks = pgTable(
  "sobriety_streaks",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull(), // FK to auth.users
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"), // null if current streak
    relapseNote: text("relapse_note"), // Optional note if streak ended
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_sobriety_streaks_user_id").on(table.userId),
    index("idx_sobriety_streaks_start_date").on(table.startDate),
  ]
);

// Sponsor relationships table - Connections between sponsors and sponsees
export const sponsorRelationships = pgTable(
  "sponsor_relationships",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    sponsorId: uuid("sponsor_id").notNull(), // FK to auth.users (sponsor)
    sponseeId: uuid("sponsee_id").notNull(), // FK to auth.users (sponsee)
    status: sponsorStatusEnum("status").notNull().default("pending"), // pending, active, revoked
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_sponsor_relationships_sponsor_id").on(table.sponsorId),
    index("idx_sponsor_relationships_sponsee_id").on(table.sponseeId),
    index("idx_sponsor_relationships_status").on(table.status),
  ]
);

// Trigger locations table - Geofenced trigger locations
export const triggerLocations = pgTable(
  "trigger_locations",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull(), // FK to auth.users
    label: varchar("label", { length: 100 }).notNull(), // User-friendly label
    lat: doublePrecision("lat").notNull(),
    lng: doublePrecision("lng").notNull(),
    radiusM: integer("radius_m").notNull().default(50), // Radius in meters (minimum 50m)
    onEnter: jsonb("on_enter").$type<string[]>().default([]), // Actions to take on enter
    onExit: jsonb("on_exit").$type<string[]>().default([]), // Actions to take on exit
    active: boolean("active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_trigger_locations_user_id").on(table.userId),
    index("idx_trigger_locations_active").on(table.active),
  ]
);

// Messages table - Encrypted messages between users
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    threadId: uuid("thread_id").notNull(), // Conversation thread ID
    senderId: uuid("sender_id").notNull(), // FK to auth.users
    recipientId: uuid("recipient_id").notNull(), // FK to auth.users
    contentCiphertext: text("content_ciphertext").notNull(), // Encrypted message content
    nonce: varchar("nonce", { length: 64 }).notNull(), // Encryption nonce
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_messages_thread_id").on(table.threadId),
    index("idx_messages_sender_id").on(table.senderId),
    index("idx_messages_recipient_id").on(table.recipientId),
    index("idx_messages_created_at").on(table.createdAt),
  ]
);

// Notification tokens table - Push notification tokens
export const notificationTokens = pgTable(
  "notification_tokens",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull(), // FK to auth.users
    token: varchar("token", { length: 500 }).notNull().unique(),
    platform: varchar("platform", { length: 20 }).notNull(), // "ios", "android", "web"
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_notification_tokens_user_id").on(table.userId),
    index("idx_notification_tokens_token").on(table.token),
  ]
);

// Risk signals table - Risk scoring for early intervention
export const riskSignals = pgTable(
  "risk_signals",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull(), // FK to auth.users
    scoredAt: timestamp("scored_at").notNull().defaultNow(),
    score: integer("score").notNull(), // 0-100 risk score
    inputs: jsonb("inputs").notNull(), // Inputs used for scoring (cravings, mood, etc.)
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_risk_signals_user_id").on(table.userId),
    index("idx_risk_signals_scored_at").on(table.scoredAt),
  ]
);

// Audit log table - Audit trail for sensitive operations
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id"), // FK to auth.users (nullable for system actions)
    action: varchar("action", { length: 100 }).notNull(), // Action name
    meta: jsonb("meta").default({}), // Additional metadata
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_audit_log_user_id").on(table.userId),
    index("idx_audit_log_action").on(table.action),
    index("idx_audit_log_created_at").on(table.createdAt),
  ]
);

// Export types
export type Profile = typeof profiles.$inferSelect;
export type Step = typeof steps.$inferSelect;
export type StepEntry = typeof stepEntries.$inferSelect;
export type DailyEntry = typeof dailyEntries.$inferSelect;
export type CravingEvent = typeof cravingEvents.$inferSelect;
export type ActionPlan = typeof actionPlans.$inferSelect;
export type Routine = typeof routines.$inferSelect;
export type RoutineLog = typeof routineLogs.$inferSelect;
export type SobrietyStreak = typeof sobrietyStreaks.$inferSelect;
export type SponsorRelationship = typeof sponsorRelationships.$inferSelect;
export type TriggerLocation = typeof triggerLocations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type NotificationToken = typeof notificationTokens.$inferSelect;
export type RiskSignal = typeof riskSignals.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;
