/**
 * Seed Sample Data
 * 
 * Creates sample data for development/testing
 * 
 * Usage:
 *   tsx server/scripts/seed-sample-data.ts
 */

import { supabaseServer } from "../lib/supabase";

/**
 * Create sample profile
 */
async function createSampleProfile(userId: string) {
  const { data, error } = await supabaseServer
    .from("profiles")
    .upsert({
      user_id: userId,
      handle: "sample_user",
      timezone: "America/New_York",
      program: "NA",
      clean_date: new Date("2024-01-01").toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create sample profile:", error.message);
    return null;
  }

  console.log("✅ Created sample profile");
  return data;
}

/**
 * Create sample daily entries
 */
async function createSampleDailyEntries(userId: string, count: number = 7) {
  const entries = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    entries.push({
      user_id: userId,
      entry_date: date.toISOString(),
      cravings_intensity: Math.floor(Math.random() * 6), // 0-5
      feelings: ["grateful", "hopeful", "anxious"].slice(0, Math.floor(Math.random() * 3) + 1),
      triggers: ["stress", "loneliness"].slice(0, Math.floor(Math.random() * 2)),
      coping_actions: ["called sponsor", "went to meeting"].slice(0, Math.floor(Math.random() * 2) + 1),
      gratitude: `I'm grateful for ${i + 1} days of recovery.`,
      notes: `Day ${i + 1} of my recovery journey.`,
      share_with_sponsor: i % 3 === 0, // Share every 3rd entry
    });
  }

  const { data, error } = await supabaseServer
    .from("daily_entries")
    .upsert(entries, { onConflict: "user_id,entry_date" })
    .select();

  if (error) {
    console.error("Failed to create sample daily entries:", error.message);
    return null;
  }

  console.log(`✅ Created ${data.length} sample daily entries`);
  return data;
}

/**
 * Create sample action plan
 */
async function createSampleActionPlan(userId: string) {
  const { data, error } = await supabaseServer
    .from("action_plans")
    .insert({
      user_id: userId,
      title: "Crisis Action Plan",
      situation: "When I feel overwhelmed or triggered",
      if_then: [
        { if: "I feel a craving", then: "Call my sponsor immediately" },
        { if: "I'm feeling isolated", then: "Go to a meeting or call a friend" },
        { if: "I'm stressed", then: "Do breathing exercises for 5 minutes" },
      ],
      checklist: [
        "Call sponsor",
        "Go to meeting",
        "Practice self-care",
        "Review my reasons for recovery",
      ],
      emergency_contacts: [
        { name: "Sponsor", phone: "555-0100" },
        { name: "Recovery Friend", phone: "555-0101" },
      ],
      is_shared_with_sponsor: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create sample action plan:", error.message);
    return null;
  }

  console.log("✅ Created sample action plan");
  return data;
}

/**
 * Main seed function
 */
async function seed() {
  console.log("🌱 Starting sample data seed...");
  console.log("=".repeat(50));

  // Note: In a real scenario, you'd get the userId from Supabase Auth
  // For this seed script, you need to provide a valid user ID
  const userId = process.env.SAMPLE_USER_ID;

  if (!userId) {
    console.error("❌ SAMPLE_USER_ID environment variable not set");
    console.log("Set it to a valid Supabase Auth user ID to seed sample data");
    process.exit(1);
  }

  try {
    await createSampleProfile(userId);
    await createSampleDailyEntries(userId, 7);
    await createSampleActionPlan(userId);

    console.log("\n" + "=".repeat(50));
    console.log("✅ Sample data seed completed!");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  }
}

// Run seed if executed directly
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, "/") || "")) {
  seed().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}

export { seed };

