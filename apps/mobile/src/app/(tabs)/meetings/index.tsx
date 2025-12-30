/**
 * Meetings Index
 *
 * Redirects to main meetings tab
 */

import { Redirect } from "expo-router";

export default function MeetingsIndex() {
  return <Redirect href="/(tabs)/meetings" />;
}

