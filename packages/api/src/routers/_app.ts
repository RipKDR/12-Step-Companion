/**
 * Root tRPC Router
 *
 * Combines all sub-routers into a single app router
 */

import { router } from "../trpc";
import { profilesRouter } from "./profiles";
import { stepsRouter } from "./steps";
import { dailyEntriesRouter } from "./dailyEntries";
import { sponsorRouter } from "./sponsor";
import { meetingsRouter } from "./meetings";
import { actionPlansRouter } from "./actionPlans";
import { routinesRouter } from "./routines";
import { notificationsRouter } from "./notifications";
import { challengesRouter } from "./challenges";
import { triggerLocationsRouter } from "./triggerLocations";
import { dataExportRouter } from "./dataExport";

/**
 * Root app router combining all sub-routers
 */
export const appRouter = router({
  profiles: profilesRouter,
  steps: stepsRouter,
  dailyEntries: dailyEntriesRouter,
  sponsor: sponsorRouter,
  meetings: meetingsRouter,
  actionPlans: actionPlansRouter,
  routines: routinesRouter,
  notifications: notificationsRouter,
  challenges: challengesRouter,
  triggerLocations: triggerLocationsRouter,
  dataExport: dataExportRouter,
});

export type AppRouter = typeof appRouter;

