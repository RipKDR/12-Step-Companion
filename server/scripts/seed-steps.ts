/**
 * Seed Steps Table
 * 
 * Populates the steps table with NA/AA step definitions from JSON files
 * 
 * Usage:
 *   tsx server/scripts/seed-steps.ts
 */

import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { supabaseServer } from "../lib/supabase";

// Get current directory (works in both ESM and CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface StepQuestion {
  id: string;
  section?: string;
  prompt: string;
  help?: string;
}

interface StepContent {
  step: number;
  title: string;
  subtitle?: string;
  overviewLabels?: string[];
  questions: StepQuestion[];
}

/**
 * Load step content from JSON file
 */
function loadStepFile(stepNumber: number, program: "NA" | "AA"): StepContent | null {
  try {
    // Try program-specific file first (e.g., "1-na.json")
    const programFile = join(
      __dirname,
      "../../public/content/steps",
      `${stepNumber}-${program.toLowerCase()}.json`
    );
    
    try {
      const content = readFileSync(programFile, "utf-8");
      return JSON.parse(content);
    } catch {
      // Fall back to generic file (e.g., "1.json")
      const genericFile = join(
        __dirname,
        "../../public/content/steps",
        `${stepNumber}.json`
      );
      const content = readFileSync(genericFile, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn(`Failed to load step ${stepNumber} for ${program}:`, error);
    return null;
  }
}

/**
 * Extract prompts from step content
 */
function extractPrompts(stepContent: StepContent): string[] {
  return stepContent.questions.map((q) => q.prompt);
}

/**
 * Seed steps for a program
 */
async function seedProgram(program: "NA" | "AA") {
  console.log(`\n📝 Seeding ${program} steps...`);

  for (let stepNumber = 1; stepNumber <= 12; stepNumber++) {
    const stepContent = loadStepFile(stepNumber, program);
    
    if (!stepContent) {
      console.warn(`⚠️  Skipping ${program} Step ${stepNumber} - file not found`);
      continue;
    }

    const prompts = extractPrompts(stepContent);
    const title = stepContent.title || `Step ${stepNumber}`;

    // Check if step already exists
    const { data: existing } = await supabaseServer
      .from("steps")
      .select("id")
      .eq("program", program)
      .eq("step_number", stepNumber)
      .single();

    if (existing) {
      // Update existing step
      const { error } = await supabaseServer
        .from("steps")
        .update({
          title,
          prompts,
          updated_at: new Date().toISOString(),
        })
        .eq("program", program)
        .eq("step_number", stepNumber);

      if (error) {
        console.error(`❌ Failed to update ${program} Step ${stepNumber}:`, error.message);
      } else {
        console.log(`✅ Updated ${program} Step ${stepNumber}: ${title}`);
      }
    } else {
      // Insert new step
      const { error } = await supabaseServer
        .from("steps")
        .insert({
          program,
          step_number: stepNumber,
          title,
          prompts,
        });

      if (error) {
        console.error(`❌ Failed to insert ${program} Step ${stepNumber}:`, error.message);
      } else {
        console.log(`✅ Inserted ${program} Step ${stepNumber}: ${title}`);
      }
    }
  }
}

/**
 * Main seed function
 */
async function seed() {
  console.log("🌱 Starting steps seed...");
  console.log("=" .repeat(50));

  try {
    // Seed NA steps
    await seedProgram("NA");

    // Seed AA steps (using same content for now - can be customized later)
    await seedProgram("AA");

    console.log("\n" + "=".repeat(50));
    console.log("✅ Steps seed completed!");
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

export { seed, seedProgram };

