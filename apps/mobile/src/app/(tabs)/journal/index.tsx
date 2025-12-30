/**
 * Journal Index
 *
 * Redirects to main journal tab
 */

import { Redirect } from "expo-router";

export default function JournalIndex() {
  return <Redirect href="/(tabs)/journal" />;
}

