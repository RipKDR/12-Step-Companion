/**
 * Steps List Screen
 *
 * Redirects to the main steps tab
 */

import { Redirect } from "expo-router";

export default function StepsIndex() {
  return <Redirect href="/(tabs)/steps" />;
}

