/**
 * Support Hook
 *
 * Manages support card functionality
 */

import { useActionPlans } from "./useActionPlans";
import { useSponsorRelationships } from "./useSponsor";

export function useSupport() {
  const { plans } = useActionPlans();
  const { relationships } = useSponsorRelationships();

  const activePlans = plans.filter((p) => p.active !== false);
  const activeSponsors = relationships.filter((r) => r.status === "active");

  return {
    actionPlans: activePlans,
    sponsors: activeSponsors,
    hasSupport: activePlans.length > 0 || activeSponsors.length > 0,
  };
}

